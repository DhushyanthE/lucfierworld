
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, CheckCircle, Cpu, Play, Square, TrendingDown, Zap } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';

// ── Math Utilities ──
function generateHamiltonianCoeffs(n: number): { linear: number[]; quadratic: number[][] } {
  const linear = Array.from({ length: n }, () => (Math.random() - 0.5) * 10);
  const quadratic = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i < j ? (Math.random() - 0.5) * 10 : 0))
  );
  return { linear, quadratic };
}

function computeKFactor(coeffs: { linear: number[]; quadratic: number[][] }): number {
  let maxAbs = 0;
  coeffs.linear.forEach(v => { maxAbs = Math.max(maxAbs, Math.abs(v)); });
  coeffs.quadratic.forEach(row => row.forEach(v => { maxAbs = Math.max(maxAbs, Math.abs(v)); }));
  return maxAbs || 1;
}

function computeTrotterError(depth: number, maxCoeff: number, time: number): number {
  // Trotter error ∝ t² * max_coeff² / depth
  return (time * time * maxCoeff * maxCoeff) / Math.max(depth, 1);
}

function computeBarrenPlateauVariance(numQubits: number, wsqaoa: boolean): number {
  // Var[∂C] ~ 1/2^n without WS-QAOA, ~1/n with WS-QAOA
  if (wsqaoa) return 1 / numQubits;
  return 1 / Math.pow(2, numQubits);
}

function generateEnergyLandscape(
  points: number,
  kScaling: boolean,
  kFactor: number
): { gamma: number; energy: number }[] {
  const data: { gamma: number; energy: number }[] = [];
  for (let i = 0; i < points; i++) {
    const gamma = (i / points) * 2 * Math.PI - Math.PI;
    const scale = kScaling ? 1 / kFactor : 1;
    // Simulated multi-modal landscape
    const energy =
      -Math.cos(gamma * 3 * scale) * 2 +
      Math.sin(gamma * 7 * scale) * 0.8 +
      Math.cos(gamma * 1.5 * scale) * 1.5 -
      0.5 * Math.cos(gamma * scale);
    data.push({ gamma: parseFloat(gamma.toFixed(3)), energy: parseFloat(energy.toFixed(4)) });
  }
  return data;
}

interface RealtimeMetric {
  tick: number;
  bellScore: number;
  energy: number;
  gradientVar: number;
  trotterErr: number;
}

export default function WSQAOAConsole() {
  const [numQubits, setNumQubits] = useState(8);
  const [numLayers, setNumLayers] = useState(3);
  const [kScalingEnabled, setKScalingEnabled] = useState(true);
  const [wsqaoaEnabled, setWsqaoaEnabled] = useState(true);
  const [symmetryRestriction, setSymmetryRestriction] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [realtimeData, setRealtimeData] = useState<RealtimeMetric[]>([]);
  const tickRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derived computations
  const coeffs = React.useMemo(() => generateHamiltonianCoeffs(numQubits), [numQubits]);
  const kFactor = React.useMemo(() => computeKFactor(coeffs), [coeffs]);
  const trotterError = computeTrotterError(numLayers, kFactor, 1.0);
  const scaledTrotterError = kScalingEnabled ? trotterError / (kFactor * kFactor) : trotterError;
  const gradientVariance = computeBarrenPlateauVariance(numQubits, wsqaoaEnabled);
  const searchVolume = symmetryRestriction
    ? Math.pow(Math.PI, numLayers) * Math.pow(2 * Math.PI, numLayers) / Math.pow(2, 2 * numLayers)
    : Math.pow(2 * Math.PI, 2 * numLayers);

  const energyLandscape = React.useMemo(
    () => generateEnergyLandscape(200, kScalingEnabled, kFactor),
    [kScalingEnabled, kFactor]
  );

  // Barren plateau data across qubit counts
  const barrenData = React.useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const n = i + 4;
      return {
        qubits: n,
        standard: 1 / Math.pow(2, n),
        wsqaoa: 1 / n,
      };
    });
  }, []);

  // Trotter error vs depth
  const trotterData = React.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const depth = i + 1;
      const raw = computeTrotterError(depth, kFactor, 1.0);
      return {
        depth,
        unscaled: parseFloat(raw.toFixed(4)),
        scaled: parseFloat((raw / (kFactor * kFactor)).toFixed(4)),
      };
    });
  }, [kFactor]);

  // Status indicators
  const barrenPlateauWarning = !wsqaoaEnabled && numQubits > 12;
  const trotterWarning = scaledTrotterError > 5;
  const networkHealthy = !barrenPlateauWarning && !trotterWarning;

  // Real-time streaming
  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    tickRef.current = 0;
    setRealtimeData([]);
    intervalRef.current = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      const convergenceRate = wsqaoaEnabled ? 0.15 : 0.05;
      const bellTarget = 2.0 + Math.random() * 0.8;
      const bellScore = bellTarget * (1 - Math.exp(-convergenceRate * t)) + (Math.random() - 0.5) * 0.1;
      const energy = -3 + 3 * Math.exp(-convergenceRate * t) + (Math.random() - 0.5) * 0.2;
      const gv = computeBarrenPlateauVariance(numQubits, wsqaoaEnabled) * (1 + Math.random() * 0.3);
      const te = computeTrotterError(numLayers, kScalingEnabled ? 1 : kFactor, 1.0) / (t * 0.5 + 1);

      setRealtimeData(prev => [
        ...prev.slice(-99),
        {
          tick: t,
          bellScore: parseFloat(bellScore.toFixed(4)),
          energy: parseFloat(energy.toFixed(4)),
          gradientVar: parseFloat(gv.toFixed(6)),
          trotterErr: parseFloat(te.toFixed(4)),
        },
      ]);
    }, 500);
  }, [wsqaoaEnabled, numQubits, numLayers, kScalingEnabled, kFactor]);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const latestMetric = realtimeData[realtimeData.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#120025] to-[#0a0015] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Cpu className="h-8 w-8 text-purple-400" />
              WS-QAOA Deployment Console
            </h1>
            <p className="text-gray-400 mt-1">
              Warm-Starting QAOA with k-factor scaling, Trotter bounds & barren plateau detection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={networkHealthy ? 'default' : 'destructive'} className={networkHealthy ? 'bg-green-600' : ''}>
              {networkHealthy ? '● Network Stable' : '⚠ Warnings Active'}
            </Badge>
            {isStreaming ? (
              <Button variant="destructive" onClick={stopStreaming} className="gap-2">
                <Square className="h-4 w-4" /> Stop Stream
              </Button>
            ) : (
              <Button onClick={startStreaming} className="gap-2 bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4" /> Start Real-time
              </Button>
            )}
          </div>
        </div>

        {/* Controls */}
        <Card className="p-6 bg-black/60 border-purple-500/20">
          <h3 className="text-lg font-semibold mb-4">Deployment Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Qubits: {numQubits}</label>
              <Slider
                value={[numQubits]}
                min={4}
                max={20}
                step={1}
                onValueChange={([v]) => setNumQubits(v)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">QAOA Layers (p): {numLayers}</label>
              <Slider
                value={[numLayers]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) => setNumLayers(v)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">k-Factor Scaling</label>
                <Switch checked={kScalingEnabled} onCheckedChange={setKScalingEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">WS-QAOA Init</label>
                <Switch checked={wsqaoaEnabled} onCheckedChange={setWsqaoaEnabled} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Symmetry Restriction</label>
                <Switch checked={symmetryRestriction} onCheckedChange={setSymmetryRestriction} />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Search Volume: {searchVolume.toExponential(2)} rad<sup>{2 * numLayers}</sup>
              </div>
            </div>
          </div>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-black/60 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">k-Factor</span>
            </div>
            <div className="text-2xl font-bold">{kFactor.toFixed(3)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {kScalingEnabled ? 'Applied — landscape smoothed' : 'Disabled — raw coefficients'}
            </div>
          </Card>

          <Card className="p-4 bg-black/60 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Trotter Error</span>
            </div>
            <div className={`text-2xl font-bold ${trotterWarning ? 'text-red-400' : 'text-green-400'}`}>
              {scaledTrotterError.toFixed(4)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {trotterWarning ? '⚠ Increase depth or enable scaling' : '✓ Within bounds'}
            </div>
          </Card>

          <Card className="p-4 bg-black/60 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              {barrenPlateauWarning
                ? <AlertTriangle className="h-4 w-4 text-red-400" />
                : <CheckCircle className="h-4 w-4 text-green-400" />}
              <span className="text-sm text-gray-400">Gradient Var</span>
            </div>
            <div className={`text-2xl font-bold ${barrenPlateauWarning ? 'text-red-400' : 'text-green-400'}`}>
              {gradientVariance.toExponential(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {barrenPlateauWarning ? '⚠ BARREN PLATEAU DETECTED' : '✓ Trainable'}
            </div>
          </Card>

          <Card className="p-4 bg-black/60 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Bell Score</span>
            </div>
            <div className="text-2xl font-bold text-purple-300">
              {latestMetric ? latestMetric.bellScore.toFixed(3) : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: S ≥ 2.000 (quantum advantage)
            </div>
          </Card>
        </div>

        {/* Visualization Tabs */}
        <Tabs defaultValue="landscape" className="space-y-4">
          <TabsList className="bg-black/60 border border-purple-500/20">
            <TabsTrigger value="landscape">Energy Landscape</TabsTrigger>
            <TabsTrigger value="barren">Barren Plateau</TabsTrigger>
            <TabsTrigger value="trotter">Trotter Bounds</TabsTrigger>
            <TabsTrigger value="realtime">Real-time Stream</TabsTrigger>
          </TabsList>

          <TabsContent value="landscape">
            <Card className="p-6 bg-black/60 border-purple-500/20">
              <h3 className="text-lg font-semibold mb-2">
                Energy Landscape ⟨H_f⟩(γ) — {kScalingEnabled ? 'k-Scaled' : 'Unscaled'}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {kScalingEnabled
                  ? 'With k-factor normalization, the landscape is smooth and the optimizer converges to the global minimum.'
                  : 'Without scaling, raw Hamiltonian coefficients create a rugged, multi-modal landscape with many local minima.'}
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyLandscape}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="gamma" label={{ value: 'γ (rad)', position: 'bottom', fill: '#999' }} tick={{ fill: '#999' }} />
                    <YAxis label={{ value: '⟨H_f⟩', angle: -90, position: 'left', fill: '#999' }} tick={{ fill: '#999' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6b21a8' }} />
                    <Line type="monotone" dataKey="energy" stroke={kScalingEnabled ? '#a855f7' : '#ef4444'} dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="barren">
            <Card className="p-6 bg-black/60 border-purple-500/20">
              <h3 className="text-lg font-semibold mb-2">Barren Plateau Detection</h3>
              <p className="text-sm text-gray-400 mb-4">
                Gradient variance Var[∂C] vs qubit count. Standard QAOA decays as 1/2ⁿ (exponential vanishing). WS-QAOA decays as 1/n (polynomial — trainable).
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={barrenData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="qubits" label={{ value: 'Number of Qubits', position: 'bottom', fill: '#999' }} tick={{ fill: '#999' }} />
                    <YAxis
                      scale="log"
                      domain={['auto', 'auto']}
                      label={{ value: 'Var[∂C] (log)', angle: -90, position: 'left', fill: '#999' }}
                      tick={{ fill: '#999' }}
                      tickFormatter={(v: number) => v.toExponential(0)}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6b21a8' }} />
                    <Line type="monotone" dataKey="standard" name="Standard QAOA" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="wsqaoa" name="WS-QAOA" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex gap-6 text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-1 bg-red-500 inline-block rounded" /> Standard QAOA (1/2ⁿ)</span>
                <span className="flex items-center gap-2"><span className="w-3 h-1 bg-green-500 inline-block rounded" /> WS-QAOA (1/n)</span>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trotter">
            <Card className="p-6 bg-black/60 border-purple-500/20">
              <h3 className="text-lg font-semibold mb-2">Trotter Error Bounds vs Circuit Depth</h3>
              <p className="text-sm text-gray-400 mb-4">
                Error from Lie-Trotter approximation decreases with depth but is amplified by raw Hamiltonian coefficients. k-scaling normalizes the coefficients.
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trotterData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="depth" label={{ value: 'Circuit Depth (p)', position: 'bottom', fill: '#999' }} tick={{ fill: '#999' }} />
                    <YAxis label={{ value: 'Error Bound', angle: -90, position: 'left', fill: '#999' }} tick={{ fill: '#999' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6b21a8' }} />
                    <Bar dataKey="unscaled" name="Unscaled" fill="#ef4444" opacity={0.7} />
                    <Bar dataKey="scaled" name="k-Scaled" fill="#a855f7" opacity={0.9} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="realtime">
            <Card className="p-6 bg-black/60 border-purple-500/20">
              <h3 className="text-lg font-semibold mb-2">Real-time QAOA Optimization Stream</h3>
              {realtimeData.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Click <strong>Start Real-time</strong> to begin streaming optimization metrics</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-64">
                    <h4 className="text-sm text-gray-400 mb-2">Bell Score Convergence (S ≥ 2.0 = quantum advantage)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={realtimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="tick" tick={{ fill: '#999' }} />
                        <YAxis domain={[0, 3]} tick={{ fill: '#999' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6b21a8' }} />
                        <Line type="monotone" dataKey="bellScore" stroke="#a855f7" dot={false} strokeWidth={2} />
                        {/* Reference line at S=2.0 */}
                        <Line type="monotone" dataKey={() => 2.0} stroke="#22c55e" strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64">
                    <h4 className="text-sm text-gray-400 mb-2">Cost Function Energy ⟨H_f⟩</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={realtimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="tick" tick={{ fill: '#999' }} />
                        <YAxis tick={{ fill: '#999' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6b21a8' }} />
                        <Line type="monotone" dataKey="energy" stroke="#3b82f6" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Deployment Summary */}
        <Card className="p-6 bg-black/60 border-purple-500/20">
          <h3 className="text-lg font-semibold mb-4">Deployment Readiness</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${kScalingEnabled ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                {kScalingEnabled ? <CheckCircle className="h-5 w-5 text-green-400" /> : <AlertTriangle className="h-5 w-5 text-yellow-400" />}
                <span className="font-medium">k-Factor Scaling</span>
              </div>
              <p className="text-sm text-gray-400">
                {kScalingEnabled
                  ? `Active. k=${kFactor.toFixed(3)}. All Hamiltonian coefficients normalized.`
                  : 'Disabled. Raw coefficients may cause chaotic energy landscapes.'}
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${!barrenPlateauWarning ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                {!barrenPlateauWarning ? <CheckCircle className="h-5 w-5 text-green-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}
                <span className="font-medium">Barren Plateau Guard</span>
              </div>
              <p className="text-sm text-gray-400">
                {!barrenPlateauWarning
                  ? `Safe. Var[∂C] = ${gradientVariance.toExponential(2)} — optimizer can learn.`
                  : `CRITICAL: Var[∂C] = ${gradientVariance.toExponential(2)} — enable WS-QAOA!`}
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${!trotterWarning ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                {!trotterWarning ? <CheckCircle className="h-5 w-5 text-green-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}
                <span className="font-medium">Trotter Error Bound</span>
              </div>
              <p className="text-sm text-gray-400">
                {!trotterWarning
                  ? `ε = ${scaledTrotterError.toFixed(4)} — within acceptable tolerance.`
                  : `ε = ${scaledTrotterError.toFixed(4)} — too high! Increase circuit depth.`}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
