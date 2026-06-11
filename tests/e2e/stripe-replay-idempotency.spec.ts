import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Verifies that re-sending the SAME Stripe replay event_id many times in quick
// succession produces exactly ONE matching audit row with the expected
// denial_reason (event cooldown / dedupe behaviour from
// public.check_stripe_replay_rate_limit + uniqueness in stripe_webhook_replay_audit).

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test.describe("Stripe replay — idempotency / single audit row", () => {
  test.skip(
    !SUPABASE_URL || !SUPABASE_ANON || !ADMIN_EMAIL || !ADMIN_PASSWORD,
    "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD / Supabase env required",
  );

  test("five identical replays for the same event_id produce one audit row", async ({ request }) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    expect(authErr, authErr?.message).toBeNull();
    const accessToken = auth.session!.access_token;

    const eventId = `evt_e2e_idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const endpoint = `${SUPABASE_URL}/functions/v1/stripe-webhook-replay`;

    // Fire 5 identical replays back-to-back. Because the event does not exist,
    // we expect denial; because of cooldown, only the first should be recorded.
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        request.post(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON,
          },
          data: { event_id: eventId },
        }),
      ),
    );

    // All requests must complete (no 5xx); statuses can be a mix of denials.
    for (const r of responses) {
      expect(r.status(), `unexpected 5xx for ${eventId}`).toBeLessThan(500);
    }

    // Poll the audit table via the authenticated session (admin RLS).
    let rows: Array<{ event_id: string; denial_reason: string | null }> = [];
    for (let i = 0; i < 8; i++) {
      const { data } = await supabase
        .from("stripe_webhook_replay_audit")
        .select("event_id, denial_reason")
        .eq("event_id", eventId);
      rows = data ?? [];
      if (rows.length > 0) break;
      await new Promise((r) => setTimeout(r, 500));
    }

    expect(rows.length, `expected exactly 1 audit row for ${eventId}, got ${rows.length}`).toBe(1);
    expect(rows[0].denial_reason).not.toBeNull();
  });
});
