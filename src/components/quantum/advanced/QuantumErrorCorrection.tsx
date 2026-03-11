/**
 * Quantum Error Correction - Surface Codes & Stabilizer Measurements
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, AlertTriangle, CheckCircle, Play, RotateCcw, Grid3X3, Zap, Activity } from 'lucide-react';

type NoiseModel = 'simple' | 'depolarizing' | 'amplitude-damping' | 'phase-damping';
type QubitType = 'data' | 'x-stabilizer' | 'z-stabilizer';
type ErrorType = 'none' | 'bit-flip' | 'phase-flip' | 'both';

interface SurfaceQubit {
  row: number;
  col: number;
  type: QubitType;
  error: ErrorType;
  measured: boolean;
  syndrome: boolean;
  corrected: boolean;
}

interface StabilizerResult {
  id: string;
  type: 'X' | 'Z';
  position: [number, number];
  eigenvalue: 1 | -1;
  neighborQubits: [number, number][];
  timestamp: number;
}

interface CorrectionRound {
  round: number;
  syndromeMap: boolean[][];
  errorsDetected: number;
  errorsCorrected: number;
  fidelity: number;
  logicalError: boolean;
}

const GRID_SIZE = 5;

function initSurfaceCode(size: number): SurfaceQubit[][] {
  const grid: SurfaceQubit[][] = [];
  for (let r = 0; r < size * 2 - 1; r++) {
    const row: SurfaceQubit[] = [];
    for (let c = 0; c < size * 2 - 1; c++) {
      const isDataQubit = (r + c) % 2 === 0;
      const isXStab = !isDataQubit && r % 2 === 1;
      row.push({
        row: r, col: c,
        type: isDataQubit ? 'data' : isXStab ? 'x-stabilizer' : 'z-stabilizer',
        error: 'none', measured: false, syndrome: false, corrected: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

export function QuantumErrorCorrection() {
  const [grid, setGrid] = useState<SurfaceQubit[][]>(() => initSurfaceCode(GRID_SIZE));
  const [stabilizers, setStabilizers] = useState<StabilizerResult[]>([]);
  const [rounds, setRounds] = useState<CorrectionRound[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [errorRate, setErrorRate] = useState('0.05');
  const [currentRound, setCurrentRound] = useState(0);
  const [autoCorrect, setAutoCorrect] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const injectErrors = useCallback(() => {
    const rate = parseFloat(errorRate);
    setGrid(prev => prev.map(row => row.map(q => {
      if (q.type !== 'data') return { ...q, error: 'none' as ErrorType, measured: false, syndrome: false, corrected: false };
      const rand = Math.random();
      let error: ErrorType = 'none';
      if (rand < rate) error = 'bit-flip';
      else if (rand < rate * 1.5) error = 'phase-flip';
      else if (rand < rate * 1.8) error = 'both';
      return { ...q, error, measured: false, syndrome: false, corrected: false };
    })));
  }, [errorRate]);

  const measureStabilizers = useCallback(() => {
    const newStabilizers: StabilizerResult[] = [];
    setGrid(prev => {
      const updated = prev.map(row => [...row.map(q => ({ ...q }))]);
      const gridRows = updated.length;
      const gridCols = updated[0]?.length || 0;

      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const q = updated[r][c];
          if (q.type === 'data') continue;
          
          const neighbors: [number, number][] = [];
          const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          let errorCount = 0;
          
          for (const [dr, dc] of deltas) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < gridRows && nc >= 0 && nc < gridCols && updated[nr][nc].type === 'data') {
              neighbors.push([nr, nc]);
              if (updated[nr][nc].error !== 'none') errorCount++;
            }
          }

          const hasSyndrome = errorCount % 2 === 1;
          updated[r][c].measured = true;
          updated[r][c].syndrome = hasSyndrome;

          newStabilizers.push({
            id: `stab-${r}-${c}`,
            type: q.type === 'x-stabilizer' ? 'X' : 'Z',
            position: [r, c],
            eigenvalue: hasSyndrome ? -1 : 1,
            neighborQubits: neighbors,
            timestamp: Date.now(),
          });
        }
      }
      return updated;
    });
    setStabilizers(newStabilizers);
  }, []);

  const correctErrors = useCallback(() => {
    let detected = 0, corrected = 0;
    setGrid(prev => {
      const updated = prev.map(row => [...row.map(q => ({ ...q }))]);
      const gridRows = updated.length;
      const gridCols = updated[0]?.length || 0;

      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          if (updated[r][c].type !== 'data' || updated[r][c].error === 'none') continue;
          detected++;
          // Check if adjacent stabilizers detected syndrome
          const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          let syndromesNearby = 0;
          for (const [dr, dc] of deltas) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < gridRows && nc >= 0 && nc < gridCols && updated[nr][nc].syndrome) {
              syndromesNearby++;
            }
          }
          if (syndromesNearby > 0 && Math.random() > 0.1) {
            updated[r][c].error = 'none';
            updated[r][c].corrected = true;
            corrected++;
          }
        }
      }
      return updated;
    });

    const fidelity = detected > 0 ? corrected / detected : 1;
    const round: CorrectionRound = {
      round: currentRound + 1,
      syndromeMap: grid.map(row => row.map(q => q.syndrome)),
      errorsDetected: detected,
      errorsCorrected: corrected,
      fidelity,
      logicalError: detected > corrected,
    };
    setRounds(prev => [...prev, round]);
    setCurrentRound(prev => prev + 1);
    toast.success(`Round ${round.round}: ${corrected}/${detected} errors corrected (${(fidelity * 100).toFixed(1)}% fidelity)`);
  }, [currentRound, grid]);

  const runFullCycle = useCallback(async () => {
    setIsRunning(true);
    injectErrors();
    await new Promise(r => setTimeout(r, 500));
    measureStabilizers();
    await new Promise(r => setTimeout(r, 500));
    if (autoCorrect) {
      correctErrors();
    }
    setIsRunning(false);
  }, [injectErrors, measureStabilizers, correctErrors, autoCorrect]);

  const reset = () => {
    setGrid(initSurfaceCode(GRID_SIZE));
    setStabilizers([]);
    setRounds([]);
    setCurrentRound(0);
  };

  // Draw surface code on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const rows = grid.length, cols = grid[0]?.length || 0;
    const cellW = w / (cols + 1), cellH = h / (rows + 1);

    // Draw connections
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c + 0.5) * cellW, y = (r + 0.5) * cellH;
        if (c < cols - 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellW, y); ctx.stroke(); }
        if (r < rows - 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellH); ctx.stroke(); }
      }
    }

    // Draw qubits
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const q = grid[r][c];
        const x = (c + 0.5) * cellW, y = (r + 0.5) * cellH;
        const radius = q.type === 'data' ? cellW * 0.3 : cellW * 0.22;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (q.type === 'data') {
          if (q.corrected) ctx.fillStyle = '#22c55e';
          else if (q.error === 'bit-flip') ctx.fillStyle = '#ef4444';
          else if (q.error === 'phase-flip') ctx.fillStyle = '#f59e0b';
          else if (q.error === 'both') ctx.fillStyle = '#dc2626';
          else ctx.fillStyle = '#3b82f6';
        } else {
          ctx.fillStyle = q.syndrome ? '#ef4444' : q.measured ? '#22c55e' : q.type === 'x-stabilizer' ? '#8b5cf680' : '#06b6d480';
        }
        ctx.fill();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(8, cellW * 0.2)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (q.type === 'data') ctx.fillText('D', x, y);
        else ctx.fillText(q.type === 'x-stabilizer' ? 'X' : 'Z', x, y);

        // Syndrome indicator
        if (q.syndrome) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  }, [grid]);

  const totalDataQubits = grid.flat().filter(q => q.type === 'data').length;
  const erroredQubits = grid.flat().filter(q => q.error !== 'none').length;
  const correctedQubits = grid.flat().filter(q => q.corrected).length;
  const syndromeCount = stabilizers.filter(s => s.eigenvalue === -1).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Surface Code Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-primary" />
                Surface Code ({GRID_SIZE}×{GRID_SIZE})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={errorRate} onValueChange={setErrorRate}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.01">1% Error</SelectItem>
                    <SelectItem value="0.05">5% Error</SelectItem>
                    <SelectItem value="0.1">10% Error</SelectItem>
                    <SelectItem value="0.2">20% Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <canvas ref={canvasRef} width={500} height={500} className="w-full rounded-lg border border-border bg-card" style={{ maxHeight: 400 }} />
            <div className="flex gap-2 mt-4">
              <Button onClick={runFullCycle} disabled={isRunning} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run Error Correction Cycle'}
              </Button>
              <Button onClick={injectErrors} variant="outline" disabled={isRunning}>
                <AlertTriangle className="h-4 w-4 mr-1" /> Inject
              </Button>
              <Button onClick={measureStabilizers} variant="outline" disabled={isRunning}>
                <Zap className="h-4 w-4 mr-1" /> Measure
              </Button>
              <Button onClick={correctErrors} variant="outline" disabled={isRunning}>
                <CheckCircle className="h-4 w-4 mr-1" /> Correct
              </Button>
              <Button onClick={reset} variant="ghost" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Data</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Bit-flip</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Phase-flip</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Corrected</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-500/50 inline-block" /> X-Stab</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cyan-500/50 inline-block" /> Z-Stab</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Code Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data Qubits</span>
                <span className="font-mono">{totalDataQubits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Errors</span>
                <span className="font-mono text-destructive">{erroredQubits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Corrected</span>
                <span className="font-mono text-green-500">{correctedQubits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Syndromes Detected</span>
                <span className="font-mono text-amber-500">{syndromeCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Correction Rounds</span>
                <span className="font-mono">{currentRound}</span>
              </div>
              {rounds.length > 0 && (
                <>
                  <Progress value={rounds[rounds.length - 1].fidelity * 100} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Logical Fidelity: {(rounds[rounds.length - 1].fidelity * 100).toFixed(1)}%
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stabilizer Results */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Stabilizer Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {stabilizers.filter(s => s.eigenvalue === -1).length === 0 && stabilizers.length > 0 && (
                  <div className="text-xs text-center text-green-500 py-2">✓ No syndromes detected</div>
                )}
                {stabilizers.filter(s => s.eigenvalue === -1).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-1.5 rounded bg-destructive/10 text-xs">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px] px-1">{s.type}</Badge>
                      <span className="font-mono">({s.position[0]},{s.position[1]})</span>
                    </div>
                    <Badge variant="destructive" className="text-[10px]">-1</Badge>
                  </div>
                ))}
                {stabilizers.length === 0 && (
                  <div className="text-xs text-center text-muted-foreground py-2">Run a cycle to see measurements</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Correction History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Correction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {rounds.map(r => (
                  <div key={r.round} className="flex items-center justify-between p-1.5 rounded bg-muted/50 text-xs">
                    <span>Round {r.round}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">{r.errorsCorrected}/{r.errorsDetected}</span>
                      {r.logicalError ? (
                        <Badge variant="destructive" className="text-[10px]">Logical Error</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-green-500 text-green-500">OK</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {rounds.length === 0 && (
                  <div className="text-xs text-center text-muted-foreground py-2">No rounds yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
