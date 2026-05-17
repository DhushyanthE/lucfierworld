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

const event = (type: string, object: Record<string, unknown>) => ({
  id: `evt_${type.replaceAll(".", "_")}`,
  type,
  data: { object },
});

const createAdminMock = () => {
  const ops: Array<{ table: string; action: string; payload: unknown; filter?: unknown }> = [];
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
