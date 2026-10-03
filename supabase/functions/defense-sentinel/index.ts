import { createClient } from "npm:@supabase/supabase-js@2";
import { analyzeTelemetry, auditHash, type Telemetry } from "../_shared/defense.ts";
import { reviewDefensiveFinding } from "../_shared/defense-review.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("DEFENSE_ALLOWED_ORIGIN") || "http://localhost:8080",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });

function validTelemetry(v: unknown): v is Telemetry {
  if (!v || typeof v !== "object") return false;
  const t = v as Record<string, unknown>;
  return typeof t.source === "string" && t.source.length > 0 && t.source.length <= 128 &&
    Number.isSafeInteger(t.failed_auth) && Number(t.failed_auth) >= 0 && Number(t.failed_auth) <= 100000 &&
    Number.isSafeInteger(t.new_processes) && Number(t.new_processes) >= 0 && Number(t.new_processes) <= 100000 &&
    typeof t.outbound_spike === "number" && Number.isFinite(t.outbound_spike) && t.outbound_spike >= 0 && t.outbound_spike <= 1 &&
    typeof t.file_entropy === "number" && Number.isFinite(t.file_entropy) && t.file_entropy >= 0 && t.file_entropy <= 1 &&
    typeof t.privilege_change === "boolean" && typeof t.known_ioc_match === "boolean";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const token = req.headers.get("authorization");
  if (!url || !anon || !token?.startsWith("Bearer ")) return json({ error: "authentication required" }, 401);
  const client = createClient(url, anon, {
    global: { headers: { Authorization: token } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: auth, error: authError } = await client.auth.getUser(token.slice(7));
  if (authError || !auth.user) return json({ error: "invalid user session" }, 401);
  const body = await req.json().catch(() => null);
  if (!validTelemetry(body)) return json({ error: "invalid telemetry" }, 400);

  const finding = analyzeTelemetry(body);
  const review = reviewDefensiveFinding(finding, body);
  // A caller-supplied previous hash is not a durable ledger. This chain is
  // session-local and untrusted until a server-managed audit store exists.
  const prevCandidate = (body as unknown as Record<string, unknown>).previous_audit_hash;
  const previous = typeof prevCandidate === "string" && /^[0-9a-f]{128}$/.test(prevCandidate)
    ? prevCandidate : "0".repeat(128);
  const audit_hash = auditHash(previous, finding);

  // Never broadcast sensitive defense telemetry over an unprotected public
  // Realtime channel. A future private RLS-backed channel can be added.
  return json({
    finding,
    review,
    audit: { previous_hash: previous, audit_hash, persistence: "session-local-untrusted" },
    realtime_bridge: "disabled_pending_private_channel",
    execution: {
      autonomous_action: false,
      human_approval_required: true,
      executed: false,
      note: "Analysis and simulated policy review only; no containment or weapon action is available.",
    },
  });
});
