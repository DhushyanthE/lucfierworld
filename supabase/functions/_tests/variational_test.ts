/**
 * Real verification of the variational layer — no mocks, no fixtures. Each test
 * asserts a property that would break if the physics or the gradients were wrong.
 *
 * Run: deno test supabase/functions/_tests/variational_test.ts
 */

import { assert, assertAlmostEquals, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { Statevector } from "../_shared/statevector.ts";
import {
  hamiltonianEnergy,
  parameterShiftGradient,
  pauliExpectation,
  runQAOAMaxCut,
  runVQE,
  trainQuantumClassifier,
} from "../_shared/variational.ts";

Deno.test("pauliExpectation: <0|Z|0> = 1, <+|X|+> = 1, <0|X|0> = 0", () => {
  const zero = new Statevector(1);
  assertAlmostEquals(pauliExpectation(zero, { coefficient: 1, ops: [{ qubit: 0, pauli: "Z" }] }), 1, 1e-9);
  assertAlmostEquals(pauliExpectation(zero, { coefficient: 1, ops: [{ qubit: 0, pauli: "X" }] }), 0, 1e-9);

  const plus = new Statevector(1);
  plus.h(0);
  assertAlmostEquals(pauliExpectation(plus, { coefficient: 1, ops: [{ qubit: 0, pauli: "X" }] }), 1, 1e-9);
});

Deno.test("pauliExpectation: Bell state has <ZZ> = 1 and <XX> = 1", () => {
  const sv = new Statevector(2);
  sv.h(0);
  sv.cx(0, 1);
  const zz = pauliExpectation(sv, {
    coefficient: 1,
    ops: [{ qubit: 0, pauli: "Z" }, { qubit: 1, pauli: "Z" }],
  });
  const xx = pauliExpectation(sv, {
    coefficient: 1,
    ops: [{ qubit: 0, pauli: "X" }, { qubit: 1, pauli: "X" }],
  });
  assertAlmostEquals(zz, 1, 1e-9);
  assertAlmostEquals(xx, 1, 1e-9);
});

Deno.test("ry rotation: probability of |1> follows sin^2(theta/2)", () => {
  for (const theta of [0, Math.PI / 3, Math.PI / 2, Math.PI]) {
    const sv = new Statevector(1);
    sv.ry(0, theta);
    assertAlmostEquals(sv.probabilities()[1], Math.sin(theta / 2) ** 2, 1e-9);
  }
});

Deno.test("parameter-shift gradient matches the analytic derivative of <Z> under ry", () => {
  const cost = (p: number[]) => {
    const sv = new Statevector(1);
    sv.ry(0, p[0]);
    return hamiltonianEnergy(sv, [{ coefficient: 1, ops: [{ qubit: 0, pauli: "Z" }] }]);
  };
  for (const theta of [0.3, 1.1, 2.4]) {
    const [g] = parameterShiftGradient(cost, [theta]);
    // <Z> = cos(theta) so d/dtheta = -sin(theta)
    assertAlmostEquals(g, -Math.sin(theta), 1e-9);
  }
});

Deno.test("VQE reaches the exact ground energy of the 2-qubit TFIM and beats the product ansatz", () => {
  const r = runVQE({ numQubits: 2, layers: 2, maxIterations: 200 });
  // Exact ground energy of -ZZ - X0 - X1 is -sqrt(5).
  assertAlmostEquals(r.exact_ground_energy, -Math.sqrt(5), 1e-4);
  assertAlmostEquals(r.entangled_ansatz.optimal_value, r.exact_ground_energy, 1e-3);
  assert(r.entanglement_helps, "entangling ansatz should beat the best unentangled one");
  assertEquals(r.entangled_ansatz.gradient_rule, "parameter-shift");
});

Deno.test("QAOA finds the optimal cut of a 4-cycle (cut = 4)", () => {
  const r = runQAOAMaxCut({
    numNodes: 4,
    edges: [{ u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 }, { u: 3, v: 0 }],
    depth: 2,
    shots: 512,
  });
  assertEquals(r.brute_force_optimal_cut, 4);
  assertEquals(r.best_sampled_cut, 4);
  assertEquals(r.approximation_ratio, 1);
});

Deno.test("quantum classifier learns a separable threshold with held-out accuracy", () => {
  const samples = Array.from({ length: 40 }, (_, i) => {
    const x = -1 + (2 * i) / 39;
    return { x, label: (x > 0 ? 1 : 0) as 0 | 1 };
  });
  // Interleave so the split contains both classes.
  const shuffled = samples.filter((_, i) => i % 2 === 0).concat(samples.filter((_, i) => i % 2 === 1));
  const r = trainQuantumClassifier({ samples: shuffled, layers: 2, maxIterations: 250 });
  assert((r.train_accuracy ?? 0) >= 0.9, `train accuracy too low: ${r.train_accuracy}`);
  assert((r.test_accuracy ?? 0) >= 0.9, `test accuracy too low: ${r.test_accuracy}`);
  assert(r.training.optimal_value < r.training.initial_value, "loss must decrease");
});
