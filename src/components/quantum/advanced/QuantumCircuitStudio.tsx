/**
 * Enhanced Quantum Circuit Studio - Real Mode with Travel Moments
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  Cpu, Brain, Activity, Sparkles, Save, RefreshCw, Play, Pause, SkipForward,
  Atom, Database, Blocks, Network, Zap, Clock, Eye, Layers, Timer
} from 'lucide-react';
import { useQuantumCoinWorkflow } from '@/hooks/useQuantumCoinWorkflow';
import { useQuantumMining } from '@/hooks/useQuantumMining';

// Gate definitions for the circuit
const GATE_TYPES = ['H', 'X', 'Y', 'Z', 'CNOT', 'T', 'S', 'Rx', 'Ry', 'Rz', 'SWAP', 'CZ'] as const;
type GateType = typeof GATE_TYPES[number];

interface QuantumGate {
  id: string;
  type: GateType;
  qubit: number;
  targetQubit?: number; // for 2-qubit gates
  angle?: number;
  column: number;
}

interface QubitState {
  alpha: { real: number; imag: number };
  beta: { real: number; imag: number };
  probability0: number;
  probability1: number;
  phase: number;
  blochTheta: number;
  blochPhi: number;
}

interface TravelMoment {
  step: number;
  gateName: string;
  qubitStates: QubitState[];
  entanglements: [number, number][];
  fidelity: number;
  timestamp: number;
}

interface CircuitData {
  id: string;
  name: string;
  qubits: number;
  gates: QuantumGate[];
  fidelity: number;
  quantumResistanceLevel: number;
  agiOptimized: boolean;
  blockchainHash?: string;
}

const GATE_COLORS: Record<GateType, string> = {
  H: '#8b5cf6', X: '#ef4444', Y: '#22c55e', Z: '#3b82f6',
  CNOT: '#f59e0b', T: '#ec4899', S: '#14b8a6', Rx: '#f97316',
  Ry: '#a855f7', Rz: '#06b6d4', SWAP: '#eab308', CZ: '#6366f1',
};

function simulateQubitState(gate: GateType, prevState: QubitState): QubitState {
  const theta = prevState.blochTheta;
  const phi = prevState.blochPhi;
  let newTheta = theta, newPhi = phi;

  switch (gate) {
    case 'H': newTheta = Math.PI / 2 - theta; newPhi = phi + Math.PI; break;
    case 'X': newTheta = Math.PI - theta; break;
    case 'Y': newTheta = Math.PI - theta; newPhi = phi + Math.PI; break;
    case 'Z': newPhi = phi + Math.PI; break;
    case 'T': newPhi = phi + Math.PI / 4; break;
    case 'S': newPhi = phi + Math.PI / 2; break;
    case 'Rx': newTheta = theta + Math.PI / 4; break;
    case 'Ry': newTheta = theta + Math.PI / 4; newPhi = phi + Math.PI / 6; break;
    case 'Rz': newPhi = phi + Math.PI / 3; break;
    default: break;
  }

  newTheta = ((newTheta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  newPhi = ((newPhi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const p0 = Math.cos(newTheta / 2) ** 2;

  return {
    alpha: { real: Math.cos(newTheta / 2), imag: 0 },
    beta: { real: Math.sin(newTheta / 2) * Math.cos(newPhi), imag: Math.sin(newTheta / 2) * Math.sin(newPhi) },
    probability0: p0,
    probability1: 1 - p0,
    phase: newPhi,
    blochTheta: newTheta,
    blochPhi: newPhi,
  };
}

function initialQubitState(): QubitState {
  return {
    alpha: { real: 1, imag: 0 }, beta: { real: 0, imag: 0 },
    probability0: 1, probability1: 0, phase: 0, blochTheta: 0, blochPhi: 0,
  };
}

export function QuantumCircuitStudio() {
  const [circuit, setCircuit] = useState<CircuitData | null>(null);
  const [selectedGate, setSelectedGate] = useState<GateType>('H');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(-1);
  const [travelMoments, setTravelMoments] = useState<TravelMoment[]>([]);
  const [viewingMoment, setViewingMoment] = useState<number | null>(null);
  const [mode, setMode] = useState<'design' | 'real' | 'travel'>('design');
  const [speed, setSpeed] = useState(1);

  const { workflowState, submitQuantumTask } = useQuantumCoinWorkflow();
  const { blockchainStats, mineBlock } = useQuantumMining();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => { initCircuit(); }, []);

  const initCircuit = useCallback(() => {
    const gates: QuantumGate[] = [];
    const numQubits = 6;
    // Build a sample circuit
    const presets: { type: GateType; q: number; col: number; tq?: number }[] = [
      { type: 'H', q: 0, col: 0 }, { type: 'H', q: 1, col: 0 }, { type: 'H', q: 2, col: 0 },
      { type: 'CNOT', q: 0, col: 1, tq: 3 }, { type: 'CNOT', q: 1, col: 1, tq: 4 },
      { type: 'T', q: 2, col: 1 }, { type: 'Rx', q: 3, col: 2 }, { type: 'Ry', q: 4, col: 2 },
      { type: 'S', q: 5, col: 2 }, { type: 'CNOT', q: 2, col: 3, tq: 5 },
      { type: 'Z', q: 0, col: 3 }, { type: 'X', q: 1, col: 4 }, { type: 'H', q: 3, col: 4 },
      { type: 'CZ', q: 4, col: 4, tq: 5 }, { type: 'Rz', q: 0, col: 5 },
      { type: 'SWAP', q: 1, col: 5, tq: 2 }, { type: 'Y', q: 5, col: 5 },
    ];
    presets.forEach((p, i) => {
      gates.push({ id: `g-${i}`, type: p.type, qubit: p.q, column: p.col, targetQubit: p.tq });
    });

    const c: CircuitData = {
      id: crypto.randomUUID(), name: 'Quantum AI Circuit', qubits: numQubits,
      gates, fidelity: 0.95, quantumResistanceLevel: 7, agiOptimized: false,
    };
    setCircuit(c);
    setTravelMoments([]);
    setExecutionStep(-1);
    setMode('design');
    setTimeout(() => drawCircuit(c, -1), 50);
  }, []);

  const addGate = (qubit: number, column: number) => {
    if (!circuit) return;
    const isTwoQubit = ['CNOT', 'SWAP', 'CZ'].includes(selectedGate);
    const newGate: QuantumGate = {
      id: `g-${Date.now()}`, type: selectedGate, qubit, column,
      targetQubit: isTwoQubit ? Math.min(qubit + 1, circuit.qubits - 1) : undefined,
      angle: ['Rx', 'Ry', 'Rz'].includes(selectedGate) ? Math.PI / 4 : undefined,
    };
    const updated = { ...circuit, gates: [...circuit.gates, newGate] };
    setCircuit(updated);
    drawCircuit(updated, executionStep);
  };

  const drawCircuit = useCallback((c: CircuitData, highlightCol: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1000, H = 400;
    canvas.width = W; canvas.height = H;
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);

    const spacing = H / (c.qubits + 1);
    const maxCol = Math.max(...c.gates.map(g => g.column), 5) + 1;
    const colW = (W - 100) / (maxCol + 1);

    // Qubit lines
    for (let i = 0; i < c.qubits; i++) {
      const y = spacing * (i + 1);
      ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 30, y); ctx.stroke();
      ctx.fillStyle = '#9ca3af'; ctx.font = '13px monospace'; ctx.textAlign = 'right';
      ctx.fillText(`|q${i}⟩`, 55, y + 5);
    }

    // Column highlight for execution
    if (highlightCol >= 0) {
      const cx = 80 + highlightCol * colW;
      ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.fillRect(cx - colW / 2, 0, colW, H);
    }

    // Gates
    c.gates.forEach(gate => {
      const x = 80 + gate.column * colW;
      const y = spacing * (gate.qubit + 1);
      const color = GATE_COLORS[gate.type];
      const isHighlighted = gate.column === highlightCol;

      // Two-qubit gate connection line
      if (gate.targetQubit !== undefined) {
        const ty = spacing * (gate.targetQubit + 1);
        ctx.strokeStyle = color; ctx.lineWidth = isHighlighted ? 3 : 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, ty); ctx.stroke();
        // Target dot
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, ty, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('⊕', x, ty + 3);
      }

      // Gate box
      const size = isHighlighted ? 20 : 17;
      ctx.fillStyle = color;
      if (isHighlighted) {
        ctx.shadowColor = color; ctx.shadowBlur = 12;
      }
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
      ctx.shadowBlur = 0;

      // Gate label
      ctx.fillStyle = '#fff'; ctx.font = `bold ${isHighlighted ? 13 : 11}px monospace`; ctx.textAlign = 'center';
      ctx.fillText(gate.type, x, y + 4);
    });

    // Measurement symbols at the end
    for (let i = 0; i < c.qubits; i++) {
      const y = spacing * (i + 1);
      const mx = W - 50;
      ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(mx, y, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx, y); ctx.lineTo(mx + 6, y - 8); ctx.stroke();
      ctx.fillStyle = '#6b7280'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('M', mx, y + 3);
    }
  }, []);

  // Execute circuit in real mode
  const executeCircuit = async () => {
    if (!circuit) return;
    setMode('real');
    setIsExecuting(true);
    setTravelMoments([]);

    const columns = [...new Set(circuit.gates.map(g => g.column))].sort((a, b) => a - b);
    let states = Array.from({ length: circuit.qubits }, () => initialQubitState());
    const moments: TravelMoment[] = [];

    // Initial moment
    moments.push({
      step: 0, gateName: 'Init |0⟩', qubitStates: [...states],
      entanglements: [], fidelity: 1.0, timestamp: Date.now(),
    });

    for (let ci = 0; ci < columns.length; ci++) {
      const col = columns[ci];
      const colGates = circuit.gates.filter(g => g.column === col);
      const entanglements: [number, number][] = [];

      colGates.forEach(gate => {
        states[gate.qubit] = simulateQubitState(gate.type, states[gate.qubit]);
        if (gate.targetQubit !== undefined) {
          states[gate.targetQubit] = simulateQubitState(gate.type, states[gate.targetQubit]);
          entanglements.push([gate.qubit, gate.targetQubit]);
        }
      });

      const fidelity = 1.0 - (ci + 1) * 0.005 * (1 + Math.random() * 0.02);
      const moment: TravelMoment = {
        step: ci + 1,
        gateName: colGates.map(g => g.type).join(' + '),
        qubitStates: states.map(s => ({ ...s })),
        entanglements,
        fidelity: Math.max(0.8, fidelity),
        timestamp: Date.now(),
      };
      moments.push(moment);

      // Animate step by step
      setExecutionStep(col);
      drawCircuit(circuit, col);
      setTravelMoments([...moments]);
      await new Promise(r => setTimeout(r, 800 / speed));
    }

    setIsExecuting(false);
    setCircuit(prev => prev ? { ...prev, fidelity: moments[moments.length - 1].fidelity } : prev);
    toast.success(`Circuit executed! ${moments.length} travel moments captured.`);
  };

  const optimizeCircuit = async () => {
    if (!circuit) return;
    toast.info('Optimizing circuit with AI...');
    try {
      await submitQuantumTask('quantum_mining', { circuitId: circuit.id }, 'high');
      setTimeout(() => {
        setCircuit(prev => prev ? { ...prev, agiOptimized: true, fidelity: Math.min(1.0, prev.fidelity + 0.03) } : prev);
        toast.success('Circuit optimized!');
      }, 2000);
    } catch { toast.error('Optimization failed'); }
  };

  const mineQuantumBlock = async () => {
    if (!circuit) return;
    toast.info('Mining quantum block...');
    try {
      const result = await mineBlock({
        difficulty: 4, algorithm: 'grover', quantumNodes: 10,
        consensusProtocol: 'quantum_proof_of_work', energyEfficiency: 0.85, quantumSupremacy: true,
      });
      if (result) {
        setCircuit(prev => prev ? { ...prev, blockchainHash: result.blockHash } : prev);
        toast.success('Block mined!');
      }
    } catch { toast.error('Mining failed'); }
  };

  const currentMoment = viewingMoment !== null ? travelMoments[viewingMoment] : travelMoments[travelMoments.length - 1];
  const depth = circuit ? Math.max(...circuit.gates.map(g => g.column), 0) + 1 : 0;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-500/20 bg-gradient-to-r from-purple-950/20 to-blue-950/20">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl">
                <Brain className="h-7 w-7 text-purple-400" />
                Quantum Circuit Studio
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">AI-Powered</Badge>
                <Badge variant="outline" className={`text-xs ${mode === 'real' ? 'text-green-400 border-green-500/40' : mode === 'travel' ? 'text-cyan-400 border-cyan-500/40' : 'text-muted-foreground'}`}>
                  {mode === 'real' ? '⚡ Real Mode' : mode === 'travel' ? '🕐 Travel' : '✏️ Design'}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Design, execute, and travel through quantum circuit moments
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={executeCircuit} disabled={isExecuting || !circuit} className="bg-green-600 hover:bg-green-700">
                {isExecuting ? <Pause className="h-4 w-4 mr-1 animate-pulse" /> : <Play className="h-4 w-4 mr-1" />}
                {isExecuting ? 'Executing...' : 'Run Circuit'}
              </Button>
              <Button onClick={optimizeCircuit} variant="secondary" disabled={isExecuting}>
                <Sparkles className="h-4 w-4 mr-1" />Optimize
              </Button>
              <Button onClick={initCircuit} variant="outline" disabled={isExecuting}>
                <RefreshCw className="h-4 w-4 mr-1" />Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Gate Palette */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Gate:</span>
            {GATE_TYPES.map(g => (
              <Button key={g} size="sm" variant={selectedGate === g ? 'default' : 'outline'}
                className="h-8 px-2.5 text-xs font-mono"
                style={selectedGate === g ? { backgroundColor: GATE_COLORS[g] } : {}}
                onClick={() => setSelectedGate(g)}>
                {g}
              </Button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Speed:</span>
              <Slider value={[speed]} onValueChange={([v]) => setSpeed(v)} min={0.25} max={4} step={0.25} className="w-24" />
              <span className="text-xs font-mono">{speed}x</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circuit Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Atom className="h-5 w-5 text-primary" />
                Circuit Visualization
                {circuit && <span className="text-xs text-muted-foreground ml-2">{circuit.qubits} qubits · {circuit.gates.length} gates · depth {depth}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <canvas ref={canvasRef}
                className="w-full border border-muted rounded-lg cursor-crosshair"
                onClick={(e) => {
                  if (!circuit || mode !== 'design') return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const scaleX = 1000 / rect.width;
                  const scaleY = 400 / rect.height;
                  const mx = (e.clientX - rect.left) * scaleX;
                  const my = (e.clientY - rect.top) * scaleY;
                  const spacing = 400 / (circuit.qubits + 1);
                  const qubit = Math.round(my / spacing) - 1;
                  const maxCol = Math.max(...circuit.gates.map(g => g.column), 5) + 1;
                  const colW = 900 / (maxCol + 1);
                  const col = Math.round((mx - 80) / colW);
                  if (qubit >= 0 && qubit < circuit.qubits && col >= 0) {
                    addGate(qubit, col);
                  }
                }}
              />
              {circuit && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <div className="text-xl font-mono">{circuit.qubits}</div>
                    <div className="text-[10px] text-muted-foreground">Qubits</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <div className="text-xl font-mono">{depth}</div>
                    <div className="text-[10px] text-muted-foreground">Depth</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <div className="text-xl font-mono">{(circuit.fidelity * 100).toFixed(1)}%</div>
                    <div className="text-[10px] text-muted-foreground">Fidelity</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <div className="text-xl font-mono">{circuit.quantumResistanceLevel}/10</div>
                    <div className="text-[10px] text-muted-foreground">Resistance</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Travel Moments Timeline */}
          {travelMoments.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-cyan-400" />
                  Travel Moments
                  <Badge variant="outline" className="text-xs">{travelMoments.length} captured</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {travelMoments.map((m, i) => (
                    <button key={i}
                      className={`flex-shrink-0 p-2 rounded-lg border text-left transition-all ${viewingMoment === i ? 'border-cyan-500 bg-cyan-500/10' : 'border-muted hover:border-primary/30'}`}
                      onClick={() => {
                        setViewingMoment(i);
                        setMode('travel');
                        if (circuit && i > 0) {
                          const cols = [...new Set(circuit.gates.map(g => g.column))].sort((a, b) => a - b);
                          drawCircuit(circuit, cols[i - 1] ?? -1);
                        }
                      }}>
                      <div className="text-[10px] text-muted-foreground">Step {m.step}</div>
                      <div className="text-xs font-mono font-medium">{m.gateName}</div>
                      <div className="text-[10px] text-cyan-400">{(m.fidelity * 100).toFixed(1)}%</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Qubit State Visualization */}
          {currentMoment && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-5 w-5 text-purple-400" />
                  Qubit States — {currentMoment.gateName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentMoment.qubitStates.map((qs, qi) => (
                    <div key={qi} className="p-2.5 rounded-lg bg-muted/30 border border-muted">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono">q{qi}</span>
                        {currentMoment.entanglements.some(e => e.includes(qi)) && (
                          <Badge variant="outline" className="text-[9px] text-yellow-400 border-yellow-500/30">Entangled</Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-6">|0⟩</span>
                          <Progress value={qs.probability0 * 100} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-mono w-10 text-right">{(qs.probability0 * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-6">|1⟩</span>
                          <Progress value={qs.probability1 * 100} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-mono w-10 text-right">{(qs.probability1 * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          φ={qs.phase.toFixed(2)} θ={qs.blochTheta.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-blue-400" />Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Mode</span>
                <Badge variant="outline" className="text-[10px]">{mode}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">AI Optimized</span>
                <Badge variant={circuit?.agiOptimized ? 'default' : 'secondary'} className="text-[10px]">
                  {circuit?.agiOptimized ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Blockchain</span>
                <Badge variant={circuit?.blockchainHash ? 'default' : 'secondary'} className="text-[10px]">
                  {circuit?.blockchainHash ? 'Secured' : 'Pending'}
                </Badge>
              </div>
              {isExecuting && (
                <div className="mt-2">
                  <div className="text-xs text-green-400 animate-pulse flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Executing...
                  </div>
                  <Progress value={travelMoments.length / (depth + 1) * 100} className="h-1.5 mt-1" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Blocks className="h-4 w-4 text-purple-400" />Blockchain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs">
                <div className="text-muted-foreground mb-0.5">Total Blocks</div>
                <div className="text-lg font-mono">{blockchainStats.totalBlocks || 0}</div>
              </div>
              <Button onClick={mineQuantumBlock} className="w-full" size="sm" disabled={isExecuting}>
                <Database className="h-3 w-3 mr-1" />Mine Block
              </Button>
              {circuit?.blockchainHash && (
                <div className="text-[10px] font-mono text-muted-foreground break-all">
                  {circuit.blockchainHash.substring(0, 32)}...
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4 text-cyan-400" />Gate Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {circuit && Object.entries(
                  circuit.gates.reduce((acc, g) => { acc[g.type] = (acc[g.type] || 0) + 1; return acc; }, {} as Record<string, number>)
                ).sort(([, a], [, b]) => b - a).map(([gate, count]) => (
                  <div key={gate} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: GATE_COLORS[gate as GateType] }} />
                      <span className="font-mono">{gate}</span>
                    </div>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Network className="h-4 w-4 text-green-400" />Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing</span>
                <span className="font-mono">{(Math.random() * 100 + 900).toFixed(0)} QFLOPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coherence</span>
                <span className="font-mono">{(Math.random() * 200 + 800).toFixed(0)}μs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Error Rate</span>
                <span className="font-mono">{(Math.random() * 0.5 + 0.1).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gate Fidelity</span>
                <span className="font-mono">{(99.5 + Math.random() * 0.49).toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
