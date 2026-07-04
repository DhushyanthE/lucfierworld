import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trash2, Play, KeyRound, Search, Sigma, Network } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Complex-number & quantum-state primitives                                  */
/* -------------------------------------------------------------------------- */

type C = { re: number; im: number };
const c = (re: number, im = 0): C => ({ re, im });
const cAdd = (a: C, b: C): C => ({ re: a.re + b.re, im: a.im + b.im });
const cMul = (a: C, b: C): C => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const cAbs2 = (a: C): number => a.re * a.re + a.im * a.im;

/** Apply a single-qubit 2x2 gate to `target` within an n-qubit statevector. */
function applySingle(state: C[], n: number, target: number, m: [C, C, C, C]): C[] {
  const out = state.map(() => c(0, 0));
  const step = 1 << target;
  for (let i = 0; i < state.length; i++) {
    const bit = (i >> target) & 1;
    const pair = bit === 0 ? i + step : i - step;
    // m = [[m00,m01],[m10,m11]]
    if (bit === 0) {
      out[i] = cAdd(out[i], cMul(m[0], state[i]));
      out[pair] = cAdd(out[pair], cMul(m[2], state[i]));
    } else {
      out[i] = cAdd(out[i], cMul(m[3], state[i]));
      out[pair] = cAdd(out[pair], cMul(m[1], state[i]));
    }
  }
  return out;
}

/** Apply CNOT with `control` and `target` qubits. */
function applyCNOT(state: C[], control: number, target: number): C[] {
  const out = state.slice();
  for (let i = 0; i < state.length; i++) {
    if (((i >> control) & 1) === 1) {
      const j = i ^ (1 << target);
      if (j > i) {
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
    }
  }
  return out;
}

const SQRT1_2 = Math.SQRT1_2;
const GATES = {
  H: [c(SQRT1_2), c(SQRT1_2), c(SQRT1_2), c(-SQRT1_2)] as [C, C, C, C],
  X: [c(0), c(1), c(1), c(0)] as [C, C, C, C],
  Y: [c(0), c(0, -1), c(0, 1), c(0)] as [C, C, C, C],
  Z: [c(1), c(0), c(0), c(-1)] as [C, C, C, C],
  S: [c(1), c(0), c(0), c(0, 1)] as [C, C, C, C],
  T: [c(1), c(0), c(0), c(Math.SQRT1_2, Math.SQRT1_2)] as [C, C, C, C],
};

type GateOp =
  | { kind: "H" | "X" | "Y" | "Z" | "S" | "T"; q: number }
  | { kind: "CNOT"; control: number; target: number };

function simulate(ops: GateOp[], n: number): C[] {
  let state: C[] = Array(1 << n)
    .fill(0)
    .map((_, i) => (i === 0 ? c(1) : c(0)));
  for (const op of ops) {
    if (op.kind === "CNOT") state = applyCNOT(state, op.control, op.target);
    else state = applySingle(state, n, op.q, GATES[op.kind]);
  }
  return state;
}

/* -------------------------------------------------------------------------- */
/*  Circuit Builder                                                            */
/* -------------------------------------------------------------------------- */

function CircuitPanel() {
  const [n, setN] = useState(3);
  const [ops, setOps] = useState<GateOp[]>([{ kind: "H", q: 0 }, { kind: "CNOT", control: 0, target: 1 }]);
  const [gate, setGate] = useState<"H" | "X" | "Y" | "Z" | "S" | "T" | "CNOT">("H");
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(1);

  const state = useMemo(() => simulate(ops, n), [ops, n]);
  const probs = state.map((amp) => cAbs2(amp));

  const label = (i: number) =>
    i.toString(2).padStart(n, "0");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Play className="h-4 w-4" /> Circuit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div>
              <Label className="text-xs">Qubits</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={n}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(5, Number(e.target.value) || 1));
                  setN(v);
                  setOps([]);
                }}
                className="w-20"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Gate</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={gate}
                onChange={(e) => setGate(e.target.value as typeof gate)}
              >
                {["H", "X", "Y", "Z", "S", "T", "CNOT"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">q{gate === "CNOT" ? "c" : ""}</Label>
              <Input type="number" min={0} max={n - 1} value={q1}
                onChange={(e) => setQ1(Number(e.target.value))} className="w-20" />
            </div>
            {gate === "CNOT" && (
              <div>
                <Label className="text-xs">qt</Label>
                <Input type="number" min={0} max={n - 1} value={q2}
                  onChange={(e) => setQ2(Number(e.target.value))} className="w-20" />
              </div>
            )}
            <Button
              onClick={() => {
                if (gate === "CNOT") {
                  if (q1 === q2) return;
                  setOps([...ops, { kind: "CNOT", control: q1, target: q2 }]);
                } else setOps([...ops, { kind: gate, q: q1 }]);
              }}
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ops.length === 0 && <span className="text-sm text-muted-foreground">No gates yet.</span>}
            {ops.map((op, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {op.kind === "CNOT" ? `CNOT ${op.control}→${op.target}` : `${op.kind}·q${op.q}`}
                <button
                  onClick={() => setOps(ops.filter((_, j) => j !== i))}
                  className="ml-1 opacity-60 hover:opacity-100"
                  aria-label="remove gate"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setOps([])}>Clear</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Amplitudes &amp; Probabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.map((amp, i) => {
            const p = probs[i];
            if (p < 1e-9) return null;
            return (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>|{label(i)}⟩</span>
                  <span className="text-muted-foreground">
                    {amp.re.toFixed(3)}{amp.im >= 0 ? "+" : ""}{amp.im.toFixed(3)}i
                  </span>
                  <span>{(p * 100).toFixed(2)}%</span>
                </div>
                <Progress value={p * 100} className="h-1.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  BB84 QKD                                                                   */
/* -------------------------------------------------------------------------- */

type BB84Row = { bit: 0 | 1; aBasis: "+" | "×"; bBasis: "+" | "×"; measured: 0 | 1; kept: boolean };

function bb84(nBits: number, eavesdrop: boolean): { rows: BB84Row[]; key: string; qber: number } {
  const rows: BB84Row[] = [];
  let errors = 0;
  let keptCount = 0;
  for (let i = 0; i < nBits; i++) {
    const bit = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
    const aBasis = (Math.random() < 0.5 ? "+" : "×") as "+" | "×";
    const bBasis = (Math.random() < 0.5 ? "+" : "×") as "+" | "×";
    let carriedBit: 0 | 1 = bit;
    if (eavesdrop) {
      const eBasis = (Math.random() < 0.5 ? "+" : "×") as "+" | "×";
      if (eBasis !== aBasis) carriedBit = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
    }
    const measured: 0 | 1 = bBasis === aBasis ? carriedBit : ((Math.random() < 0.5 ? 0 : 1) as 0 | 1);
    const kept = aBasis === bBasis;
    if (kept) {
      keptCount++;
      if (measured !== bit) errors++;
    }
    rows.push({ bit, aBasis, bBasis, measured, kept });
  }
  const key = rows.filter((r) => r.kept).map((r) => r.bit).join("");
  const qber = keptCount ? errors / keptCount : 0;
  return { rows, key, qber };
}

function BB84Panel() {
  const [nBits, setNBits] = useState(48);
  const [eve, setEve] = useState(false);
  const [run, setRun] = useState(() => bb84(48, false));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4" /> BB84 Quantum Key Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label className="text-xs">Photons</Label>
            <Input type="number" min={8} max={512} value={nBits}
              onChange={(e) => setNBits(Number(e.target.value) || 48)} className="w-24" />
          </div>
          <Button variant={eve ? "destructive" : "outline"} onClick={() => setEve(!eve)}>
            Eavesdropper: {eve ? "ON" : "off"}
          </Button>
          <Button onClick={() => setRun(bb84(nBits, eve))}>Run protocol</Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Stat label="Sifted key length" value={run.key.length} />
          <Stat label="QBER" value={`${(run.qber * 100).toFixed(1)}%`}
            hint={run.qber > 0.11 ? "Above 11% — abort" : "Within tolerance"} />
          <Stat label="Yield" value={`${((run.key.length / nBits) * 100).toFixed(0)}%`} />
        </div>

        <div className="max-h-40 overflow-auto rounded border p-2 font-mono text-xs">
          {run.key || <span className="text-muted-foreground">Empty key</span>}
        </div>

        <div className="max-h-56 overflow-auto rounded border">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/50">
              <tr>
                <th className="px-2 py-1 text-left">#</th>
                <th className="px-2 py-1">Alice bit</th>
                <th className="px-2 py-1">Alice basis</th>
                <th className="px-2 py-1">Bob basis</th>
                <th className="px-2 py-1">Measured</th>
                <th className="px-2 py-1">Kept</th>
              </tr>
            </thead>
            <tbody>
              {run.rows.slice(0, 64).map((r, i) => (
                <tr key={i} className={r.kept ? "" : "opacity-40"}>
                  <td className="px-2 py-1">{i}</td>
                  <td className="px-2 py-1 text-center">{r.bit}</td>
                  <td className="px-2 py-1 text-center">{r.aBasis}</td>
                  <td className="px-2 py-1 text-center">{r.bBasis}</td>
                  <td className="px-2 py-1 text-center">{r.measured}</td>
                  <td className="px-2 py-1 text-center">{r.kept ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Complex algorithm solvers                                                  */
/* -------------------------------------------------------------------------- */

/** Grover over N=2^nBits with an oracle described by a bit-pattern using
 *  '0', '1', '?'. Returns marked indices, optimal iteration count, and the
 *  success-probability trace P(k) = sin²((2k+1)·θ/2), θ=2·asin(√(M/N)). */
function parsePattern(pattern: string, nBits: number): number[] {
  const p = pattern.trim().padStart(nBits, "?").slice(-nBits);
  const marked: number[] = [];
  for (let x = 0; x < (1 << nBits); x++) {
    let ok = true;
    for (let b = 0; b < nBits; b++) {
      const ch = p[nBits - 1 - b];
      if (ch === "0" && ((x >> b) & 1) !== 0) { ok = false; break; }
      if (ch === "1" && ((x >> b) & 1) !== 1) { ok = false; break; }
    }
    if (ok) marked.push(x);
  }
  return marked;
}
function grover(nBits: number, pattern: string) {
  const N = 1 << nBits;
  const marked = parsePattern(pattern, nBits);
  const M = Math.max(1, marked.length);
  const theta = 2 * Math.asin(Math.sqrt(M / N));
  const iters = Math.max(1, Math.round(Math.PI / (2 * theta) - 0.5));
  const trace: { k: number; p: number }[] = [];
  for (let k = 0; k <= iters + 2; k++) {
    const amp = Math.sin((2 * k + 1) * (theta / 2));
    trace.push({ k, p: amp * amp });
  }
  return { N, M, marked, iters, trace };
}

/** Continued-fraction convergents of x (0<x<1) up to denominator ≤ maxDen. */
function continuedFraction(x: number, maxDen: number): { p: number; q: number }[] {
  const out: { p: number; q: number }[] = [];
  let h1 = 1, h0 = 0, k1 = 0, k0 = 1;
  let a = x;
  for (let i = 0; i < 32; i++) {
    const ai = Math.floor(a);
    const h = ai * h1 + h0;
    const k = ai * k1 + k0;
    if (k > maxDen) break;
    out.push({ p: h, q: k });
    const frac = a - ai;
    if (frac < 1e-12) break;
    a = 1 / frac;
    h0 = h1; h1 = h; k0 = k1; k1 = k;
  }
  return out;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
function modpow(base: number, exp: number, m: number): number {
  let r = 1; base = base % m;
  while (exp > 0) { if (exp & 1) r = (r * base) % m; exp = Math.floor(exp / 2); base = (base * base) % m; }
  return r;
}
/** Shor factoring using classical order finding + continued-fraction post-processing
 *  applied to a simulated QPE measurement s/2^t ≈ k/r. */
function shorFactor(N: number): {
  a: number; r: number | null; s: number | null; t: number | null;
  convergents: { p: number; q: number }[]; factors: [number, number] | null; note: string;
} {
  if (N % 2 === 0) return { a: 2, r: null, s: null, t: null, convergents: [], factors: [2, N / 2], note: "Even — trivial factor 2." };
  for (let attempt = 0; attempt < 25; attempt++) {
    const a = 2 + Math.floor(Math.random() * (N - 3));
    const g = gcd(a, N);
    if (g > 1) return { a, r: null, s: null, t: null, convergents: [], factors: [g, N / g], note: `gcd(a,N)=${g}.` };
    let r: number | null = null;
    for (let k = 1; k < N; k++) if (modpow(a, k, N) === 1) { r = k; break; }
    if (!r || r % 2 !== 0) continue;
    // Simulate a QPE outcome s ≈ round(k/r · 2^t) for random 0<k<r.
    const t = Math.ceil(2 * Math.log2(N));
    const k0 = 1 + Math.floor(Math.random() * (r - 1));
    const s = Math.round((k0 / r) * (1 << t));
    const convergents = continuedFraction(s / (1 << t), N);
    const x = modpow(a, r / 2, N);
    if (x === N - 1) continue;
    const p = gcd(x - 1, N); const q = gcd(x + 1, N);
    const f = p > 1 && p < N ? p : q > 1 && q < N ? q : null;
    if (f) return { a, r, s, t, convergents, factors: [f, N / f], note: `Order r=${r} recovered; QPE s=${s}/2^${t}.` };
  }
  return { a: 0, r: null, s: null, t: null, convergents: [], factors: null, note: "Failed — try again or another N." };
}

/* -- QAOA MaxCut (p=1) on a small graph, exact statevector simulation -------- */

type Edge = [number, number];
function cutValue(x: number, edges: Edge[]): number {
  let v = 0;
  for (const [i, j] of edges) if (((x >> i) & 1) !== ((x >> j) & 1)) v++;
  return v;
}
function qaoaMaxCut(nNodes: number, edges: Edge[]) {
  const N = 1 << nNodes;
  // Precompute cut value for each bitstring.
  const cuts = new Array(N).fill(0).map((_, x) => cutValue(x, edges));
  const bestCut = Math.max(...cuts);
  // p=1 QAOA: |ψ⟩ = U_B(β) U_C(γ) H^n |0⟩. Cost is diagonal so U_C is a phase.
  // Grid search (γ, β) ∈ [0, π] × [0, π/2].
  const gridG = 24, gridB = 12;
  let best = { gamma: 0, beta: 0, exp: -Infinity, probs: [] as number[] };
  const rxMat = (angle: number): [C, C, C, C] => {
    const c0 = Math.cos(angle / 2);
    const s0 = -Math.sin(angle / 2); // coefficient on i·σx
    return [c(c0), c(0, s0), c(0, s0), c(c0)];
  };
  for (let gi = 0; gi < gridG; gi++) {
    const gamma = (Math.PI * gi) / gridG;
    for (let bi = 0; bi < gridB; bi++) {
      const beta = (Math.PI / 2 * bi) / gridB;
      // Start: uniform superposition (H^n on |0⟩).
      const amp = 1 / Math.sqrt(N);
      let state: C[] = new Array(N);
      // Apply diagonal U_C: phase = exp(-i γ C(x)).
      for (let x = 0; x < N; x++) {
        const ang = -gamma * cuts[x];
        state[x] = c(amp * Math.cos(ang), amp * Math.sin(ang));
      }
      // Apply U_B = ∏ RX(2β) on each qubit.
      const m = rxMat(2 * beta);
      for (let q = 0; q < nNodes; q++) state = applySingle(state, nNodes, q, m);
      // Expectation ⟨C⟩ = Σ |ψ_x|² · C(x).
      let exp = 0;
      for (let x = 0; x < N; x++) exp += cAbs2(state[x]) * cuts[x];
      if (exp > best.exp) {
        best = { gamma, beta, exp, probs: state.map((a) => cAbs2(a)) };
      }
    }
  }
  // Rank top bitstrings from best distribution.
  const ranked = best.probs
    .map((p, x) => ({ x, p, cut: cuts[x] }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 6);
  return { bestCut, best, ranked, cuts };
}

function SolverPanel() {
  const [gBits, setGBits] = useState(5);
  const [gPattern, setGPattern] = useState("1?01?");
  const grov = useMemo(() => grover(gBits, gPattern), [gBits, gPattern]);

  const [shorN, setShorN] = useState(21);
  const [shorRes, setShorRes] = useState(() => shorFactor(21));

  const [qNodes, setQNodes] = useState(5);
  const [qEdges, setQEdges] = useState<Edge[]>([[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2]]);
  const qaoa = useMemo(
    () => qaoaMaxCut(qNodes, qEdges.filter(([i, j]) => i < qNodes && j < qNodes && i !== j)),
    [qNodes, qEdges],
  );
  const [eA, setEA] = useState(0);
  const [eB, setEB] = useState(1);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" /> Grover Search (oracle builder)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div><Label className="text-xs">Bits (n)</Label>
              <Input type="number" min={2} max={8} value={gBits}
                onChange={(e) => setGBits(Math.max(2, Math.min(8, Number(e.target.value) || 2)))} className="w-24" /></div>
            <div className="flex-1"><Label className="text-xs">Pattern (0/1/?)</Label>
              <Input value={gPattern} onChange={(e) => setGPattern(e.target.value.replace(/[^01?]/g, ""))} /></div>
          </div>
          <div className="text-sm text-muted-foreground">
            N = <span className="font-mono">{grov.N}</span>, marked M = <span className="font-mono">{grov.M}</span>.
            Optimal iters = <span className="font-mono">{grov.iters}</span> ≈ π/4·√(N/M).
          </div>
          {grov.marked.length > 0 && grov.marked.length <= 16 && (
            <div className="flex flex-wrap gap-1 text-xs font-mono">
              {grov.marked.map((x) => (
                <Badge key={x} variant="secondary">|{x.toString(2).padStart(gBits, "0")}⟩</Badge>
              ))}
            </div>
          )}
          <div className="space-y-1">
            {grov.trace.map((t) => (
              <div key={t.k} className="flex items-center gap-2 text-xs">
                <span className="w-8 font-mono">k={t.k}</span>
                <Progress value={t.p * 100} className="h-1.5 flex-1" />
                <span className="w-14 text-right font-mono">{(t.p * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sigma className="h-4 w-4" /> Shor Factoring (CF post-processing)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div><Label className="text-xs">N to factor</Label>
              <Input type="number" min={4} max={9999} value={shorN}
                onChange={(e) => setShorN(Number(e.target.value) || 15)} className="w-28" /></div>
            <Button onClick={() => setShorRes(shorFactor(shorN))}>Factor</Button>
          </div>
          <div className="rounded border p-3 text-sm space-y-1">
            <div>Base a = <span className="font-mono">{shorRes.a || "—"}</span></div>
            <div>QPE outcome s / 2^t = <span className="font-mono">{shorRes.s ?? "—"} / 2^{shorRes.t ?? "—"}</span></div>
            <div>Recovered order r = <span className="font-mono">{shorRes.r ?? "—"}</span></div>
            <div>Factors = <span className="font-mono">
              {shorRes.factors ? `${shorRes.factors[0]} × ${shorRes.factors[1]}` : "—"}
            </span></div>
            <div className="text-xs text-muted-foreground">{shorRes.note}</div>
          </div>
          {shorRes.convergents.length > 0 && (
            <div>
              <Label className="text-xs">Continued-fraction convergents p/q</Label>
              <div className="mt-1 flex flex-wrap gap-1 text-xs font-mono">
                {shorRes.convergents.map((cv, i) => (
                  <Badge key={i} variant="outline">{cv.p}/{cv.q}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="h-4 w-4" /> QAOA MaxCut (p=1, exact statevector)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div><Label className="text-xs">Nodes</Label>
              <Input type="number" min={3} max={6} value={qNodes}
                onChange={(e) => setQNodes(Math.max(3, Math.min(6, Number(e.target.value) || 3)))} className="w-20" /></div>
            <div><Label className="text-xs">Edge a</Label>
              <Input type="number" min={0} max={qNodes - 1} value={eA}
                onChange={(e) => setEA(Number(e.target.value) || 0)} className="w-20" /></div>
            <div><Label className="text-xs">Edge b</Label>
              <Input type="number" min={0} max={qNodes - 1} value={eB}
                onChange={(e) => setEB(Number(e.target.value) || 0)} className="w-20" /></div>
            <Button variant="outline" onClick={() => {
              if (eA !== eB && !qEdges.some(([i, j]) => (i === eA && j === eB) || (i === eB && j === eA))) {
                setQEdges([...qEdges, [Math.min(eA, eB), Math.max(eA, eB)]]);
              }
            }}>Add edge</Button>
            <Button variant="ghost" onClick={() => setQEdges([])}>Clear edges</Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {qEdges.map(([i, j], idx) => (
              <Badge key={idx} variant="secondary" className="gap-1">
                {i}—{j}
                <button onClick={() => setQEdges(qEdges.filter((_, k) => k !== idx))}
                  className="ml-1 opacity-60 hover:opacity-100" aria-label="remove edge">
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {qEdges.length === 0 && <span className="text-sm text-muted-foreground">Add edges to build the graph.</span>}
          </div>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <Stat label="Best cut (classical)" value={qaoa.bestCut} />
            <Stat label="⟨C⟩ at optimum" value={qaoa.best.exp.toFixed(3)} />
            <Stat label="γ*, β*" value={`${qaoa.best.gamma.toFixed(2)}, ${qaoa.best.beta.toFixed(2)}`} />
          </div>
          <div>
            <Label className="text-xs">Top-6 measurement outcomes</Label>
            <div className="mt-1 space-y-1">
              {qaoa.ranked.map((r) => (
                <div key={r.x} className="flex items-center gap-2 text-xs">
                  <span className="w-20 font-mono">|{r.x.toString(2).padStart(qNodes, "0")}⟩</span>
                  <Progress value={r.p * 100} className="h-1.5 flex-1" />
                  <span className="w-14 text-right font-mono">{(r.p * 100).toFixed(1)}%</span>
                  <span className="w-16 text-right text-muted-foreground">cut={r.cut}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function QuantumLab() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Quantum Lab</h1>
        <p className="text-sm text-muted-foreground">
          Quantum sequence simulation, BB84 key distribution, and complex algorithmic solvers —
          all computed in-browser from first principles.
        </p>
      </header>
      <Tabs defaultValue="circuit">
        <TabsList>
          <TabsTrigger value="circuit">Sequence</TabsTrigger>
          <TabsTrigger value="qkd">Cryptography</TabsTrigger>
          <TabsTrigger value="solver">Solvers</TabsTrigger>
        </TabsList>
        <TabsContent value="circuit" className="mt-4"><CircuitPanel /></TabsContent>
        <TabsContent value="qkd" className="mt-4"><BB84Panel /></TabsContent>
        <TabsContent value="solver" className="mt-4"><SolverPanel /></TabsContent>
      </Tabs>
    </div>
  );
}
