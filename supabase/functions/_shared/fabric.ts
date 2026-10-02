/**
 * QuantumSynapse Fabric — integrated pipeline (DEVELOPMENT.md §5f-4 extended).
 *
 *   1. Entanglement-based BB84 (BBM92): Bell pair (|00>+|11>)/sqrt2 per round,
 *      random Z/X bases, optional intercept-resend eavesdropper, QBER check.
 *   2. Decision network: small CNN (1-D conv) + RNN over the input signal, then
 *      a softmax policy head. A toy model, not an AGI.
 *   3. Canonical JSON -> SHA3-512 -> ML-DSA-87 signature (audit_trail.py port).
 *   4. "Cellular ledger": N simulated cell nodes each independently re-verify
 *      hash + signature; the "Proof of Dharmic State" quorum rule accepts a
 *      block only if >= 2/3 of cells agree AND the QKD channel was secure.
 *      Cells are software nodes — nothing here runs in biological tissue.
 */
import { sha3_512 } from "npm:@noble/hashes@2.3.0/sha3.js";
import { bytesToHex } from "npm:@noble/hashes@2.3.0/utils.js";
import { randomBit, Statevector } from "./statevector.ts";
import { mlDsa } from "./pqc.ts";

// ---------- 1. Entangled QKD ----------
export function entangledQKD(rounds: number, eavesdropper: boolean) {
  if (!Number.isInteger(rounds) || rounds < 16 || rounds > 2048) {
    throw new Error("rounds must be an integer in 16..2048");
  }
  const a: number[] = [], b: number[] = [];
  for (let i = 0; i < rounds; i++) {
    const sv = new Statevector(2);
    sv.h(0); sv.cx(0, 1); // Bell state |Φ+>
    const ba = randomBit(), bb = randomBit();
    if (eavesdropper) {
      const eb = randomBit();
      if (eb) sv.h(1);
      const m = sv.measureQubit(1);
      if (eb) sv.h(1);
      void m;
    }
    if (ba) sv.h(0);
    const ra = sv.measureQubit(0);
    if (bb) sv.h(1);
    const rb = sv.measureQubit(1);
    if (ba === bb) { a.push(ra); b.push(rb); }
  }
  const sample = Math.max(1, Math.floor(a.length / 4));
  let mism = 0;
  for (let i = 0; i < sample; i++) if (a[i] !== b[i]) mism++;
  const qber = (mism / sample) * 100;
  const secure = qber <= 11;
  const key = a.slice(sample);
  return {
    state: "(|00> + |11>)/sqrt(2)",
    rounds, eavesdropper,
    sifted_bits: a.length, sampled_bits: sample, mismatches: mism,
    qber_percent: Math.round(qber * 100) / 100,
    secure,
    key_bits: secure ? key.length : 0,
    key_hex: secure ? bitsToHex(key).slice(0, 32) : "",
  };
}
function bitsToHex(bits: number[]) {
  let s = "";
  for (let i = 0; i + 4 <= bits.length; i += 4) s += ((bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | bits[i + 3]).toString(16);
  return s;
}

// ---------- 2. Decision network (CNN + RNN + policy) ----------
const ACTIONS = ["approve", "review", "reject"] as const;
function prng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32 - 0.5; }; }
export function decide(signal: number[], qber: number) {
  if (!Array.isArray(signal) || signal.length < 4 || signal.length > 256 || signal.some((v) => typeof v !== "number" || !isFinite(v))) {
    throw new Error("signal must be 4..256 finite numbers");
  }
  const r = prng(42);
  const kernel = [r(), r(), r()];
  const conv = signal.slice(0, -2).map((_, i) => Math.max(0, kernel[0] * signal[i] + kernel[1] * signal[i + 1] + kernel[2] * signal[i + 2])); // CNN+ReLU
  const wx = r(), wh = r();
  let h = 0;
  for (const x of conv) h = Math.tanh(wx * x + wh * h); // RNN
  const feats = [h, qber / 100, conv.reduce((s, v) => s + v, 0) / conv.length];
  const W = [[2.0, -4.0, 0.5], [0.2, 1.0, 0.1], [-1.5, 6.0, -0.4]];
  const logits = W.map((row) => row.reduce((s, w, i) => s + w * feats[i], 0));
  const m = Math.max(...logits);
  const ex = logits.map((l) => Math.exp(l - m));
  const z = ex.reduce((s, v) => s + v, 0);
  const probs = ex.map((v) => v / z);
  const idx = probs.indexOf(Math.max(...probs));
  return { action: ACTIONS[idx], probabilities: Object.fromEntries(ACTIONS.map((a, i) => [a, Math.round(probs[i] * 1e4) / 1e4])), features: feats.map((f) => Math.round(f * 1e4) / 1e4) };
}

// ---------- 3. Hash + sign ----------
export function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(",")}}`;
  return JSON.stringify(v);
}
export const sha3 = (s: string) => bytesToHex(sha3_512(new TextEncoder().encode(s)));

export interface SignedRecord { payload: Record<string, unknown>; hash: string; signature_b64: string; public_key_b64: string }
export function signPayload(payload: Record<string, unknown>, sk: string, pk: string): SignedRecord {
  const hash = sha3(canonical(payload));
  return { payload, hash, signature_b64: mlDsa.sign(sk, hash).signature_b64, public_key_b64: pk };
}
export function verifyRecord(r: SignedRecord) {
  const hash_matches = sha3(canonical(r.payload)) === r.hash;
  const signature_valid = mlDsa.verify(r.public_key_b64, r.hash, r.signature_b64);
  return { hash_matches, signature_valid, valid: hash_matches && signature_valid };
}

// ---------- 4. Cellular ledger + Proof of Dharmic State ----------
export function cellularConsensus(rec: SignedRecord, qkdSecure: boolean, cells: number, prevHash: string) {
  if (!Number.isInteger(cells) || cells < 3 || cells > 64) throw new Error("cells must be 3..64");
  const votes = Array.from({ length: cells }, (_, i) => {
    const v = verifyRecord(rec); // each cell re-verifies independently
    return { cell: `cell-${i}`, accept: v.valid && qkdSecure };
  });
  const yes = votes.filter((v) => v.accept).length;
  const accepted = yes * 3 >= cells * 2;
  const block = accepted ? { prev_hash: prevHash, record_hash: rec.hash, block_hash: sha3(prevHash + rec.hash) } : null;
  return { rule: ">= 2/3 cells verify SHA3-512 + ML-DSA-87 AND QKD QBER <= 11%", cells, accept_votes: yes, accepted, block, votes };
}

export function runFabric(opts: { rounds?: number; eavesdropper?: boolean; signal?: number[]; cells?: number; tamper?: boolean }) {
  const qkd = entangledQKD(opts.rounds ?? 256, !!opts.eavesdropper);
  const decision = decide(opts.signal ?? [0.2, 0.5, 0.9, 0.4, 0.7, 0.1, 0.3, 0.8], qkd.qber_percent);
  const keys = mlDsa.keygen();
  const payload = { decision, qkd_qber_percent: qkd.qber_percent, qkd_key_fingerprint: qkd.key_hex ? sha3(qkd.key_hex).slice(0, 16) : null, timestamp: Date.now() };
  const record = signPayload(payload, keys.secret_key_b64, keys.public_key_b64);
  const toCheck = opts.tamper ? { ...record, payload: { ...payload, decision: { ...decision, action: "approve" } } } : record;
  const consensus = cellularConsensus(toCheck, qkd.secure, opts.cells ?? 9, "0".repeat(128));
  return {
    qkd, decision, record: { hash: record.hash, signature_bytes: Math.round(record.signature_b64.length * 3 / 4), tampered: !!opts.tamper },
    verification: verifyRecord(toCheck), consensus,
    status: "Simulation. Cells are software nodes; the decision model is a small CNN+RNN, not AGI. QKD, SHA3-512 and ML-DSA-87 are real algorithms.",
  };
}
