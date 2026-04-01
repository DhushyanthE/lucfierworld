/**
 * Variational Quantum Eigensolver (VQE) Simulator
 * Parameterized circuits with energy landscape optimization
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Play, Pause, RotateCcw, TrendingDown, Atom, Layers, Zap, LineChart } from 'lucide-react';

type Molecule = 'H2' | 'LiH' | 'HeH+' | 'H2O';
type Optimizer = 'COBYLA' | 'SPSA' | 'L-BFGS-B' | 'Nelder-Mead';
type Ansatz = 'UCCSD' | 'HardwareEfficient' | 'RealAmplitudes';

interface MoleculeSpec {
  name: string;
  exactEnergy: number;  // Hartree
  numQubits: number;
  numParams: number;
  bondLength: string;
  description: string;
}

interface OptimizationStep {
  iteration: number;
  energy: number;
  params: number[];
  gradientNorm: number;
  converged: boolean;
}

interface VQEResult {
  steps: OptimizationStep[];
  finalEnergy: number;
  exactEnergy: number;
  chemicalAccuracy: boolean; // within 1.6 mHa
  totalIterations: number;
  converged: boolean;
}

const MOLECULES: Record<Molecule, MoleculeSpec> = {
  'H2': { name: 'Hydrogen (H₂)', exactEnergy: -1.1373, numQubits: 2, numParams: 3, bondLength: '0.735 Å', description: 'Simplest diatomic molecule' },
  'LiH': { name: 'Lithium Hydride (LiH)', exactEnergy: -7.8825, numQubits: 4, numParams: 8, bondLength: '1.595 Å', description: 'Ionic bond character' },
  'HeH+': { name: 'Helium Hydride (HeH⁺)', exactEnergy: -2.8622, numQubits: 2, numParams: 3, bondLength: '0.774 Å', description: 'Simplest heteronuclear ion' },
  'H2O': { name: 'Water (H₂O)', exactEnergy: -75.0116, numQubits: 6, numParams: 14, bondLength: '0.958 Å', description: 'Bent molecular geometry' },
};

const OPTIMIZERS: Record<Optimizer, { name: string; convergenceRate: number; noise: number }> = {
  'COBYLA': { name: 'COBYLA', convergenceRate: 0.85, noise: 0.02 },
  'SPSA': { name: 'SPSA', convergenceRate: 0.7, noise: 0.05 },
  'L-BFGS-B': { name: 'L-BFGS-B', convergenceRate: 0.95, noise: 0.01 },
  'Nelder-Mead': { name: 'Nelder-Mead', convergenceRate: 0.8, noise: 0.03 },
};

function simulateVQE(
  molecule: Molecule, optimizer: Optimizer, ansatz: Ansatz,
  maxIter: number, shotNoise: number
): VQEResult {
  const mol = MOLECULES[molecule];
  const opt = OPTIMIZERS[optimizer];
  const steps: OptimizationStep[] = [];

  // Initial random parameters
  let params = Array.from({ length: mol.numParams }, () => (Math.random() - 0.5) * Math.PI);
  const exact = mol.exactEnergy;

  // Start with HF energy (higher than exact)
  let energy = exact + Math.abs(exact) * 0.15 * (1 + Math.random() * 0.3);
  const ansatzFactor = ansatz === 'UCCSD' ? 1.0 : ansatz === 'RealAmplitudes' ? 0.9 : 0.85;

  for (let i = 0; i < maxIter; i++) {
    // Simulate optimization step
    const progress = i / maxIter;
    const learningRate = 0.1 * Math.exp(-2 * progress) * opt.convergenceRate;
    const noiseContrib = (opt.noise + shotNoise * 0.01) * (Math.random() - 0.5) * Math.abs(exact) * 0.01;

    // Energy descends toward exact with some noise
    const targetDist = energy - exact;
    const step = targetDist * learningRate * ansatzFactor;
    energy = energy - step + noiseContrib;

    // Ensure energy doesn't go below exact (variational principle)
    if (energy < exact) energy = exact + Math.abs(noiseContrib);

    // Update params
    params = params.map(p => p - learningRate * (Math.random() - 0.5) * 0.5);
    const gradNorm = Math.abs(targetDist) * (1 - progress * 0.8) + Math.random() * 0.001;

    const converged = Math.abs(energy - exact) < 0.0016; // chemical accuracy

    steps.push({
      iteration: i + 1,
      energy,
      params: [...params],
      gradientNorm: gradNorm,
      converged,
    });

    if (converged && i > 10) break;
  }

  const finalEnergy = steps[steps.length - 1].energy;
  return {
    steps,
    finalEnergy,
    exactEnergy: exact,
    chemicalAccuracy: Math.abs(finalEnergy - exact) < 0.0016,
    totalIterations: steps.length,
    converged: steps[steps.length - 1].converged,
  };
}

// ── Energy Landscape Canvas ──
function EnergyLandscape({ steps, exactEnergy }: { steps: OptimizationStep[]; exactEnergy: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || steps.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padding = { top: 20, right: 20, bottom: 35, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const energies = steps.map(s => s.energy);
    const minE = Math.min(...energies, exactEnergy) - 0.01;
    const maxE = Math.max(...energies) + 0.01;
    const range = maxE - minE;

    // Background grid
    ctx.strokeStyle = 'rgba(128,128,128,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#888';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      const val = maxE - (i / 4) * range;
      ctx.fillText(val.toFixed(4), padding.left - 5, y + 3);
    }

    // Exact energy line
    const exactY = padding.top + ((maxE - exactEnergy) / range) * chartH;
    ctx.beginPath();
    ctx.moveTo(padding.left, exactY);
    ctx.lineTo(w - padding.right, exactY);
    ctx.strokeStyle = 'hsl(142, 71%, 45%)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'hsl(142, 71%, 45%)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Exact: ${exactEnergy.toFixed(4)} Ha`, w - padding.right - 120, exactY - 6);

    // Chemical accuracy band (±1.6 mHa)
    const accTop = padding.top + ((maxE - (exactEnergy + 0.0016)) / range) * chartH;
    const accBot = padding.top + ((maxE - (exactEnergy - 0.0016)) / range) * chartH;
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
    ctx.fillRect(padding.left, accTop, chartW, accBot - accTop);

    // Energy curve
    ctx.beginPath();
    steps.forEach((s, i) => {
      const x = padding.left + (i / (steps.length - 1)) * chartW;
      const y = padding.top + ((maxE - s.energy) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'hsl(250, 80%, 60%)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gradient glow
    ctx.beginPath();
    steps.forEach((s, i) => {
      const x = padding.left + (i / (steps.length - 1)) * chartW;
      const y = padding.top + ((maxE - s.energy) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + chartW, h - padding.bottom);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    grad.addColorStop(0, 'hsla(250, 80%, 60%, 0.3)');
    grad.addColorStop(1, 'hsla(250, 80%, 60%, 0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Final point
    const lastStep = steps[steps.length - 1];
    const lastX = padding.left + chartW;
    const lastY = padding.top + ((maxE - lastStep.energy) / range) * chartH;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lastStep.converged ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)';
    ctx.fill();

    // X axis label
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Iteration', w / 2, h - 5);
    [0, Math.floor(steps.length / 2), steps.length - 1].forEach(i => {
      const x = padding.left + (i / (steps.length - 1)) * chartW;
      ctx.fillText(`${i + 1}`, x, h - padding.bottom + 14);
    });
  }, [steps, exactEnergy]);

  return <canvas ref={canvasRef} width={600} height={250} className="w-full rounded-lg border border-border bg-card" />;
}

// ── Circuit Diagram ──
function AnsatzCircuit({ molecule, ansatz }: { molecule: Molecule; ansatz: Ansatz }) {
  const mol = MOLECULES[molecule];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const qubits = mol.numQubits;
    const rowH = h / (qubits + 1);
    const gateW = 35;
    const layers = ansatz === 'UCCSD' ? 3 : ansatz === 'RealAmplitudes' ? 4 : 5;

    // Qubit lines
    for (let q = 0; q < qubits; q++) {
      const y = (q + 1) * rowH;
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(w - 10, y);
      ctx.strokeStyle = 'rgba(128,128,128,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`q${q}`, 25, y + 4);
    }

    // Gates per layer
    const gateColors: Record<string, string> = {
      'Ry': 'hsl(250, 80%, 60%)',
      'Rz': 'hsl(271, 91%, 65%)',
      'CNOT': 'hsl(45, 93%, 47%)',
      'Rx': 'hsl(142, 71%, 45%)',
    };

    for (let l = 0; l < layers; l++) {
      const baseX = 50 + l * (gateW + 30);

      // Single-qubit rotation gates
      for (let q = 0; q < qubits; q++) {
        const y = (q + 1) * rowH;
        const gateName = l % 2 === 0 ? 'Ry' : 'Rz';
        const color = gateColors[gateName];

        ctx.fillStyle = color;
        ctx.fillRect(baseX - gateW / 2, y - 12, gateW, 24);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${gateName}(θ)`, baseX, y + 3);
      }

      // Entangling gates (CNOT between adjacent pairs)
      if (l < layers - 1) {
        const cnotX = baseX + gateW / 2 + 15;
        for (let q = 0; q < qubits - 1; q += 2) {
          const y1 = (q + 1) * rowH;
          const y2 = (q + 2) * rowH;

          // Control dot
          ctx.beginPath();
          ctx.arc(cnotX, y1, 4, 0, Math.PI * 2);
          ctx.fillStyle = gateColors['CNOT'];
          ctx.fill();

          // Line
          ctx.beginPath();
          ctx.moveTo(cnotX, y1);
          ctx.lineTo(cnotX, y2);
          ctx.strokeStyle = gateColors['CNOT'];
          ctx.lineWidth = 2;
          ctx.stroke();

          // Target circle
          ctx.beginPath();
          ctx.arc(cnotX, y2, 8, 0, Math.PI * 2);
          ctx.strokeStyle = gateColors['CNOT'];
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cnotX, y2 - 8);
          ctx.lineTo(cnotX, y2 + 8);
          ctx.moveTo(cnotX - 8, y2);
          ctx.lineTo(cnotX + 8, y2);
          ctx.stroke();
        }
      }
    }

    // Ansatz label
    ctx.fillStyle = '#aaa';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${ansatz} · ${layers} layers · ${mol.numParams} params`, w - 15, h - 5);
  }, [molecule, ansatz, mol]);

  return <canvas ref={canvasRef} width={500} height={Math.max(120, MOLECULES[molecule].numQubits * 35 + 30)} className="w-full rounded border border-border bg-card" />;
}

// ── Bond Scan PES Chart ──
function BondScanChart({ data, moleculeName }: { data: { distances: number[]; energies: number[]; exact: number[] }; moleculeName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const pad = { top: 20, right: 20, bottom: 35, left: 65 };
    const cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    const allE = [...data.energies, ...data.exact];
    const minE = Math.min(...allE) - 0.02, maxE = Math.max(...allE) + 0.02;
    const rng = maxE - minE;
    const minD = data.distances[0], maxD = data.distances[data.distances.length - 1];
    const dRng = maxD - minD;

    // Grid
    ctx.strokeStyle = 'rgba(128,128,128,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * cH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
      ctx.fillText((maxE - (i / 4) * rng).toFixed(3), pad.left - 5, y + 3);
    }

    // Exact curve
    ctx.beginPath();
    data.distances.forEach((d, i) => {
      const x = pad.left + ((d - minD) / dRng) * cW;
      const y = pad.top + ((maxE - data.exact[i]) / rng) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'hsl(142, 71%, 45%)'; ctx.lineWidth = 2; ctx.stroke();

    // VQE points
    data.distances.forEach((d, i) => {
      const x = pad.left + ((d - minD) / dRng) * cW;
      const y = pad.top + ((maxE - data.energies[i]) / rng) * cH;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(250, 80%, 60%)'; ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#888'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Bond Length (Å)', w / 2, h - 5);
    [0, 0.5, 1].forEach(f => {
      const d = minD + f * dRng;
      const x = pad.left + f * cW;
      ctx.fillText(d.toFixed(1), x, h - pad.bottom + 14);
    });

    // Legend
    ctx.font = '9px sans-serif';
    ctx.fillStyle = 'hsl(142, 71%, 45%)'; ctx.fillText('— Exact', w - 80, 14);
    ctx.fillStyle = 'hsl(250, 80%, 60%)'; ctx.fillText('● VQE', w - 30, 14);
  }, [data, moleculeName]);

  return <canvas ref={canvasRef} width={600} height={220} className="w-full rounded-lg border border-border bg-card" />;
}

// ── Main Component ──
export function QuantumVQESimulator() {
  const [molecule, setMolecule] = useState<Molecule>('H2');
  const [optimizer, setOptimizer] = useState<Optimizer>('COBYLA');
  const [ansatz, setAnsatz] = useState<Ansatz>('UCCSD');
  const [maxIter, setMaxIter] = useState(100);
  const [shotNoise, setShotNoise] = useState(1);
  const [result, setResult] = useState<VQEResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBondScan, setShowBondScan] = useState(false);
  const [bondScanResult, setBondScanResult] = useState<{ distances: number[]; energies: number[]; exact: number[] } | null>(null);
  const [isBondScanning, setIsBondScanning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mol = MOLECULES[molecule];

  const runVQE = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    setAnimStep(0);
    setIsAnimating(false);
    await new Promise(r => setTimeout(r, 200));

    const res = simulateVQE(molecule, optimizer, ansatz, maxIter, shotNoise);
    setResult(res);
    setIsRunning(false);
    setIsAnimating(true);

    toast.success(
      res.chemicalAccuracy
        ? `VQE converged! Chemical accuracy achieved in ${res.totalIterations} iterations`
        : `VQE completed in ${res.totalIterations} iterations (not at chemical accuracy)`
    );
  }, [molecule, optimizer, ansatz, maxIter, shotNoise]);

  const runBondScan = useCallback(async () => {
    setIsBondScanning(true);
    setBondScanResult(null);
    await new Promise(r => setTimeout(r, 100));
    const baseE = mol.exactEnergy;
    const distances: number[] = [];
    const energies: number[] = [];
    const exact: number[] = [];
    for (let d = 0.3; d <= 3.0; d += 0.1) {
      distances.push(parseFloat(d.toFixed(1)));
      const eqDist = parseFloat(mol.bondLength);
      const De = Math.abs(baseE) * 0.15;
      const a = 1.8;
      const exactE = baseE + De * (1 - Math.exp(-a * (d - eqDist))) ** 2 - De;
      exact.push(exactE);
      const vqeE = exactE + (Math.random() * 0.01 + 0.002) * (1 + Math.abs(d - eqDist) * 0.5);
      energies.push(vqeE);
    }
    setBondScanResult({ distances, energies, exact });
    setIsBondScanning(false);
    setShowBondScan(true);
    toast.success('Bond length scan complete — potential energy surface generated');
  }, [molecule, mol]);

  // Animate steps
  useEffect(() => {
    if (isAnimating && result) {
      intervalRef.current = setInterval(() => {
        setAnimStep(prev => {
          if (prev >= result.steps.length - 1) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAnimating, result]);

  const displaySteps = result ? result.steps.slice(0, animStep + 1) : [];
  const currentStep = displaySteps.length > 0 ? displaySteps[displaySteps.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main visualization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Atom className="h-5 w-5 text-primary" />
                Variational Quantum Eigensolver
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={runVQE} disabled={isRunning || isBondScanning}>
                  {isRunning ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isRunning ? 'Computing...' : 'Run VQE'}
                </Button>
                <Button variant="outline" onClick={runBondScan} disabled={isRunning || isBondScanning}>
                  {isBondScanning ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : <LineChart className="h-4 w-4 mr-2" />}
                  {isBondScanning ? 'Scanning...' : 'Bond Scan'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ansatz circuit */}
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Layers className="h-3 w-3" /> Parameterized Circuit ({ansatz})
              </div>
              <AnsatzCircuit molecule={molecule} ansatz={ansatz} />
            </div>

            {/* Energy landscape */}
            {displaySteps.length > 0 ? (
              <>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Energy Optimization Landscape
                  </div>
                  <EnergyLandscape steps={displaySteps} exactEnergy={mol.exactEnergy} />
                </div>

                {/* Current metrics */}
                {currentStep && (
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-[10px] text-muted-foreground">Iteration</div>
                      <div className="font-mono font-bold text-sm">{currentStep.iteration}/{result?.totalIterations}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-[10px] text-muted-foreground">Energy (Ha)</div>
                      <div className="font-mono font-bold text-sm">{currentStep.energy.toFixed(4)}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-[10px] text-muted-foreground">Error (mHa)</div>
                      <div className="font-mono font-bold text-sm">
                        {((currentStep.energy - mol.exactEnergy) * 1000).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-[10px] text-muted-foreground">∇ Norm</div>
                      <div className="font-mono font-bold text-sm">{currentStep.gradientNorm.toFixed(4)}</div>
                    </div>
                  </div>
                )}

                {/* Result card */}
                {animStep >= (result?.steps.length ?? 0) - 1 && result && (
                  <Card className={`border ${result.chemicalAccuracy ? 'border-green-500/50 bg-green-500/5' : 'border-destructive/50 bg-destructive/5'}`}>
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={result.chemicalAccuracy ? 'default' : 'destructive'} className="text-[10px]">
                          {result.chemicalAccuracy ? '✓ Chemical Accuracy' : '✗ Not Converged'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {result.totalIterations} iterations
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">E = {result.finalEnergy.toFixed(6)} Ha</span>
                        <span className="text-muted-foreground ml-2">
                          (exact: {result.exactEnergy.toFixed(6)} Ha, error: {((result.finalEnergy - result.exactEnergy) * 1000).toFixed(3)} mHa)
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                Configure molecule and optimizer, then click Run VQE
              </div>
            )}

            {/* Bond Length Scan PES */}
            {bondScanResult && showBondScan && (
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <LineChart className="h-3 w-3" /> Potential Energy Surface — Bond Length Scan
                </div>
                <BondScanChart data={bondScanResult} moleculeName={mol.name} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Atom className="h-4 w-4" /> Molecule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={molecule} onValueChange={v => setMolecule(v as Molecule)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MOLECULES) as Molecule[]).map(m => (
                    <SelectItem key={m} value={m} className="text-xs">
                      {MOLECULES[m].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-[10px] text-muted-foreground p-2 bg-muted/50 rounded space-y-0.5">
                <div>{mol.description}</div>
                <div>Bond: {mol.bondLength} · Qubits: {mol.numQubits} · Params: {mol.numParams}</div>
                <div>Exact E: {mol.exactEnergy.toFixed(4)} Ha</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Ansatz</label>
                <Select value={ansatz} onValueChange={v => setAnsatz(v as Ansatz)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UCCSD" className="text-xs">UCCSD (Unitary Coupled Cluster)</SelectItem>
                    <SelectItem value="RealAmplitudes" className="text-xs">Real Amplitudes</SelectItem>
                    <SelectItem value="HardwareEfficient" className="text-xs">Hardware Efficient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Optimizer</label>
                <Select value={optimizer} onValueChange={v => setOptimizer(v as Optimizer)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(OPTIMIZERS) as Optimizer[]).map(o => (
                      <SelectItem key={o} value={o} className="text-xs">{OPTIMIZERS[o].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Max Iterations</span>
                  <span className="font-mono">{maxIter}</span>
                </div>
                <Slider value={[maxIter]} min={20} max={500} step={10}
                  onValueChange={([v]) => setMaxIter(v)} />
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Shot Noise</span>
                  <span className="font-mono">{shotNoise}×</span>
                </div>
                <Slider value={[shotNoise]} min={0} max={10} step={0.5}
                  onValueChange={([v]) => setShotNoise(v)} />
              </div>
            </CardContent>
          </Card>

          {/* Parameter values */}
          {currentStep && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Circuit Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {currentStep.params.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <span className="w-8 font-mono text-muted-foreground">θ{i}</span>
                      <Progress value={((p + Math.PI) / (2 * Math.PI)) * 100} className="h-1.5 flex-1" />
                      <span className="w-12 text-right font-mono">{p.toFixed(3)}</span>
                    </div>
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
