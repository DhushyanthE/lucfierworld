import { assert, assertEquals } from "jsr:@std/assert@1";
import { analyzeTelemetry, auditHash, classify, recommendation, threatScore } from "../_shared/defense.ts";
import { persistAuditEvent } from "../_shared/defense-audit.ts";
import { mlDsa } from "../_shared/pqc.ts";

const clean = {
  source: "test",
  failed_auth: 0,
  new_processes: 1,
  outbound_spike: 0.05,
  file_entropy: 0.1,
  privilege_change: false,
  known_ioc_match: false,
};

Deno.test("quiet telemetry remains low risk", () => {
  const s = threatScore(clean);
  assert(s < .35);
  assertEquals(classify(s), "low");
  assertEquals(recommendation(s), "observe");
});

Deno.test("combined defensive indicators produce isolation recommendation", () => {
  const s = threatScore({
    ...clean, failed_auth: 20, new_processes: 25, outbound_spike: 1,
    file_entropy: 1, privilege_change: true, known_ioc_match: true,
  });
  assert(s >= .75);
  assertEquals(recommendation(s), "recommend_isolation");
});

Deno.test("finding always requires human approval and carries valid ML-DSA signature", () => {
  const f = analyzeTelemetry(clean, "2026-01-01T00:00:00.000Z");
  assertEquals(f.requires_human_approval, true);
  assertEquals(f.payload_sha3_256.length, 64);
  assertEquals(f.payload_hash.length, 128);
  assert(mlDsa.verify(f.public_key_b64, f.payload_sha3_256, f.signature_b64));
});

Deno.test("durable audit append stores the SHA3-256 digest with its ML-DSA signature", async () => {
  const finding = analyzeTelemetry(clean, "2026-01-01T00:00:00.000Z");
  let appended: Record<string, unknown> | null = null;
  const client = {
    rpc: async (_name: string, args: Record<string, unknown>) => {
      appended = args;
      return { data: { id: "audit-test" }, error: null };
    },
  };
  await persistAuditEvent(client, {
    correlation_id: "test-correlation", source: finding.source,
    severity: finding.severity, recommendation: finding.recommendation,
    score: finding.score, payload_hash: finding.payload_hash,
    payload_sha3_256: finding.payload_sha3_256, audit_hash: "a".repeat(128),
    previous_audit_hash: "0".repeat(128), review_engine: "test",
    review_yes: 9, review_total: 9, quorum_met: true,
    reasons: finding.reasons, signature_b64: finding.signature_b64,
    public_key_b64: finding.public_key_b64,
  });
  assert(appended !== null);
  assertEquals(appended.p_payload_sha3_256, finding.payload_sha3_256);
  assertEquals(appended.p_signature_b64, finding.signature_b64);
  assertEquals(appended.p_public_key_b64, finding.public_key_b64);
});

Deno.test("audit chain changes with previous head", () => {
  const f = analyzeTelemetry(clean, "2026-01-01T00:00:00.000Z");
  assert(auditHash("a", f) !== auditHash("b", f));
});

import { reviewDefensiveFinding } from "../_shared/defense-review.ts";

Deno.test("severe signed telemetry escalates only to a human", () => {
  const t = { ...clean, failed_auth: 20, new_processes: 25, outbound_spike: 1,
    file_entropy: 1, privilege_change: true, known_ioc_match: true };
  const f = analyzeTelemetry(t, "2026-01-01T00:00:00.000Z");
  const review = reviewDefensiveFinding(f, t);
  assertEquals(review.verified, true);
  assertEquals(review.yes, 9);
  assertEquals(review.quorum_required, 7);
  assertEquals(review.decision, "escalate_to_human");
  assertEquals(review.executable, false);
});

Deno.test("tampered signed finding fails closed", () => {
  const f = analyzeTelemetry(clean, "2026-01-01T00:00:00.000Z");
  const review = reviewDefensiveFinding({ ...f, score: 1 }, clean);
  assertEquals(review.verified, false);
  assertEquals(review.yes, 0);
  assertEquals(review.quorum_met, false);
});

Deno.test("changing evidence after signing fails verification", () => {
  const f = analyzeTelemetry(clean, "2026-01-01T00:00:00.000Z");
  const review = reviewDefensiveFinding(f, { ...clean, known_ioc_match: true });
  assertEquals(review.verified, false);
  assertEquals(review.decision, "needs_manual_review");
});
