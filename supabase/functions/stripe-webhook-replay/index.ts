import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { processStripeEvent } from "../stripe-webhook/index.ts";

const ALLOWED_ORIGINS = (Deno.env.get("STRIPE_REPLAY_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const buildCors = (origin: string | null) => {
  const allowOrigin =
    origin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))
      ? origin
      : ALLOWED_ORIGINS[0] ?? "null";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-requested-with, x-csrf-token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
};

const json = (body: unknown, status: number, cors: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const sha256Hex = async (input: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const isValidEventId = (s: unknown): s is string =>
  typeof s === "string" && /^evt_[A-Za-z0-9_]{8,128}$/.test(s);

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = buildCors(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);

  // ---- CSRF: enforce custom header + Origin allowlist (defense-in-depth) ----
  if (req.headers.get("x-requested-with") !== "XMLHttpRequest") {
    return json({ error: "Missing CSRF header" }, 403, cors);
  }
  if (ALLOWED_ORIGINS.length > 0 && (!origin || !ALLOWED_ORIGINS.includes(origin))) {
    return json({ error: "Origin not allowed" }, 403, cors);
  }
  const csrfToken = req.headers.get("x-csrf-token");
  if (!csrfToken || csrfToken.length < 16 || csrfToken.length > 256) {
    return json({ error: "Missing or invalid CSRF token" }, 403, cors);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Server misconfigured" }, 500, cors);
  }

  // ---- AuthN: validate JWT via getClaims (verifies signature + exp) ----
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401, cors);
  const token = authHeader.slice(7);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  const claims = claimsData?.claims as Record<string, unknown> | undefined;
  if (claimsError || !claims?.sub) return json({ error: "Unauthorized" }, 401, cors);

  // Reject tokens nearing expiry / not-yet-valid; require a real user session.
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof claims.exp === "number" ? claims.exp : 0;
  const iat = typeof claims.iat === "number" ? claims.iat : 0;
  if (exp <= now || iat > now + 60) return json({ error: "Token invalid" }, 401, cors);
  if (claims.aud !== "authenticated" || claims.role !== "authenticated") {
    return json({ error: "Unauthorized" }, 401, cors);
  }

  const adminId = claims.sub as string;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // ---- AuthZ: strict admin role via has_role (single source of truth) ----
  const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
    _user_id: adminId,
    _role: "admin",
  });
  if (roleErr || isAdmin !== true) return json({ error: "Forbidden" }, 403, cors);

  // ---- Body validation ----
  let body: { event_id?: unknown } = {};
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400, cors); }
  if (!isValidEventId(body.event_id)) {
    return json({ error: "event_id must match evt_*" }, 400, cors);
  }
  const eventId = body.event_id;

  // ---- Rate limit (per-admin and per-event cooldown) ----
  const { data: rl, error: rlErr } = await admin.rpc("check_stripe_replay_rate_limit", {
    p_user_id: adminId,
    p_event_id: eventId,
  });
  if (rlErr) return json({ error: "Rate limit check failed" }, 500, cors);
  const decision = Array.isArray(rl) ? rl[0] : rl;
  if (!decision?.allowed) {
    const reason = decision?.reason ?? "rate_limited";
    return json({ error: "Rate limited", reason }, 429, cors);
  }

  // ---- Lookup event ----
  const { data: row, error: lookupError } = await admin
    .from("stripe_webhook_events")
    .select("id, event_id, event_type, payload")
    .eq("event_id", eventId)
    .maybeSingle();
  if (lookupError) return json({ error: lookupError.message }, 500, cors);
  if (!row) return json({ error: "Event not found" }, 404, cors);

  // ---- Audit context ----
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "";
  const ipHash = ip ? await sha256Hex(`${ip}:${adminId}`) : null;
  const ua = (req.headers.get("user-agent") ?? "").slice(0, 512);

  const writeAudit = (status: string, error: string | null) =>
    admin.from("stripe_webhook_replay_audit").insert({
      admin_user_id: adminId,
      event_id: eventId,
      status,
      error: error?.slice(0, 1000) ?? null,
      ip_hash: ipHash,
      user_agent: ua,
      origin: origin?.slice(0, 256) ?? null,
    });

  try {
    const result = await processStripeEvent(admin, row.payload as never);
    const newStatus = `replayed:${result.status}`;
    await admin
      .from("stripe_webhook_events")
      .update({
        status: newStatus,
        error: result.error,
        processed_at: new Date().toISOString(),
      })
      .eq("event_id", eventId);
    await writeAudit(newStatus, result.error ?? null);
    return json({ replayed: true, status: newStatus, error: result.error }, 200, cors);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await admin
      .from("stripe_webhook_events")
      .update({
        status: "replayed:failed",
        error: message.slice(0, 1000),
        processed_at: new Date().toISOString(),
      })
      .eq("event_id", eventId);
    await writeAudit("replayed:failed", message);
    return json({ error: message }, 500, cors);
  }
});
