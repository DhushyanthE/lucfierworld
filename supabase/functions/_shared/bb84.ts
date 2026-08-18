/**
 * BB84 quantum key distribution — TypeScript port of the BB84 simulator in
 * DEVELOPMENT.md (§5.1 `/v1/quantum/bb84/simulate`, mirrored by rust-qkd-sim).
 *
 * Every bit is prepared and measured on the real statevector engine in
 * ./statevector.ts, so the eavesdropper's QBER emerges from actual projective
 * measurement in the wrong basis — it is not a hardcoded error rate.
 */

import { randomBit, Statevector } from "./statevector.ts";

export interface BB84Result {
  num_bits: number;
  simulate_eavesdropper: boolean;
  sample_fraction: number;
  matching_bases: number;
  sifted_key_length: number;
  sampled_bits: number;
  mismatches: number;
  qber_percent: number;
  eavesdropper_detected: boolean;
  final_key_length: number;
  final_key_preview: string;
  explanation: string;
}

/** Prepare |0>, |1>, |+> or |-> depending on bit and basis (0 = Z, 1 = X). */
function prepare(bit: 0 | 1, basis: 0 | 1): Statevector {
  const sv = new Statevector(1);
  if (bit === 1) sv.x(0);
  if (basis === 1) sv.h(0);
  return sv;
}

/** Measure in the given basis, collapsing the qubit. */
function measure(sv: Statevector, basis: 0 | 1): 0 | 1 {
  if (basis === 1) sv.h(0);
  return sv.measureQubit(0);
}

export function simulateBB84(
  numBits: number,
  simulateEavesdropper: boolean,
  sampleFraction: number,
): BB84Result {
  if (!Number.isInteger(numBits) || numBits < 8 || numBits > 4096) {
    throw new Error("num_bits must be an integer in 8..4096");
  }
  if (!(sampleFraction > 0 && sampleFraction < 1)) {
    throw new Error("sample_fraction must be between 0 and 1 (exclusive)");
  }

  const siftedAlice: (0 | 1)[] = [];
  const siftedBob: (0 | 1)[] = [];

  for (let i = 0; i < numBits; i++) {
    const aliceBit = randomBit();
    const aliceBasis = randomBit();
    const sv = prepare(aliceBit, aliceBasis);

    if (simulateEavesdropper) {
      // Intercept-resend: Eve measures in a random basis, then re-prepares
      // what she saw. Wrong-basis interceptions damage Bob's statistics.
      const eveBasis = randomBit();
      const eveBit = measure(sv, eveBasis);
      const resent = prepare(eveBit, eveBasis);
      sv.re.set(resent.re);
      sv.im.set(resent.im);
    }

    const bobBasis = randomBit();
    const bobBit = measure(sv, bobBasis);

    if (aliceBasis === bobBasis) {
      siftedAlice.push(aliceBit);
      siftedBob.push(bobBit);
    }
  }

  const sampleSize = Math.max(1, Math.floor(siftedAlice.length * sampleFraction));
  let mismatches = 0;
  for (let i = 0; i < sampleSize; i++) {
    if (siftedAlice[i] !== siftedBob[i]) mismatches++;
  }
  const qber = sampleSize > 0 ? (mismatches / sampleSize) * 100 : 0;
  // Intercept-resend on all bits yields ~25% QBER; 11% is the standard
  // security threshold for BB84 with one-way post-processing.
  const detected = qber > 11;

  const finalKey = siftedAlice.slice(sampleSize);

  return {
    num_bits: numBits,
    simulate_eavesdropper: simulateEavesdropper,
    sample_fraction: sampleFraction,
    matching_bases: siftedAlice.length,
    sifted_key_length: siftedAlice.length,
    sampled_bits: sampleSize,
    mismatches,
    qber_percent: Math.round(qber * 100) / 100,
    eavesdropper_detected: detected,
    final_key_length: detected ? 0 : finalKey.length,
    final_key_preview: detected ? "" : finalKey.slice(0, 32).join(""),
    explanation: detected
      ? `QBER of ${qber.toFixed(2)}% exceeds the 11% BB84 threshold. The sifted key is discarded — an intercept-resend eavesdropper disturbs roughly 25% of the sampled bits because measuring in the wrong basis collapses the qubit.`
      : `QBER of ${qber.toFixed(2)}% is within the 11% BB84 threshold, so the remaining ${finalKey.length} sifted bits are kept as the shared key. Bases matched on ${siftedAlice.length}/${numBits} bits, which is the expected ~50%.`,
  };
}
