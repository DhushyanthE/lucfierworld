/**
 * Native statevector engine — a TypeScript port of the `engine.py` described in
 * DEVELOPMENT.md (§ quantum-core/engine.py). Zero SDK dependency: no Qiskit,
 * no Cirq, no Braket — those are Python-only and cannot run on Deno.
 *
 * Supported gates: h, x, y, z, s, t, rz(theta), cx, cz.
 * State is stored as parallel real/imaginary Float64Arrays of length 2^n.
 */

export type Gate =
  | { gate: "h" | "x" | "y" | "z" | "s" | "t"; qubit: number }
  | { gate: "rz" | "rx" | "ry"; qubit: number; theta: number }
  | { gate: "cx" | "cz"; control: number; target: number };

export const MAX_QUBITS = 16;

export class Statevector {
  readonly n: number;
  readonly re: Float64Array;
  readonly im: Float64Array;

  constructor(n: number) {
    if (!Number.isInteger(n) || n < 1 || n > MAX_QUBITS) {
      throw new Error(`num_qubits must be an integer in 1..${MAX_QUBITS}`);
    }
    this.n = n;
    const size = 1 << n;
    this.re = new Float64Array(size);
    this.im = new Float64Array(size);
    this.re[0] = 1; // |00...0>
  }

  /** Apply an arbitrary 2x2 unitary [[a,b],[c,d]] (complex) to one qubit. */
  private apply1(
    q: number,
    a: [number, number],
    b: [number, number],
    c: [number, number],
    d: [number, number],
  ) {
    if (q < 0 || q >= this.n) throw new Error(`qubit ${q} out of range`);
    const bit = 1 << q;
    const size = this.re.length;
    for (let i = 0; i < size; i++) {
      if (i & bit) continue;
      const j = i | bit;
      const x0r = this.re[i], x0i = this.im[i];
      const x1r = this.re[j], x1i = this.im[j];
      this.re[i] = a[0] * x0r - a[1] * x0i + b[0] * x1r - b[1] * x1i;
      this.im[i] = a[0] * x0i + a[1] * x0r + b[0] * x1i + b[1] * x1r;
      this.re[j] = c[0] * x0r - c[1] * x0i + d[0] * x1r - d[1] * x1i;
      this.im[j] = c[0] * x0i + c[1] * x0r + d[0] * x1i + d[1] * x1r;
    }
  }

  h(q: number) {
    const s = Math.SQRT1_2;
    this.apply1(q, [s, 0], [s, 0], [s, 0], [-s, 0]);
  }
  x(q: number) {
    this.apply1(q, [0, 0], [1, 0], [1, 0], [0, 0]);
  }
  y(q: number) {
    this.apply1(q, [0, 0], [0, -1], [0, 1], [0, 0]);
  }
  z(q: number) {
    this.apply1(q, [1, 0], [0, 0], [0, 0], [-1, 0]);
  }
  s(q: number) {
    this.apply1(q, [1, 0], [0, 0], [0, 0], [0, 1]);
  }
  t(q: number) {
    const s = Math.SQRT1_2;
    this.apply1(q, [1, 0], [0, 0], [0, 0], [s, s]);
  }
  rz(q: number, theta: number) {
    const h = theta / 2;
    this.apply1(q, [Math.cos(-h), Math.sin(-h)], [0, 0], [0, 0], [
      Math.cos(h),
      Math.sin(h),
    ]);
  }
  rx(q: number, theta: number) {
    const c = Math.cos(theta / 2);
    const s = -Math.sin(theta / 2);
    this.apply1(q, [c, 0], [0, s], [0, s], [c, 0]);
  }
  ry(q: number, theta: number) {
    const c = Math.cos(theta / 2);
    const s = Math.sin(theta / 2);
    this.apply1(q, [c, 0], [-s, 0], [s, 0], [c, 0]);
  }

  /** Deep copy — needed for expectation values that change basis in place. */
  clone(): Statevector {
    const sv = new Statevector(this.n);
    sv.re.set(this.re);
    sv.im.set(this.im);
    return sv;
  }

  cx(control: number, target: number) {
    this.controlled(control, target, "x");
  }
  cz(control: number, target: number) {
    this.controlled(control, target, "z");
  }

  private controlled(control: number, target: number, kind: "x" | "z") {
    if (control === target) throw new Error("control and target must differ");
    if (control < 0 || control >= this.n) throw new Error(`control ${control} out of range`);
    if (target < 0 || target >= this.n) throw new Error(`target ${target} out of range`);
    const cb = 1 << control;
    const tb = 1 << target;
    const size = this.re.length;
    for (let i = 0; i < size; i++) {
      if (!(i & cb)) continue;
      if (kind === "z") {
        if (i & tb) {
          this.re[i] = -this.re[i];
          this.im[i] = -this.im[i];
        }
        continue;
      }
      if (i & tb) continue;
      const j = i | tb;
      const tr = this.re[i], ti = this.im[i];
      this.re[i] = this.re[j];
      this.im[i] = this.im[j];
      this.re[j] = tr;
      this.im[j] = ti;
    }
  }

  applyGate(g: Gate) {
    switch (g.gate) {
      case "h": return this.h(g.qubit);
      case "x": return this.x(g.qubit);
      case "y": return this.y(g.qubit);
      case "z": return this.z(g.qubit);
      case "s": return this.s(g.qubit);
      case "t": return this.t(g.qubit);
      case "rz": return this.rz(g.qubit, g.theta);
      case "rx": return this.rx(g.qubit, g.theta);
      case "ry": return this.ry(g.qubit, g.theta);
      case "cx": return this.cx(g.control, g.target);
      case "cz": return this.cz(g.control, g.target);
      default: throw new Error(`unknown gate: ${(g as { gate: string }).gate}`);
    }
  }

  probabilities(): Float64Array {
    const size = this.re.length;
    const p = new Float64Array(size);
    for (let i = 0; i < size; i++) {
      p[i] = this.re[i] * this.re[i] + this.im[i] * this.im[i];
    }
    return p;
  }

  /** Sample `shots` computational-basis outcomes using crypto-grade randomness. */
  sample(shots: number): Record<string, number> {
    if (!Number.isInteger(shots) || shots < 1 || shots > 20000) {
      throw new Error("shots must be an integer in 1..20000");
    }
    const p = this.probabilities();
    const cdf = new Float64Array(p.length);
    let acc = 0;
    for (let i = 0; i < p.length; i++) {
      acc += p[i];
      cdf[i] = acc;
    }
    const counts: Record<string, number> = {};
    for (let s = 0; s < shots; s++) {
      const r = randomUnit() * acc;
      let lo = 0, hi = cdf.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cdf[mid] < r) lo = mid + 1;
        else hi = mid;
      }
      const key = lo.toString(2).padStart(this.n, "0");
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }

  /**
   * Projectively measure one qubit, collapsing the state (used by BB84 so the
   * eavesdropper's disturbance is a real consequence of measurement, not a
   * hand-written error rate).
   */
  measureQubit(q: number): 0 | 1 {
    const bit = 1 << q;
    let p1 = 0;
    for (let i = 0; i < this.re.length; i++) {
      if (i & bit) p1 += this.re[i] * this.re[i] + this.im[i] * this.im[i];
    }
    const outcome: 0 | 1 = randomUnit() < p1 ? 1 : 0;
    const norm = Math.sqrt(outcome === 1 ? p1 : 1 - p1) || 1;
    for (let i = 0; i < this.re.length; i++) {
      const keep = outcome === 1 ? (i & bit) !== 0 : (i & bit) === 0;
      if (keep) {
        this.re[i] /= norm;
        this.im[i] /= norm;
      } else {
        this.re[i] = 0;
        this.im[i] = 0;
      }
    }
    return outcome;
  }

  /** Non-zero amplitudes, for display. */
  amplitudes(limit = 32) {
    const out: { state: string; re: number; im: number; probability: number }[] = [];
    for (let i = 0; i < this.re.length && out.length < limit; i++) {
      const prob = this.re[i] * this.re[i] + this.im[i] * this.im[i];
      if (prob < 1e-12) continue;
      out.push({
        state: i.toString(2).padStart(this.n, "0"),
        re: round(this.re[i]),
        im: round(this.im[i]),
        probability: round(prob),
      });
    }
    return out;
  }
}

export function randomUnit(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 0x1_0000_0000;
}

export function randomBit(): 0 | 1 {
  return randomUnit() < 0.5 ? 0 : 1;
}

function round(x: number): number {
  return Math.abs(x) < 1e-12 ? 0 : Math.round(x * 1e9) / 1e9;
}

/** GHZ circuit: h(0) then cx(0, k) for all k>0. Perfectly correlated outcomes. */
export function ghz(numQubits: number): Statevector {
  const sv = new Statevector(numQubits);
  sv.h(0);
  for (let k = 1; k < numQubits; k++) sv.cx(0, k);
  return sv;
}
