// E2E: drives the stripe-webhook-replay edge function until it returns 429,
// waits for the per-minute rate-limit window to roll over (the SQL function
// check_stripe_replay_rate_limit uses interval '1 minute'), then asserts:
//   (a) the very next replay no longer returns 429
//   (b) a new audit row appears in stripe_webhook_replay_audit AFTER the
//       last 429 row — confirming the rate-limit counter actually reset.
import { test, expect, request as pwRequest } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const ANON         = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const EMAIL        = process.env.E2E_ADMIN_EMAIL!;
const PASSWORD     = process.env.E2E_ADMIN_PASSWORD!;
const SERVICE      = process.env.SUPABASE_SERVICE_ROLE_KEY; // optional, used for audit assertions
const REPLAY_URL   = `${SUPABASE_URL}/functions/v1/stripe-webhook-replay`;
const EVENT_ID     = process.env.E2E_STRIPE_EVENT_ID ?? "evt_e2e_ratelimit_recovery";

const CSRF = "e2e-csrf-token-0123456789abcdef";

test.describe("stripe-webhook-replay rate-limit recovery", () => {
  test.skip(
    !SUPABASE_URL || !ANON || !EMAIL || !PASSWORD,
    "Requires VITE_SUPABASE_URL/KEY + E2E_ADMIN_EMAIL/PASSWORD.",
  );
  // Window reset is up to ~70s — give the suite room.
  test.setTimeout(180_000);

  test("429 clears after the 1-minute window and audit log advances", async () => {
    const supa = createClient(SUPABASE_URL, ANON);
    const { data: signIn, error } = await supa.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
    expect(error, "admin sign-in must succeed").toBeNull();
    const jwt = signIn.session!.access_token;

    const api = await pwRequest.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${jwt}`,
        apikey: ANON,
        "Content-Type": "application/json",
        "x-requested-with": "XMLHttpRequest",
        "x-csrf-token": CSRF,
      },
    });

    // Fire until we hit 429. SQL limits are 5/min + 30s per-event cooldown,
    // so a different event_id per call exercises the per-minute bucket.
    let saw429 = false;
    for (let i = 0; i < 12 && !saw429; i++) {
      const r = await api.post(REPLAY_URL, { data: { event_id: `${EVENT_ID}_${i}` } });
      if (r.status() === 429) {
        const body = await r.json();
        expect(body.reason).toMatch(/^rate_limit_(minute|hour|event_cooldown)$/);
        saw429 = true;
      } else {
        // event_not_found is fine — only the denial path matters here.
        expect([200, 404]).toContain(r.status());
      }
    }
    expect(saw429, "expected to trigger a 429 within 12 attempts").toBe(true);

    // Note when the last 429 audit row was written (best-effort).
    let lastDenyAt: string | null = null;
    if (SERVICE) {
      const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } });
      const { data } = await admin
        .from("stripe_webhook_replay_audit")
        .select("created_at,status")
        .like("status", "denied:rate_limit_%")
        .order("created_at", { ascending: false })
        .limit(1);
      lastDenyAt = data?.[0]?.created_at ?? null;
    }

    // Wait out the 1-minute window with a small safety margin.
    await new Promise((r) => setTimeout(r, 65_000));

    // Replay should now be accepted (or 404 if the event truly doesn't exist).
    const recoveryEventId = `${EVENT_ID}_recovery_${Date.now()}`;
    const after = await api.post(REPLAY_URL, { data: { event_id: recoveryEventId } });
    expect(after.status(), "must not be rate-limited after window reset").not.toBe(429);
    expect([200, 404]).toContain(after.status());

    // Audit log must advance past the last 429.
    if (SERVICE) {
      const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } });
      const { data: latest } = await admin
        .from("stripe_webhook_replay_audit")
        .select("created_at,status,event_id")
        .eq("event_id", recoveryEventId)
        .order("created_at", { ascending: false })
        .limit(1);
      expect(latest?.[0], "post-reset replay must have created an audit row").toBeTruthy();
      expect(latest![0].status.startsWith("denied:rate_limit_")).toBe(false);
      if (lastDenyAt) {
        expect(new Date(latest![0].created_at).getTime())
          .toBeGreaterThan(new Date(lastDenyAt).getTime());
      }
    }
  });
});
