import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from 'recharts';
import { Cpu, Zap, Activity, Shield, Play, RotateCcw } from 'lucide-react';

interface HardwareBackend {
  id: string;
  name: string;
  provider: string;
  qubits: number;
  technology: string;
  connectivity: string;
  nativeGates: string[];
  color: string;
}

interface BenchmarkResult {
  backend: string;
  singleQubitError: number;
  twoQubitError: number;
  readoutError: number;
  t1: number; // μs
  t2: number; // μs
  gateTime1Q: number; // ns
  gateTime2Q: number; // ns
  qv: number; // quantum volume
  clops: number; // CLOPS
  overallFidelity: number;
}

const BACKENDS: HardwareBackend[] = [
  { id: 'ibm_eagle', name: 'IBM Eagle r3', provider: 'IBM', qubits: 127, technology: 'Superconducting (Transmon)', connectivity: 'Heavy-hex', nativeGates: ['√X', 'RZ', 'ECR'], color: 'hsl(220, 70%, 55%)' },
  { id: 'google_sycamore', name: 'Google Sycamore', provider: 'Google', qubits: 72, technology: 'Superconducting (Xmon)', connectivity: 'Grid (2D)', nativeGates: ['√iSWAP', 'PhasedXZ', 'CZ'], color: 'hsl(140, 60%, 45%)' },
  { id: 'ionq_forte', name: 'IonQ Forte', provider: 'IonQ', qubits: 36, technology: 'Trapped Ion (Yb⁺)', connectivity: 'All-to-all', nativeGates: ['GPI', 'GPI2', 'MS'], color: 'hsl(280, 60%, 55%)' },
  { id: 'quera_aquila', name: 'QuEra Aquila', provider: 'QuEra', qubits: 256, technology: 'Neutral Atom (Rb)', connectivity: 'Programmable (optical)', nativeGates: ['Rydberg', 'Global Rz', 'CZ'], color: 'hsl(30, 80%, 50%)' },
];

function simulateBenchmark(backendId: string, noise: number): BenchmarkResult {
  const seed = backendId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  const configs: Record<string, Partial<BenchmarkResult>> = {
    ibm_eagle: { singleQubitError: 0.0002, twoQubitError: 0.006, readoutError: 0.008, t1: 300, t2: 150, gateTime1Q: 35, gateTime2Q: 660, qv: 128, clops: 15000 },
    google_sycamore: { singleQubitError: 0.0015, twoQubitError: 0.0036, readoutError: 0.034, t1: 20, t2: 12, gateTime1Q: 25, gateTime2Q: 32, qv: 32, clops: 8000 },
    ionq_forte: { singleQubitError: 0.0003, twoQubitError: 0.004, readoutError: 0.003, t1: 100000, t2: 1500, gateTime1Q: 10000, gateTime2Q: 200000, qv: 256, clops: 900 },
    quera_aquila: { singleQubitError: 0.003, twoQubitError: 0.005, readoutError: 0.02, t1: 5000, t2: 2000, gateTime1Q: 500, gateTime2Q: 1000, qv: 16, clops: 500 },
  };

  const base = configs[backendId] || configs.ibm_eagle;
  const nf = 1 + noise / 100;

  const sq = (base.singleQubitError || 0.001) * nf;
  const tq = (base.twoQubitError || 0.01) * nf;
  const ro = (base.readoutError || 0.01) * nf;

  return {
    backend: backendId,
    singleQubitError: Math.min(sq, 0.5),
    twoQubitError: Math.min(tq, 0.5),
    readoutError: Math.min(ro, 0.5),
    t1: (base.t1 || 100) / nf,
    t2: (base.t2 || 50) / nf,
    gateTime1Q: base.gateTime1Q || 50,
    gateTime2Q: base.gateTime2Q || 500,
    qv: Math.round((base.qv || 32) / nf),
    clops: Math.round((base.clops || 1000) / nf),
    overallFidelity: Math.max(0, 1 - sq * 10 - tq * 5 - ro * 2),
  };
}

export default function QuantumHardwareBenchmark() {
  const [selectedBackends, setSelectedBackends] = useState<string[]>(['ibm_eagle', 'google_sycamore', 'ionq_forte', 'quera_aquila']);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = async () => {
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 1200));
    const res = selectedBackends.map(id => simulateBenchmark(id, noiseLevel));
    setResults(res);
    setIsRunning(false);
  };

  const backendMap = useMemo(() => Object.fromEntries(BACKENDS.map(b => [b.id, b])), []);

  const errorBarData = useMemo(() => {
    if (!results) return [];
    return results.map(r => ({
      name: backendMap[r.backend]?.provider || r.backend,
      '1Q Error (×10⁻⁴)': +(r.singleQubitError * 10000).toFixed(1),
      '2Q Error (×10⁻³)': +(r.twoQubitError * 1000).toFixed(2),
      'Readout Error (×10⁻³)': +(r.readoutError * 1000).toFixed(2),
    }));
  }, [results, backendMap]);

  const radarData = useMemo(() => {
    if (!results) return [];
    const metrics = ['Fidelity', 'Coherence', 'Speed', 'QV', 'Connectivity'];
    return metrics.map(m => {
      const point: any = { metric: m };
      results.forEach(r => {
        const b = backendMap[r.backend];
        let val = 0;
        if (m === 'Fidelity') val = r.overallFidelity * 100;
        if (m === 'Coherence') val = Math.min(100, (r.t1 / 1000) * 100);
        if (m === 'Speed') val = Math.min(100, (1 / r.gateTime2Q) * 100000);
        if (m === 'QV') val = Math.min(100, (r.qv / 256) * 100);
        if (m === 'Connectivity') val = b?.connectivity === 'All-to-all' ? 100 : b?.connectivity?.includes('Grid') ? 60 : 40;
        point[b?.provider || r.backend] = +val.toFixed(1);
      });
      return point;
    });
  }, [results, backendMap]);

  const depthData = useMemo(() => {
    if (!results) return [];
    return Array.from({ length: 20 }, (_, i) => {
      const depth = (i + 1) * 5;
      const point: any = { depth };
      results.forEach(r => {
        const b = backendMap[r.backend];
        const fidelity = Math.pow(1 - r.twoQubitError, depth) * Math.pow(1 - r.singleQubitError, depth * 2);
        point[b?.provider || r.backend] = +(fidelity * 100).toFixed(2);
      });
      return point;
    });
  }, [results, backendMap]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              Quantum Hardware Noise Benchmark
            </h1>
            <p className="text-sm text-muted-foreground">Compare error rates across IBM, Google, IonQ, and QuEra backends</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Extra Noise:</span>
              <input
                type="range" min={0} max={200} value={noiseLevel}
                onChange={e => setNoiseLevel(+e.target.value)}
                className="w-24"
              />
              <span className="text-sm font-mono text-foreground w-12">{noiseLevel}%</span>
            </div>
            <Button onClick={runBenchmark} disabled={isRunning} className="gap-2">
              {isRunning ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Running...' : 'Run Benchmark'}
            </Button>
          </div>
        </div>

        {/* Backend cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BACKENDS.map(b => {
            const res = results?.find(r => r.backend === b.id);
            return (
              <Card key={b.id} className={`border-2 ${selectedBackends.includes(b.id) ? 'border-primary/50' : 'border-border'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{b.name}</span>
                    <Badge variant="outline" className="text-xs">{b.qubits}Q</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{b.technology}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Connectivity:</span> {b.connectivity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Native:</span> {b.nativeGates.join(', ')}
                  </div>
                  {res && (
                    <div className="pt-2 border-t border-border space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Overall Fidelity</span>
                        <span className={`font-mono font-bold ${res.overallFidelity > 0.95 ? 'text-green-400' : res.overallFidelity > 0.85 ? 'text-amber-400' : 'text-red-400'}`}>
                          {(res.overallFidelity * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Quantum Volume</span>
                        <span className="font-mono font-bold text-foreground">{res.qv}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">CLOPS</span>
                        <span className="font-mono font-bold text-foreground">{res.clops.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {results && (
          <Tabs defaultValue="errors" className="w-full">
            <TabsList>
              <TabsTrigger value="errors" className="gap-1"><Activity className="h-3.5 w-3.5" />Error Rates</TabsTrigger>
              <TabsTrigger value="radar" className="gap-1"><Shield className="h-3.5 w-3.5" />Capability Radar</TabsTrigger>
              <TabsTrigger value="depth" className="gap-1"><Zap className="h-3.5 w-3.5" />Depth vs Fidelity</TabsTrigger>
              <TabsTrigger value="details" className="gap-1"><Cpu className="h-3.5 w-3.5" />Detailed Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="errors">
              <Card>
                <CardHeader><CardTitle>Error Rate Comparison</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={errorBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                      <Legend />
                      <Bar dataKey="1Q Error (×10⁻⁴)" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="2Q Error (×10⁻³)" fill="hsl(280, 60%, 55%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Readout Error (×10⁻³)" fill="hsl(30, 80%, 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="radar">
              <Card>
                <CardHeader><CardTitle>Multi-Axis Capability Comparison</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <PolarRadiusAxis stroke="hsl(var(--border))" fontSize={10} />
                      {results.map(r => {
                        const b = backendMap[r.backend];
                        return (
                          <Radar key={r.backend} name={b?.provider || r.backend} dataKey={b?.provider || r.backend}
                            stroke={b?.color} fill={b?.color} fillOpacity={0.15} strokeWidth={2} />
                        );
                      })}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="depth">
              <Card>
                <CardHeader>
                  <CardTitle>Circuit Fidelity vs Depth</CardTitle>
                  <p className="text-xs text-muted-foreground">Shows how fidelity degrades as circuit depth increases, assuming random 2Q gates per layer</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={depthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="depth" stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Circuit Depth', position: 'insideBottom', offset: -5 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} label={{ value: 'Fidelity (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                      <Legend />
                      {results.map(r => {
                        const b = backendMap[r.backend];
                        return (
                          <Line key={r.backend} type="monotone" dataKey={b?.provider || r.backend}
                            stroke={b?.color} strokeWidth={2} dot={false} />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader><CardTitle>Detailed Hardware Metrics</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-muted-foreground">Metric</th>
                          {results.map(r => (
                            <th key={r.backend} className="text-right py-2 px-3 text-foreground">
                              {backendMap[r.backend]?.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: '1Q Gate Error', key: 'singleQubitError', fmt: (v: number) => (v * 100).toFixed(4) + '%' },
                          { label: '2Q Gate Error', key: 'twoQubitError', fmt: (v: number) => (v * 100).toFixed(3) + '%' },
                          { label: 'Readout Error', key: 'readoutError', fmt: (v: number) => (v * 100).toFixed(3) + '%' },
                          { label: 'T₁ (μs)', key: 't1', fmt: (v: number) => v.toFixed(1) },
                          { label: 'T₂ (μs)', key: 't2', fmt: (v: number) => v.toFixed(1) },
                          { label: '1Q Gate Time (ns)', key: 'gateTime1Q', fmt: (v: number) => v.toLocaleString() },
                          { label: '2Q Gate Time (ns)', key: 'gateTime2Q', fmt: (v: number) => v.toLocaleString() },
                          { label: 'Quantum Volume', key: 'qv', fmt: (v: number) => v.toString() },
                          { label: 'CLOPS', key: 'clops', fmt: (v: number) => v.toLocaleString() },
                        ].map(row => (
                          <tr key={row.label} className="border-b border-border/50">
                            <td className="py-2 px-3 text-muted-foreground">{row.label}</td>
                            {results.map(r => (
                              <td key={r.backend} className="text-right py-2 px-3 font-mono text-foreground">
                                {row.fmt((r as any)[row.key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!results && (
          <Card className="py-16">
            <CardContent className="text-center space-y-4">
              <Cpu className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-lg text-muted-foreground">Click <strong>Run Benchmark</strong> to compare quantum hardware backends</p>
              <p className="text-sm text-muted-foreground">Simulates gate fidelities, coherence times, and circuit depth degradation across 4 platforms</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
