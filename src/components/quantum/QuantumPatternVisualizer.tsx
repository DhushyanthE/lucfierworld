/**
 * Quantum Pattern Visualizer
 * 
 * Interactive visualization component for 15 quantum patterns
 * scaled from the 150-qubit system.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Atom, 
  Zap, 
  TrendingUp, 
  Activity,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

export interface QuantumState {
  id: number;
  binaryState: string;
  amplitude: number;
  probability: number;
  scalingFactor: number;
  isActive: boolean;
  phase: number;
}

interface QuantumPatternVisualizerProps {
  patterns?: QuantumState[];
  autoAnimate?: boolean;
  onPatternSelect?: (pattern: QuantumState) => void;
}

export function QuantumPatternVisualizer({ 
  patterns: providedPatterns,
  autoAnimate = true,
  onPatternSelect 
}: QuantumPatternVisualizerProps) {
  const [patterns, setPatterns] = useState<QuantumState[]>([]);
  const [isAnimating, setIsAnimating] = useState(autoAnimate);
  const [selectedPattern, setSelectedPattern] = useState<QuantumState | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Initialize quantum patterns
  useEffect(() => {
    if (providedPatterns) {
      setPatterns(providedPatterns.map(p => ({ ...p, phase: 0 })));
    } else {
      // Generate default 15 quantum states
      const defaultPatterns: QuantumState[] = [];
      for (let i = 0; i < 15; i++) {
        const binaryState = i.toString(2).padStart(4, '0');
        const amplitude = Math.cos(Math.PI * i / 30);
        const probability = Math.pow(amplitude, 2) / 15;
        
        defaultPatterns.push({
          id: i,
          binaryState,
          amplitude,
          probability,
          scalingFactor: 15,
          isActive: false,
          phase: 0
        });
      }
      setPatterns(defaultPatterns);
    }
  }, [providedPatterns]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
      
      setPatterns(prev => prev.map(pattern => ({
        ...pattern,
        phase: (pattern.phase + 2 + pattern.id * 0.5) % 360,
        amplitude: Math.cos((animationPhase + pattern.id * 24) * Math.PI / 180),
        probability: Math.pow(Math.abs(Math.cos((animationPhase + pattern.id * 24) * Math.PI / 180)), 2) / 15
      })));
    }, 100);

    return () => clearInterval(interval);
  }, [isAnimating, animationPhase]);

  // Handle pattern selection
  const handlePatternClick = (pattern: QuantumState) => {
    setSelectedPattern(pattern);
    setPatterns(prev => prev.map(p => ({
      ...p,
      isActive: p.id === pattern.id
    })));
    onPatternSelect?.(pattern);
  };

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(prev => !prev);
  };

  // Reset patterns
  const resetPatterns = () => {
    setAnimationPhase(0);
    setSelectedPattern(null);
    setPatterns(prev => prev.map(p => ({
      ...p,
      isActive: false,
      phase: 0
    })));
  };

  // Render quantum state visualization
  const renderQuantumState = (pattern: QuantumState) => {
    const intensity = Math.abs(pattern.amplitude);
    const hue = (pattern.phase + pattern.id * 24) % 360;
    const opacity = 0.3 + intensity * 0.7;
    
    return (
      <Card 
        key={pattern.id}
        className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
          pattern.isActive ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => handlePatternClick(pattern)}
        style={{
          backgroundColor: `hsla(${hue}, 70%, 50%, ${opacity * 0.1})`,
          borderColor: `hsla(${hue}, 70%, 50%, ${opacity * 0.5})`
        }}
      >
        <CardContent className="p-4 text-center relative">
          {/* Quantum state notation */}
          <div className="text-lg font-mono font-bold text-primary mb-2">
            |{pattern.binaryState}⟩
          </div>
          
          {/* Visual representation */}
          <div className="relative w-16 h-16 mx-auto mb-3">
            <div 
              className="absolute inset-0 rounded-full border-2 transition-all duration-300"
              style={{
                borderColor: `hsl(${hue}, 70%, 50%)`,
                transform: `rotate(${pattern.phase}deg) scale(${0.5 + intensity * 0.5})`,
                boxShadow: `0 0 ${intensity * 20}px hsla(${hue}, 70%, 50%, ${opacity})`
              }}
            >
              <div 
                className="absolute w-2 h-2 bg-primary rounded-full top-0 left-1/2 transform -translate-x-1/2 -translate-y-1"
                style={{
                  backgroundColor: `hsl(${hue}, 70%, 50%)`,
                }}
              />
            </div>
            
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: `hsl(${hue}, 70%, 50%)`,
                  opacity: intensity
                }}
              />
            </div>
          </div>
          
          {/* Pattern info */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              Pattern {pattern.id}
            </div>
            <div className="text-xs text-muted-foreground">
              15x Scale
            </div>
            <Progress 
              value={pattern.probability * 1000} 
              className="h-1"
            />
            <div className="text-xs text-muted-foreground">
              P = {pattern.probability.toFixed(4)}
            </div>
          </div>
          
          {/* Active indicator */}
          {pattern.isActive && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Atom className="h-5 w-5" />
            <span>Quantum Pattern Visualizer</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Interactive visualization of 15 scaled quantum states from 150-qubit system
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAnimation}
          >
            {isAnimating ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Animate
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetPatterns}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Pattern grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {patterns.map(renderQuantumState)}
      </div>

      {/* Selected pattern details */}
      {selectedPattern && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Pattern {selectedPattern.id} Details</span>
            </CardTitle>
            <CardDescription>
              Quantum state |{selectedPattern.binaryState}⟩ analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Amplitude</div>
                <div className="text-lg font-bold">
                  {selectedPattern.amplitude.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Probability</div>
                <div className="text-lg font-bold">
                  {selectedPattern.probability.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phase</div>
                <div className="text-lg font-bold">
                  {selectedPattern.phase.toFixed(0)}°
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Scaling</div>
                <div className="text-lg font-bold">
                  {selectedPattern.scalingFactor}x
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Binary State:</span>
                <Badge variant="secondary" className="font-mono">
                  {selectedPattern.binaryState}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <Badge variant={selectedPattern.isActive ? "default" : "outline"}>
                  {selectedPattern.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animation info */}
      {isAnimating && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Activity className="h-5 w-5 text-primary animate-spin" />
              <div className="flex-1">
                <div className="text-sm font-medium">Animation Active</div>
                <div className="text-xs text-muted-foreground">
                  Quantum states are evolving in real-time
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">
                  Phase: {animationPhase}°
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}