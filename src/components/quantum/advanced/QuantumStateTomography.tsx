/**
 * Quantum State Tomography Tool
 * Reconstructs density matrices from measurement data with Bloch sphere visualization
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Play, RotateCcw, Eye, Grid3X3 } from 'lucide-react';

interface Complex { re: number; im: number; }
type DensityMatrix = Complex[][];

interface TomographyResult {
  rho: DensityMatrix;
  purity: number;
  fidelity: number;
  blochVector: [number, number, number];
  vonNeumannEntropy: number;
  measurements: { basis: string; counts: Record<string, number> }[];
}

type InputState = '|0⟩' | '|1⟩' | '|+⟩' | '|−⟩' | '|i⟩' | '|−i⟩' | 'Mixed';

const INPUT_STATES: Record<InputState, { rho: DensityMatrix; bloch: [number, number, number]; label: string }> = {
  '|0⟩': {
    rho: [[{ re: 1, im: 0 }, { re: 0, im: 0 }], [{ re: 0, im: 0 }, { re: 0, im: 0 }]],
    bloch: [0, 0, 1], label: 'Ground state',
  },
  '|1⟩': {
    rho: [[{ re: 0, im: 0 }, { re: 0, im: 0 }], [{ re: 0, im: 0 }, { re: 1, im: 0 }]],
    bloch: [0, 0, -1], label: 'Excited state',
  },
  '|+⟩': {
    rho: [[{ re: 0.5, im: 0 }, { re: 0.5, im: 0 }], [{ re: 0.5, im: 0 }, { re: 0.5, im: 0 }]],
    bloch: [1, 0, 0], label: 'Plus state',
  },
  '|−⟩': {
    rho: [[{ re: 0.5, im: 0 }, { re: -0.5, im: 0 }], [{ re: -0.5, im: 0 }, { re: 0.5, im: 0 }]],
    bloch: [-1, 0, 0], label: 'Minus state',
  },
  '|i⟩': {
    rho: [[{ re: 0.5, im: 0 }, { re: 0, im: -0.5 }], [{ re: 0, im: 0.5 }, { re: 0.5, im: 0 }]],
    bloch: [0, 1, 0], label: 'Y-plus state',
  },
  '|−i⟩': {
    rho: [[{ re: 0.5, im: 0 }, { re: 0, im: 0.5 }], [{ re: 0, im: -0.5 }, { re: 0.5, im: 0 }]],
    bloch: [0, -1, 0], label: 'Y-minus state',
  },
  'Mixed': {
    rho: [[{ re: 0.5, im: 0 }, { re: 0, im: 0 }], [{ re: 0, im: 0 }, { re: 0.5, im: 0 }]],
    bloch: [0, 0, 0], label: 'Maximally mixed',
  },
};

function addNoise(rho: DensityMatrix, noise: number): DensityMatrix {
  const n = rho.length;
  const result: DensityMatrix = rho.map(row => row.map(c => ({ ...c })));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i][j].re += (Math.random() - 0.5) * noise * 0.1;
      result[i][j].im += (Math.random() - 0.5) * noise * 0.1;
    }
  }
  // Ensure Hermiticity
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      result[j][i].re = result[i][j].re;
      result[j][i].im = -result[i][j].im;
    }
    result[i][i].im = 0;
  }
  // Normalize trace to 1
  let trace = 0;
  for (let i = 0; i < n; i++) trace += result[i][i].re;
  if (trace > 0) for (let i = 0; i < n; i++) result[i][i].re /= trace;
  return result;
}

function simulateMeasurements(rho: DensityMatrix, shots: number): { basis: string; counts: Record<string, number> }[] {
  const bases = ['Z', 'X', 'Y'];
  return bases.map(basis => {
    let p0: number;
    if (basis === 'Z') p0 = rho[0][0].re;
    else if (basis === 'X') p0 = 0.5 + rho[0][1].re;
    else p0 = 0.5 + rho[0][1].im;
    p0 = Math.max(0, Math.min(1, p0));
    let c0 = 0;
    for (let i = 0; i < shots; i++) if (Math.random() < p0) c0++;
    return { basis, counts: { '0': c0, '1': shots - c0 } };
  });
}

function reconstructState(measurements: { basis: string; counts: Record<string, number> }[]): { rho: DensityMatrix; bloch: [number, number, number] } {
  const expectation = (m: { counts: Record<string, number> }) => {
    const total = m.counts['0'] + m.counts['1'];
    return (m.counts['0'] - m.counts['1']) / total;
  };
  const z = expectation(measurements.find(m => m.basis === 'Z')!);
  const x = expectation(measurements.find(m => m.basis === 'X')!);
  const y = expectation(measurements.find(m => m.basis === 'Y')!);

  const rho: DensityMatrix = [
    [{ re: (1 + z) / 2, im: 0 }, { re: x / 2, im: -y / 2 }],
    [{ re: x / 2, im: y / 2 }, { re: (1 - z) / 2, im: 0 }],
  ];
  return { rho, bloch: [x, y, z] };
}

function calcPurity(rho: DensityMatrix): number {
  let trace = 0;
  for (let i = 0; i < 2; i++)
    for (let k = 0; k < 2; k++)
      trace += rho[i][k].re * rho[k][i].re - rho[i][k].im * rho[k][i].im;
  return Math.max(0.5, Math.min(1, trace));
}

function calcFidelity(rho: DensityMatrix, target: DensityMatrix): number {
  let f = 0;
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++)
      f += rho[i][j].re * target[i][j].re + rho[i][j].im * target[i][j].im;
  return Math.max(0, Math.min(1, f));
}

function calcEntropy(rho: DensityMatrix): number {
  const p = calcPurity(rho);
  const l1 = (1 + Math.sqrt(2 * p - 1)) / 2;
  const l2 = 1 - l1;
  let S = 0;
  if (l1 > 1e-10) S -= l1 * Math.log2(l1);
  if (l2 > 1e-10) S -= l2 * Math.log2(l2);
  return Math.max(0, S);
}

// ── Bloch Sphere Canvas ──
function BlochSphere({ blochVector, targetBloch }: { blochVector: [number, number, number]; targetBloch: [number, number, number] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 30;

    // Sphere outline
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(128,128,128,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Equator ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(128,128,128,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Meridian
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.3, r, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(128,128,128,0.15)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    const axes: { label: string; dx: number; dy: number }[] = [
      { label: 'X', dx: r + 15, dy: 0 },
      { label: 'Y', dx: r * 0.4, dy: -r * 0.25 },
      { label: 'Z', dx: 0, dy: -(r + 15) },
    ];
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    axes.forEach(a => ctx.fillText(a.label, cx + a.dx, cy + a.dy));

    // Axis lines
    ctx.strokeStyle = 'rgba(128,128,128,0.25)';
    ctx.lineWidth = 1;
    // Z axis
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
    // X axis
    ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();

    // Labels |0⟩ and |1⟩
    ctx.fillStyle = '#aaa';
    ctx.font = '12px serif';
    ctx.fillText('|0⟩', cx + 8, cy - r - 5);
    ctx.fillText('|1⟩', cx + 8, cy + r + 14);

    // Project 3D Bloch vector to 2D (simple orthographic)
    const project = (v: [number, number, number]): [number, number] => {
      const px = cx + v[0] * r;
      const py = cy - v[2] * r;
      return [px, py];
    };

    // Target state (faded)
    const [tx, ty] = project(targetBloch);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(tx, ty, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.fill();

    // Reconstructed state
    const [bx, by] = project(blochVector);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = 'hsl(250, 80%, 60%)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arrow head
    const angle = Math.atan2(by - cy, bx - cx);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - 10 * Math.cos(angle - 0.4), by - 10 * Math.sin(angle - 0.4));
    ctx.lineTo(bx - 10 * Math.cos(angle + 0.4), by - 10 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = 'hsl(250, 80%, 60%)';
    ctx.fill();

    // State dot
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(250, 80%, 60%)';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

  }, [blochVector, targetBloch]);

  return <canvas ref={canvasRef} width={300} height={300} className="w-full max-w-[300px] mx-auto rounded-lg border border-border bg-card" />;
}

// ── Density Matrix Visualization ──
function DensityMatrixViz({ rho }: { rho: DensityMatrix }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const n = rho.length;
    const cellW = (w - 60) / (n * 2 + 1);
    const cellH = (h - 40) / n;
    const startX = 40;

    // Real part
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Re(ρ)', startX + n * cellW / 2, 12);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = rho[i][j].re;
        const intensity = Math.abs(val);
        const hue = val >= 0 ? 250 : 0;
        ctx.fillStyle = `hsla(${hue}, 80%, 55%, ${Math.min(1, intensity + 0.1)})`;
        ctx.fillRect(startX + j * cellW, 18 + i * cellH, cellW - 2, cellH - 2);
        ctx.fillStyle = '#fff';
        ctx.font = '9px monospace';
        ctx.fillText(val.toFixed(2), startX + j * cellW + cellW / 2, 18 + i * cellH + cellH / 2 + 3);
      }
    }

    // Imaginary part
    const imStartX = startX + n * cellW + cellW;
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.fillText('Im(ρ)', imStartX + n * cellW / 2, 12);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = rho[i][j].im;
        const intensity = Math.abs(val);
        const hue = val >= 0 ? 142 : 45;
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${Math.min(1, intensity + 0.1)})`;
        ctx.fillRect(imStartX + j * cellW, 18 + i * cellH, cellW - 2, cellH - 2);
        ctx.fillStyle = '#fff';
        ctx.font = '9px monospace';
        ctx.fillText(val.toFixed(2), imStartX + j * cellW + cellW / 2, 18 + i * cellH + cellH / 2 + 3);
      }
    }

    // Labels
    ctx.fillStyle = '#888';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i < n; i++) {
      ctx.fillText(`|${i}⟩`, startX - 5, 18 + i * cellH + cellH / 2 + 3);
    }
  }, [rho]);

  return <canvas ref={canvasRef} width={350} height={100} className="w-full max-w-[350px] mx-auto rounded border border-border bg-card" />;
}

// ── Main Component ──
export function QuantumStateTomography() {
  const [inputState, setInputState] = useState<InputState>('|+⟩');
  const [shots, setShots] = useState(1000);
  const [noise, setNoise] = useState(0);
  const [result, setResult] = useState<TomographyResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTomography = useCallback(async () => {
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 300));

    const target = INPUT_STATES[inputState];
    const noisyRho = addNoise(target.rho, noise);
    const measurements = simulateMeasurements(noisyRho, shots);
    const { rho, bloch } = reconstructState(measurements);
    const purity = calcPurity(rho);
    const fidelity = calcFidelity(rho, target.rho);
    const vonNeumannEntropy = calcEntropy(rho);

    setResult({ rho, purity, fidelity, blochVector: bloch, vonNeumannEntropy, measurements });
    setIsRunning(false);
    toast.success(`Tomography complete: Fidelity ${(fidelity * 100).toFixed(1)}%, Purity ${(purity * 100).toFixed(1)}%`);
  }, [inputState, shots, noise]);

  const target = INPUT_STATES[inputState];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bloch Sphere */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Quantum State Tomography
              </CardTitle>
              <Button onClick={runTomography} disabled={isRunning}>
                {isRunning ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? 'Measuring...' : 'Run Tomography'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bloch sphere */}
              <div>
                <div className="text-xs text-muted-foreground mb-2">Bloch Sphere Reconstruction</div>
                <BlochSphere
                  blochVector={result?.blochVector ?? [0, 0, 0]}
                  targetBloch={target.bloch}
                />
                <div className="flex gap-3 mt-2 text-[10px] justify-center">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(250, 80%, 60%)' }} />
                    Reconstructed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.5)' }} />
                    Target
                  </span>
                </div>
              </div>

              {/* Density matrix + metrics */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Grid3X3 className="h-3 w-3" /> Density Matrix ρ
                  </div>
                  {result ? (
                    <DensityMatrixViz rho={result.rho} />
                  ) : (
                    <div className="h-[100px] flex items-center justify-center text-muted-foreground text-xs border border-border rounded">
                      Run tomography to see ρ
                    </div>
                  )}
                </div>

                {result && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-[10px] text-muted-foreground">Purity Tr(ρ²)</div>
                      <div className="font-mono font-bold text-sm">{result.purity.toFixed(4)}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-[10px] text-muted-foreground">Fidelity</div>
                      <div className="font-mono font-bold text-sm">{(result.fidelity * 100).toFixed(1)}%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-[10px] text-muted-foreground">S(ρ) entropy</div>
                      <div className="font-mono font-bold text-sm">{result.vonNeumannEntropy.toFixed(4)}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-[10px] text-muted-foreground">|r⃗| length</div>
                      <div className="font-mono font-bold text-sm">
                        {Math.sqrt(result.blochVector.reduce((s, v) => s + v * v, 0)).toFixed(4)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Measurement results */}
                {result && (
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1">Measurement Counts ({shots} shots)</div>
                    <div className="space-y-1">
                      {result.measurements.map(m => {
                        const total = m.counts['0'] + m.counts['1'];
                        const p0 = m.counts['0'] / total;
                        return (
                          <div key={m.basis} className="flex items-center gap-2 text-[10px]">
                            <span className="w-6 font-mono font-bold">{m.basis}</span>
                            <div className="flex-1 h-3 bg-muted rounded overflow-hidden flex">
                              <div className="h-full bg-primary/70" style={{ width: `${p0 * 100}%` }} />
                              <div className="h-full bg-destructive/50" style={{ width: `${(1 - p0) * 100}%` }} />
                            </div>
                            <span className="w-20 font-mono text-right">{m.counts['0']}|{m.counts['1']}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Input State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={inputState} onValueChange={v => { setInputState(v as InputState); setResult(null); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(INPUT_STATES) as InputState[]).map(s => (
                    <SelectItem key={s} value={s} className="text-xs">{s} — {INPUT_STATES[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-[10px] text-muted-foreground p-2 bg-muted/50 rounded">
                Bloch: ({target.bloch.join(', ')})
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Measurement Shots</span>
                  <span className="font-mono">{shots}</span>
                </div>
                <Slider value={[shots]} min={100} max={10000} step={100} onValueChange={([v]) => setShots(v)} />
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Noise Level</span>
                  <span className="font-mono">{noise.toFixed(1)}</span>
                </div>
                <Slider value={[noise]} min={0} max={5} step={0.1} onValueChange={([v]) => setNoise(v)} />
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bloch Vector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between"><span>r_x:</span><span>{result.blochVector[0].toFixed(4)}</span></div>
                  <div className="flex justify-between"><span>r_y:</span><span>{result.blochVector[1].toFixed(4)}</span></div>
                  <div className="flex justify-between"><span>r_z:</span><span>{result.blochVector[2].toFixed(4)}</span></div>
                </div>
                <div className="mt-2">
                  <Badge variant={result.purity > 0.95 ? 'default' : result.purity > 0.7 ? 'secondary' : 'destructive'} className="text-[10px]">
                    {result.purity > 0.95 ? 'Pure State' : result.purity > 0.7 ? 'Partially Mixed' : 'Mixed State'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
