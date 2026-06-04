import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
// processStripeEvent is loaded via a runtime-built specifier so the test
// runner does not statically resolve stripe-webhook's transitive npm imports.
const loadProcessStripeEvent = async (): Promise<
  (admin: unknown, payload: unknown) => Promise<{ status: string; error: string | null }>
> => {
  const spec = "../stripe-webhook/" + "index.ts";
  // deno-lint-ignore no-explicit-any
  const mod: any = await import(spec);
  return mod.processStripeEvent;
};

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

// Denial reason codes used for audit + alerts.
export type DenialReason =
  | "method_not_allowed"
  | "csrf_xhr_missing"
  | "cors_origin_blocked"
  | "csrf_token_missing"
  | "server_misconfigured"
  | "auth_missing"
  | "jwt_invalid"
  | "jwt_expired"
  | "jwt_bad_audience"
  | "role_not_admin"
  | "body_invalid"
  | "event_id_invalid"
  | "rate_limit_check_failed"
  | "rate_limit_minute"
  | "rate_limit_hour"
  | "rate_limit_event_cooldown"
  | "event_not_found";

const DENIAL_STATUS: Record<DenialReason, number> = {
  method_not_allowed: 405,
  csrf_xhr_missing: 403,
  cors_origin_blocked: 403,
  csrf_token_missing: 403,
  server_misconfigured: 500,
  auth_missing: 401,
  jwt_invalid: 401,
  jwt_expired: 401,
  jwt_bad_audience: 401,
  role_not_admin: 403,
  body_invalid: 400,
  event_id_invalid: 400,
  rate_limit_check_failed: 500,
  rate_limit_minute: 429,
  rate_limit_hour: 429,
  rate_limit_event_cooldown: 429,
  event_not_found: 404,
};

// Map denial codes to human-readable user-facing messages.
const denialMessage = (reason: DenialReason): string => {
  switch (reason) {
    case "csrf_xhr_missing":
    case "csrf_token_missing":
      return "CSRF protection required";
    case "cors_origin_blocked":
      return "Origin not allowed";
    case "auth_missing":
    case "jwt_invalid":
    case "jwt_expired":
    case "jwt_bad_audience":
      return "Unauthorized";
    case "role_not_admin":
      return "Forbidden";
    case "rate_limit_minute":
    case "rate_limit_hour":
    case "rate_limit_event_cooldown":
      return "Rate limited";
    case "event_not_found":
      return "Event not found";
    case "event_id_invalid":
    case "body_invalid":
      return "Invalid request";
    case "method_not_allowed":
      return "Method not allowed";
    default:
      return "Request denied";
  }
};

const SEVERE_DENIALS: DenialReason[] = [
  "role_not_admin",
  "jwt_invalid",
  "jwt_expired",
  "jwt_bad_audience",
  "csrf_xhr_missing",
  "csrf_token_missing",
  "cors_origin_blocked",
  "rate_limit_minute",
  "rate_limit_hour",
];

export type AuditContext = {
  adminUserId: string | null;
  eventId: string | null;
  ipHash: string | null;
  userAgent: string;
  origin: string | null;
};

export type ReplayDeps = {
  admin: SupabaseClient;
  notifySlack?: (text: string) => Promise<void>;
  // Injectable for tests; defaults to Supabase auth.getClaims.
  verifyClaims?: (token: string) => Promise<{
    claims: Record<string, unknown> | null;
    error: { message: string } | null;
  }>;
};

// In-memory short-window throttle for repeated denials (per origin+reason)
// to avoid Slack/email floods when an attacker hammers the endpoint.
const denialNotifyWindow = new Map<string, number>();
const NOTIFY_DEDUP_MS = 60_000;

export async function logAndNotifyDenial(
  deps: ReplayDeps,
  reason: DenialReason,
  ctx: AuditContext,
  extra?: string,
) {
  try {
    await deps.admin.from("stripe_webhook_replay_audit").insert({
      admin_user_id: ctx.adminUserId ?? "00000000-0000-0000-0000-000000000000",
      event_id: ctx.eventId ?? "unknown",
      status: `denied:${reason}`,
      error: (extra ?? denialMessage(reason)).slice(0, 1000),
      ip_hash: ctx.ipHash,
      user_agent: ctx.userAgent,
      origin: ctx.origin?.slice(0, 256) ?? null,
    });
  } catch (e) {
    console.error("[replay] audit insert failed", e);
  }

  if (!SEVERE_DENIALS.includes(reason)) return;
  const key = `${reason}:${ctx.origin ?? "-"}:${ctx.ipHash ?? "-"}`;
  const now = Date.now();
  const last = denialNotifyWindow.get(key) ?? 0;
  if (now - last < NOTIFY_DEDUP_MS) return;
  denialNotifyWindow.set(key, now);

  const slackUrl = Deno.env.get("SLACK_WEBHOOK_URL");
  const send =
    deps.notifySlack ??
    (slackUrl
      ? async (text: string) => {
          await fetch(slackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
        }
      : undefined);
  if (!send) return;
  const text =
    `:rotating_light: stripe-webhook-replay *denied* — ${reason}\n` +
    `event_id: \`${ctx.eventId ?? "n/a"}\` · admin: \`${ctx.adminUserId ?? "anonymous"}\`\n` +
    `origin: \`${ctx.origin ?? "n/a"}\` · ip_hash: \`${ctx.ipHash ?? "n/a"}\``;
  try {
    await send(text);
  } catch (e) {
    console.error("[replay] slack notify failed", e);
  }
}

const denyResponse = async (
  deps: ReplayDeps,
  reason: DenialReason,
  ctx: AuditContext,
  cors: Record<string, string>,
  extra?: string,
) => {
  await logAndNotifyDenial(deps, reason, ctx, extra);
  return json(
    { error: denialMessage(reason), reason },
    DENIAL_STATUS[reason],
    cors,
  );
};

export async function handleReplayRequest(req: Request, deps?: Partial<ReplayDeps>): Promise<Response> {
  const origin = req.headers.get("origin");
  const cors = buildCors(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const admin: SupabaseClient | null =
    deps?.admin ??
    (supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null);

  const ipRaw =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "";
  const ua = (req.headers.get("user-agent") ?? "").slice(0, 512);
  const ctxBase: AuditContext = {
    adminUserId: null,
    eventId: null,
    ipHash: ipRaw ? await sha256Hex(ipRaw) : null,
    userAgent: ua,
    origin: origin ?? null,
  };

  // If admin client unavailable we can still deny but we cannot audit.
  const dummyDeps: ReplayDeps = {
    admin: admin ?? ({} as SupabaseClient),
    notifySlack: deps?.notifySlack,
  };
  const canAudit = !!admin;

  const deny = async (reason: DenialReason, extra?: string) =>
    canAudit
      ? denyResponse(dummyDeps, reason, ctxBase, cors, extra)
      : json({ error: denialMessage(reason), reason }, DENIAL_STATUS[reason], cors);

  if (req.method !== "POST") return deny("method_not_allowed");

  if (req.headers.get("x-requested-with") !== "XMLHttpRequest") {
    return deny("csrf_xhr_missing");
  }
  if (ALLOWED_ORIGINS.length > 0 && (!origin || !ALLOWED_ORIGINS.includes(origin))) {
    return deny("cors_origin_blocked");
  }
  const csrfToken = req.headers.get("x-csrf-token");
  if (!csrfToken || csrfToken.length < 16 || csrfToken.length > 256) {
    return deny("csrf_token_missing");
  }

  if (!admin) {
    return json({ error: "Server misconfigured" }, 500, cors);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return deny("auth_missing");
  const token = authHeader.slice(7);

  const verifyClaims =
    deps?.verifyClaims ??
    (async (t: string) => {
      if (!supabaseUrl || !anonKey) return { claims: null, error: { message: "no env" } };
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${t}` } },
      });
      const { data, error } = await userClient.auth.getClaims(t);
      return {
        claims: (data?.claims as Record<string, unknown> | null) ?? null,
        error: error ? { message: error.message } : null,
      };
    });

  const { claims, error: claimsError } = await verifyClaims(token);
  if (claimsError || !claims?.sub) return deny("jwt_invalid", claimsError?.message);

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof claims.exp === "number" ? claims.exp : 0;
  const iat = typeof claims.iat === "number" ? claims.iat : 0;
  if (exp <= now) return deny("jwt_expired");
  if (iat > now + 60) return deny("jwt_invalid");
  if (claims.aud !== "authenticated" || claims.role !== "authenticated") {
    return deny("jwt_bad_audience");
  }

  ctxBase.adminUserId = claims.sub as string;
  const adminId = ctxBase.adminUserId;
  // Re-hash IP scoped to the admin id for stronger pseudonymity in the audit log.
  ctxBase.ipHash = ipRaw ? await sha256Hex(`${ipRaw}:${adminId}`) : null;

  const deps2: ReplayDeps = { admin, notifySlack: deps?.notifySlack };

  const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
    _user_id: adminId,
    _role: "admin",
  });
  if (roleErr || isAdmin !== true) {
    return denyResponse(deps2, "role_not_admin", ctxBase, cors, roleErr?.message);
  }

  let body: { event_id?: unknown } = {};
  try { body = await req.json(); } catch {
    return denyResponse(deps2, "body_invalid", ctxBase, cors);
  }
  if (!isValidEventId(body.event_id)) {
    return denyResponse(deps2, "event_id_invalid", ctxBase, cors);
  }
  const eventId = body.event_id;
  ctxBase.eventId = eventId;

  const { data: rl, error: rlErr } = await admin.rpc("check_stripe_replay_rate_limit", {
    p_user_id: adminId,
    p_event_id: eventId,
  });
  if (rlErr) return denyResponse(deps2, "rate_limit_check_failed", ctxBase, cors, rlErr.message);
  const decision = Array.isArray(rl) ? rl[0] : rl;
  if (!decision?.allowed) {
    const reasonCode = decision?.reason as string | undefined;
    const mapped: DenialReason =
      reasonCode === "rate_limited_minute"
        ? "rate_limit_minute"
        : reasonCode === "rate_limited_hour"
          ? "rate_limit_hour"
          : reasonCode === "event_cooldown"
            ? "rate_limit_event_cooldown"
            : "rate_limit_minute";
    return denyResponse(deps2, mapped, ctxBase, cors);
  }

  const { data: row, error: lookupError } = await admin
    .from("stripe_webhook_events")
    .select("id, event_id, event_type, payload")
    .eq("event_id", eventId)
    .maybeSingle();
  if (lookupError) return json({ error: lookupError.message }, 500, cors);
  if (!row) return denyResponse(deps2, "event_not_found", ctxBase, cors);

  const writeAudit = (status: string, error: string | null) =>
    admin.from("stripe_webhook_replay_audit").insert({
      admin_user_id: adminId,
      event_id: eventId,
      status,
      error: error?.slice(0, 1000) ?? null,
      ip_hash: ctxBase.ipHash,
      user_agent: ctxBase.userAgent,
      origin: ctxBase.origin?.slice(0, 256) ?? null,
    });

  try {
    const processStripeEvent = await loadProcessStripeEvent();
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
}

serve((req) => handleReplayRequest(req));
