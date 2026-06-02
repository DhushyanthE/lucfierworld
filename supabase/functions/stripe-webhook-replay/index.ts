import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { processStripeEvent } from "../stripe-webhook/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsError } = await userClient.auth.getClaims(token);
  if (claimsError || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", claims.claims.sub)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) return json({ error: "Forbidden" }, 403);

  let body: { event_id?: string } = {};
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const eventId = body.event_id;
  if (!eventId || typeof eventId !== "string") return json({ error: "event_id required" }, 400);

  const { data: row, error: lookupError } = await admin
    .from("stripe_webhook_events")
    .select("id, event_id, event_type, payload")
    .eq("event_id", eventId)
    .maybeSingle();
  if (lookupError) return json({ error: lookupError.message }, 500);
  if (!row) return json({ error: "Event not found" }, 404);

  try {
    const result = await processStripeEvent(admin, row.payload as never);
    const newStatus = `replayed:${result.status}`;
    await admin.from("stripe_webhook_events").update({
      status: newStatus,
      error: result.error,
      processed_at: new Date().toISOString(),
    }).eq("event_id", eventId);
    return json({ replayed: true, status: newStatus, error: result.error });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await admin.from("stripe_webhook_events").update({
      status: "replayed:failed",
      error: message.slice(0, 1000),
      processed_at: new Date().toISOString(),
    }).eq("event_id", eventId);
    return json({ error: message }, 500);
  }
});
