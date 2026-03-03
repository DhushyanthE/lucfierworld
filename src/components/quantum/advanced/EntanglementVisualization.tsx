/**
 * Quantum Entanglement Visualization - Bell States & Teleportation Protocols
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Atom, Zap, Link2, ArrowRight, Play, RotateCcw, Radio } from 'lucide-react';

type BellState = 'Φ+' | 'Φ-' | 'Ψ+' | 'Ψ-';

interface EntangledPair {
  id: string;
  qubitA: number;
  qubitB: number;
  bellState: BellState;
  fidelity: number;
  phase: number;
  correlationStrength: number;
}

interface TeleportationStep {
  name: string;
  description: string;
  qubitStates: { alpha: number; beta: number }[];
  bellMeasurement?: string;
  classicalBits?: [number, number];
  correction?: string;
  fidelity: number;
  completed: boolean;
}

const BELL_STATE_INFO: Record<BellState, { formula: string; color: string; description: string }> = {
  'Φ+': { formula: '(|00⟩ + |11⟩)/√2', color: '#8b5cf6', description: 'Even parity, positive phase' },
  'Φ-': { formula: '(|00⟩ - |11⟩)/√2', color: '#3b82f6', description: 'Even parity, negative phase' },
  'Ψ+': { formula: '(|01⟩ + |10⟩)/√2', color: '#22c55e', description: 'Odd parity, positive phase' },
  'Ψ-': { formula: '(|01⟩ - |10⟩)/√2', color: '#ef4444', description: 'Odd parity, negative phase' },
};

function generateEntangledPairs(count: number): EntangledPair[] {
  const states: BellState[] = ['Φ+', 'Φ-', 'Ψ+', 'Ψ-'];
  return Array.from({ length: count }, (_, i) => ({
    id: `ep-${i}`,
    qubitA: i * 2,
    qubitB: i * 2 + 1,
    bellState: states[Math.floor(Math.random() * states.length)],
    fidelity: 0.92 + Math.random() * 0.08,
    phase: Math.random() * Math.PI * 2,
    correlationStrength: 0.85 + Math.random() * 0.15,
  }));
}

function generateTeleportationSteps(bellState: BellState): TeleportationStep[] {
  const classicalBits: [number, number] = [Math.round(Math.random()), Math.round(Math.random())];
  const corrections = ['None', 'X gate', 'Z gate', 'X + Z gates'];
  const correctionIdx = classicalBits[0] * 2 + classicalBits[1];

  return [
    {
      name: 'Prepare |ψ⟩',
      description: 'Alice prepares the quantum state to be teleported',
      qubitStates: [
        { alpha: 0.6 + Math.random() * 0.3, beta: 0.4 + Math.random() * 0.3 },
        { alpha: 1, beta: 0 },
        { alpha: 1, beta: 0 },
      ],
      fidelity: 1.0,
      completed: false,
    },
    {
      name: 'Create Bell Pair',
      description: `Generate entangled ${bellState} state between qubits B and C`,
      qubitStates: [
        { alpha: 0.6, beta: 0.4 },
        { alpha: 0.707, beta: 0.707 },
        { alpha: 0.707, beta: 0.707 },
      ],
      fidelity: 0.98,
      completed: false,
    },
    {
      name: 'CNOT + Hadamard',
      description: 'Alice applies CNOT(A→B) then Hadamard on qubit A',
      qubitStates: [
        { alpha: 0.5, beta: 0.5 },
        { alpha: 0.5, beta: 0.5 },
        { alpha: 0.707, beta: 0.707 },
      ],
      fidelity: 0.96,
      completed: false,
    },
    {
      name: 'Bell Measurement',
      description: `Alice measures qubits A and B in the Bell basis`,
      bellMeasurement: bellState,
      classicalBits,
      qubitStates: [
        { alpha: classicalBits[0], beta: 1 - classicalBits[0] },
        { alpha: classicalBits[1], beta: 1 - classicalBits[1] },
        { alpha: 0.6, beta: 0.4 },
      ],
      fidelity: 0.94,
      completed: false,
    },
    {
      name: 'Classical Channel',
      description: `Alice sends classical bits [${classicalBits[0]}, ${classicalBits[1]}] to Bob`,
      classicalBits,
      qubitStates: [
        { alpha: classicalBits[0], beta: 1 - classicalBits[0] },
        { alpha: classicalBits[1], beta: 1 - classicalBits[1] },
        { alpha: 0.6, beta: 0.4 },
      ],
      fidelity: 0.94,
      completed: false,
    },
    {
      name: 'Correction',
      description: `Bob applies ${corrections[correctionIdx]} based on classical bits`,
      correction: corrections[correctionIdx],
      qubitStates: [
        { alpha: classicalBits[0], beta: 1 - classicalBits[0] },
        { alpha: classicalBits[1], beta: 1 - classicalBits[1] },
        { alpha: 0.6, beta: 0.4 },
      ],
      fidelity: 0.92 + Math.random() * 0.06,
      completed: false,
    },
  ];
}

export function EntanglementVisualization() {
  const [pairs, setPairs] = useState<EntangledPair[]>(() => generateEntangledPairs(4));
  const [selectedBell, setSelectedBell] = useState<BellState>('Φ+');
  const [teleportSteps, setTeleportSteps] = useState<TeleportationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw entanglement visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = 300;
    ctx.scale(2, 1);
    const w = W / 2;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, H);

    const time = Date.now() / 1000;

    pairs.forEach((pair, idx) => {
      const yCenter = 40 + idx * 65;
      const xA = 80, xB = w - 80;

      // Draw entanglement "beam"
      const info = BELL_STATE_INFO[pair.bellState];
      const gradient = ctx.createLinearGradient(xA, yCenter, xB, yCenter);
      gradient.addColorStop(0, info.color + '80');
      gradient.addColorStop(0.5, info.color + '20');
      gradient.addColorStop(1, info.color + '80');

      // Wavy entanglement line
      ctx.beginPath();
      ctx.moveTo(xA + 15, yCenter);
      for (let x = xA + 15; x <= xB - 15; x += 2) {
        const progress = (x - xA) / (xB - xA);
        const wave = Math.sin(progress * Math.PI * 4 + time * 2 + pair.phase) * 8 * pair.correlationStrength;
        ctx.lineTo(x, yCenter + wave);
      }
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Second complementary wave
      ctx.beginPath();
      ctx.moveTo(xA + 15, yCenter);
      for (let x = xA + 15; x <= xB - 15; x += 2) {
        const progress = (x - xA) / (xB - xA);
        const wave = Math.sin(progress * Math.PI * 4 + time * 2 + pair.phase + Math.PI) * 8 * pair.correlationStrength;
        ctx.lineTo(x, yCenter + wave);
      }
      ctx.strokeStyle = info.color + '40';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Qubit A
      ctx.beginPath();
      ctx.arc(xA, yCenter, 12, 0, Math.PI * 2);
      ctx.fillStyle = info.color;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`q${pair.qubitA}`, xA, yCenter + 4);

      // Qubit B
      ctx.beginPath();
      ctx.arc(xB, yCenter, 12, 0, Math.PI * 2);
      ctx.fillStyle = info.color;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(`q${pair.qubitB}`, xB, yCenter + 4);

      // Bell state label
      ctx.fillStyle = info.color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`|${pair.bellState}⟩`, w / 2, yCenter - 12);

      // Fidelity
      ctx.fillStyle = '#9ca3af';
      ctx.font = '9px monospace';
      ctx.fillText(`F=${(pair.fidelity * 100).toFixed(1)}%`, w / 2, yCenter + 18);
    });

    // Animate
    const frameId = requestAnimationFrame(() => {
      const c = canvasRef.current;
      if (c) c.dispatchEvent(new Event('redraw'));
    });

    const redrawHandler = () => {
      // trigger re-render
    };
    canvas.addEventListener('redraw', redrawHandler);

    return () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener('redraw', redrawHandler);
    };
  }, [pairs]);

  // Animate canvas continuously
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.offsetWidth;
      const H = 300;
      ctx.clearRect(0, 0, w * 2, H);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, H);

      const time = Date.now() / 1000;

      pairs.forEach((pair, idx) => {
        const yCenter = 40 + idx * 65;
        const xA = 80, xB = w - 80;
        const info = BELL_STATE_INFO[pair.bellState];

        // Wavy lines
        for (let wave_i = 0; wave_i < 2; wave_i++) {
          ctx.beginPath();
          ctx.moveTo(xA + 15, yCenter);
          for (let x = xA + 15; x <= xB - 15; x += 2) {
            const progress = (x - xA) / (xB - xA);
            const wave = Math.sin(progress * Math.PI * 4 + time * 2 + pair.phase + wave_i * Math.PI) * 8 * pair.correlationStrength;
            ctx.lineTo(x, yCenter + wave);
          }
          ctx.strokeStyle = info.color + (wave_i === 0 ? '80' : '40');
          ctx.lineWidth = wave_i === 0 ? 2 : 1.5;
          ctx.stroke();
        }

        // Qubits
        [{ x: xA, q: pair.qubitA }, { x: xB, q: pair.qubitB }].forEach(({ x, q }) => {
          const glow = Math.sin(time * 3 + idx) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(x, yCenter, 14, 0, Math.PI * 2);
          ctx.fillStyle = info.color + Math.floor(glow * 255).toString(16).padStart(2, '0');
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, yCenter, 12, 0, Math.PI * 2);
          ctx.fillStyle = info.color;
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`q${q}`, x, yCenter + 4);
        });

        // Labels
        ctx.fillStyle = info.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`|${pair.bellState}⟩`, w / 2, yCenter - 12);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px monospace';
        ctx.fillText(`F=${(pair.fidelity * 100).toFixed(1)}%`, w / 2, yCenter + 18);
      });

      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [pairs]);

  const runTeleportation = async () => {
    const steps = generateTeleportationSteps(selectedBell);
    setTeleportSteps(steps);
    setCurrentStep(-1);
    setIsRunning(true);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 1200));
      setCurrentStep(i);
      setTeleportSteps(prev => prev.map((s, j) => j <= i ? { ...s, completed: true } : s));
    }

    setIsRunning(false);
    toast.success(`Teleportation complete! Final fidelity: ${(steps[steps.length - 1].fidelity * 100).toFixed(1)}%`);
  };

  const resetPairs = () => {
    setPairs(generateEntangledPairs(4));
    setTeleportSteps([]);
    setCurrentStep(-1);
  };

  return (
    <div className="space-y-6">
      {/* Bell States Overview */}
      <Card className="border-2 border-violet-500/20 bg-gradient-to-r from-violet-950/20 to-cyan-950/20">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Link2 className="h-6 w-6 text-violet-400" />
                Quantum Entanglement Lab
                <Badge className="bg-gradient-to-r from-violet-600 to-cyan-600">Bell States</Badge>
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Visualize entangled pairs and run quantum teleportation protocols
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetPairs}>
                <RotateCcw className="h-4 w-4 mr-1" />Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bell State Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {(Object.entries(BELL_STATE_INFO) as [BellState, typeof BELL_STATE_INFO[BellState]][]).map(([state, info]) => (
              <div key={state} className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedBell === state ? 'border-violet-500 bg-violet-500/10' : 'border-muted hover:border-primary/30'
              }`} onClick={() => setSelectedBell(state)}>
                <div className="text-lg font-mono font-bold" style={{ color: info.color }}>|{state}⟩</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-1">{info.formula}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{info.description}</div>
              </div>
            ))}
          </div>

          {/* Entanglement Canvas */}
          <canvas ref={canvasRef} className="w-full border border-muted rounded-lg" style={{ height: 300 }} />
        </CardContent>
      </Card>

      {/* Teleportation Protocol */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="h-5 w-5 text-cyan-400" />
              Quantum Teleportation Protocol
              <Badge variant="outline" className="text-xs">|{selectedBell}⟩ channel</Badge>
            </CardTitle>
            <Button onClick={runTeleportation} disabled={isRunning} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
              <Play className="h-4 w-4 mr-1" />{isRunning ? 'Running...' : 'Run Teleportation'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teleportSteps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Select a Bell state and click "Run Teleportation" to start the protocol
            </div>
          ) : (
            <div className="space-y-3">
              {teleportSteps.map((step, i) => (
                <div key={i} className={`p-3 rounded-lg border transition-all ${
                  i === currentStep ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30' :
                  step.completed ? 'border-green-500/30 bg-green-500/5' : 'border-muted opacity-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.completed ? 'bg-green-600 text-white' : i === currentStep ? 'bg-cyan-600 text-white animate-pulse' : 'bg-muted text-muted-foreground'
                      }`}>{i + 1}</div>
                      <span className="font-medium text-sm">{step.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">F={( step.fidelity * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-8">{step.description}</p>

                  {step.completed && (
                    <div className="mt-2 ml-8 flex gap-3 flex-wrap">
                      {step.qubitStates.map((qs, qi) => (
                        <div key={qi} className="text-[10px] px-2 py-1 rounded bg-muted/50 font-mono">
                          q{qi}: α={qs.alpha.toFixed(2)} β={qs.beta.toFixed(2)}
                        </div>
                      ))}
                      {step.classicalBits && (
                        <div className="text-[10px] px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 font-mono">
                          Classical: [{step.classicalBits[0]}, {step.classicalBits[1]}]
                        </div>
                      )}
                      {step.correction && (
                        <div className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-mono">
                          Correction: {step.correction}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Overall progress */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Protocol Progress</span>
                  <span>{Math.round(((currentStep + 1) / teleportSteps.length) * 100)}%</span>
                </div>
                <Progress value={((currentStep + 1) / teleportSteps.length) * 100} className="h-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entangled Pairs Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Atom className="h-5 w-5 text-purple-400" />
            Active Entangled Pairs
            <Badge variant="outline" className="text-xs">{pairs.length} pairs</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pairs.map(pair => {
              const info = BELL_STATE_INFO[pair.bellState];
              return (
                <div key={pair.id} className="p-3 rounded-lg bg-muted/30 border border-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                      <span className="text-sm font-mono">q{pair.qubitA} ↔ q{pair.qubitB}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]" style={{ color: info.color, borderColor: info.color + '40' }}>
                      |{pair.bellState}⟩
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Fidelity</span>
                      <div className="font-mono">{(pair.fidelity * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Correlation</span>
                      <div className="font-mono">{(pair.correlationStrength * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phase</span>
                      <div className="font-mono">{pair.phase.toFixed(2)} rad</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
