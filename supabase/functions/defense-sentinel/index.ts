import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { analyzeTelemetry, auditHash, type Telemetry } from "../_shared/defense.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function validTelemetry(v: any): v is Telemetry {
  return v && typeof v.source === "string" &&
    Number.isFinite(v.failed_auth) && v.failed_auth >= 0 &&
    Number.isFinite(v.new_processes) && v.new_processes >= 0 &&
    Number.isFinite(v.outbound_spike) && v.outbound_spike >= 0 && v.outbound_spike <= 1 &&
    Number.isFinite(v.file_entropy) && v.file_entropy >= 0 && v.file_entropy <= 1 &&
    typeof v.privilege_change === "boolean" && typeof v.known_ioc_match === "boolean";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const body = await req.json().catch(() => null);
  if (!validTelemetry(body)) return json({ error: "invalid telemetry" }, 400);

  const finding = analyzeTelemetry(body);
  const previous = typeof body.previous_audit_hash === "string" ? body.previous_audit_hash : "0".repeat(128);
  const audit_hash = auditHash(previous, finding);

  let realtime = "unavailable";
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_ANON_KEY");
    if (url && key) {
      const sb = createClient(url, key);
      const ch = sb.channel("defense-sentinel");
      const status = await ch.send({
        type: "broadcast",
        event: "finding",
        payload: { finding, previous_audit_hash: previous, audit_hash },
      });
      realtime = status === "ok" ? "live" : String(status);
      await sb.removeChannel(ch);
    }
  } catch (e) {
    console.error("Sentinel realtime broadcast failed", e);
  }

  return json({
    finding,
    audit: { previous_hash: previous, audit_hash },
    realtime_bridge: realtime,
    execution: {
      autonomous_action: false,
      human_approval_required: true,
      note: "Recommendation only. This service does not execute containment or weapon actions.",
    },
  });
});
