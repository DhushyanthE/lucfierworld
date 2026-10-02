// Port of test_decision_audit.py + QKD/consensus checks for the fabric pipeline.
import { assert, assertEquals } from "jsr:@std/assert@1";
import { canonical, entangledQKD, runFabric, sha3, signPayload, verifyRecord } from "../_shared/fabric.ts";
import { mlDsa } from "../_shared/pqc.ts";

Deno.test("clean entangled QKD has ~0% QBER and is secure", () => {
  const r = entangledQKD(512, false);
  assertEquals(r.mismatches, 0);
  assert(r.secure && r.key_bits > 0);
});
Deno.test("eavesdropper raises QBER above 11%", () => {
  const r = entangledQKD(2048, true);
  assert(r.qber_percent > 11, `qber ${r.qber_percent}`);
  assert(!r.secure);
});
Deno.test("canonical JSON is key-order independent", () => {
  assertEquals(sha3(canonical({ a: 1, b: 2 })), sha3(canonical({ b: 2, a: 1 })));
  assertEquals(sha3("x").length, 128);
});
Deno.test("valid record verifies; tampered payload and forged signature are caught", () => {
  const k = mlDsa.keygen(), other = mlDsa.keygen();
  const rec = signPayload({ tool: "run_bb84", qber: 27.5 }, k.secret_key_b64, k.public_key_b64);
  assert(verifyRecord(rec).valid);
  const t = verifyRecord({ ...rec, payload: { tool: "run_bb84", qber: 0 } });
  assert(!t.hash_matches && !t.valid);
  const f = verifyRecord({ ...rec, signature_b64: signPayload(rec.payload, other.secret_key_b64, other.public_key_b64).signature_b64 });
  assert(f.hash_matches && !f.signature_valid);
});
Deno.test("consensus accepts clean run, rejects tamper and eavesdropper", () => {
  assert(runFabric({}).consensus.accepted);
  assert(!runFabric({ tamper: true }).consensus.accepted);
  assert(!runFabric({ eavesdropper: true, rounds: 2048 }).consensus.accepted);
});
