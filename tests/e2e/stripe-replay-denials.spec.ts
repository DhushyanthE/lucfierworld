import { test, expect } from "@playwright/test";

/**
 * Direct HTTP checks against the deployed stripe-webhook-replay edge function.
 *
 * Covers the unauthorized + CSRF-mismatch denial paths. These tests do NOT
 * require an admin login — they assert the function rejects the request and
 * (where applicable) records the correct `denied:<reason>` audit row.
 *
 * Audit verification is only performed when E2E_ADMIN_EMAIL/PASSWORD are
 * provided (admin SELECT is required by RLS on stripe_webhook_replay_audit).
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://lttxaakpruqqgqdlwpki.supabase.co";
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dHhhYWtwcnVxcWdxZGx3cGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTA4MzIsImV4cCI6MjA3NTE4NjgzMn0.q9EXcUP3RNU290B0y36BYOlrj6S7u3MuJaZ13J5W6cA";
const REPLAY_URL = `${SUPABASE_URL}/functions/v1/stripe-webhook-replay`;

const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

const validEventId = () => `evt_e2e_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

const baseHeaders = (overrides: Record<string, string> = {}) => ({
  "content-type": "application/json",
  "apikey": ANON_KEY,
  "x-requested-with": "XMLHttpRequest",
  "x-csrf-token": "e2e".padEnd(32, "0"),
  ...overrides,
});

async function adminClient() {
  if (!EMAIL || !PASSWORD) return null;
  const client = createClient(SUPABASE_URL, ANON_KEY);
  const { error } = await client.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (error) throw new Error(`admin sign-in failed: ${error.message}`);
  return client;
}

async function findAuditRow(eventId: string, expectedStatus: string) {
  const client = await adminClient();
  if (!client) return null;
  // The audit insert is fire-and-forget; poll briefly so the test isn't flaky.
  for (let i = 0; i < 5; i++) {
    const { data } = await client
      .from("stripe_webhook_replay_audit")
      .select("event_id, status, error")
      .eq("event_id", eventId)
      .eq("status", expectedStatus)
      .limit(1);
    if (data && data.length > 0) return data[0];
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

test.describe("stripe-webhook-replay — denial paths (HTTP)", () => {
  test("unauthorized (no JWT) returns 401 auth_missing and logs nothing for that event", async ({ request }) => {
    const eventId = validEventId();
    const res = await request.post(REPLAY_URL, {
      headers: baseHeaders(), // no Authorization
      data: { event_id: eventId },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.reason).toBe("auth_missing");
    expect(body.error).toMatch(/unauthorized/i);

    // auth_missing happens before we have an admin_user_id, so no audit row is
    // written for the event_id — verify the absence when we have admin access.
    const client = await adminClient();
    if (client) {
      const { data } = await client
        .from("stripe_webhook_replay_audit")
        .select("id")
        .eq("event_id", eventId)
        .limit(1);
      expect(data ?? []).toHaveLength(0);
    }
  });

  test("invalid bearer token returns 401 jwt_invalid", async ({ request }) => {
    const eventId = validEventId();
    const res = await request.post(REPLAY_URL, {
      headers: baseHeaders({ authorization: "Bearer not.a.real.jwt" }),
      data: { event_id: eventId },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.reason).toBe("jwt_invalid");
  });

  test("CSRF mismatch — missing x-requested-with returns 403 csrf_xhr_missing + audit row", async ({ request }) => {
    const eventId = validEventId();
    const headers = baseHeaders();
    delete (headers as Record<string, string>)["x-requested-with"];

    const res = await request.post(REPLAY_URL, {
      headers,
      data: { event_id: eventId },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.reason).toBe("csrf_xhr_missing");
    expect(body.error).toMatch(/csrf/i);

    const row = await findAuditRow(eventId, "denied:csrf_xhr_missing");
    if (EMAIL && PASSWORD) {
      expect(row, "expected denied:csrf_xhr_missing audit row").not.toBeNull();
    }
  });

  test("CSRF mismatch — short/empty x-csrf-token returns 403 csrf_token_missing + audit row", async ({ request }) => {
    const eventId = validEventId();
    const res = await request.post(REPLAY_URL, {
      headers: baseHeaders({ "x-csrf-token": "short" }), // <16 chars triggers csrf_token_missing
      data: { event_id: eventId },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.reason).toBe("csrf_token_missing");

    const row = await findAuditRow(eventId, "denied:csrf_token_missing");
    if (EMAIL && PASSWORD) {
      expect(row, "expected denied:csrf_token_missing audit row").not.toBeNull();
    }
  });
});
