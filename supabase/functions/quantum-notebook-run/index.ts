/**
 * quantum-notebook-run — live re-run of the checks in
 * notebooks/QuantumSynapseFabric_Qiskit_Verified.ipynb.
 *
 * HONESTY BOUNDARY: the notebook itself is Python + Qiskit and cannot execute on
 * Deno. This function re-runs the SAME circuits and assertions on the project's
 * own statevector engine (supabase/functions/_shared/statevector.ts) so the
 * numbers are freshly sampled, not replayed from a recorded run. It is labelled
 * as the TypeScript engine, never as Qiskit output.
 *
 * Read-only: no chain access, no signing, no database writes.
 */

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { ghz, randomBit, Statevector } from "../_shared/statevector.ts";
import { simulateBB84 } from "../_shared/bb84.ts";

type CellResult = {
  index: number;
  title: string;
  status: "passed" | "failed";
  output: string;
  error: string | null;
  duration_ms: number;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function timed(index: number, title: string, fn: () => string): CellResult {
  const t0 = performance.now();
  try {
    const output = fn();
    return {
      index,
      title,
      status: "passed",
      output,
      error: null,
      duration_ms: Math.round(performance.now() - t0),
    };
  } catch (e) {
    return {
      index,
      title,
      status: "failed",
      output: "",
      error: e instanceof Error ? e.message : String(e),
      duration_ms: Math.round(performance.now() - t0),
    };
  }
}

/** Cell 4 equivalent: 8-bit quantum random number from H + measurement. */
function cellQrng(): string {
  let bits = "";
  for (let i = 0; i < 8; i++) {
    const sv = new Statevector(1);
    sv.h(0);
    bits += String(sv.measureQubit(0));
  }
  const value = parseInt(bits, 2);
  if (bits.length !== 8) throw new Error("QRNG did not produce 8 bits");
  return `QRNG result: ${bits} -> integer ${value}\nPASS`;
}

/** Cell 6 equivalent: 4-qubit GHZ state must only ever collapse to 0000/1111. */
function cellGhz(): string {
  const shots = 500;
  const counts = ghz(4).sample(shots);
  const keys = Object.keys(counts).sort();
  const stray = keys.filter((k) => k !== "0000" && k !== "1111");
  if (stray.length) {
    throw new Error(`GHZ produced uncorrelated outcomes: ${stray.join(", ")}`);
  }
  return `GHZ counts: ${JSON.stringify(counts)}\nPASS: all ${shots} shots were fully correlated (all-0s or all-1s only)`;
}

/** Cell 8 equivalent: BB84 QBER with and without an intercept-resend eavesdropper. */
function cellBb84(): string {
  const clean = simulateBB84(512, false, 0.25);
  const tapped = simulateBB84(512, true, 0.25);
  if (clean.qber_percent > 1) {
    throw new Error(`clean channel QBER should be ~0%, got ${clean.qber_percent}%`);
  }
  if (tapped.qber_percent < 15) {
    throw new Error(
      `eavesdropped channel QBER should exceed the detection threshold, got ${tapped.qber_percent}%`,
    );
  }
  return [
    `QBER without eavesdropper: ${clean.qber_percent}%`,
    `QBER with eavesdropper:    ${tapped.qber_percent}%`,
    "PASS: eavesdropper correctly pushes QBER past the detection threshold",
  ].join("\n");
}

/**
 * CHSH / Bell check: the optimal quantum strategy must land above the classical
 * limit 2 and at or below the Tsirelson bound 2*sqrt(2) — the same window the
 * LeviathanCoin governance contract enforces on-chain.
 */
function cellChsh(): string {
  const shotsPerSetting = 4000;
  const settings: [number, number][] = [
    [0, Math.PI / 4],
    [0, -Math.PI / 4],
    [Math.PI / 2, Math.PI / 4],
    [Math.PI / 2, -Math.PI / 4],
  ];

  const correlate = (a: number, b: number) => {
    let sum = 0;
    for (let s = 0; s < shotsPerSetting; s++) {
      const sv = new Statevector(2);
      sv.h(0);
      sv.cx(0, 1);
      sv.ry(0, -2 * a);
      sv.ry(1, -2 * b);
      const m0 = sv.measureQubit(0);
      const m1 = sv.measureQubit(1);
      sum += m0 === m1 ? 1 : -1;
    }
    return sum / shotsPerSetting;
  };

  const [e00, e01, e10, e11] = settings.map(([a, b]) => correlate(a, b));
  const S = Math.abs(e00 - e01 + e10 + e11);
  const tsirelson = 2 * Math.SQRT2;
  if (S <= 2) throw new Error(`S = ${S.toFixed(3)} did not beat the classical limit 2`);
  if (S > tsirelson + 0.1) {
    throw new Error(`S = ${S.toFixed(3)} exceeds the Tsirelson bound ${tsirelson.toFixed(3)}`);
  }
  return [
    `CHSH correlators: ${[e00, e01, e10, e11].map((v) => v.toFixed(3)).join(", ")}`,
    `S = ${S.toFixed(3)} (classical limit 2, Tsirelson bound ${tsirelson.toFixed(3)})`,
    `PASS: governance-acceptable score (${(S * 1000).toFixed(0)} milli-units)`,
  ].join("\n");
}

/** Sanity check that the engine's RNG is not stuck on one value. */
function cellRng(): string {
  let ones = 0;
  for (let i = 0; i < 2000; i++) ones += randomBit();
  const ratio = ones / 2000;
  if (ratio < 0.4 || ratio > 0.6) {
    throw new Error(`engine RNG is biased: ${(ratio * 100).toFixed(1)}% ones`);
  }
  return `Engine RNG: ${(ratio * 100).toFixed(1)}% ones over 2000 draws\nPASS: within 40-60% band`;
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST" && req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const t0 = performance.now();
  const cells: CellResult[] = [
    timed(2, "engine bootstrap (statevector RNG)", cellRng),
    timed(4, "def qrng(num_bits: int) -> str:", cellQrng),
    timed(6, "def ghz_counts(num_qubits: int, shots: int) -> dict:", cellGhz),
    timed(8, "def run_single_shot(qc):  # BB84 QBER", cellBb84),
    timed(10, "CHSH / Bell inequality governance window", cellChsh),
  ];

  const failing = cells.filter((c) => c.status === "failed");
  return json({
    notebook: "QuantumSynapseFabric_Qiskit_Verified.ipynb",
    engine: "native TypeScript statevector engine (Deno) — equivalent circuits, not Qiskit",
    ran_at: new Date().toISOString(),
    total_duration_ms: Math.round(performance.now() - t0),
    passed: cells.length - failing.length,
    failing: failing.length,
    failing_cells: failing.map((c) => ({ index: c.index, title: c.title, error: c.error })),
    cells,
  });
});
