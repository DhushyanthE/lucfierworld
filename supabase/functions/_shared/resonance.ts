/**
 * Dharmic Resonance Engine (DRE)
 *
 * This is a project-specific research scoring model, not a standardized
 * blockchain consensus algorithm. It deliberately avoids a plain weighted sum:
 * a weighted harmonic mean makes a weak dimension a bottleneck, so stake cannot
 * compensate for broken quantum/integrity conditions.
 */
import { sha3 } from "./fabric.ts";

export type ResonanceVector = {
  quantum: number;
  integrity: number;
  temporal: number;
  reputation: number;
  stake: number;
  challenge: number;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function deterministicChallenge(prevHash: string, round: number, cellId: string) {
  const digest = sha3(`${prevHash}:${round}:${cellId}:DRE`);
  // 48 deterministic bits are enough for a stable simulation challenge.
  const n = Number.parseInt(digest.slice(0, 12), 16);
  return Math.round((0.75 + (n / 0xffffffffffff) * 0.25) * 1e6) / 1e6;
}

export function temporalCoherence(latencyMs: number, onTimeLimitMs: number, slashes: number) {
  const latencyQuality = Math.exp(-Math.max(0, latencyMs) / Math.max(1, onTimeLimitMs));
  const memoryPenalty = Math.exp(-Math.max(0, slashes) * 0.45);
  return clamp01(latencyQuality * memoryPenalty);
}

export function resonanceVector(input: {
  bellGate: number;
  hashOk: boolean;
  signatureOk: boolean;
  qkdOk: boolean;
  latencyMs: number;
  onTimeLimitMs: number;
  reputation: number;
  stakeWeight: number;
  slashes: number;
  prevHash: string;
  round: number;
  cellId: string;
}): ResonanceVector {
  return {
    quantum: input.qkdOk ? clamp01(input.bellGate) : 0,
    integrity: input.hashOk && input.signatureOk ? 1 : 0,
    temporal: temporalCoherence(input.latencyMs, input.onTimeLimitMs, input.slashes),
    reputation: clamp01(input.reputation / 2),
    stake: clamp01(input.stakeWeight),
    challenge: deterministicChallenge(input.prevHash, input.round, input.cellId),
  };
}

/**
 * Weighted harmonic resonance.
 * Security dimensions (quantum + integrity) are hard gates.
 * Remaining dimensions cannot hide a zero/near-zero dimension.
 */
export function harmonicResonance(v: ResonanceVector) {
  if (v.quantum <= 0 || v.integrity <= 0) return 0;
  const weights: Record<keyof ResonanceVector, number> = {
    quantum: 1.5,
    integrity: 2.0,
    temporal: 1.0,
    reputation: 1.0,
    stake: 0.65,
    challenge: 0.35,
  };
  const keys = Object.keys(weights) as (keyof ResonanceVector)[];
  const numerator = keys.reduce((s, k) => s + weights[k], 0);
  const denominator = keys.reduce((s, k) => s + weights[k] / Math.max(v[k], 1e-9), 0);
  return Math.round((numerator / denominator) * 1e6) / 1e6;
}

export function fieldCoherence(vectors: ResonanceVector[]) {
  if (!vectors.length) return 0;
  const dims = Object.keys(vectors[0]) as (keyof ResonanceVector)[];
  // Mean absolute deviation from each dimension's mean, inverted to [0,1].
  const deviations = dims.map((d) => {
    const mean = vectors.reduce((s, v) => s + v[d], 0) / vectors.length;
    return vectors.reduce((s, v) => s + Math.abs(v[d] - mean), 0) / vectors.length;
  });
  return Math.round(clamp01(1 - deviations.reduce((a, b) => a + b, 0) / dims.length) * 1e6) / 1e6;
}

export function phaseLabel(score: number) {
  if (score >= 0.75) return "RESONANT";
  if (score >= 0.5) return "COHERENT";
  if (score > 0) return "TRANSITION";
  return "COLLAPSED";
}
