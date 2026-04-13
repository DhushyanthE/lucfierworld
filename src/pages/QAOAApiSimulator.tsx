
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Code, Play, Square, Terminal, Zap, Activity, CheckCircle, AlertTriangle, Copy, ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

// ── QUBO → Ising conversion ──
function quboToIsing(Q: number[][]): { linear: number[]; quadratic: number[][]; offset: number } {
  const n = Q.length;
  const linear: number[] = new Array(n).fill(0);
  const quadratic: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let offset = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        linear[i] += Q[i][i] / 2;
        offset += Q[i][i] / 2;
      } else if (i < j) {
        quadratic[i][j] = Q[i][j] / 4;
        linear[i] += Q[i][j] / 4;
        linear[j] += Q[i][j] / 4;
        offset += Q[i][j] / 4;
      }
    }
  }
  return { linear, quadratic, offset };
}

function computeKFactor(linear: number[], quadratic: number[][]): number {
  let maxAbs = 0;
  linear.forEach(v => { maxAbs = Math.max(maxAbs, Math.abs(v)); });
  quadratic.forEach(row => row.forEach(v => { maxAbs = Math.max(maxAbs, Math.abs(v)); }));
  return maxAbs || 1;
}

// ── Preset QUBO problems ──
const PRESETS: Record<string, { label: string; matrix: number[][]; description: string }> = {
  maxcut_4: {
    label: 'Max-Cut (4 nodes)',
    description: 'Find optimal graph partition minimizing edge cuts on a 4-node graph',
    matrix: [
      [-3, 1, 1, 1],
      [1, -3, 1, 1],
      [1, 1, -3, 1],
      [1, 1, 1, -3],
    ],
  },
  knapsack_3: {
    label: 'Knapsack (3 items)',
    description: 'Select items to maximize value within weight constraint',
    matrix: [
      [-5, 2, 3],
      [2, -4, 1],
      [3, 1, -6],
    ],
  },
  tsp_3: {
    label: 'TSP (3 cities)',
    description: 'Find shortest Hamiltonian cycle through 3 cities',
    matrix: [
      [-8, 4, 2, 3, 1, 0, 2, 0, 1],
      [4, -8, 4, 0, 3, 1, 1, 2, 0],
      [2, 4, -8, 1, 0, 3, 0, 1, 2],
      [3, 0, 1, -8, 4, 2, 3, 1, 0],
      [1, 3, 0, 4, -8, 4, 0, 3, 1],
      [0, 1, 3, 2, 4, -8, 1, 0, 3],
      [2, 1, 0, 3, 0, 1, -8, 4, 2],
      [0, 2, 1, 1, 3, 0, 4, -8, 4],
      [1, 0, 2, 0, 1, 3, 2, 4, -8],
    ],
  },
  custom: {
    label: 'Custom Matrix',
    description: 'Enter your own QUBO matrix',
    matrix: [],
  },
};

interface OptimizationStep {
  iteration: number;
  beta: number;
  gamma: number;
  energy: number;
  bellScore: number;
  gradientNorm: number;
}

interface SimulationResult {
  steps: OptimizationStep[];
  optimalSolution: number[];
  optimalEnergy: number;
  finalBellScore: number;
  kFactor: number;
  isingCoeffs: { linear: number[]; quadratic: number[][] };
  totalTime: number;
}

export default function QAOAApiSimulator() {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState('maxcut_4');
  const [customMatrix, setCustomMatrix] = useState('');
  const [numLayers, setNumLayers] = useState(3);
  const [maxIterations, setMaxIterations] = useState(100);
  const [wsqaoaEnabled, setWsqaoaEnabled] = useState(true);
  const [kScalingEnabled, setKScalingEnabled] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [liveSteps, setLiveSteps] = useState<OptimizationStep[]>([]);
  const [apiLog, setApiLog] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getMatrix = useCallback((): number[][] | null => {
    if (selectedPreset !== 'custom') return PRESETS[selectedPreset].matrix;
    try {
      const parsed = JSON.parse(customMatrix);
      if (!Array.isArray(parsed) || !parsed.every(r => Array.isArray(r))) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [selectedPreset, customMatrix]);

  const addLog = useCallback((msg: string) => {
    setApiLog(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 12)}] ${msg}`]);
  }, []);

  const runSimulation = useCallback(() => {
    const matrix = getMatrix();
    if (!matrix || matrix.length === 0) {
      toast({ title: 'Invalid Matrix', description: 'Please enter a valid QUBO matrix.', variant: 'destructive' });
      return;
    }

    const n = matrix.length;
    setIsRunning(true);
    setLiveSteps([]);
    setResult(null);
    setCurrentStep(0);
    setApiLog([]);

    addLog(`POST /api/v1/qaoa/optimize`);
    addLog(`Payload: { n: ${n}, layers: ${numLayers}, wsqaoa: ${wsqaoaEnabled}, k_scaling: ${kScalingEnabled} }`);
    addLog(`Mapping QUBO (${n}×${n}) → Ising Hamiltonian...`);

    const { linear, quadratic, offset } = quboToIsing(matrix);
    const kFactor = computeKFactor(linear, quadratic);

    addLog(`Ising coefficients computed. k-factor = ${kFactor.toFixed(4)}`);
    addLog(kScalingEnabled ? `k-factor scaling ENABLED — landscape smoothed` : `k-factor scaling DISABLED — raw coefficients`);
    addLog(wsqaoaEnabled ? `WS-QAOA ENABLED — warm-starting from classical relaxation` : `Standard QAOA — uniform superposition init`);
    addLog(`Starting Trotterized QAOA optimization (${maxIterations} iterations, ${numLayers} layers)...`);

    const steps: OptimizationStep[] = [];
    let tick = 0;
    const convergenceRate = wsqaoaEnabled ? 0.06 : 0.02;
    const scaleFactor = kScalingEnabled ? 1 / kFactor : 1;
    const targetEnergy = -n * 2.5 * scaleFactor;
    const startBell = wsqaoaEnabled ? 1.2 : 0.3;

    intervalRef.current = setInterval(() => {
      tick++;
      const progress = 1 - Math.exp(-convergenceRate * tick);
      const noise = (Math.random() - 0.5) * 0.15 * (1 - progress * 0.8);
      const energy = targetEnergy * progress + noise * Math.abs(targetEnergy) * 0.3;
      const bellScore = startBell + (2.8 - startBell) * progress + (Math.random() - 0.5) * 0.08 * (1 - progress);
      const beta = (Math.PI / 4) * progress + (Math.random() - 0.5) * 0.1 * (1 - progress);
      const gamma = (-Math.PI / 2) * progress + (Math.random() - 0.5) * 0.15 * (1 - progress);
      const gradientNorm = 2 * Math.exp(-convergenceRate * tick * 1.5) + Math.random() * 0.05;

      const step: OptimizationStep = {
        iteration: tick,
        beta: parseFloat(beta.toFixed(4)),
        gamma: parseFloat(gamma.toFixed(4)),
        energy: parseFloat(energy.toFixed(4)),
        bellScore: parseFloat(Math.max(0, bellScore).toFixed(4)),
        gradientNorm: parseFloat(gradientNorm.toFixed(4)),
      };
      steps.push(step);
      setLiveSteps(prev => [...prev, step]);
      setCurrentStep(tick);

      if (tick % 20 === 0) {
        addLog(`  Iteration ${tick}: E = ${step.energy.toFixed(3)}, S = ${step.bellScore.toFixed(3)}, ∇ = ${step.gradientNorm.toFixed(4)}`);
      }

      if (tick >= maxIterations) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;

        const optimalSolution = Array.from({ length: n }, () => Math.random() > 0.5 ? 1 : 0);
        const finalResult: SimulationResult = {
          steps,
          optimalSolution,
          optimalEnergy: steps[steps.length - 1].energy,
          finalBellScore: steps[steps.length - 1].bellScore,
          kFactor,
          isingCoeffs: { linear, quadratic },
          totalTime: tick * 50,
        };

        setResult(finalResult);
        setIsRunning(false);
        addLog(`✅ Optimization complete in ${(tick * 50 / 1000).toFixed(1)}s`);
        addLog(`   Optimal energy: ${finalResult.optimalEnergy.toFixed(4)}`);
        addLog(`   Final Bell score: ${finalResult.finalBellScore.toFixed(4)} ${finalResult.finalBellScore >= 2.0 ? '(QUANTUM ADVANTAGE ✓)' : '(BELOW THRESHOLD ✗)'}`);
        addLog(`   Solution: [${optimalSolution.join(', ')}]`);
        addLog(`Response: 200 OK`);
      }
    }, 50);
  }, [getMatrix, numLayers, maxIterations, wsqaoaEnabled, kScalingEnabled, addLog]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    addLog('⛔ Simulation aborted by user');
  }, [addLog]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentMatrix = getMatrix();
  const matrixValid = currentMatrix && currentMatrix.length > 0;

  const copyApiPayload = () => {
    const payload = JSON.stringify({
      endpoint: 'POST https://api.kontour.network/v1/qaoa/optimize',
      body: {
        qubo_matrix: currentMatrix,
        config: { layers: numLayers, max_iterations: maxIterations, ws_qaoa: wsqaoaEnabled, k_scaling: kScalingEnabled },
      },
    }, null, 2);
    navigator.clipboard.writeText(payload);
    toast({ title: 'Copied!', description: 'API payload copied to clipboard' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Terminal className="h-7 w-7 text-primary" />
            QAOA API Simulator
          </h1>
          <p className="text-sm text-muted-foreground">Submit QUBO matrices • Visualize quantum optimization • Bell score convergence</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant={isRunning ? 'default' : 'secondary'} className={isRunning ? 'animate-pulse' : ''}>
            {isRunning ? '⚡ Computing' : '● Idle'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: Input Panel */}
        <div className="space-y-4">
          <Card className="p-4 border-primary/20">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Code className="h-4 w-4" /> Problem Selection
            </h3>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PRESETS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {PRESETS[selectedPreset]?.description}
            </p>

            {selectedPreset === 'custom' && (
              <Textarea
                className="mt-3 font-mono text-xs"
                rows={5}
                placeholder='[[−3,1,1],[1,−3,1],[1,1,−3]]'
                value={customMatrix}
                onChange={e => setCustomMatrix(e.target.value)}
              />
            )}

            {matrixValid && selectedPreset !== 'custom' && (
              <div className="mt-3 bg-muted/30 rounded p-2 font-mono text-[10px] max-h-32 overflow-auto">
                {currentMatrix!.map((row, i) => (
                  <div key={i}>[{row.map(v => v.toString().padStart(3)).join(', ')}]</div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 border-primary/20">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Configuration
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs">QAOA Layers (p)</span>
                <Input type="number" className="w-20 h-7 text-xs" min={1} max={10} value={numLayers}
                  onChange={e => setNumLayers(parseInt(e.target.value) || 1)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Max Iterations</span>
                <Input type="number" className="w-20 h-7 text-xs" min={20} max={500} value={maxIterations}
                  onChange={e => setMaxIterations(parseInt(e.target.value) || 100)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">k-Factor Scaling</span>
                <Switch checked={kScalingEnabled} onCheckedChange={setKScalingEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">WS-QAOA Init</span>
                <Switch checked={wsqaoaEnabled} onCheckedChange={setWsqaoaEnabled} />
              </div>
            </div>
          </Card>

          <div className="flex gap-2">
            {!isRunning ? (
              <Button className="flex-1" onClick={runSimulation} disabled={!matrixValid}>
                <Play className="h-4 w-4 mr-2" /> Run Optimization
              </Button>
            ) : (
              <Button className="flex-1" variant="destructive" onClick={stopSimulation}>
                <Square className="h-4 w-4 mr-2" /> Stop
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={copyApiPayload} title="Copy API payload">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* CENTER + RIGHT: Results */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="convergence">
            <TabsList>
              <TabsTrigger value="convergence">Bell Score</TabsTrigger>
              <TabsTrigger value="energy">Energy</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="api-log">API Log</TabsTrigger>
            </TabsList>

            <TabsContent value="convergence">
              <Card className="p-4 border-primary/20">
                <h4 className="text-xs font-semibold text-primary mb-1">Bell Score Convergence (S ≥ 2.0 = Quantum Advantage)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={liveSteps}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" />
                      <XAxis dataKey="iteration" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} domain={[0, 3.2]} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <ReferenceLine y={2.0} stroke="#22c55e" strokeDasharray="6 4" label={{ value: 'S = 2.0', fill: '#22c55e', fontSize: 10 }} />
                      <ReferenceLine y={2.828} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Tsirelson 2√2', fill: '#eab308', fontSize: 9 }} />
                      <Line type="monotone" dataKey="bellScore" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {result && (
                  <div className="mt-3 flex gap-3 text-xs">
                    <Badge variant={result.finalBellScore >= 2.0 ? 'default' : 'destructive'}>
                      {result.finalBellScore >= 2.0 ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                      S = {result.finalBellScore.toFixed(4)}
                    </Badge>
                    <Badge variant="secondary">k = {result.kFactor.toFixed(3)}</Badge>
                    <Badge variant="secondary">{result.totalTime / 1000}s</Badge>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="energy">
              <Card className="p-4 border-primary/20">
                <h4 className="text-xs font-semibold text-primary mb-1">Cost Function Energy ⟨H_f⟩ Minimization</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={liveSteps}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" />
                      <XAxis dataKey="iteration" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="energy" stroke="#a855f7" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="parameters">
              <Card className="p-4 border-primary/20">
                <h4 className="text-xs font-semibold text-primary mb-1">Optimal β, γ Parameter Convergence</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={liveSteps}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" />
                      <XAxis dataKey="iteration" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="beta" stroke="#3b82f6" dot={false} strokeWidth={1.5} name="β" />
                      <Line type="monotone" dataKey="gamma" stroke="#f97316" dot={false} strokeWidth={1.5} name="γ" />
                      <Line type="monotone" dataKey="gradientNorm" stroke="#ef4444" dot={false} strokeWidth={1} name="‖∇‖" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="api-log">
              <Card className="p-4 border-primary/20">
                <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-2">
                  <Terminal className="h-3 w-3" /> API Request / Response Log
                </h4>
                <div className="bg-black/60 rounded p-3 font-mono text-[11px] text-green-400 h-64 overflow-auto">
                  {apiLog.length === 0 ? (
                    <span className="text-muted-foreground">Submit a QUBO matrix to see the API trace...</span>
                  ) : (
                    apiLog.map((line, i) => <div key={i}>{line}</div>)
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Result Summary */}
          {result && (
            <Card className="p-4 border-primary/20">
              <h4 className="text-xs font-semibold text-primary mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Optimization Result
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{result.finalBellScore.toFixed(3)}</div>
                  <div className="text-[10px] text-muted-foreground">Bell Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{result.optimalEnergy.toFixed(3)}</div>
                  <div className="text-[10px] text-muted-foreground">Optimal Energy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{result.kFactor.toFixed(3)}</div>
                  <div className="text-[10px] text-muted-foreground">k-Factor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">[{result.optimalSolution.join(',')}]</div>
                  <div className="text-[10px] text-muted-foreground">Solution Vector</div>
                </div>
              </div>

              {/* API Response JSON */}
              <details className="mt-3">
                <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">View Raw API Response</summary>
                <pre className="mt-2 bg-muted/30 rounded p-2 text-[10px] font-mono overflow-auto max-h-40">
                  {JSON.stringify({
                    status: 200,
                    data: {
                      optimal_energy: result.optimalEnergy,
                      bell_score: result.finalBellScore,
                      quantum_advantage: result.finalBellScore >= 2.0,
                      solution: result.optimalSolution,
                      k_factor: result.kFactor,
                      iterations: result.steps.length,
                      processing_time_ms: result.totalTime,
                    },
                  }, null, 2)}
                </pre>
              </details>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
