import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { processStripeEvent } from "./index.ts";

const session = (overrides: Record<string, unknown> = {}) => ({
  id: "cs_test_123",
  payment_status: "paid",
  payment_intent: "pi_test_123",
  customer: "cus_test_123",
  amount_total: 1999,
  currency: "usd",
  customer_details: { email: "customer@example.com" },
  metadata: { user_id: "11111111-1111-4111-8111-111111111111", product: "pro_access" },
  ...overrides,
});

const charge = (overrides: Record<string, unknown> = {}) => ({
  id: "ch_test_123",
  payment_intent: "pi_test_123",
  customer: "cus_test_123",
  amount: 1999,
  amount_refunded: 1999,
  refunded: true,
  ...overrides,
});

const event = (type: string, object: Record<string, unknown>) => ({
  id: `evt_${type.replaceAll(".", "_")}`,
  type,
  data: { object },
});

const createAdminMock = (selectRows: Record<string, unknown> = {}) => {
  const ops: Array<{ table: string; action: string; payload?: unknown; filter?: unknown }> = [];
  const admin = {
    from(table: string) {
      return {
        update(payload: unknown) {
          return {
            async eq(column: string, value: string) {
              ops.push({ table, action: "update", payload, filter: { column, value } });
              return { error: null };
            },
          };
        },
        async upsert(payload: unknown) {
          ops.push({ table, action: "upsert", payload });
          return { error: null };
        },
        async insert(payload: unknown) {
          ops.push({ table, action: "insert", payload });
          return { error: null };
        },
        select(_cols: string) {
          return {
            eq(column: string, value: string) {
              return {
                async maybeSingle() {
                  ops.push({ table, action: "select", filter: { column, value } });
                  return { data: selectRows[table] ?? null, error: null };
                },
              };
            },
          };
        },
      };
    },
  };
  return { admin, ops };
};

Deno.test("checkout.session.completed paid event updates payment, unlocks customer status, and sends receipt", async () => {
  const { admin, ops } = createAdminMock();
  let receiptCount = 0;

  const result = await processStripeEvent(
    admin,
    event("checkout.session.completed", session()) as never,
    async () => { receiptCount += 1; return null; },
  );

  assertEquals(result.status, "processed");
  assertEquals(receiptCount, 1);
  assertEquals(ops.find((op) => op.table === "payments")?.payload, {
    status: "paid",
    stripe_payment_intent_id: "pi_test_123",
    stripe_customer_id: "cus_test_123",
    amount_total: 1999,
    currency: "usd",
  });
  assertEquals(ops.some((op) => op.table === "customer_status" && op.action === "upsert"), true);
  assertEquals(ops.some((op) => op.table === "notifications" && op.action === "insert"), true);
});

Deno.test("checkout.session.async_payment_failed marks payment failed without unlocking customer status", async () => {
  const { admin, ops } = createAdminMock();

  const result = await processStripeEvent(
    admin,
    event("checkout.session.async_payment_failed", session({ payment_status: "unpaid" })) as never,
    async () => { throw new Error("receipt should not be sent"); },
  );

  assertEquals(result.status, "processed");
  assertEquals(ops.find((op) => op.table === "payments")?.payload, {
    status: "failed",
    stripe_payment_intent_id: "pi_test_123",
    stripe_customer_id: "cus_test_123",
  });
  assertEquals(ops.some((op) => op.table === "customer_status"), false);
  assertEquals(ops.some((op) => op.table === "notifications"), false);
});

Deno.test("checkout.session.expired marks payment expired", async () => {
  const { admin, ops } = createAdminMock();
  const result = await processStripeEvent(
    admin,
    event("checkout.session.expired", session({ payment_status: "unpaid" })) as never,
    async () => null,
  );
  assertEquals(result.status, "processed");
  assertEquals((ops.find((op) => op.table === "payments")?.payload as { status: string }).status, "expired");
  assertEquals(ops.some((op) => op.table === "customer_status"), false);
});

Deno.test("charge.refunded (full) marks payment refunded, deactivates status, notifies user", async () => {
  const { admin, ops } = createAdminMock({
    payments: { user_id: "11111111-1111-4111-8111-111111111111" },
  });
  const result = await processStripeEvent(
    admin,
    event("charge.refunded", charge()) as never,
    async () => null,
  );
  assertEquals(result.status, "processed");
  const paymentOp = ops.find((op) => op.table === "payments" && op.action === "update");
  assertEquals((paymentOp?.payload as { status: string }).status, "refunded");
  const statusOp = ops.find((op) => op.table === "customer_status" && op.action === "upsert");
  assertEquals((statusOp?.payload as { active: boolean; tier: string }).active, false);
  assertEquals((statusOp?.payload as { active: boolean; tier: string }).tier, "free");
  assertEquals(ops.some((op) => op.table === "notifications" && op.action === "insert"), true);
});

Deno.test("charge.refunded (partial) marks payment partially_refunded and does not deactivate", async () => {
  const { admin, ops } = createAdminMock({
    payments: { user_id: "11111111-1111-4111-8111-111111111111" },
  });
  const result = await processStripeEvent(
    admin,
    event("charge.refunded", charge({ refunded: false, amount_refunded: 500 })) as never,
    async () => null,
  );
  assertEquals(result.status, "processed");
  const paymentOp = ops.find((op) => op.table === "payments" && op.action === "update");
  assertEquals((paymentOp?.payload as { status: string }).status, "partially_refunded");
  assertEquals(ops.some((op) => op.table === "customer_status"), false);
  assertEquals(ops.some((op) => op.table === "notifications"), false);
});

Deno.test("charge.refunded with no matching payment skips status changes", async () => {
  const { admin, ops } = createAdminMock(); // no payments row returned
  const result = await processStripeEvent(
    admin,
    event("charge.refunded", charge()) as never,
    async () => null,
  );
  assertEquals(result.status, "processed");
  assertEquals(ops.some((op) => op.table === "customer_status"), false);
});

Deno.test("paid checkout remains processed when receipt email fails and records the email error", async () => {
  const { admin } = createAdminMock();
  const result = await processStripeEvent(
    admin,
    event("checkout.session.completed", session()) as never,
    async () => "Receipt email failed: provider unavailable",
  );
  assertEquals(result.status, "processed_with_email_error");
  assertEquals(result.error, "Receipt email failed: provider unavailable");
});
