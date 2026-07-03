import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trash2, Play, KeyRound, Search, Sigma } from "lucide-react";

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

/** Grover's search over N items, marked = target. Returns success probability
 *  vs. iteration count and the optimal iteration ⌊π/4·√N⌋. */
function grover(N: number, target: number) {
  const iters = Math.max(1, Math.floor((Math.PI / 4) * Math.sqrt(N)));
  const theta = 2 * Math.asin(1 / Math.sqrt(N));
  const trace: { k: number; p: number }[] = [];
  for (let k = 0; k <= iters + 2; k++) {
    const amp = Math.sin((2 * k + 1) * (theta / 2));
    trace.push({ k, p: amp * amp });
  }
  return { iters, target, trace };
}

/** Shor-style period finding via classical modular exponentiation. Returns the
 *  period r of a^x mod N and the factors derived from gcd(a^{r/2}±1, N). */
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
function shorLike(N: number): { a: number; r: number | null; factors: [number, number] | null; note: string } {
  if (N % 2 === 0) return { a: 2, r: null, factors: [2, N / 2], note: "Even — trivial factor." };
  for (let attempt = 0; attempt < 20; attempt++) {
    const a = 2 + Math.floor(Math.random() * (N - 3));
    const g = gcd(a, N);
    if (g > 1) return { a, r: null, factors: [g, N / g], note: `Lucky gcd(a,N)=${g}.` };
    let r: number | null = null;
    for (let k = 1; k < N; k++) {
      if (modpow(a, k, N) === 1) { r = k; break; }
    }
    if (!r || r % 2 !== 0) continue;
    const x = modpow(a, r / 2, N);
    if (x === N - 1) continue;
    const p = gcd(x - 1, N); const q = gcd(x + 1, N);
    if (p > 1 && p < N) return { a, r, factors: [p, N / p], note: `Order r=${r}.` };
    if (q > 1 && q < N) return { a, r, factors: [q, N / q], note: `Order r=${r}.` };
  }
  return { a: 0, r: null, factors: null, note: "Failed — try again or a larger N." };
}

/** Newton's method in ℂ for f(z)=z^n − 1. Finds complex roots of unity. */
function newtonRoots(n: number, iterations = 40) {
  const roots: C[] = [];
  const seeds: C[] = [];
  for (let k = 0; k < 4 * n; k++) {
    const ang = (2 * Math.PI * k) / (4 * n);
    seeds.push({ re: Math.cos(ang) * (0.5 + Math.random()), im: Math.sin(ang) * (0.5 + Math.random()) });
  }
  const cSub = (a: C, b: C): C => ({ re: a.re - b.re, im: a.im - b.im });
  const cDiv = (a: C, b: C): C => {
    const d = b.re * b.re + b.im * b.im;
    return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
  };
  const cPow = (z: C, k: number): C => {
    let r: C = c(1);
    for (let i = 0; i < k; i++) r = cMul(r, z);
    return r;
  };
  for (const s of seeds) {
    let z = s;
    for (let i = 0; i < iterations; i++) {
      const zn = cPow(z, n);
      const num = cSub(zn, c(1));
      const den = cMul(c(n), cPow(z, n - 1));
      if (den.re === 0 && den.im === 0) break;
      z = cSub(z, cDiv(num, den));
    }
    if (Number.isFinite(z.re) && Number.isFinite(z.im)) {
      const dup = roots.find((r) => Math.hypot(r.re - z.re, r.im - z.im) < 1e-4);
      if (!dup) roots.push({ re: +z.re.toFixed(6), im: +z.im.toFixed(6) });
    }
  }
  return roots.slice(0, n);
}

function SolverPanel() {
  const [gN, setGN] = useState(32);
  const [gTarget, setGTarget] = useState(11);
  const grov = useMemo(() => grover(gN, gTarget), [gN, gTarget]);

  const [shorN, setShorN] = useState(15);
  const [shorRes, setShorRes] = useState(() => shorLike(15));

  const [polyN, setPolyN] = useState(5);
  const roots = useMemo(() => newtonRoots(polyN), [polyN]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" /> Grover Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div><Label className="text-xs">N (search space)</Label>
              <Input type="number" min={2} max={1024} value={gN}
                onChange={(e) => setGN(Number(e.target.value) || 2)} className="w-28" /></div>
            <div><Label className="text-xs">Marked index</Label>
              <Input type="number" min={0} max={gN - 1} value={gTarget}
                onChange={(e) => setGTarget(Number(e.target.value) || 0)} className="w-28" /></div>
          </div>
          <div className="text-sm text-muted-foreground">
            Optimal iterations: <span className="font-mono">{grov.iters}</span> (≈ π/4·√N).
            Classical brute force: <span className="font-mono">O(N)</span>.
          </div>
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
            <Sigma className="h-4 w-4" /> Shor-style Factoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div><Label className="text-xs">N to factor</Label>
              <Input type="number" min={4} max={9999} value={shorN}
                onChange={(e) => setShorN(Number(e.target.value) || 15)} className="w-28" /></div>
            <Button onClick={() => setShorRes(shorLike(shorN))}>Factor</Button>
          </div>
          <div className="rounded border p-3 text-sm space-y-1">
            <div>Tried base a = <span className="font-mono">{shorRes.a || "—"}</span></div>
            <div>Period r = <span className="font-mono">{shorRes.r ?? "—"}</span></div>
            <div>Factors ={" "}
              <span className="font-mono">
                {shorRes.factors ? `${shorRes.factors[0]} × ${shorRes.factors[1]}` : "—"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">{shorRes.note}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Complex Roots — Newton on zⁿ − 1</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div><Label className="text-xs">Degree n</Label>
              <Input type="number" min={2} max={12} value={polyN}
                onChange={(e) => setPolyN(Number(e.target.value) || 2)} className="w-24" /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            {roots.map((r, i) => (
              <div key={i} className="rounded border px-2 py-1">
                z{i} = {r.re.toFixed(4)}{r.im >= 0 ? "+" : ""}{r.im.toFixed(4)}i
              </div>
            ))}
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
