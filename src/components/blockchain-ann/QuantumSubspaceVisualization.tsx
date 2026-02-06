import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Layers, Cpu, Lock, Zap, Activity } from 'lucide-react';

interface SubspaceData {
  id: string;
  dimension: number;
  qubits: number;
  compressionRatio: number;
  securityLevel: 'standard' | 'enhanced' | 'maximum';
  active: boolean;
  utilization?: number;
}

interface QuantumSubspaceVisualizationProps {
  subspaces: SubspaceData[];
  title?: string;
}

export function QuantumSubspaceVisualization({ 
  subspaces, 
  title = "Quantum Subspace Architecture" 
}: QuantumSubspaceVisualizationProps) {
  const totalQubits = subspaces.reduce((sum, s) => sum + s.qubits, 0);
  const avgCompression = subspaces.reduce((sum, s) => sum + s.compressionRatio, 0) / Math.max(subspaces.length, 1);
  const activeSubspaces = subspaces.filter(s => s.active).length;

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'maximum': return 'text-green-500 border-green-500';
      case 'enhanced': return 'text-blue-500 border-blue-500';
      default: return 'text-yellow-500 border-yellow-500';
    }
  };

  const getDimensionWidth = (dimension: number) => {
    const maxDimension = Math.max(...subspaces.map(s => s.dimension), 1);
    return (dimension / maxDimension) * 100;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {title}
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <Cpu className="h-3 w-3 mr-1" />
              {totalQubits} Qubits
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {avgCompression.toFixed(1)}x Compression
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Subspace Hierarchy Visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Active Subspaces: {activeSubspaces}/{subspaces.length}
            </span>
            <Activity className="h-4 w-4 text-primary animate-pulse" />
          </div>

          {/* Visual Representation */}
          <div className="relative space-y-3 py-4">
            {subspaces.map((subspace, idx) => (
              <div 
                key={subspace.id} 
                className="relative"
                style={{ marginLeft: `${idx * 10}px` }}
              >
                <div 
                  className={`p-3 rounded-lg border-2 transition-all ${
                    subspace.active 
                      ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/40' 
                      : 'bg-muted/50 border-muted'
                  }`}
                  style={{ width: `${getDimensionWidth(subspace.dimension)}%`, minWidth: '200px' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        subspace.active ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
                      }`} />
                      <span className="text-xs font-medium truncate max-w-[150px]">
                        {subspace.id.replace('subspace-', '').split('-')[0]}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSecurityColor(subspace.securityLevel)}`}
                    >
                      <Lock className="h-2 w-2 mr-1" />
                      {subspace.securityLevel}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-1 rounded bg-background/50">
                      <div className="font-mono text-primary">{subspace.dimension}D</div>
                      <div className="text-muted-foreground text-[10px]">Dimension</div>
                    </div>
                    <div className="text-center p-1 rounded bg-background/50">
                      <div className="font-mono text-blue-500">{subspace.qubits}</div>
                      <div className="text-muted-foreground text-[10px]">Qubits</div>
                    </div>
                    <div className="text-center p-1 rounded bg-background/50">
                      <div className="font-mono text-orange-500">{subspace.compressionRatio.toFixed(1)}x</div>
                      <div className="text-muted-foreground text-[10px]">Compress</div>
                    </div>
                  </div>

                  {subspace.utilization !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-mono">{subspace.utilization}%</span>
                      </div>
                      <Progress value={subspace.utilization} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Connection Line */}
                {idx < subspaces.length - 1 && (
                  <div className="absolute left-4 -bottom-3 w-0.5 h-3 bg-gradient-to-b from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 justify-center text-xs mt-4 pt-4 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500" />
              <span>Maximum Security</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500" />
              <span>Enhanced</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500" />
              <span>Standard</span>
            </div>
          </div>
        </div>

        {/* Key Advantages */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-xs font-medium text-green-500 mb-1">Resource Savings</div>
            <div className="text-lg font-bold">33%</div>
            <div className="text-xs text-muted-foreground">Qubit reduction vs full space</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-xs font-medium text-blue-500 mb-1">Training Speed</div>
            <div className="text-lg font-bold">3x</div>
            <div className="text-xs text-muted-foreground">Faster in subspaces</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="text-xs font-medium text-purple-500 mb-1">Circuit Depth</div>
            <div className="text-lg font-bold">50%</div>
            <div className="text-xs text-muted-foreground">Gate count reduction</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="text-xs font-medium text-orange-500 mb-1">Memory</div>
            <div className="text-lg font-bold">10x</div>
            <div className="text-xs text-muted-foreground">State compression</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
