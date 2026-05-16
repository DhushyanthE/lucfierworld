import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");
const ALERT_EMAIL = Deno.env.get("SECURITY_ALERT_EMAIL");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Hard cap on deliveries per alert_key per hour (defense-in-depth on top of per-event dedup)
const HOURLY_DELIVERY_CAP = 6;

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendSlack(text: string): Promise<{ ok: boolean; error?: string }> {
  if (!SLACK_WEBHOOK_URL) return { ok: false, error: "SLACK_WEBHOOK_URL not configured" };
  try {
    const r = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `🚨 *Security alert*\n${text}` }),
    });
    if (!r.ok) return { ok: false, error: `slack ${r.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function sendEmail(subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY || !ALERT_EMAIL) return { ok: false, error: "Resend or SECURITY_ALERT_EMAIL missing" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Security <onboarding@resend.dev>", to: [ALERT_EMAIL], subject, html }),
    });
    if (!r.ok) {
      const body = await r.text();
      return { ok: false, error: `resend ${r.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: settingsRows } = await supabase.from("security_alert_settings").select("*");
    const settings = new Map<string, any>();
    (settingsRows ?? []).forEach((s: any) => settings.set(s.alert_key, s));
    const cfg = (key: string) =>
      settings.get(key) ?? { enabled: true, threshold: 1, window_minutes: 5, channels: ["slack", "email"] };

    const anomalies: { key: string; text: string; channels: string[]; windowMinutes: number; details: any }[] = [];

    // 1. Anon firewall log writes
    {
      const c = cfg("anon_firewall_writes");
      if (c.enabled) {
        const since = new Date(Date.now() - c.window_minutes * 60_000).toISOString();
        const { count } = await supabase
          .from("quantum_firewall_logs").select("id", { count: "exact", head: true })
          .is("user_id", null).gte("created_at", since);
        if ((count ?? 0) >= c.threshold) {
          anomalies.push({
            key: "anon_firewall_writes",
            text: `${count} anonymous firewall_logs inserts in last ${c.window_minutes}min`,
            channels: c.channels, windowMinutes: c.window_minutes, details: { count },
          });
        }
      }
    }

    // 2. Ineligible DAO votes
    {
      const c = cfg("ineligible_dao_vote");
      if (c.enabled) {
        const since = new Date(Date.now() - c.window_minutes * 60_000).toISOString();
        const { data: voteRows } = await supabase.from("dao_votes")
          .select("user_id, proposal_id, created_at").gte("created_at", since).limit(500);
        if (voteRows?.length) {
          const userIds = [...new Set(voteRows.map((v) => v.user_id))];
          const { data: eligible } = await supabase.from("dao_eligible_voters").select("user_id").in("user_id", userIds);
          const allowed = new Set((eligible ?? []).map((e) => e.user_id));
          const bad = voteRows.filter((v) => !allowed.has(v.user_id));
          if (bad.length >= c.threshold) {
            anomalies.push({
              key: "ineligible_dao_vote",
              text: `${bad.length} dao_votes from non-eligible users in last ${c.window_minutes}min`,
              channels: c.channels, windowMinutes: c.window_minutes, details: { count: bad.length },
            });
          }
        }
      }
    }

    // 3. Cross-user session collisions
    {
      const c = cfg("cross_user_session");
      if (c.enabled) {
        const since = new Date(Date.now() - c.window_minutes * 60_000).toISOString();
        const { data: cross } = await supabase.from("quantum_firewall_logs")
          .select("session_id, user_id").gte("created_at", since);
        if (cross) {
          const map = new Map<string, Set<string>>();
          for (const r of cross) {
            if (!r.session_id || !r.user_id) continue;
            if (!map.has(r.session_id)) map.set(r.session_id, new Set());
            map.get(r.session_id)!.add(r.user_id);
          }
          const collisions = [...map.entries()].filter(([, s]) => s.size > 1);
          if (collisions.length >= c.threshold) {
            anomalies.push({
              key: "cross_user_session",
              text: `${collisions.length} session_id collisions across users in last ${c.window_minutes}min`,
              channels: c.channels, windowMinutes: c.window_minutes, details: { collisions: collisions.length },
            });
          }
        }
      }
    }

    // === Deduplication + rate limiting + delivery ===
    const deliveries: any[] = [];
    const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();

    for (const a of anomalies) {
      const payloadHash = await sha256Hex(`${a.key}|${a.text}`);
      const dedupeSince = new Date(Date.now() - a.windowMinutes * 60_000).toISOString();

      // Dedup: identical alert already delivered within window? bump count, skip send.
      const { data: dup } = await supabase
        .from("security_alert_outcomes")
        .select("id, triggered_count")
        .eq("alert_key", a.key)
        .eq("payload_hash", payloadHash)
        .gte("created_at", dedupeSince)
        .order("created_at", { ascending: false })
        .limit(1).maybeSingle();

      if (dup) {
        await supabase.from("security_alert_outcomes").update({
          triggered_count: (dup.triggered_count ?? 1) + 1,
        }).eq("id", dup.id);
        deliveries.push({ key: a.key, status: "deduped", payload_hash: payloadHash });
        continue;
      }

      // Hourly rate limit per alert_key
      const { count: recentCount } = await supabase
        .from("security_alert_outcomes")
        .select("id", { count: "exact", head: true })
        .eq("alert_key", a.key)
        .neq("status", "deduped")
        .gte("created_at", oneHourAgo);
      if ((recentCount ?? 0) >= HOURLY_DELIVERY_CAP) {
        await supabase.from("security_alert_outcomes").insert({
          alert_key: a.key, channel: "all", status: "rate_limited",
          payload_hash: payloadHash, details: { text: a.text, cap: HOURLY_DELIVERY_CAP },
        });
        deliveries.push({ key: a.key, status: "rate_limited" });
        continue;
      }

      // Deliver per channel and log outcome
      for (const channel of a.channels) {
        let outcome: { ok: boolean; error?: string } = { ok: false, error: "unknown channel" };
        if (channel === "slack") outcome = await sendSlack(a.text);
        else if (channel === "email") {
          outcome = await sendEmail(`Quantum Firewall: ${a.key}`, `<p>${a.text}</p>`);
        }
        await supabase.from("security_alert_outcomes").insert({
          alert_key: a.key, channel,
          status: outcome.ok ? "succeeded" : "failed",
          error: outcome.error ?? null,
          payload_hash: payloadHash,
          details: { text: a.text, ...a.details },
        });
        deliveries.push({ key: a.key, channel, status: outcome.ok ? "succeeded" : "failed", error: outcome.error });
      }
    }

    return new Response(JSON.stringify({ ok: true, anomalies, deliveries }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
