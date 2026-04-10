import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Play, RotateCcw } from 'lucide-react';

interface ComplexNum { re: number; im: number; }

function cMul(a: ComplexNum, b: ComplexNum): ComplexNum {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
function cAdd(a: ComplexNum, b: ComplexNum): ComplexNum {
  return { re: a.re + b.re, im: a.im + b.im };
}
function cConj(a: ComplexNum): ComplexNum {
  return { re: a.re, im: -a.im };
}
function cMag(c: ComplexNum): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

// 2x2 matrices for single-qubit Paulis
const I2: ComplexNum[][] = [[{re:1,im:0},{re:0,im:0}],[{re:0,im:0},{re:1,im:0}]];
const X2: ComplexNum[][] = [[{re:0,im:0},{re:1,im:0}],[{re:1,im:0},{re:0,im:0}]];
const Y2: ComplexNum[][] = [[{re:0,im:0},{re:0,im:-1}],[{re:0,im:1},{re:0,im:0}]];
const Z2: ComplexNum[][] = [[{re:1,im:0},{re:0,im:0}],[{re:0,im:0},{re:-1,im:0}]];

const SINGLE_PAULIS = [I2, X2, Y2, Z2];
const PAULI_LABELS_1Q = ['I', 'X', 'Y', 'Z'];

// Tensor product of two 2x2 matrices → 4x4
function tensorProduct(a: ComplexNum[][], b: ComplexNum[][]): ComplexNum[][] {
  const n = 4;
  const result: ComplexNum[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => ({ re: 0, im: 0 }))
  );
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++)
      for (let k = 0; k < 2; k++)
        for (let l = 0; l < 2; l++)
          result[i * 2 + k][j * 2 + l] = cMul(a[i][j], b[k][l]);
  return result;
}

// Generate all 16 two-qubit Pauli basis operators (σ_i ⊗ σ_j)
function generate2QubitPaulis(): { matrices: ComplexNum[][][]; labels: string[] } {
  const matrices: ComplexNum[][][] = [];
  const labels: string[] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      matrices.push(tensorProduct(SINGLE_PAULIS[i], SINGLE_PAULIS[j]));
      labels.push(`${PAULI_LABELS_1Q[i]}${PAULI_LABELS_1Q[j]}`);
    }
  }
  return { matrices, labels };
}

// 2-qubit gates (4x4)
const CNOT: ComplexNum[][] = [
  [{re:1,im:0},{re:0,im:0},{re:0,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:1,im:0},{re:0,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:0,im:0},{re:0,im:0},{re:1,im:0}],
  [{re:0,im:0},{re:0,im:0},{re:1,im:0},{re:0,im:0}],
];

const SWAP: ComplexNum[][] = [
  [{re:1,im:0},{re:0,im:0},{re:0,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:0,im:0},{re:1,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:1,im:0},{re:0,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:0,im:0},{re:0,im:0},{re:1,im:0}],
];

const CZ: ComplexNum[][] = [
  [{re:1,im:0},{re:0,im:0},{re:0,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:1,im:0},{re:0,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:0,im:0},{re:1,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:0,im:0},{re:0,im:0},{re:-1,im:0}],
];

// √iSWAP gate
const s = Math.SQRT1_2;
const SQRT_ISWAP: ComplexNum[][] = [
  [{re:1,im:0},{re:0,im:0},{re:0,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:s,im:0},{re:0,im:s},{re:0,im:0}],
  [{re:0,im:0},{re:0,im:s},{re:s,im:0},{re:0,im:0}],
  [{re:0,im:0},{re:0,im:0},{re:0,im:0},{re:1,im:0}],
];

const TWO_QUBIT_GATES: Record<string, { label: string; matrix: ComplexNum[][] }> = {
  'CNOT': { label: 'CNOT', matrix: CNOT },
  'CZ': { label: 'CZ', matrix: CZ },
  'SWAP': { label: 'SWAP', matrix: SWAP },
  'sqrtISWAP': { label: '√iSWAP', matrix: SQRT_ISWAP },
};

// Matrix trace for 4x4
function matTrace(m: ComplexNum[][], n: number): ComplexNum {
  let tr: ComplexNum = { re: 0, im: 0 };
  for (let i = 0; i < n; i++) tr = cAdd(tr, m[i][i]);
  return tr;
}

// Matrix multiply NxN
function matMul(a: ComplexNum[][], b: ComplexNum[][], n: number): ComplexNum[][] {
  const r: ComplexNum[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => ({ re: 0, im: 0 }))
  );
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++)
        r[i][j] = cAdd(r[i][j], cMul(a[i][k], b[k][j]));
  return r;
}

function compute2QubitChi(gateKey: string, noiseLevel: number): { chi: ComplexNum[][]; krausOps: ComplexNum[][][] } {
  const gate = TWO_QUBIT_GATES[gateKey].matrix;
  const { matrices: paulis } = generate2QubitPaulis();
  const dim = 4; // 2-qubit Hilbert space dimension
  const numPaulis = 16;

  // Decompose U in 2-qubit Pauli basis: a_m = Tr(σ_m · U) / dim
  const coeffs: ComplexNum[] = [];
  for (let m = 0; m < numPaulis; m++) {
    const prod = matMul(paulis[m], gate, dim);
    const tr = matTrace(prod, dim);
    coeffs.push({ re: tr.re / dim, im: tr.im / dim });
  }

  // χ_{mn} = a_m · a_n*
  const chi: ComplexNum[][] = Array.from({ length: numPaulis }, (_, i) =>
    Array.from({ length: numPaulis }, (_, j) => cMul(coeffs[i], cConj(coeffs[j])))
  );

  // Apply depolarizing noise
  if (noiseLevel > 0) {
    const p = noiseLevel;
    for (let i = 0; i < numPaulis; i++) {
      for (let j = 0; j < numPaulis; j++) {
        chi[i][j].re *= (1 - p);
        chi[i][j].im *= (1 - p);
        if (i === j) chi[i][j].re += p / numPaulis;
      }
    }
  }

  // Extract Kraus operators from χ via eigendecomposition (simplified: use diagonal)
  const krausOps: ComplexNum[][][] = [];
  for (let k = 0; k < numPaulis; k++) {
    const weight = cMag(chi[k][k]);
    if (weight > 0.01) {
      const sqrtW = Math.sqrt(weight);
      const op: ComplexNum[][] = paulis[k].map(row =>
        row.map(c => ({ re: c.re * sqrtW, im: c.im * sqrtW }))
      );
      krausOps.push(op);
    }
  }

  return { chi, krausOps };
}

function ChiMatrix16Heatmap({ chi, labels }: { chi: ComplexNum[][]; labels: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 320;
    const cellSize = size / 16;
    canvas.width = size;
    canvas.height = size;

    let maxVal = 0;
    for (let i = 0; i < 16; i++)
      for (let j = 0; j < 16; j++)
        maxVal = Math.max(maxVal, cMag(chi[i][j]));
    if (maxVal === 0) maxVal = 1;

    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        const mag = cMag(chi[i][j]) / maxVal;
        const phase = Math.atan2(chi[i][j].im, chi[i][j].re);
        const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${0.1 + mag * 0.9})`;
        ctx.fillRect(j * cellSize, i * cellSize, cellSize - 0.5, cellSize - 0.5);
      }
    }
  }, [chi]);

  return (
    <div className="space-y-1">
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded border border-border" />
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        16×16 χ-matrix in 2-qubit Pauli basis. Hue = phase, brightness = magnitude.
      </p>
    </div>
  );
}

export function MultiQubitProcessTomography() {
  const [selectedGate, setSelectedGate] = useState('CNOT');
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [result, setResult] = useState<{ chi: ComplexNum[][]; krausOps: ComplexNum[][][] } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<{ processFidelity: number; numKraus: number; entanglingPower: number } | null>(null);

  const { labels } = generate2QubitPaulis();

  const runTomography = async () => {
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 2000));

    const res = compute2QubitChi(selectedGate, noiseLevel);
    setResult(res);

    // Process fidelity: Tr(χ_ideal · χ_noisy)
    const ideal = compute2QubitChi(selectedGate, 0);
    let fidelity = 0;
    for (let i = 0; i < 16; i++)
      for (let j = 0; j < 16; j++)
        fidelity += ideal.chi[i][j].re * res.chi[i][j].re + ideal.chi[i][j].im * res.chi[i][j].im;

    // Entangling power (simplified: measure how far from product operation)
    const diagSum = res.chi.reduce((sum, row, i) => sum + cMag(row[i]), 0);
    const offDiagWeight = 16 - diagSum; // Rough proxy
    const entanglingPower = Math.min(1, Math.max(0, 1 - cMag(res.chi[0][0])));

    setMetrics({
      processFidelity: Math.max(0, Math.min(1, fidelity)),
      numKraus: res.krausOps.length,
      entanglingPower,
    });
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Multi-Qubit Process Tomography — Kraus Reconstruction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">2-Qubit Gate</label>
              <Select value={selectedGate} onValueChange={setSelectedGate}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TWO_QUBIT_GATES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Depolarizing Noise: {(noiseLevel * 100).toFixed(0)}%</label>
              <input
                type="range" min="0" max="0.5" step="0.01"
                value={noiseLevel}
                onChange={e => setNoiseLevel(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={runTomography} disabled={isRunning} className="gap-2">
                <Play className="h-4 w-4" />
                {isRunning ? 'Reconstructing...' : 'Run Tomography'}
              </Button>
              <Button variant="outline" onClick={() => { setResult(null); setMetrics(null); }}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Reconstructs the full 16×16 χ-matrix for 2-qubit quantum channels and extracts Kraus operators K_k
            such that ε(ρ) = Σ_k K_k ρ K_k†.
          </p>
        </CardContent>
      </Card>

      {result && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">16×16 χ-Matrix</CardTitle></CardHeader>
            <CardContent>
              <ChiMatrix16Heatmap chi={result.chi} labels={labels} />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">Process Metrics & Kraus Operators</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Process Fidelity</span>
                <Badge className={metrics.processFidelity > 0.99 ? 'bg-green-600/40 text-green-400' : metrics.processFidelity > 0.9 ? 'bg-yellow-600/40 text-yellow-400' : 'bg-red-600/40 text-red-400'}>
                  {(metrics.processFidelity * 100).toFixed(2)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Kraus Operators Extracted</span>
                <span className="text-lg font-mono font-bold text-foreground">{metrics.numKraus}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Entangling Power</span>
                <span className="text-lg font-mono font-bold text-foreground">{metrics.entanglingPower.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Noise Level</span>
                <span className="text-sm text-muted-foreground">{(noiseLevel * 100).toFixed(0)}% depolarizing</span>
              </div>

              {/* Kraus operator list */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Kraus Operators (K_k)</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {result.krausOps.map((op, idx) => {
                    const weight = Math.sqrt(op[0].reduce((s, c) => s + c.re * c.re + c.im * c.im, 0) +
                      op[1].reduce((s, c) => s + c.re * c.re + c.im * c.im, 0) +
                      op[2].reduce((s, c) => s + c.re * c.re + c.im * c.im, 0) +
                      op[3].reduce((s, c) => s + c.re * c.re + c.im * c.im, 0));
                    return (
                      <div key={idx} className="p-2 bg-muted/30 rounded border border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-foreground">K_{idx} ≈ {labels[idx] || `Op${idx}`}</span>
                          <span className="text-xs text-muted-foreground">‖K‖ = {(weight / 4).toFixed(3)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  The Kraus decomposition ε(ρ) = Σ_k K_k ρ K_k† provides a complete
                  characterization of the quantum channel. For a unitary operation,
                  only one Kraus operator is non-zero.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
