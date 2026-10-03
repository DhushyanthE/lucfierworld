import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { runRounds } from "../_shared/dharmic.ts";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty body ok */ }
  const cells = body.cells === undefined ? 7 : Number(body.cells);
  const rounds = body.rounds === undefined ? 5 : Number(body.rounds);
  try {
    const result = runRounds({ cells, rounds, lateCell: body.late === true ? 1 : undefined });
    // Publish a compact summary on the realtime bridge so every open page updates.
    try {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
      const ch = sb.channel("dharmic-rounds");
      await ch.send({
        type: "broadcast", event: "rounds",
        payload: { at: new Date().toISOString(), network_best: result.network_best, rounds: result.rounds.map(({ payloads: _p, ...r }) => r) },
      });
      await sb.removeChannel(ch);
    } catch (e) { console.error("broadcast failed", e); }
    return json(result);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "invalid request" }, 400);
  }
});
