/**
 * Quantum Algorithm Simulator
 * Supports Grover's Search and Shor's Factoring with step-by-step visualization
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Play, Pause, SkipForward, RotateCcw, Search, Hash, ChevronRight, Zap } from 'lucide-react';

type Algorithm = 'grover' | 'shor';

interface AlgorithmStep {
  id: number;
  name: string;
  description: string;
  qubits: number[];        // amplitudes or state representation
  amplitudes: number[];     // probability amplitudes
  phase: number[];          // phase info
  highlight: string;        // which part of circuit is active
  completed: boolean;
}

interface GroverConfig {
  numQubits: number;
  targetState: number;
  iterations: number;
}

interface ShorConfig {
  numberToFactor: number;
  base: number;
}

interface SimulationResult {
  algorithm: Algorithm;
  steps: AlgorithmStep[];
  finalAnswer: string;
  successProbability: number;
  totalSteps: number;
  classicalComparison: string;
}

// ── Grover's Algorithm Simulation ──
function simulateGrover(config: GroverConfig): SimulationResult {
  const N = 2 ** config.numQubits;
  const target = config.targetState % N;
  const optimalIters = Math.max(1, Math.round(Math.PI / 4 * Math.sqrt(N)));
  const iters = config.iterations || optimalIters;
  const steps: AlgorithmStep[] = [];

  // Step 0: Initialize |0⟩^n
  const initAmps = new Array(N).fill(0);
  initAmps[0] = 1;
  steps.push({
    id: 0, name: 'Initialize', description: `Prepare ${config.numQubits} qubits in |0⟩ state`,
    qubits: Array.from({ length: config.numQubits }, (_, i) => i),
    amplitudes: [...initAmps], phase: new Array(N).fill(0),
    highlight: 'init', completed: false,
  });

  // Step 1: Hadamard on all qubits → uniform superposition
  const uniformAmp = 1 / Math.sqrt(N);
  const hadAmps = new Array(N).fill(uniformAmp);
  steps.push({
    id: 1, name: 'Hadamard Layer', description: `Apply H⊗${config.numQubits} for uniform superposition`,
    qubits: Array.from({ length: config.numQubits }, (_, i) => i),
    amplitudes: [...hadAmps], phase: new Array(N).fill(0),
    highlight: 'hadamard', completed: false,
  });

  // Grover iterations
  let amps = [...hadAmps];
  let phases = new Array(N).fill(0);
  for (let it = 0; it < iters; it++) {
    // Oracle: flip phase of target
    phases = phases.map((p, i) => i === target ? p + Math.PI : p);
    const oracleAmps = amps.map((a, i) => i === target ? -a : a);
    steps.push({
      id: steps.length, name: `Oracle (iter ${it + 1})`,
      description: `Mark target state |${target.toString(2).padStart(config.numQubits, '0')}⟩ by phase flip`,
      qubits: Array.from({ length: config.numQubits }, (_, i) => i),
      amplitudes: [...oracleAmps], phase: [...phases],
      highlight: 'oracle', completed: false,
    });

    // Diffusion operator: 2|s⟩⟨s| - I
    const mean = oracleAmps.reduce((a, b) => a + b, 0) / N;
    amps = oracleAmps.map(a => 2 * mean - a);
    steps.push({
      id: steps.length, name: `Diffusion (iter ${it + 1})`,
      description: 'Amplitude amplification via inversion about the mean',
      qubits: Array.from({ length: config.numQubits }, (_, i) => i),
      amplitudes: [...amps], phase: [...phases],
      highlight: 'diffusion', completed: false,
    });
  }

  // Measurement
  const probs = amps.map(a => a * a);
  const successProb = probs[target];
  steps.push({
    id: steps.length, name: 'Measurement',
    description: `Measure all qubits → P(|${target.toString(2).padStart(config.numQubits, '0')}⟩) = ${(successProb * 100).toFixed(1)}%`,
    qubits: Array.from({ length: config.numQubits }, (_, i) => i),
    amplitudes: [...amps], phase: [...phases],
    highlight: 'measure', completed: false,
  });

  return {
    algorithm: 'grover',
    steps,
    finalAnswer: `Target |${target.toString(2).padStart(config.numQubits, '0')}⟩ found with ${(successProb * 100).toFixed(1)}% probability`,
    successProbability: successProb,
    totalSteps: steps.length,
    classicalComparison: `Classical: O(${N}) | Quantum: O(√${N}) = O(${Math.round(Math.sqrt(N))})`,
  };
}

// ── Shor's Algorithm Simulation ──
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

function findPeriod(a: number, N: number): number {
  for (let r = 1; r <= N; r++) {
    if (modPow(a, r, N) === 1) return r;
  }
  return N;
}

function simulateShor(config: ShorConfig): SimulationResult {
  const N = config.numberToFactor;
  const a = config.base;
  const steps: AlgorithmStep[] = [];
  const numQubits = Math.ceil(Math.log2(N)) * 2;
  const stateSize = Math.min(N, 16);

  // Step 0: Check trivial
  steps.push({
    id: 0, name: 'Input Validation',
    description: `Factor N=${N} using base a=${a}. Check gcd(${a}, ${N})`,
    qubits: [0], amplitudes: [1], phase: [0],
    highlight: 'init', completed: false,
  });

  const g = gcd(a, N);
  if (g > 1) {
    steps.push({
      id: 1, name: 'Trivial Factor Found',
      description: `gcd(${a}, ${N}) = ${g} — non-trivial factor found classically!`,
      qubits: [0], amplitudes: [1], phase: [0],
      highlight: 'result', completed: false,
    });
    return {
      algorithm: 'shor', steps,
      finalAnswer: `${N} = ${g} × ${N / g}`,
      successProbability: 1, totalSteps: steps.length,
      classicalComparison: `Trivial case — gcd shortcut`,
    };
  }

  // Step 1: Initialize quantum registers
  const uniformAmp = 1 / Math.sqrt(stateSize);
  steps.push({
    id: steps.length, name: 'Quantum Register Init',
    description: `Create ${numQubits}-qubit register pair (counting + work)`,
    qubits: Array.from({ length: Math.min(numQubits, 8) }, (_, i) => i),
    amplitudes: new Array(stateSize).fill(uniformAmp),
    phase: new Array(stateSize).fill(0),
    highlight: 'init', completed: false,
  });

  // Step 2: Hadamard on counting register
  steps.push({
    id: steps.length, name: 'Superposition',
    description: 'Apply Hadamard gates to counting register for uniform superposition',
    qubits: Array.from({ length: Math.min(numQubits / 2, 4) }, (_, i) => i),
    amplitudes: new Array(stateSize).fill(uniformAmp),
    phase: new Array(stateSize).fill(0),
    highlight: 'hadamard', completed: false,
  });

  // Step 3: Modular exponentiation
  const modExpValues = Array.from({ length: stateSize }, (_, x) => modPow(a, x, N));
  const modAmps = modExpValues.map(() => uniformAmp);
  steps.push({
    id: steps.length, name: 'Modular Exponentiation',
    description: `Compute |x⟩|${a}^x mod ${N}⟩ in superposition`,
    qubits: Array.from({ length: Math.min(numQubits, 8) }, (_, i) => i),
    amplitudes: modAmps, phase: modExpValues.map((_, i) => (2 * Math.PI * i) / stateSize),
    highlight: 'modexp', completed: false,
  });

  // Step 4: QFT
  const r = findPeriod(a, N);
  const qftAmps = new Array(stateSize).fill(0);
  for (let k = 0; k < stateSize; k++) {
    let sum = 0;
    for (let j = 0; j < stateSize; j++) {
      sum += Math.cos(2 * Math.PI * j * k / stateSize) / stateSize;
    }
    qftAmps[k] = Math.abs(sum) * Math.sqrt(stateSize);
  }
  // Peaks at multiples of stateSize/r
  steps.push({
    id: steps.length, name: 'Quantum Fourier Transform',
    description: `Apply QFT to extract period. Peaks at multiples of ${Math.round(stateSize / r)}`,
    qubits: Array.from({ length: Math.min(numQubits / 2, 4) }, (_, i) => i),
    amplitudes: qftAmps, phase: qftAmps.map((_, i) => (2 * Math.PI * i * r) / stateSize),
    highlight: 'qft', completed: false,
  });

  // Step 5: Measurement
  steps.push({
    id: steps.length, name: 'Measurement',
    description: `Measure counting register → period r = ${r}`,
    qubits: Array.from({ length: Math.min(numQubits / 2, 4) }, (_, i) => i),
    amplitudes: qftAmps, phase: qftAmps.map((_, i) => (2 * Math.PI * i * r) / stateSize),
    highlight: 'measure', completed: false,
  });

  // Step 6: Classical post-processing
  let factor1 = 1, factor2 = N;
  if (r % 2 === 0) {
    const x = modPow(a, r / 2, N);
    factor1 = gcd(x - 1, N);
    factor2 = gcd(x + 1, N);
    if (factor1 === 1 || factor1 === N) { factor1 = gcd(x + 1, N); factor2 = N / factor1; }
    if (factor1 === 1 || factor1 === N) { factor1 = r; factor2 = N / gcd(r, N); }
  }
  if (factor1 <= 1 || factor1 >= N) { factor1 = 0; factor2 = 0; }

  steps.push({
    id: steps.length, name: 'Classical Post-Processing',
    description: `Period r=${r}${r % 2 === 0 ? ` → gcd(${a}^${r / 2}±1, ${N}) = {${factor1}, ${factor2}}` : ' (odd period, retry needed)'}`,
    qubits: [0], amplitudes: [1], phase: [0],
    highlight: 'result', completed: false,
  });

  const success = factor1 > 1 && factor1 < N;
  return {
    algorithm: 'shor', steps,
    finalAnswer: success ? `${N} = ${factor1} × ${factor2}` : `Period r=${r} found; retry with different base needed`,
    successProbability: success ? 0.95 : 0,
    totalSteps: steps.length,
    classicalComparison: `Classical: O(e^{n^{1/3}}) | Quantum: O(n³)`,
  };
}

// ── Amplitude Bar Chart ──
function AmplitudeChart({ amplitudes, phase, highlight, targetState }: {
  amplitudes: number[]; phase: number[]; highlight: string; targetState?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const maxDisplay = Math.min(amplitudes.length, 32);
    const padding = { top: 10, right: 10, bottom: 25, left: 35 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const barW = chartW / maxDisplay;

    // Y axis
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    const maxAmp = Math.max(...amplitudes.slice(0, maxDisplay).map(Math.abs), 0.01);

    amplitudes.slice(0, maxDisplay).forEach((amp, i) => {
      const prob = amp * amp;
      const barH = (Math.abs(amp) / maxAmp) * chartH * 0.9;
      const x = padding.left + i * barW;
      const y = h - padding.bottom - barH;

      const isTarget = i === targetState;
      const isNeg = amp < 0;

      if (isTarget) {
        ctx.fillStyle = isNeg ? 'hsl(0, 84%, 60%)' : 'hsl(142, 71%, 45%)';
      } else {
        ctx.fillStyle = isNeg ? 'hsl(0, 60%, 50%, 0.6)' : 'hsl(var(--primary) / 0.7)';
      }
      ctx.fillRect(x + 1, y, barW - 2, barH);

      if (isTarget) {
        ctx.strokeStyle = 'hsl(45, 93%, 47%)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y, barW - 2, barH);
        ctx.lineWidth = 1;
      }

      // X label
      if (maxDisplay <= 16 || i % Math.ceil(maxDisplay / 16) === 0) {
        ctx.fillStyle = 'hsl(var(--muted-foreground))';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`|${i}⟩`, x + barW / 2, h - padding.bottom + 12);
      }
    });

    // Y labels
    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    [0, 0.5, 1].forEach(v => {
      const y = h - padding.bottom - v * chartH * 0.9;
      ctx.fillText((v * maxAmp).toFixed(2), padding.left - 3, y + 3);
    });
  }, [amplitudes, phase, highlight, targetState]);

  return <canvas ref={canvasRef} width={500} height={180} className="w-full rounded border border-border bg-card" />;
}

// ── Main Component ──
export function QuantumAlgorithmSimulator() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('grover');
  const [groverConfig, setGroverConfig] = useState<GroverConfig>({ numQubits: 3, targetState: 5, iterations: 0 });
  const [shorConfig, setShorConfig] = useState<ShorConfig>({ numberToFactor: 15, base: 7 });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runSimulation = useCallback(() => {
    const res = algorithm === 'grover'
      ? simulateGrover(groverConfig)
      : simulateShor(shorConfig);
    setResult(res);
    setCurrentStep(0);
    setIsPlaying(false);
    toast.success(`${algorithm === 'grover' ? "Grover's" : "Shor's"} simulation ready: ${res.totalSteps} steps`);
  }, [algorithm, groverConfig, shorConfig]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && result) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= result.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, result]);

  const step = result?.steps[currentStep];

  const highlightColors: Record<string, string> = {
    init: 'bg-muted text-muted-foreground',
    hadamard: 'bg-primary/20 text-primary',
    oracle: 'bg-destructive/20 text-destructive',
    diffusion: 'bg-accent text-accent-foreground',
    modexp: 'bg-primary/20 text-primary',
    qft: 'bg-secondary text-secondary-foreground',
    measure: 'bg-primary text-primary-foreground',
    result: 'bg-primary text-primary-foreground',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quantum Algorithm Simulator
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant={algorithm === 'grover' ? 'default' : 'outline'} onClick={() => setAlgorithm('grover')}>
                  <Search className="h-3 w-3 mr-1" /> Grover
                </Button>
                <Button size="sm" variant={algorithm === 'shor' ? 'default' : 'outline'} onClick={() => setAlgorithm('shor')}>
                  <Hash className="h-3 w-3 mr-1" /> Shor
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                Configure parameters and click Simulate
              </div>
            ) : (
              <>
                {/* Step progress */}
                <div className="flex items-center gap-2">
                  <Progress value={((currentStep + 1) / result.steps.length) * 100} className="flex-1 h-2" />
                  <span className="text-xs font-mono text-muted-foreground">{currentStep + 1}/{result.steps.length}</span>
                </div>

                {/* Playback controls */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setCurrentStep(0); setIsPlaying(false); }}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="outline" disabled={!result || currentStep >= result.steps.length - 1}
                    onClick={() => setCurrentStep(s => Math.min(s + 1, result.steps.length - 1))}>
                    <SkipForward className="h-3 w-3" />
                  </Button>
                  <div className="flex-1" />
                  {step && (
                    <Badge className={`text-[10px] ${highlightColors[step.highlight] || ''}`}>
                      {step.name}
                    </Badge>
                  )}
                </div>

                {/* Amplitude visualization */}
                {step && (
                  <AmplitudeChart
                    amplitudes={step.amplitudes}
                    phase={step.phase}
                    highlight={step.highlight}
                    targetState={algorithm === 'grover' ? groverConfig.targetState : undefined}
                  />
                )}

                {/* Step description */}
                {step && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="text-sm font-semibold">{step.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
                  </div>
                )}

                {/* Final result */}
                {currentStep === result.steps.length - 1 && (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardContent className="p-3 space-y-1">
                      <div className="text-sm font-bold text-primary">Result: {result.finalAnswer}</div>
                      <div className="text-xs text-muted-foreground">
                        Success probability: {(result.successProbability * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">{result.classicalComparison}</div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {algorithm === 'grover' ? "Grover's Search" : "Shor's Factoring"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {algorithm === 'grover' ? (
                <>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Qubits</span>
                      <span className="font-mono">{groverConfig.numQubits} ({2 ** groverConfig.numQubits} states)</span>
                    </div>
                    <Slider value={[groverConfig.numQubits]} min={2} max={5} step={1}
                      onValueChange={([v]) => setGroverConfig(c => ({ ...c, numQubits: v, targetState: Math.min(c.targetState, 2 ** v - 1) }))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Target State</span>
                      <span className="font-mono">|{groverConfig.targetState.toString(2).padStart(groverConfig.numQubits, '0')}⟩</span>
                    </div>
                    <Slider value={[groverConfig.targetState]} min={0} max={2 ** groverConfig.numQubits - 1} step={1}
                      onValueChange={([v]) => setGroverConfig(c => ({ ...c, targetState: v }))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Iterations</span>
                      <span className="font-mono">{groverConfig.iterations || 'Optimal'}</span>
                    </div>
                    <Slider value={[groverConfig.iterations]} min={0} max={10} step={1}
                      onValueChange={([v]) => setGroverConfig(c => ({ ...c, iterations: v }))} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Number to Factor</label>
                    <Input type="number" value={shorConfig.numberToFactor}
                      onChange={e => setShorConfig(c => ({ ...c, numberToFactor: Math.max(4, parseInt(e.target.value) || 15) }))}
                      className="h-8 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Base (a)</label>
                    <Input type="number" value={shorConfig.base}
                      onChange={e => setShorConfig(c => ({ ...c, base: Math.max(2, parseInt(e.target.value) || 2) }))}
                      className="h-8 text-sm font-mono" />
                  </div>
                  <div className="text-[10px] text-muted-foreground p-2 bg-muted/50 rounded">
                    Try: N=15 a=7, N=21 a=2, N=35 a=3
                  </div>
                </>
              )}
              <Button onClick={runSimulation} className="w-full">
                <Play className="h-4 w-4 mr-2" /> Simulate
              </Button>
            </CardContent>
          </Card>

          {/* Step list */}
          {result && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Execution Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {result.steps.map((s, i) => (
                    <button key={s.id}
                      className={`w-full text-left p-2 rounded text-xs flex items-center gap-2 transition-colors ${
                        i === currentStep ? 'bg-primary/10 border border-primary/30' :
                        i < currentStep ? 'text-muted-foreground' : ''
                      }`}
                      onClick={() => { setCurrentStep(i); setIsPlaying(false); }}
                    >
                      <ChevronRight className={`h-3 w-3 shrink-0 ${i === currentStep ? 'text-primary' : 'text-muted-foreground/50'}`} />
                      <span className="truncate">{s.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
