import { assert, assertEquals } from "jsr:@std/assert@1";
import { analyzeTelemetry, auditHash, classify, recommendation, threatScore } from "../_shared/defense.ts";
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
  assert(mlDsa.verify(f.public_key_b64, f.payload_hash, f.signature_b64));
});

Deno.test("audit chain changes with previous head", () => {
  const f = analyzeTelemetry(clean, "2026-01-01T00:00:00.000Z");
  assert(auditHash("a", f) !== auditHash("b", f));
});
