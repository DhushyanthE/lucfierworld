// Verifies the post-fix posture of the analytics ingestion path:
//
//  1. Anonymous clients can NOT insert directly into public.analytics_events
//     (RLS now requires auth.uid() = user_id, no anon insert policy).
//  2. The track-analytics edge function still accepts anonymous calls, but
//     populates ip_address and user_agent from REQUEST HEADERS — any
//     attacker-supplied user_agent in the JSON body is ignored.
import { assert, assertEquals, assertNotEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { shutdown, testClient } from "./_client.ts";
// Load .env explicitly. The auto-loading `dotenv/load.ts` cross-checks .env
// against .env.example and throws when any documented VITE_* var is unset,
// which has nothing to do with what these tests need — so load without the
// example check instead.
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
await load({ envPath: ".env", export: true, examplePath: null });

const URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // optional, only for verification

Deno.test("anon cannot INSERT into analytics_events", async () => {
  const c = testClient(URL, ANON);
  const { error } = await c.from("analytics_events").insert({
    event_name: "anon_should_fail",
    user_id: null,
    ip_address: "1.2.3.4",
    user_agent: "forged-agent",
  });
  // RLS should reject; service must NOT silently accept anon writes anymore.
  assert(error, "anonymous insert into analytics_events must fail under RLS");
});

Deno.test("anon cannot INSERT into analytics_events even when passing a fake user_id", async () => {
  const c = testClient(URL, ANON);
  const { error } = await c.from("analytics_events").insert({
    event_name: "anon_with_fake_uid",
    user_id: "00000000-0000-0000-0000-000000000000",
  });
  assert(error, "anonymous insert with fabricated user_id must still fail");
});

Deno.test("track-analytics ignores client-supplied user_agent and uses request headers", async () => {
  const forgedUA = "EVIL/9.9 (forged-by-client-body)";
  const realUA = "QSF-Integration-Test/1.0";
  const sessionId = `anon-test-${crypto.randomUUID()}`;

  const res = await fetch(`${URL}/functions/v1/track-analytics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      "User-Agent": realUA,
      "X-Forwarded-For": "203.0.113.7",
    },
    body: JSON.stringify({
      event_name: "anon_via_edge_fn",
      session_id: sessionId,
      user_agent: forgedUA, // must be IGNORED server-side
      page_url: "https://example.test/anon-edge",
    }),
  });

  // Read the body once up front: the assertion message is evaluated eagerly, so
  // inlining `await res.text()` there consumed the stream and then failed to cancel it.
  const body = await res.text();
  assertEquals(res.status, 200, `expected 200, got ${res.status}: ${body}`);

  // Assert against the row the function itself reports it stored. This is the
  // authoritative record and needs no service-role key, so the check runs in
  // every environment instead of silently degrading to a no-op.
  const stored = JSON.parse(body).data as {
    session_id: string;
    user_agent: string | null;
    ip_address: string | null;
  };
  assert(stored, "edge function should return the stored analytics row");
  assertEquals(stored.session_id, sessionId);
  assertNotEquals(stored.user_agent, forgedUA, "client-supplied user_agent must NOT be stored");
  assertEquals(stored.user_agent, realUA, "user_agent must come from the request header");
  // ip_address is derived server-side; the platform may rewrite the exact value,
  // so assert only that it was populated rather than pinning a literal.
  assert(stored.ip_address, "ip_address should be populated server-side from headers");
});
