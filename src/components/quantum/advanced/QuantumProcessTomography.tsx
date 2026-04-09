import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Play, RotateCcw } from 'lucide-react';

interface ComplexNum { re: number; im: number; }
type ChiMatrix = ComplexNum[][];

const GATES: Record<string, { label: string; matrix: ComplexNum[][] }> = {
  'I': { label: 'Identity (I)', matrix: [[{re:1,im:0},{re:0,im:0}],[{re:0,im:0},{re:1,im:0}]] },
  'X': { label: 'Pauli-X', matrix: [[{re:0,im:0},{re:1,im:0}],[{re:1,im:0},{re:0,im:0}]] },
  'Y': { label: 'Pauli-Y', matrix: [[{re:0,im:0},{re:0,im:-1}],[{re:0,im:1},{re:0,im:0}]] },
  'Z': { label: 'Pauli-Z', matrix: [[{re:1,im:0},{re:0,im:0}],[{re:0,im:0},{re:-1,im:0}]] },
  'H': { label: 'Hadamard (H)', matrix: [[{re:0.7071,im:0},{re:0.7071,im:0}],[{re:0.7071,im:0},{re:-0.7071,im:0}]] },
  'S': { label: 'Phase (S)', matrix: [[{re:1,im:0},{re:0,im:0}],[{re:0,im:0},{re:0,im:1}]] },
  'T': { label: 'T Gate', matrix: [[{re:1,im:0},{re:0,im:0}],[{re:0,im:0},{re:0.7071,im:0.7071}]] },
};

const PAULI_LABELS = ['I', 'X', 'Y', 'Z'];

function complexMul(a: ComplexNum, b: ComplexNum): ComplexNum {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

function complexAdd(a: ComplexNum, b: ComplexNum): ComplexNum {
  return { re: a.re + b.re, im: a.im + b.im };
}

function complexMag(c: ComplexNum): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

function complexConj(a: ComplexNum): ComplexNum {
  return { re: a.re, im: -a.im };
}

function computeChiMatrix(gateKey: string, noiseLevel: number): ChiMatrix {
  const gate = GATES[gateKey].matrix;
  const paulis = [GATES['I'].matrix, GATES['X'].matrix, GATES['Y'].matrix, GATES['Z'].matrix];

  // Decompose U in Pauli basis: a_m = Tr(σ_m · U) / 2
  const coeffs: ComplexNum[] = [];
  for (let m = 0; m < 4; m++) {
    let tr: ComplexNum = { re: 0, im: 0 };
    for (let r = 0; r < 2; r++) {
      for (let k = 0; k < 2; k++) {
        tr = complexAdd(tr, complexMul(paulis[m][r][k], gate[k][r]));
      }
    }
    coeffs.push({ re: tr.re / 2, im: tr.im / 2 });
  }

  // χ_{mn} = a_m · a_n*
  const chi: ChiMatrix = Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) => complexMul(coeffs[i], complexConj(coeffs[j])))
  );

  // Add depolarizing noise
  if (noiseLevel > 0) {
    const p = noiseLevel;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        chi[i][j].re *= (1 - p);
        chi[i][j].im *= (1 - p);
        if (i === j) chi[i][j].re += p / 4;
      }
    }
  }

  return chi;
}

function ChiMatrixHeatmap({ chi, label }: { chi: ChiMatrix; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 200;
    const cellSize = size / 4;
    canvas.width = size;
    canvas.height = size;

    let maxVal = 0;
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        maxVal = Math.max(maxVal, complexMag(chi[i][j]));
    if (maxVal === 0) maxVal = 1;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const mag = complexMag(chi[i][j]) / maxVal;
        const phase = Math.atan2(chi[i][j].im, chi[i][j].re);
        const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${0.15 + mag * 0.85})`;
        ctx.fillRect(j * cellSize, i * cellSize, cellSize - 1, cellSize - 1);

        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(mag.toFixed(2), j * cellSize + cellSize / 2, i * cellSize + cellSize / 2 + 4);
      }
    }
  }, [chi]);

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground text-center">{label}</p>
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded border border-border" />
      </div>
      <div className="flex justify-center gap-2">
        {PAULI_LABELS.map((l, i) => (
          <span key={i} className="text-[10px] text-muted-foreground w-[50px] text-center">{l}</span>
        ))}
      </div>
    </div>
  );
}

export function QuantumProcessTomography() {
  const [selectedGate, setSelectedGate] = useState('X');
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [chi, setChi] = useState<ChiMatrix | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<{ processFidelity: number; unitarity: number; avgGateFidelity: number } | null>(null);

  const runTomography = async () => {
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 1500));

    const result = computeChiMatrix(selectedGate, noiseLevel);
    setChi(result);

    // Process fidelity = chi[0][0] for ideal, but for general gate it's the dominant element
    const ideal = computeChiMatrix(selectedGate, 0);
    let fidelity = 0;
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        fidelity += ideal[i][j].re * result[i][j].re + ideal[i][j].im * result[i][j].im;

    let trChi2 = 0;
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        let s: ComplexNum = { re: 0, im: 0 };
        for (let k = 0; k < 4; k++)
          s = complexAdd(s, complexMul(result[i][k], result[k][j]));
        if (i === j) trChi2 += s.re;
      }

    const avgGateFidelity = (2 * Math.max(0, Math.min(1, fidelity)) + 1) / 3;

    setMetrics({
      processFidelity: Math.max(0, Math.min(1, fidelity)),
      unitarity: Math.max(0, Math.min(1, trChi2)),
      avgGateFidelity: Math.max(0, Math.min(1, avgGateFidelity)),
    });
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Quantum Process Tomography — χ-Matrix Reconstruction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Target Gate</label>
              <Select value={selectedGate} onValueChange={setSelectedGate}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(GATES).map(([k, v]) => (
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
                {isRunning ? 'Running...' : 'Run Tomography'}
              </Button>
              <Button variant="outline" onClick={() => { setChi(null); setMetrics(null); }}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {chi && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">χ-Matrix (Magnitude)</CardTitle></CardHeader>
            <CardContent>
              <ChiMatrixHeatmap chi={chi} label={`Process matrix for ${GATES[selectedGate].label}`} />
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Color hue encodes phase, brightness encodes magnitude. Axes: {PAULI_LABELS.join(', ')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">Process Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Process Fidelity</span>
                <Badge className={metrics.processFidelity > 0.99 ? 'bg-green-600/40 text-green-400' : metrics.processFidelity > 0.9 ? 'bg-yellow-600/40 text-yellow-400' : 'bg-red-600/40 text-red-400'}>
                  {(metrics.processFidelity * 100).toFixed(2)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Gate Fidelity</span>
                <span className="text-lg font-mono font-bold text-foreground">{(metrics.avgGateFidelity * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unitarity (Tr(χ²))</span>
                <span className="text-lg font-mono font-bold text-foreground">{metrics.unitarity.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Noise Level</span>
                <span className="text-sm text-muted-foreground">{(noiseLevel * 100).toFixed(0)}% depolarizing</span>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  The χ-matrix fully characterizes the quantum process ε(ρ) = Σᵢⱼ χᵢⱼ σᵢ ρ σⱼ†.
                  An ideal unitary gate concentrates all weight in a single χ element.
                  Depolarizing noise spreads weight across the diagonal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
