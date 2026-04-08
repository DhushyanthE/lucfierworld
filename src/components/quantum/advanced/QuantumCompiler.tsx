import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Play, ArrowRight, Zap, Cpu } from 'lucide-react';

interface GateOp {
  gate: string;
  qubits: number[];
  params?: number[];
}

interface CompiledCircuit {
  original: GateOp[];
  transpiled: GateOp[];
  optimized: GateOp[];
  depth: { original: number; transpiled: number; optimized: number };
  gateCount: { original: number; transpiled: number; optimized: number };
  targetBasis: string[];
}

const ARCHITECTURES: Record<string, { label: string; basis: string[]; connectivity: string }> = {
  'ibm_eagle': { label: 'IBM Eagle (r3)', basis: ['CX', 'ID', 'RZ', 'SX', 'X'], connectivity: 'Heavy-hex' },
  'google_sycamore': { label: 'Google Sycamore', basis: ['√iSWAP', 'PhasedXZ', 'CZ'], connectivity: 'Grid' },
  'ion_trap': { label: 'IonQ Forte', basis: ['GPI', 'GPI2', 'MS'], connectivity: 'All-to-all' },
  'neutral_atom': { label: 'QuEra Aquila', basis: ['Rydberg CZ', 'Rxy'], connectivity: 'Programmable' },
};

const SAMPLE_CIRCUITS: Record<string, { label: string; gates: GateOp[] }> = {
  'bell': {
    label: 'Bell State',
    gates: [
      { gate: 'H', qubits: [0] },
      { gate: 'CNOT', qubits: [0, 1] },
    ]
  },
  'ghz3': {
    label: 'GHZ-3 State',
    gates: [
      { gate: 'H', qubits: [0] },
      { gate: 'CNOT', qubits: [0, 1] },
      { gate: 'CNOT', qubits: [1, 2] },
    ]
  },
  'qft3': {
    label: 'QFT (3-qubit)',
    gates: [
      { gate: 'H', qubits: [0] },
      { gate: 'CP', qubits: [1, 0], params: [Math.PI / 2] },
      { gate: 'CP', qubits: [2, 0], params: [Math.PI / 4] },
      { gate: 'H', qubits: [1] },
      { gate: 'CP', qubits: [2, 1], params: [Math.PI / 2] },
      { gate: 'H', qubits: [2] },
      { gate: 'SWAP', qubits: [0, 2] },
    ]
  },
  'grover_oracle': {
    label: 'Grover Oracle (2-qubit)',
    gates: [
      { gate: 'H', qubits: [0] },
      { gate: 'H', qubits: [1] },
      { gate: 'CZ', qubits: [0, 1] },
      { gate: 'H', qubits: [0] },
      { gate: 'H', qubits: [1] },
      { gate: 'X', qubits: [0] },
      { gate: 'X', qubits: [1] },
      { gate: 'CZ', qubits: [0, 1] },
      { gate: 'X', qubits: [0] },
      { gate: 'X', qubits: [1] },
      { gate: 'H', qubits: [0] },
      { gate: 'H', qubits: [1] },
    ]
  },
};

function transpileGate(gate: GateOp, basis: string[]): GateOp[] {
  const g = gate.gate;
  // Decompose high-level gates to target basis
  if (basis.includes(g)) return [gate];

  if (g === 'H') {
    if (basis.includes('SX') && basis.includes('RZ'))
      return [{ gate: 'RZ', qubits: gate.qubits, params: [Math.PI / 2] }, { gate: 'SX', qubits: gate.qubits }, { gate: 'RZ', qubits: gate.qubits, params: [Math.PI / 2] }];
    if (basis.includes('GPI') && basis.includes('GPI2'))
      return [{ gate: 'GPI2', qubits: gate.qubits, params: [0] }, { gate: 'GPI', qubits: gate.qubits, params: [0] }];
    return [{ gate: 'Rxy', qubits: gate.qubits, params: [Math.PI, Math.PI / 4] }];
  }
  if (g === 'CNOT' || g === 'CX') {
    if (basis.includes('CX')) return [{ gate: 'CX', qubits: gate.qubits }];
    if (basis.includes('CZ'))
      return [{ gate: 'H', qubits: [gate.qubits[1]] }, { gate: 'CZ', qubits: gate.qubits }, { gate: 'H', qubits: [gate.qubits[1]] }];
    if (basis.includes('MS'))
      return [{ gate: 'GPI2', qubits: [gate.qubits[0]], params: [0] }, { gate: 'MS', qubits: gate.qubits, params: [Math.PI / 4] }, { gate: 'GPI2', qubits: [gate.qubits[1]], params: [Math.PI / 2] }];
    return [{ gate: '√iSWAP', qubits: gate.qubits }, { gate: 'PhasedXZ', qubits: [gate.qubits[0]], params: [Math.PI] }];
  }
  if (g === 'SWAP') {
    return [
      ...transpileGate({ gate: 'CNOT', qubits: gate.qubits }, basis),
      ...transpileGate({ gate: 'CNOT', qubits: [gate.qubits[1], gate.qubits[0]] }, basis),
      ...transpileGate({ gate: 'CNOT', qubits: gate.qubits }, basis),
    ];
  }
  if (g === 'CP') {
    const theta = gate.params?.[0] ?? Math.PI / 2;
    return [
      { gate: 'RZ', qubits: [gate.qubits[0]], params: [theta / 2] },
      ...transpileGate({ gate: 'CNOT', qubits: gate.qubits }, basis),
      { gate: 'RZ', qubits: [gate.qubits[1]], params: [-theta / 2] },
      ...transpileGate({ gate: 'CNOT', qubits: gate.qubits }, basis),
      { gate: 'RZ', qubits: [gate.qubits[1]], params: [theta / 2] },
    ];
  }
  if (g === 'CZ') {
    return transpileGate({ gate: 'CNOT', qubits: gate.qubits }, basis).concat([]);
  }
  if (g === 'X') {
    if (basis.includes('X')) return [gate];
    if (basis.includes('SX')) return [{ gate: 'SX', qubits: gate.qubits }, { gate: 'SX', qubits: gate.qubits }];
    return [{ gate: 'GPI', qubits: gate.qubits, params: [0] }];
  }
  return [gate]; // fallback
}

function optimizeCircuit(gates: GateOp[]): GateOp[] {
  const result: GateOp[] = [];
  for (let i = 0; i < gates.length; i++) {
    const curr = gates[i];
    const next = gates[i + 1];
    // Cancel adjacent inverse gates (same single-qubit gate twice = identity for self-inverse gates)
    if (next && curr.gate === next.gate && curr.qubits.length === 1 && next.qubits.length === 1
      && curr.qubits[0] === next.qubits[0] && ['X', 'H', 'SX'].includes(curr.gate) && !curr.params) {
      i++; // skip both
      continue;
    }
    // Merge adjacent RZ rotations
    if (next && curr.gate === 'RZ' && next.gate === 'RZ' && curr.qubits[0] === next.qubits[0]) {
      result.push({ gate: 'RZ', qubits: curr.qubits, params: [(curr.params?.[0] ?? 0) + (next.params?.[0] ?? 0)] });
      i++;
      continue;
    }
    result.push(curr);
  }
  return result;
}

function compileCircuit(circuitKey: string, archKey: string): CompiledCircuit {
  const circuit = SAMPLE_CIRCUITS[circuitKey];
  const arch = ARCHITECTURES[archKey];

  const transpiled = circuit.gates.flatMap(g => transpileGate(g, arch.basis));
  const optimized = optimizeCircuit(transpiled);

  const calcDepth = (gates: GateOp[]) => {
    const qubitEnd: Record<number, number> = {};
    let depth = 0;
    for (const g of gates) {
      const start = Math.max(...g.qubits.map(q => qubitEnd[q] ?? 0));
      const end = start + 1;
      g.qubits.forEach(q => qubitEnd[q] = end);
      depth = Math.max(depth, end);
    }
    return depth;
  };

  return {
    original: circuit.gates,
    transpiled,
    optimized,
    depth: { original: calcDepth(circuit.gates), transpiled: calcDepth(transpiled), optimized: calcDepth(optimized) },
    gateCount: { original: circuit.gates.length, transpiled: transpiled.length, optimized: optimized.length },
    targetBasis: arch.basis,
  };
}

function GateChip({ gate }: { gate: GateOp }) {
  const is2q = gate.qubits.length > 1;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${is2q ? 'bg-primary/20 text-primary' : 'bg-accent/50 text-accent-foreground'}`}>
      {gate.gate}
      <span className="text-muted-foreground">q{gate.qubits.join(',')}</span>
      {gate.params && <span className="text-muted-foreground">({gate.params.map(p => (p / Math.PI).toFixed(2) + 'π').join(',')})</span>}
    </span>
  );
}

export function QuantumCompiler() {
  const [circuitKey, setCircuitKey] = useState('bell');
  const [archKey, setArchKey] = useState('ibm_eagle');
  const [result, setResult] = useState<CompiledCircuit | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const compile = async () => {
    setIsCompiling(true);
    await new Promise(r => setTimeout(r, 1200));
    setResult(compileCircuit(circuitKey, archKey));
    setIsCompiling(false);
  };

  const arch = ARCHITECTURES[archKey];
  const depthReduction = result ? ((1 - result.depth.optimized / result.depth.transpiled) * 100) : 0;
  const gateReduction = result ? ((1 - result.gateCount.optimized / result.gateCount.transpiled) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Quantum Compiler — Transpilation & Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Input Circuit</label>
              <Select value={circuitKey} onValueChange={setCircuitKey}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SAMPLE_CIRCUITS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Target Architecture</label>
              <Select value={archKey} onValueChange={setArchKey}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ARCHITECTURES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={compile} disabled={isCompiling} className="gap-2 w-full">
                <Play className="h-4 w-4" />
                {isCompiling ? 'Compiling...' : 'Compile'}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1"><Cpu className="h-3 w-3" />{arch.connectivity}</Badge>
            <span className="text-xs text-muted-foreground">Native basis: {arch.basis.join(', ')}</span>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Original', gates: result.original, depth: result.depth.original, count: result.gateCount.original },
              { label: 'Transpiled', gates: result.transpiled, depth: result.depth.transpiled, count: result.gateCount.transpiled },
              { label: 'Optimized', gates: result.optimized, depth: result.depth.optimized, count: result.gateCount.optimized },
            ].map((stage, idx) => (
              <Card key={idx} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{stage.label}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">Depth: {stage.depth}</Badge>
                      <Badge variant="secondary" className="text-xs">Gates: {stage.count}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {stage.gates.map((g, i) => <GateChip key={i} gate={g} />)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Optimization Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{result.gateCount.optimized}</p>
                  <p className="text-xs text-muted-foreground">Final Gate Count</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{result.depth.optimized}</p>
                  <p className="text-xs text-muted-foreground">Final Depth</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{gateReduction > 0 ? `-${gateReduction.toFixed(0)}%` : '0%'}</p>
                  <p className="text-xs text-muted-foreground">Gate Reduction</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{depthReduction > 0 ? `-${depthReduction.toFixed(0)}%` : '0%'}</p>
                  <p className="text-xs text-muted-foreground">Depth Reduction</p>
                </div>
              </div>
              <div className="mt-4 bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Optimization passes: adjacent gate cancellation, RZ merging, identity elimination.
                  Target basis: [{result.targetBasis.join(', ')}]. 
                  Connectivity: {arch.connectivity}.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
