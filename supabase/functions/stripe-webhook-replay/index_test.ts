// Integration tests for stripe-webhook-replay denial paths.
// Run with: deno test --allow-net --allow-env supabase/functions/stripe-webhook-replay/index_test.ts
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

// Stub env BEFORE importing the handler — it reads ALLOWED_ORIGINS at module load.
Deno.env.set("STRIPE_REPLAY_ALLOWED_ORIGINS", "https://app.test");
Deno.env.set("SUPABASE_URL", "http://localhost:54321");
Deno.env.set("SUPABASE_ANON_KEY", "anon-key");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");

const { handleReplayRequest } = await import("./index.ts");

// ---------- Fake Supabase client ----------
type FakeOpts = {
  isAdmin?: boolean;
  claims?: Record<string, unknown> | null;
  claimsError?: { message: string } | null;
  rateLimit?: { allowed: boolean; reason?: string };
  webhookEvent?: { event_id: string; event_type: string; payload: unknown } | null;
};

const auditInserts: Array<Record<string, unknown>> = [];

const makeAdmin = (opts: FakeOpts) => ({
  rpc: (name: string) => {
    if (name === "has_role") {
      return Promise.resolve({ data: opts.isAdmin === true, error: null });
    }
    if (name === "check_stripe_replay_rate_limit") {
      const r = opts.rateLimit ?? { allowed: true };
      return Promise.resolve({ data: [r], error: null });
    }
    return Promise.resolve({ data: null, error: { message: `unknown rpc ${name}` } });
  },
  from: (table: string) => {
    if (table === "stripe_webhook_replay_audit") {
      return {
        insert: (row: Record<string, unknown>) => {
          auditInserts.push(row);
          return Promise.resolve({ data: null, error: null });
        },
      };
    }
    if (table === "stripe_webhook_events") {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: opts.webhookEvent ?? null, error: null }),
          }),
        }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      };
    }
    return { insert: () => Promise.resolve({ data: null, error: null }) };
  },
});

// Patch createClient inside the supabase module so auth.getClaims is controllable.
let currentClaims: { data: { claims: Record<string, unknown> | null } | null; error: unknown } = {
  data: null, error: { message: "default" },
};
const supabaseMod = await import("https://esm.sh/@supabase/supabase-js@2");
const originalCreate = supabaseMod.createClient;
// deno-lint-ignore no-explicit-any
(supabaseMod as any).createClient = (_url: string, key: string) => {
  if (key === "anon-key") {
    return { auth: { getClaims: () => Promise.resolve(currentClaims) } } as never;
  }
  return originalCreate(_url, key);
};

const ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const futureExp = () => Math.floor(Date.now() / 1000) + 3600;
const pastExp = () => Math.floor(Date.now() / 1000) - 10;

const baseHeaders = (overrides: Record<string, string> = {}) => ({
  "content-type": "application/json",
  "origin": "https://app.test",
  "x-requested-with": "XMLHttpRequest",
  "x-csrf-token": "abcdef0123456789abcdef0123456789",
  "authorization": "Bearer fake.jwt.token",
  ...overrides,
});

const makeReq = (
  body: unknown,
  headers: Record<string, string> = baseHeaders(),
  method = "POST",
) =>
  new Request("https://fn.test/stripe-webhook-replay", {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });

const setupAdminClaims = () => {
  currentClaims = {
    data: {
      claims: {
        sub: ADMIN_ID,
        aud: "authenticated",
        role: "authenticated",
        exp: futureExp(),
        iat: Math.floor(Date.now() / 1000) - 10,
      },
    },
    error: null,
  };
};

const validEventId = "evt_test_1234567890ab";

// ---------- Tests ----------

Deno.test("denies non-POST methods", async () => {
  auditInserts.length = 0;
  const res = await handleReplayRequest(makeReq(null, baseHeaders(), "GET"), {
    admin: makeAdmin({}) as never,
  });
  assertEquals(res.status, 405);
  const json = await res.json();
  assertEquals(json.reason, "method_not_allowed");
});

Deno.test("denies request missing CSRF XHR header", async () => {
  auditInserts.length = 0;
  const h = baseHeaders();
  delete (h as Record<string, string>)["x-requested-with"];
  const res = await handleReplayRequest(makeReq({ event_id: validEventId }, h), {
    admin: makeAdmin({}) as never,
  });
  assertEquals(res.status, 403);
  const json = await res.json();
  assertEquals(json.reason, "csrf_xhr_missing");
  assert(auditInserts.some((r) => r.status === "denied:csrf_xhr_missing"));
});

Deno.test("denies request from non-allowlisted origin", async () => {
  auditInserts.length = 0;
  const res = await handleReplayRequest(
    makeReq({ event_id: validEventId }, baseHeaders({ origin: "https://evil.test" })),
    { admin: makeAdmin({}) as never },
  );
  assertEquals(res.status, 403);
  const json = await res.json();
  assertEquals(json.reason, "cors_origin_blocked");
});

Deno.test("denies request missing or short CSRF token", async () => {
  auditInserts.length = 0;
  const res = await handleReplayRequest(
    makeReq({ event_id: validEventId }, baseHeaders({ "x-csrf-token": "short" })),
    { admin: makeAdmin({}) as never },
  );
  assertEquals(res.status, 403);
  const json = await res.json();
  assertEquals(json.reason, "csrf_token_missing");
});

Deno.test("denies request with expired JWT", async () => {
  auditInserts.length = 0;
  currentClaims = {
    data: {
      claims: {
        sub: ADMIN_ID, aud: "authenticated", role: "authenticated",
        exp: pastExp(), iat: pastExp() - 100,
      },
    },
    error: null,
  };
  const res = await handleReplayRequest(makeReq({ event_id: validEventId }), {
    admin: makeAdmin({ isAdmin: true }) as never,
  });
  assertEquals(res.status, 401);
  const json = await res.json();
  assertEquals(json.reason, "jwt_expired");
  assert(auditInserts.some((r) => r.status === "denied:jwt_expired"));
});

Deno.test("denies request with invalid JWT signature", async () => {
  auditInserts.length = 0;
  currentClaims = { data: null, error: { message: "bad signature" } };
  const res = await handleReplayRequest(makeReq({ event_id: validEventId }), {
    admin: makeAdmin({}) as never,
  });
  assertEquals(res.status, 401);
  const json = await res.json();
  assertEquals(json.reason, "jwt_invalid");
});

Deno.test("denies request when JWT belongs to non-admin user", async () => {
  auditInserts.length = 0;
  setupAdminClaims();
  const res = await handleReplayRequest(makeReq({ event_id: validEventId }), {
    admin: makeAdmin({ isAdmin: false }) as never,
  });
  assertEquals(res.status, 403);
  const json = await res.json();
  assertEquals(json.reason, "role_not_admin");
  assert(auditInserts.some((r) => r.status === "denied:role_not_admin"));
});

Deno.test("denies request when event_id is invalid", async () => {
  auditInserts.length = 0;
  setupAdminClaims();
  const res = await handleReplayRequest(makeReq({ event_id: "not-an-event" }), {
    admin: makeAdmin({ isAdmin: true }) as never,
  });
  assertEquals(res.status, 400);
  const json = await res.json();
  assertEquals(json.reason, "event_id_invalid");
});

Deno.test("denies request when per-minute rate limit is exceeded", async () => {
  auditInserts.length = 0;
  setupAdminClaims();
  const res = await handleReplayRequest(makeReq({ event_id: validEventId }), {
    admin: makeAdmin({
      isAdmin: true,
      rateLimit: { allowed: false, reason: "rate_limited_minute" },
    }) as never,
  });
  assertEquals(res.status, 429);
  const json = await res.json();
  assertEquals(json.reason, "rate_limit_minute");
  assert(auditInserts.some((r) => r.status === "denied:rate_limit_minute"));
});

Deno.test("denies request when event cooldown is active", async () => {
  auditInserts.length = 0;
  setupAdminClaims();
  const res = await handleReplayRequest(makeReq({ event_id: validEventId }), {
    admin: makeAdmin({
      isAdmin: true,
      rateLimit: { allowed: false, reason: "event_cooldown" },
    }) as never,
  });
  assertEquals(res.status, 429);
  const json = await res.json();
  assertEquals(json.reason, "rate_limit_event_cooldown");
});

Deno.test("denies request when target event is not found", async () => {
  auditInserts.length = 0;
  setupAdminClaims();
  const res = await handleReplayRequest(makeReq({ event_id: validEventId }), {
    admin: makeAdmin({ isAdmin: true, webhookEvent: null }) as never,
  });
  assertEquals(res.status, 404);
  const json = await res.json();
  assertEquals(json.reason, "event_not_found");
  assert(auditInserts.some((r) => r.status === "denied:event_not_found"));
});

Deno.test("emits Slack notification for severe denials (role_not_admin)", async () => {
  auditInserts.length = 0;
  setupAdminClaims();
  const slackCalls: string[] = [];
  const res = await handleReplayRequest(makeReq({ event_id: validEventId }), {
    admin: makeAdmin({ isAdmin: false }) as never,
    notifySlack: (t) => { slackCalls.push(t); return Promise.resolve(); },
  });
  assertEquals(res.status, 403);
  assert(slackCalls.length >= 1, "expected Slack notify for role denial");
  assert(slackCalls[0].includes("role_not_admin"));
});
