import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Hammer the stripe-webhook-replay edge function as a real admin until the
 * per-minute rate limit (default 5/min) trips. Asserts:
 *   - the trigger response is 429 with reason `rate_limit_minute`
 *   - the human-readable error message is "Rate limited"
 *   - a `denied:rate_limit_minute` audit row exists for the firing event_id
 *
 * Uses a fresh, non-existent event_id so we exercise the rate-limit gate
 * (which runs before the event lookup) without mutating real webhook state.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://lttxaakpruqqgqdlwpki.supabase.co";
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dHhhYWtwcnVxcWdxZGx3cGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTA4MzIsImV4cCI6MjA3NTE4NjgzMn0.q9EXcUP3RNU290B0y36BYOlrj6S7u3MuJaZ13J5W6cA";
const REPLAY_URL = `${SUPABASE_URL}/functions/v1/stripe-webhook-replay`;

const EMAIL = process.env.E2E_ADMIN_EMAIL!;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test.skip(!EMAIL || !PASSWORD, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

test("stripe-webhook-replay rate limit trips with 429 + audit row", async ({ request }) => {
  test.setTimeout(60_000);

  const client = createClient(SUPABASE_URL, ANON_KEY);
  const { data: signIn, error } = await client.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (error || !signIn.session) throw new Error(`admin sign-in failed: ${error?.message}`);
  const jwt = signIn.session.access_token;

  const headers = {
    "content-type": "application/json",
    apikey: ANON_KEY,
    authorization: `Bearer ${jwt}`,
    "x-requested-with": "XMLHttpRequest",
    "x-csrf-token": "ratelimit-e2e".padEnd(32, "0"),
  };

  // 1 unique id per request so the event_cooldown rule never triggers — only
  // the per-minute count gate. Default cap is 5/min, so the 6th attempt fires.
  const eventIds = Array.from({ length: 8 }, (_, i) => `evt_rl_${Date.now()}_${i}`);
  const statuses: number[] = [];
  let trippedBody: { reason?: string; error?: string } | null = null;
  let trippedEventId: string | null = null;

  for (const id of eventIds) {
    const res = await request.post(REPLAY_URL, { headers, data: { event_id: id } });
    statuses.push(res.status());
    if (res.status() === 429) {
      trippedBody = await res.json();
      trippedEventId = id;
      break;
    }
  }

  expect(statuses, `statuses observed: ${statuses.join(",")}`).toContain(429);
  expect(trippedBody?.reason).toBe("rate_limit_minute");
  expect(trippedBody?.error).toMatch(/rate limited/i);
  expect(trippedEventId).not.toBeNull();

  // Audit row for the firing event_id should exist within a few seconds.
  let row: { event_id: string; status: string } | null = null;
  for (let i = 0; i < 6; i++) {
    const { data } = await client
      .from("stripe_webhook_replay_audit")
      .select("event_id, status")
      .eq("event_id", trippedEventId!)
      .eq("status", "denied:rate_limit_minute")
      .limit(1);
    if (data && data.length > 0) { row = data[0]; break; }
    await new Promise((r) => setTimeout(r, 500));
  }
  expect(row, "expected denied:rate_limit_minute audit row").not.toBeNull();
});
