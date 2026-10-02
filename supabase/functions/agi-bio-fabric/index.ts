import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { runFabric } from "../_shared/fabric.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    return json(runFabric({
      rounds: body.rounds, eavesdropper: body.eavesdropper === true,
      signal: body.signal, cells: body.cells, tamper: body.tamper === true,
    }));
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "invalid request" }, 400);
  }
});
