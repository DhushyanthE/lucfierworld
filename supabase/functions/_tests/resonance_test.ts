import { assert, assertEquals } from "jsr:@std/assert@1";
import {
  deterministicChallenge,
  fieldCoherence,
  harmonicResonance,
  phaseLabel,
  resonanceVector,
  temporalCoherence,
} from "../_shared/resonance.ts";

Deno.test("resonance challenge is deterministic and cell-specific", () => {
  const a = deterministicChallenge("abc", 7, "cell-1");
  assertEquals(a, deterministicChallenge("abc", 7, "cell-1"));
  assert(a !== deterministicChallenge("abc", 7, "cell-2"));
  assert(a >= 0.75 && a <= 1);
});

Deno.test("security axes are hard gates", () => {
  const base = {
    quantum: 0.8, integrity: 1, temporal: 0.9,
    reputation: 0.8, stake: 0.8, challenge: 0.9,
  };
  assert(harmonicResonance(base) > 0);
  assertEquals(harmonicResonance({ ...base, quantum: 0 }), 0);
  assertEquals(harmonicResonance({ ...base, integrity: 0 }), 0);
});

Deno.test("harmonic resonance exposes a weak dimension", () => {
  const balanced = harmonicResonance({
    quantum: 0.8, integrity: 1, temporal: 0.8,
    reputation: 0.8, stake: 0.8, challenge: 0.8,
  });
  const weakTemporal = harmonicResonance({
    quantum: 0.8, integrity: 1, temporal: 0.05,
    reputation: 0.8, stake: 1, challenge: 1,
  });
  assert(weakTemporal < balanced);
});

Deno.test("temporal coherence decays with latency and slash memory", () => {
  assert(temporalCoherence(50, 500, 0) > temporalCoherence(450, 500, 0));
  assert(temporalCoherence(50, 500, 0) > temporalCoherence(50, 500, 3));
});

Deno.test("resonance vector normalizes all axes", () => {
  const v = resonanceVector({
    bellGate: 0.8, hashOk: true, signatureOk: true, qkdOk: true,
    latencyMs: 100, onTimeLimitMs: 500, reputation: 1.5,
    stakeWeight: 0.7, slashes: 0, prevHash: "0", round: 1, cellId: "cell-0",
  });
  for (const value of Object.values(v)) assert(value >= 0 && value <= 1);
});

Deno.test("field coherence rewards similar network state", () => {
  const same = Array.from({ length: 4 }, () => ({
    quantum: .8, integrity: 1, temporal: .8, reputation: .7, stake: .6, challenge: .9,
  }));
  const split = [...same.slice(0, 2), ...same.slice(0, 2).map(v => ({ ...v, temporal: .1, stake: .1 }))];
  assert(fieldCoherence(same) > fieldCoherence(split));
});

Deno.test("phase labels are stable", () => {
  assertEquals(phaseLabel(.8), "RESONANT");
  assertEquals(phaseLabel(.6), "COHERENT");
  assertEquals(phaseLabel(.2), "TRANSITION");
  assertEquals(phaseLabel(0), "COLLAPSED");
});
