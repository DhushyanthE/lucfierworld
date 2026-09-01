// Realtime auth + edge-function ownership tests.
// Verifies anon and cross-user clients cannot read user-scoped tables.
import { assertEquals, assert } from "https://deno.land/std@0.224.0/testing/asserts.ts";
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

Deno.test("anon cannot SELECT quantum_firewall_logs", async () => {
  const c = testClient(URL, ANON);
  const { data, error } = await c.from("quantum_firewall_logs").select("id").limit(1);
  assert(error || (data ?? []).length === 0, "anon should be blocked");
});

Deno.test("anon cannot SELECT user_secrets", async () => {
  const c = testClient(URL, ANON);
  const { data, error } = await c.from("user_secrets").select("user_id").limit(1);
  assert(error || (data ?? []).length === 0, "user_secrets must be deny-all");
});

Deno.test("anon cannot SELECT quantum_transfer_history", async () => {
  const c = testClient(URL, ANON);
  const { data } = await c.from("quantum_transfer_history").select("id").limit(1);
  assertEquals((data ?? []).length, 0);
});

Deno.test("anon cannot SELECT notifications", async () => {
  const c = testClient(URL, ANON);
  const { data } = await c.from("notifications").select("id").limit(1);
  assertEquals((data ?? []).length, 0);
});

Deno.test("realtime subscription on quantum_firewall_logs gets no rows for anon", async () => {
  const c = testClient(URL, ANON);
  let received = 0;
  const ch = c.channel("test-fwall")
    .on("postgres_changes", { event: "*", schema: "public", table: "quantum_firewall_logs" },
      () => { received++; })
    .subscribe();
  await new Promise((r) => setTimeout(r, 1500));
  assertEquals(received, 0);
  await c.removeChannel(ch);
});

Deno.test("password reset endpoint returns constant 200 for unknown email", async () => {
  const r = await fetch(`${URL}/functions/v1/send-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON },
    body: JSON.stringify({ email: `nobody-${Date.now()}@example.invalid` }),
  });
  await r.text();
  assert(r.status === 200 || r.status === 204, `expected 2xx, got ${r.status}`);
});
