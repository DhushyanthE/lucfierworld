import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Admin-only: simulates anonymous firewall writes, cross-user session collisions,
 * and ineligible DAO vote rows by inserting synthetic records via service role,
 * then invokes security-anomaly-watcher and returns its result.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization");

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: u } = await userClient.auth.getUser();
    if (!u.user) throw new Error("Not authenticated");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!roles?.some((r: any) => r.role === "admin")) throw new Error("Admin only");

    const body = await req.json().catch(() => ({}));
    const scenarios: string[] = body.scenarios || ["anon", "cross_user", "ineligible_vote"];
    const tag = `sim-${Date.now()}`;

    if (scenarios.includes("anon")) {
      const rows = Array.from({ length: 3 }, (_, i) => ({
        user_id: null,
        session_id: `${tag}-anon-${i}`,
        event_type: "simulated_anon_write",
        severity: "high",
      }));
      await admin.from("quantum_firewall_logs").insert(rows);
    }

    if (scenarios.includes("cross_user")) {
      const sharedSession = `${tag}-cross`;
      const fakeUsers = [crypto.randomUUID(), crypto.randomUUID()];
      await admin.from("quantum_firewall_logs").insert(
        fakeUsers.map((uid) => ({
          user_id: uid,
          session_id: sharedSession,
          event_type: "simulated_cross_user",
          severity: "high",
        })),
      );
    }

    if (scenarios.includes("ineligible_vote")) {
      // Find a proposal id to attach to (any)
      const { data: prop } = await admin.from("dao_proposals").select("id").limit(1).maybeSingle();
      if (prop) {
        await admin.from("dao_votes").insert({
          proposal_id: prop.id,
          user_id: crypto.randomUUID(),
          vote: "for",
        });
      }
    }

    // Trigger watcher
    const watcherRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/security-anomaly-watcher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ source: "simulate", tag }),
    });
    const watcherJson = await watcherRes.json().catch(() => ({}));

    // Cleanup synthetic firewall rows
    await admin.from("quantum_firewall_logs").delete().like("session_id", `${tag}-%`);

    return new Response(JSON.stringify({ ok: true, tag, scenarios, watcher: watcherJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e instanceof Error ? e.message : e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
