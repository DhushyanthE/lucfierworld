/**
 * Quantum Gate Fidelity Benchmarking Tool
 * Compares ideal vs noisy gate operations across qubit architectures
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Gauge, Play, BarChart3, Cpu, Zap, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

type Architecture = 'superconducting' | 'trapped-ion' | 'photonic' | 'topological';
type GateType = 'H' | 'X' | 'Y' | 'Z' | 'CNOT' | 'T' | 'S' | 'Rx' | 'Ry' | 'Rz' | 'SWAP' | 'CZ' | 'Toffoli';

interface ArchitectureSpec {
  name: string;
  t1: number;        // µs
  t2: number;        // µs
  singleGateTime: number;  // ns
  twoGateTime: number;     // ns
  singleGateError: number; // error rate
  twoGateError: number;
  readoutError: number;
  connectivity: string;
  color: string;
}

interface GateSpec {
  name: string;
  qubits: 1 | 2 | 3;
  idealMatrix: string;
  category: 'Pauli' | 'Clifford' | 'Non-Clifford' | 'Multi-Qubit';
}

interface BenchmarkResult {
  gate: GateType;
  architecture: Architecture;
  idealFidelity: number;
  noisyFidelity: number;
  processInfidelity: number;
  diamondNorm: number;
  gateTime: number;
  errorRate: number;
  passed: boolean;
}

interface BenchmarkSuite {
  architecture: Architecture;
  results: BenchmarkResult[];
  avgFidelity: number;
  worstGate: string;
  bestGate: string;
  overallScore: number;
  timestamp: number;
}

const ARCHITECTURES: Record<Architecture, ArchitectureSpec> = {
  'superconducting': {
    name: 'Superconducting (Transmon)',
    t1: 80, t2: 50,
    singleGateTime: 25, twoGateTime: 200,
    singleGateError: 0.001, twoGateError: 0.006,
    readoutError: 0.015,
    connectivity: 'Nearest-neighbor grid',
    color: 'hsl(var(--primary))',
  },
  'trapped-ion': {
    name: 'Trapped Ion (Yb+)',
    t1: 1000000, t2: 500000,
    singleGateTime: 10000, twoGateTime: 200000,
    singleGateError: 0.0003, twoGateError: 0.002,
    readoutError: 0.003,
    connectivity: 'All-to-all',
    color: 'hsl(271, 91%, 65%)',
  },
  'photonic': {
    name: 'Photonic (Linear Optical)',
    t1: Infinity, t2: Infinity,
    singleGateTime: 1, twoGateTime: 10,
    singleGateError: 0.002, twoGateError: 0.01,
    readoutError: 0.01,
    connectivity: 'Reconfigurable',
    color: 'hsl(142, 71%, 45%)',
  },
  'topological': {
    name: 'Topological (Majorana)',
    t1: 10000000, t2: 5000000,
    singleGateTime: 100, twoGateTime: 1000,
    singleGateError: 0.0001, twoGateError: 0.001,
    readoutError: 0.005,
    connectivity: 'Braiding lattice',
    color: 'hsl(45, 93%, 47%)',
  },
};

const GATES: Record<GateType, GateSpec> = {
  'H':       { name: 'Hadamard',    qubits: 1, idealMatrix: '1/√2[[1,1],[1,-1]]', category: 'Clifford' },
  'X':       { name: 'Pauli-X',     qubits: 1, idealMatrix: '[[0,1],[1,0]]', category: 'Pauli' },
  'Y':       { name: 'Pauli-Y',     qubits: 1, idealMatrix: '[[0,-i],[i,0]]', category: 'Pauli' },
  'Z':       { name: 'Pauli-Z',     qubits: 1, idealMatrix: '[[1,0],[0,-1]]', category: 'Pauli' },
  'S':       { name: 'Phase (S)',    qubits: 1, idealMatrix: '[[1,0],[0,i]]', category: 'Clifford' },
  'T':       { name: 'T Gate',      qubits: 1, idealMatrix: '[[1,0],[0,e^iπ/4]]', category: 'Non-Clifford' },
  'Rx':      { name: 'Rotation-X',  qubits: 1, idealMatrix: 'e^{-iθX/2}', category: 'Non-Clifford' },
  'Ry':      { name: 'Rotation-Y',  qubits: 1, idealMatrix: 'e^{-iθY/2}', category: 'Non-Clifford' },
  'Rz':      { name: 'Rotation-Z',  qubits: 1, idealMatrix: 'e^{-iθZ/2}', category: 'Non-Clifford' },
  'CNOT':    { name: 'CNOT',        qubits: 2, idealMatrix: '|0⟩⟨0|⊗I+|1⟩⟨1|⊗X', category: 'Multi-Qubit' },
  'SWAP':    { name: 'SWAP',        qubits: 2, idealMatrix: 'SWAP matrix', category: 'Multi-Qubit' },
  'CZ':      { name: 'Controlled-Z', qubits: 2, idealMatrix: 'diag(1,1,1,-1)', category: 'Multi-Qubit' },
  'Toffoli': { name: 'Toffoli',     qubits: 3, idealMatrix: 'CCX matrix', category: 'Multi-Qubit' },
};

function simulateGateBenchmark(gate: GateType, arch: Architecture, noiseScale: number, shots: number): BenchmarkResult {
  const spec = ARCHITECTURES[arch];
  const gateSpec = GATES[gate];
  const isMultiQubit = gateSpec.qubits >= 2;
  const is3Qubit = gateSpec.qubits === 3;

  const baseError = isMultiQubit ? spec.twoGateError : spec.singleGateError;
  const gateTime = isMultiQubit ? spec.twoGateTime : spec.singleGateTime;
  const effectiveError = baseError * noiseScale * (is3Qubit ? 3 : 1);

  // Randomized benchmarking simulation
  let totalFidelity = 0;
  for (let i = 0; i < shots; i++) {
    const coherenceDecay = gateTime < Infinity && spec.t2 < Infinity
      ? Math.exp(-gateTime / (spec.t2 * 1000))
      : 1;
    const gateNoise = 1 - effectiveError * (0.8 + Math.random() * 0.4);
    const readoutNoise = 1 - spec.readoutError * Math.random() * 0.5;
    totalFidelity += coherenceDecay * gateNoise * readoutNoise;
  }
  const noisyFidelity = totalFidelity / shots;

  const processInfidelity = 1 - noisyFidelity;
  const diamondNorm = processInfidelity * (2 ** gateSpec.qubits); // upper bound

  return {
    gate,
    architecture: arch,
    idealFidelity: 1,
    noisyFidelity: Math.max(0, Math.min(1, noisyFidelity)),
    processInfidelity: Math.max(0, processInfidelity),
    diamondNorm: Math.min(1, Math.max(0, diamondNorm)),
    gateTime,
    errorRate: effectiveError,
    passed: noisyFidelity >= 0.99,
  };
}

export function GateFidelityBenchmark() {
  const [selectedArchs, setSelectedArchs] = useState<Architecture[]>(['superconducting', 'trapped-ion']);
  const [selectedGates, setSelectedGates] = useState<GateType[]>(['H', 'X', 'CNOT', 'T', 'SWAP', 'CZ']);
  const [noiseScale, setNoiseScale] = useState(1);
  const [shots, setShots] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [suites, setSuites] = useState<BenchmarkSuite[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleArch = (arch: Architecture) => {
    setSelectedArchs(prev =>
      prev.includes(arch) ? prev.filter(a => a !== arch) : [...prev, arch]
    );
  };

  const toggleGate = (gate: GateType) => {
    setSelectedGates(prev =>
      prev.includes(gate) ? prev.filter(g => g !== gate) : [...prev, gate]
    );
  };

  const runBenchmark = useCallback(async () => {
    if (selectedArchs.length === 0 || selectedGates.length === 0) {
      toast.error('Select at least one architecture and one gate');
      return;
    }
    setIsRunning(true);
    setSuites([]);

    await new Promise(r => setTimeout(r, 300));

    const newSuites: BenchmarkSuite[] = [];
    for (const arch of selectedArchs) {
      const results: BenchmarkResult[] = [];
      for (const gate of selectedGates) {
        results.push(simulateGateBenchmark(gate, arch, noiseScale, shots));
      }
      const fidelities = results.map(r => r.noisyFidelity);
      const avgFidelity = fidelities.reduce((a, b) => a + b, 0) / fidelities.length;
      const worstIdx = fidelities.indexOf(Math.min(...fidelities));
      const bestIdx = fidelities.indexOf(Math.max(...fidelities));

      newSuites.push({
        architecture: arch,
        results,
        avgFidelity,
        worstGate: GATES[results[worstIdx].gate].name,
        bestGate: GATES[results[bestIdx].gate].name,
        overallScore: avgFidelity * 100,
        timestamp: Date.now(),
      });
    }

    setSuites(newSuites);
    setIsRunning(false);
    toast.success(`Benchmark complete: ${selectedArchs.length} architectures × ${selectedGates.length} gates`);
  }, [selectedArchs, selectedGates, noiseScale, shots]);

  // Draw comparison chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || suites.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padding = { top: 30, right: 20, bottom: 60, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const gateCount = selectedGates.length;
    const archCount = suites.length;
    const groupW = chartW / gateCount;
    const barW = Math.min(groupW / (archCount + 1), 30);

    // Y axis
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    // Y labels
    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const val = 0.95 + i * 0.01;
      const y = h - padding.bottom - ((val - 0.95) / 0.05) * chartH;
      ctx.fillText(`${(val * 100).toFixed(1)}%`, padding.left - 5, y + 3);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.strokeStyle = 'hsl(var(--border) / 0.3)';
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Threshold line at 99%
    const threshY = h - padding.bottom - ((0.99 - 0.95) / 0.05) * chartH;
    ctx.beginPath();
    ctx.moveTo(padding.left, threshY);
    ctx.lineTo(w - padding.right, threshY);
    ctx.strokeStyle = 'hsl(0, 84%, 60%)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'hsl(0, 84%, 60%)';
    ctx.textAlign = 'left';
    ctx.fillText('99% threshold', w - padding.right - 80, threshY - 5);

    // Bars
    suites.forEach((suite, si) => {
      const arch = ARCHITECTURES[suite.architecture];
      suite.results.forEach((result, gi) => {
        const x = padding.left + gi * groupW + (si + 0.5) * barW + (groupW - archCount * barW) / 2;
        const fidelityClamped = Math.max(0.95, result.noisyFidelity);
        const barH = ((fidelityClamped - 0.95) / 0.05) * chartH;
        const y = h - padding.bottom - barH;

        // Bar
        const gradient = ctx.createLinearGradient(x, y, x, h - padding.bottom);
        gradient.addColorStop(0, arch.color);
        gradient.addColorStop(1, arch.color.replace(')', ' / 0.3)').replace('hsl(', 'hsla('));
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barW - 2, barH);

        // Border
        ctx.strokeStyle = arch.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barW - 2, barH);

        // Value on top
        ctx.fillStyle = 'hsl(var(--foreground))';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        if (barH > 15) {
          ctx.fillText(`${(result.noisyFidelity * 100).toFixed(2)}`, x + (barW - 2) / 2, y - 3);
        }
      });
    });

    // X labels (gate names)
    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    selectedGates.forEach((gate, gi) => {
      const x = padding.left + gi * groupW + groupW / 2;
      ctx.fillText(gate, x, h - padding.bottom + 15);
    });

    // Legend
    suites.forEach((suite, si) => {
      const arch = ARCHITECTURES[suite.architecture];
      const lx = padding.left + si * 160;
      ctx.fillStyle = arch.color;
      ctx.fillRect(lx, h - 20, 12, 12);
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(arch.name, lx + 16, h - 10);
    });
  }, [suites, selectedGates]);

  const allArchKeys = Object.keys(ARCHITECTURES) as Architecture[];
  const allGateKeys = Object.keys(GATES) as GateType[];
  const gateCategories = ['Pauli', 'Clifford', 'Non-Clifford', 'Multi-Qubit'] as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Gate Fidelity Benchmark
              </CardTitle>
              <Button onClick={runBenchmark} disabled={isRunning}>
                {isRunning ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? 'Running...' : 'Run Benchmark'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {suites.length === 0 ? (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
                Select architectures and gates, then click Run Benchmark
              </div>
            ) : (
              <canvas ref={canvasRef} width={700} height={380} className="w-full rounded-lg border border-border bg-card" />
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Qubit Architectures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {allArchKeys.map(arch => (
                <Button
                  key={arch}
                  size="sm"
                  variant={selectedArchs.includes(arch) ? 'default' : 'outline'}
                  className="w-full justify-start text-xs"
                  onClick={() => toggleArch(arch)}
                >
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ARCHITECTURES[arch].color }} />
                  {ARCHITECTURES[arch].name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" /> Gate Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gateCategories.map(cat => (
                <div key={cat}>
                  <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{cat}</div>
                  <div className="flex flex-wrap gap-1">
                    {allGateKeys.filter(g => GATES[g].category === cat).map(gate => (
                      <Badge
                        key={gate}
                        variant={selectedGates.includes(gate) ? 'default' : 'outline'}
                        className="cursor-pointer text-[10px]"
                        onClick={() => toggleGate(gate)}
                      >
                        {gate}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Noise Scale</span>
                  <span className="font-mono">{noiseScale.toFixed(1)}×</span>
                </div>
                <Slider value={[noiseScale]} min={0.1} max={5} step={0.1}
                  onValueChange={([v]) => setNoiseScale(v)} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">RB Shots</span>
                  <span className="font-mono">{shots}</span>
                </div>
                <Slider value={[shots]} min={100} max={10000} step={100}
                  onValueChange={([v]) => setShots(v)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Table */}
      {suites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suites.map(suite => {
            const arch = ARCHITECTURES[suite.architecture];
            return (
              <Card key={suite.architecture}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: arch.color }} />
                      {arch.name}
                    </CardTitle>
                    <Badge variant={suite.avgFidelity >= 0.99 ? 'default' : 'destructive'} className="text-[10px]">
                      {(suite.avgFidelity * 100).toFixed(2)}% avg
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Best: {suite.bestGate} · Worst: {suite.worstGate} · {arch.connectivity}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {suite.results.map(r => (
                      <div key={r.gate} className="flex items-center gap-2 text-xs">
                        <span className="w-12 font-mono font-bold">{r.gate}</span>
                        <div className="flex-1">
                          <Progress value={r.noisyFidelity * 100} className="h-2" />
                        </div>
                        <span className="w-16 text-right font-mono">
                          {(r.noisyFidelity * 100).toFixed(3)}%
                        </span>
                        {r.passed
                          ? <CheckCircle className="h-3 w-3 text-green-500" />
                          : <XCircle className="h-3 w-3 text-destructive" />
                        }
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
                    <div className="p-1.5 rounded bg-muted/50 text-center">
                      <div className="font-mono font-bold">{arch.singleGateTime}ns</div>
                      <div className="text-muted-foreground">1Q Gate</div>
                    </div>
                    <div className="p-1.5 rounded bg-muted/50 text-center">
                      <div className="font-mono font-bold">{arch.twoGateTime}ns</div>
                      <div className="text-muted-foreground">2Q Gate</div>
                    </div>
                    <div className="p-1.5 rounded bg-muted/50 text-center">
                      <div className="font-mono font-bold">{(arch.readoutError * 100).toFixed(2)}%</div>
                      <div className="text-muted-foreground">Readout Err</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
