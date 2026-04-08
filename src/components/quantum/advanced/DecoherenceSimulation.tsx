/**
 * Quantum Decoherence Simulation with Bloch Sphere Visualization
 * Models T1 (amplitude damping) and T2 (phase damping) time constants
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Atom, Play, Pause, RotateCcw, Timer, Activity } from 'lucide-react';

interface BlochState {
  theta: number; // polar angle (0 = |0⟩, π = |1⟩)
  phi: number;   // azimuthal angle
  r: number;     // purity (1 = pure, 0 = maximally mixed)
}

interface DecoherenceParams {
  t1: number; // amplitude damping time (µs)
  t2: number; // phase damping time (µs)
  temperature: number; // in mK
}

interface SimulationSnapshot {
  time: number;
  state: BlochState;
  fidelity: number;
  purity: number;
}

const INITIAL_STATES: Record<string, { theta: number; phi: number; label: string }> = {
  'plus': { theta: Math.PI / 2, phi: 0, label: '|+⟩ = (|0⟩+|1⟩)/√2' },
  'minus': { theta: Math.PI / 2, phi: Math.PI, label: '|−⟩ = (|0⟩−|1⟩)/√2' },
  'plus_i': { theta: Math.PI / 2, phi: Math.PI / 2, label: '|+i⟩ = (|0⟩+i|1⟩)/√2' },
  'one': { theta: Math.PI, phi: 0, label: '|1⟩' },
  'custom': { theta: Math.PI / 3, phi: Math.PI / 4, label: 'Custom θ=π/3, φ=π/4' },
};

function applyDecoherence(state: BlochState, dt: number, params: DecoherenceParams): BlochState {
  const { t1, t2 } = params;
  // T1: amplitude damping — z component decays toward +1 (ground state)
  const gammaT1 = 1 - Math.exp(-dt / t1);
  // T2: phase damping — x,y components decay
  const gammaT2 = 1 - Math.exp(-dt / t2);

  const x = state.r * Math.sin(state.theta) * Math.cos(state.phi);
  const y = state.r * Math.sin(state.theta) * Math.sin(state.phi);
  const z = state.r * Math.cos(state.theta);

  // Apply damping
  const newX = x * (1 - gammaT2);
  const newY = y * (1 - gammaT2);
  const newZ = z * (1 - gammaT1) + gammaT1; // relaxes toward |0⟩ (z=+1)

  const newR = Math.sqrt(newX * newX + newY * newY + newZ * newZ);
  const clampedR = Math.min(1, newR);

  if (clampedR < 0.001) return { theta: 0, phi: 0, r: clampedR };

  const newTheta = Math.acos(Math.max(-1, Math.min(1, newZ / Math.max(clampedR, 1e-10))));
  const newPhi = Math.atan2(newY, newX);

  return { theta: newTheta, phi: newPhi < 0 ? newPhi + 2 * Math.PI : newPhi, r: clampedR };
}

function calcFidelity(initial: BlochState, current: BlochState): number {
  const ix = Math.sin(initial.theta) * Math.cos(initial.phi);
  const iy = Math.sin(initial.theta) * Math.sin(initial.phi);
  const iz = Math.cos(initial.theta);
  const cx = current.r * Math.sin(current.theta) * Math.cos(current.phi);
  const cy = current.r * Math.sin(current.theta) * Math.sin(current.phi);
  const cz = current.r * Math.cos(current.theta);
  return Math.max(0, Math.min(1, 0.5 * (1 + ix * cx + iy * cy + iz * cz)));
}

export function DecoherenceSimulation() {
  const [initialKey, setInitialKey] = useState('plus');
  const [state, setState] = useState<BlochState>({ theta: Math.PI / 2, phi: 0, r: 1 });
  const [params, setParams] = useState<DecoherenceParams>({ t1: 50, t2: 30, temperature: 20 });
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<SimulationSnapshot[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef(state);
  const elapsedRef = useRef(0);

  const initialState: BlochState = { ...INITIAL_STATES[initialKey], r: 1 };

  const resetSim = useCallback(() => {
    setIsRunning(false);
    cancelAnimationFrame(animRef.current);
    const init = { ...INITIAL_STATES[initialKey], r: 1 };
    setState(init);
    stateRef.current = init;
    setElapsed(0);
    elapsedRef.current = 0;
    setHistory([{ time: 0, state: init, fidelity: 1, purity: 1 }]);
  }, [initialKey]);

  useEffect(() => { resetSim(); }, [initialKey, resetSim]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = (now - lastTime) / 1000; // seconds → treat as µs for sim
      lastTime = now;
      const simDt = dt * 10; // speed up simulation 10x

      const newState = applyDecoherence(stateRef.current, simDt, params);
      stateRef.current = newState;
      elapsedRef.current += simDt;

      setState(newState);
      setElapsed(elapsedRef.current);

      if (elapsedRef.current % 2 < simDt) {
        const fidelity = calcFidelity(initialState, newState);
        setHistory(prev => [...prev.slice(-100), {
          time: elapsedRef.current,
          state: { ...newState },
          fidelity,
          purity: newState.r * newState.r,
        }]);
      }

      if (newState.r > 0.01) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setIsRunning(false);
        toast.info('Qubit fully decohered — reached maximally mixed state');
      }
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, params]);

  // Draw Bloch sphere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.38;

    ctx.clearRect(0, 0, w, h);

    // Sphere outline
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Equator ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.3)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    const drawAxis = (x1: number, y1: number, x2: number, y2: number, label: string) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x2 + (x2 > cx ? 12 : x2 < cx ? -12 : 0), y2 + (y2 > cy ? 14 : -8));
    };

    drawAxis(cx, cy - R - 5, cx, cy - R - 5, '|0⟩');
    drawAxis(cx, cy + R + 5, cx, cy + R + 5, '|1⟩');
    // Z axis
    ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.3)'; ctx.lineWidth = 1; ctx.stroke();
    // X axis
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
    ctx.stroke();

    // Draw trail from history
    if (history.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < history.length; i++) {
        const s = history[i].state;
        const px = cx + s.r * R * Math.sin(s.theta) * Math.cos(s.phi);
        const py = cy - s.r * R * Math.cos(s.theta);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'hsl(var(--primary) / 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Bloch vector
    const bx = cx + state.r * R * Math.sin(state.theta) * Math.cos(state.phi);
    const by = cy - state.r * R * Math.cos(state.theta);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tip
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(200, 80%, 60%, ${0.4 + state.r * 0.6})`;
    ctx.fill();

    // Purity ring
    ctx.beginPath();
    ctx.arc(bx, by, 8, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(200, 80%, 60%, ${state.r * 0.6})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Origin dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.5)';
    ctx.fill();

  }, [state, history]);

  const fidelity = calcFidelity(initialState, state);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bloch Sphere */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Atom className="h-5 w-5 text-primary" />
                Bloch Sphere — Decoherence Simulation
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setIsRunning(!isRunning)} variant={isRunning ? 'destructive' : 'default'}>
                  {isRunning ? <><Pause className="h-4 w-4 mr-1" /> Pause</> : <><Play className="h-4 w-4 mr-1" /> Run</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetSim}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <canvas ref={canvasRef} width={500} height={500} className="w-full rounded-lg border border-border bg-card" style={{ maxHeight: 420 }} />

            {/* State info */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold font-mono text-primary">{(fidelity * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-muted-foreground">Fidelity</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold font-mono text-amber-500">{(state.r * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-muted-foreground">Purity (r)</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold font-mono text-blue-500">{elapsed.toFixed(1)}</div>
                <div className="text-[10px] text-muted-foreground">Time (µs)</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold font-mono text-green-500">{(state.theta / Math.PI * 180).toFixed(0)}°</div>
                <div className="text-[10px] text-muted-foreground">θ Angle</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Timer className="h-4 w-4" /> Decoherence Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">T₁ (Amplitude)</span>
                  <span className="font-mono">{params.t1} µs</span>
                </div>
                <Slider value={[params.t1]} min={5} max={200} step={5}
                  onValueChange={([v]) => setParams(p => ({ ...p, t1: v }))} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">T₂ (Phase)</span>
                  <span className="font-mono">{params.t2} µs</span>
                </div>
                <Slider value={[params.t2]} min={5} max={200} step={5}
                  onValueChange={([v]) => setParams(p => ({ ...p, t2: Math.min(v, p.t1 * 2) }))} />
                <p className="text-[10px] text-muted-foreground mt-1">T₂ ≤ 2·T₁ (physical constraint)</p>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className="font-mono">{params.temperature} mK</span>
                </div>
                <Slider value={[params.temperature]} min={5} max={100} step={5}
                  onValueChange={([v]) => setParams(p => ({ ...p, temperature: v }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" /> Initial State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(INITIAL_STATES).map(([key, val]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={initialKey === key ? 'default' : 'outline'}
                  className="w-full justify-start text-xs"
                  onClick={() => setInitialKey(key)}
                  disabled={isRunning}
                >
                  {val.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Fidelity Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Fidelity Decay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24 flex items-end gap-[2px]">
                {history.slice(-60).map((snap, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all"
                    style={{
                      height: `${snap.fidelity * 100}%`,
                      backgroundColor: `hsl(var(--primary) / ${0.3 + snap.fidelity * 0.7})`,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0 µs</span>
                <span>{elapsed.toFixed(0)} µs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
