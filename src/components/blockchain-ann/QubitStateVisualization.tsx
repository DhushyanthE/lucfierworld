/**
 * Qubit State Visualization
 * Animated representations of superposition and entanglement states
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Atom, Play, Pause, RefreshCw, Zap, 
  Circle, ArrowUpDown, RotateCcw
} from 'lucide-react';

interface QubitState {
  id: number;
  alpha: number; // |0⟩ amplitude
  beta: number;  // |1⟩ amplitude
  phase: number;
  isEntangled: boolean;
  entangledWith: number | null;
  measurementResult: '0' | '1' | null;
}

const generateQubitPair = (id1: number, id2: number): [QubitState, QubitState] => {
  const alpha = Math.random();
  const beta = Math.sqrt(1 - alpha * alpha);
  
  return [
    {
      id: id1,
      alpha,
      beta,
      phase: Math.random() * 2 * Math.PI,
      isEntangled: true,
      entangledWith: id2,
      measurementResult: null
    },
    {
      id: id2,
      alpha: beta, // Bell state: correlated
      beta: alpha,
      phase: Math.random() * 2 * Math.PI,
      isEntangled: true,
      entangledWith: id1,
      measurementResult: null
    }
  ];
};

function BlochSphere({ qubit, size = 150, animate = true }: { 
  qubit: QubitState; 
  size?: number;
  animate?: boolean;
}) {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [animate]);

  // Calculate Bloch sphere coordinates
  const theta = Math.acos(2 * qubit.alpha * qubit.alpha - 1);
  const phi = qubit.phase;
  
  const x = Math.sin(theta) * Math.cos(phi + rotation * 0.02);
  const y = Math.sin(theta) * Math.sin(phi + rotation * 0.02);
  const z = Math.cos(theta);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  // Project 3D to 2D
  const projX = centerX + x * radius * 0.7;
  const projY = centerY - z * radius + y * radius * 0.3;

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Sphere outline */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={radius}
        ry={radius * 0.3}
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1}
        strokeDasharray="3,3"
        opacity={0.5}
      />
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1}
        opacity={0.3}
      />
      
      {/* Axes */}
      <line
        x1={centerX}
        y1={centerY - radius}
        x2={centerX}
        y2={centerY + radius}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1}
        opacity={0.5}
      />
      <text x={centerX + 5} y={centerY - radius + 15} className="fill-muted-foreground text-xs">|0⟩</text>
      <text x={centerX + 5} y={centerY + radius - 5} className="fill-muted-foreground text-xs">|1⟩</text>

      {/* Entanglement glow */}
      {qubit.isEntangled && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 10}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeDasharray="5,5"
          opacity={0.5 + 0.3 * Math.sin(rotation * 0.05)}
          className="animate-pulse"
        />
      )}

      {/* State vector */}
      <line
        x1={centerX}
        y1={centerY}
        x2={projX}
        y2={projY}
        stroke={qubit.measurementResult ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
        strokeWidth={3}
      />
      
      {/* State point */}
      <circle
        cx={projX}
        cy={projY}
        r={8}
        fill={qubit.measurementResult ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
        className={animate && !qubit.measurementResult ? 'animate-pulse' : ''}
      />

      {/* Measurement result indicator */}
      {qubit.measurementResult && (
        <text
          x={centerX}
          y={centerY + radius + 20}
          textAnchor="middle"
          className="fill-foreground text-lg font-bold"
        >
          |{qubit.measurementResult}⟩
        </text>
      )}
    </svg>
  );
}

function SuperpositionBar({ qubit }: { qubit: QubitState }) {
  const prob0 = qubit.alpha * qubit.alpha * 100;
  const prob1 = qubit.beta * qubit.beta * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-8 text-xs font-mono">|0⟩</span>
        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${prob0}%` }}
          />
        </div>
        <span className="w-12 text-xs font-mono text-right">{prob0.toFixed(1)}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-8 text-xs font-mono">|1⟩</span>
        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${prob1}%` }}
          />
        </div>
        <span className="w-12 text-xs font-mono text-right">{prob1.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function QubitStateVisualization() {
  const [qubits, setQubits] = useState<QubitState[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [qubitCount, setQubitCount] = useState(4);
  const [showBlochSphere, setShowBlochSphere] = useState(true);
  const animationRef = useRef<number>();

  // Initialize qubits
  useEffect(() => {
    const newQubits: QubitState[] = [];
    for (let i = 0; i < qubitCount; i += 2) {
      const [q1, q2] = generateQubitPair(i, i + 1);
      newQubits.push(q1, q2);
    }
    setQubits(newQubits);
  }, [qubitCount]);

  // Animation loop for phase evolution
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = () => {
      setQubits(prev => prev.map(q => ({
        ...q,
        phase: q.measurementResult ? q.phase : (q.phase + 0.02) % (2 * Math.PI)
      })));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating]);

  const measureQubit = (qubitId: number) => {
    setQubits(prev => {
      const qubit = prev.find(q => q.id === qubitId);
      if (!qubit || qubit.measurementResult) return prev;

      // Probabilistic measurement
      const result: '0' | '1' = Math.random() < qubit.alpha * qubit.alpha ? '0' : '1';

      return prev.map(q => {
        if (q.id === qubitId) {
          return { ...q, measurementResult: result };
        }
        // Collapse entangled partner
        if (q.entangledWith === qubitId && qubit.isEntangled) {
          // Bell state correlation: opposite result
          return { ...q, measurementResult: result === '0' ? '1' : '0' };
        }
        return q;
      });
    });
  };

  const resetQubits = () => {
    const newQubits: QubitState[] = [];
    for (let i = 0; i < qubitCount; i += 2) {
      const [q1, q2] = generateQubitPair(i, i + 1);
      newQubits.push(q1, q2);
    }
    setQubits(newQubits);
  };

  const applyHadamard = (qubitId: number) => {
    setQubits(prev => prev.map(q => {
      if (q.id !== qubitId || q.measurementResult) return q;
      
      // Hadamard transformation
      const newAlpha = (q.alpha + q.beta) / Math.sqrt(2);
      const newBeta = (q.alpha - q.beta) / Math.sqrt(2);
      
      return {
        ...q,
        alpha: Math.abs(newAlpha),
        beta: Math.abs(newBeta),
        phase: q.phase + Math.PI / 4
      };
    }));
  };

  const entangledPairs = qubits.filter(q => q.isEntangled && q.entangledWith !== null && q.id < (q.entangledWith || 0)).length;
  const measuredQubits = qubits.filter(q => q.measurementResult !== null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <Atom className="h-6 w-6 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <CardTitle>Qubit State Visualization</CardTitle>
                <CardDescription>
                  Superposition and entanglement states with Bloch sphere representation
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{qubits.length} Qubits</Badge>
              <Badge variant="outline">{entangledPairs} Entangled Pairs</Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAnimating(!isAnimating)}
              >
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={resetQubits}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Qubit Count: {qubitCount}</Label>
              <Slider
                value={[qubitCount]}
                onValueChange={([val]) => setQubitCount(val % 2 === 0 ? val : val + 1)}
                min={2}
                max={8}
                step={2}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Label>Show Bloch Spheres</Label>
              <Switch checked={showBlochSphere} onCheckedChange={setShowBlochSphere} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Measured Qubits</p>
              <p className="text-2xl font-bold">{measuredQubits}/{qubits.length}</p>
            </div>
            <Button variant="outline" onClick={resetQubits}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Qubit Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {qubits.map((qubit) => (
          <Card 
            key={qubit.id}
            className={`transition-all ${
              qubit.measurementResult 
                ? 'border-destructive/50 bg-destructive/5' 
                : qubit.isEntangled 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-border'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Atom className="h-4 w-4" />
                  Qubit {qubit.id + 1}
                </CardTitle>
                {qubit.isEntangled && (
                  <Badge variant="outline" className="text-xs">
                    ⟷ Q{(qubit.entangledWith || 0) + 1}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bloch Sphere */}
              {showBlochSphere && (
                <BlochSphere 
                  qubit={qubit} 
                  size={120} 
                  animate={isAnimating && !qubit.measurementResult} 
                />
              )}

              {/* Probability Bars */}
              <SuperpositionBar qubit={qubit} />

              {/* State Vector */}
              <div className="text-center font-mono text-xs bg-muted p-2 rounded">
                {qubit.measurementResult ? (
                  <span className="text-destructive">
                    Collapsed: |{qubit.measurementResult}⟩
                  </span>
                ) : (
                  <>
                    {qubit.alpha.toFixed(2)}|0⟩ + {qubit.beta.toFixed(2)}e<sup>iφ</sup>|1⟩
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => measureQubit(qubit.id)}
                  disabled={!!qubit.measurementResult}
                >
                  <Circle className="h-3 w-3 mr-1" />
                  Measure
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => applyHadamard(qubit.id)}
                  disabled={!!qubit.measurementResult}
                >
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  H Gate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Entanglement Correlation Display */}
      {measuredQubits > 0 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Entanglement Correlation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {qubits.filter(q => q.measurementResult).map(q => (
                <div key={q.id} className="p-4 rounded-lg bg-background text-center">
                  <p className="text-xs text-muted-foreground mb-1">Qubit {q.id + 1}</p>
                  <p className="text-3xl font-bold font-mono">|{q.measurementResult}⟩</p>
                  {q.entangledWith !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Entangled with Q{q.entangledWith + 1}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
