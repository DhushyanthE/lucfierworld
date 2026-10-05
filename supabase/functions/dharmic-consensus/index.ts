import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { runRounds } from "../_shared/dharmic.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is a valid default simulation request.
  }

  const cells = body.cells === undefined ? 9 : Number(body.cells);
  const rounds = body.rounds === undefined ? 5 : Number(body.rounds);

  try {
    const result = runRounds({
      cells,
      rounds,
      lateCell: body.late === true ? 1 : undefined,
      forgeSignature: body.forge_signature === true,
      tamperPayload: body.tamper_payload === true,
      impossibleBell: body.impossible_bell === true,
      replayRound: body.replay_round === true,
      qkdSecure: body.qkd_secure !== false,
      stakes: body.stakes && typeof body.stakes === "object" ? body.stakes as Record<string, number> : undefined,
    });

    let realtime = "unavailable";
    try {
      const url = Deno.env.get("SUPABASE_URL");
      const key = Deno.env.get("SUPABASE_ANON_KEY");
      if (url && key) {
        const sb = createClient(url, key);
        const ch = sb.channel("dharmic-rounds");
        const send = await ch.send({
          type: "broadcast",
          event: "rounds",
          payload: {
            at: new Date().toISOString(),
            engine: result.engine,\n            network_best: result.network_best,\n            field_coherence: result.rounds.at(-1)?.field_coherence ?? null,
            chain_head: result.chain_head,
            accepted_rounds: result.accepted_rounds,
            rejected_rounds: result.rejected_rounds,
            total_locked_lvth: result.total_locked_lvth,
            latest_round: result.rounds.at(-1) ?? null,
          },
        });
        realtime = send === "ok" ? "live" : String(send);
        await sb.removeChannel(ch);
      }
    } catch (e) {
      console.error("PoDS realtime broadcast failed", e);
    }

    return json({
      ...result,
      persistence_mode: "Server simulation",
      realtime_bridge: realtime,
      on_chain: false,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "invalid request" }, 400);
  }
});
