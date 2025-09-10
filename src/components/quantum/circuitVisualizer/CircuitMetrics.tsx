
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, GitBranch, GitMerge } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CircuitMetricsProps {
  circuit: {
    gates: any[];
    depth: number;
    fidelity: number;
  };
  optimizationResults?: {
    improvements: {
      gateReduction: number;
      depthReduction: number;
      fidelityImprovement: number;
      coherenceImprovement: number;
    };
  };
  isOptimized: boolean;
  complexity: 'low' | 'medium' | 'high';
}

export function CircuitMetrics({ circuit, optimizationResults, isOptimized, complexity }: CircuitMetricsProps) {
  // Calculate metrics
  const gateCount = circuit.gates.length;
  const circuitDepth = circuit.depth;
  const circuitFidelity = circuit.fidelity;
  
  // Calculate gate types distribution
  const gateTypes = new Map<string, number>();
  circuit.gates.forEach(gate => {
    const type = gate.type;
    gateTypes.set(type, (gateTypes.get(type) || 0) + 1);
  });
  
  // Convert to array for rendering
  const gateDistribution = Array.from(gateTypes.entries()).map(([type, count]) => ({
    type,
    count,
    percentage: (count / gateCount) * 100
  }));
  
  // Calculate estimated execution time (simplified model)
  const estimatedTimeMs = circuitDepth * 20 + gateCount * 5;
  
  // Calculate quantum resource cost (simplified model)
  const resourceCost = Math.ceil(circuitDepth * 0.7 + gateCount * 0.3);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-gray-900/30 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-400" />
            Circuit Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Circuit Fidelity</span>
                <span className={
                  circuitFidelity > 0.9 ? "text-green-400" :
                  circuitFidelity > 0.7 ? "text-yellow-400" :
                  "text-red-400"
                }>{(circuitFidelity * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={circuitFidelity * 100} 
                className="h-1.5" 
                color={
                  circuitFidelity > 0.9 ? "bg-green-500" :
                  circuitFidelity > 0.7 ? "bg-yellow-500" :
                  "bg-red-500"
                }
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Execution Efficiency</span>
                <span className="text-blue-400">
                  {isOptimized ? "Optimized" : "Unoptimized"}
                </span>
              </div>
              <Progress 
                value={isOptimized ? 85 : 50} 
                className="h-1.5"
                color="bg-blue-500"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Circuit Depth</span>
                <span className="text-purple-400">{circuitDepth} layers</span>
              </div>
              <Progress 
                value={Math.min((circuitDepth / 20) * 100, 100)} 
                className="h-1.5" 
                color="bg-purple-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-800/50 p-2 rounded-md">
              <div className="text-gray-400">Gates</div>
              <div className="font-medium">{gateCount}</div>
            </div>
            
            <div className="bg-gray-800/50 p-2 rounded-md">
              <div className="text-gray-400">Estimated Time</div>
              <div className="font-medium">{estimatedTimeMs < 1000 ? `${estimatedTimeMs} μs` : `${(estimatedTimeMs / 1000).toFixed(2)} ms`}</div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-2 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400">Complexity Rating</span>
              <Badge className={
                complexity === 'high' ? "bg-red-900/50 text-red-300" :
                complexity === 'medium' ? "bg-yellow-900/50 text-yellow-300" :
                "bg-green-900/50 text-green-300"
              }>
                {complexity === 'high' ? "High" : 
                 complexity === 'medium' ? "Medium" : "Low"}
              </Badge>
            </div>
            <div className="text-gray-500">
              Resource cost: {resourceCost} quantum units
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900/30 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <GitBranch className="h-4 w-4 mr-2 text-green-400" />
            Gate Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="space-y-3 mb-4">
            {gateDistribution.slice(0, 5).map(gate => (
              <div key={gate.type}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">{gate.type} Gate</span>
                  <span>{gate.count} ({gate.percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={
                      gate.type === 'H' ? "bg-purple-500" :
                      gate.type === 'X' ? "bg-red-500" :
                      gate.type === 'CNOT' ? "bg-green-500" :
                      gate.type === 'Y' ? "bg-yellow-500" :
                      "bg-blue-500"
                    }
                    style={{ width: `${gate.percentage}%`, height: '100%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          {isOptimized && optimizationResults && (
            <div className="bg-gray-800/50 p-2 rounded-md">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                <div>Optimization Results</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-gray-400">Gate Reduction</div>
                  <div className="text-green-400">-{optimizationResults.improvements.gateReduction}</div>
                </div>
                <div>
                  <div className="text-gray-400">Depth Improvement</div>
                  <div className="text-green-400">-{optimizationResults.improvements.depthReduction}</div>
                </div>
              </div>
            </div>
          )}
          
          {!isOptimized && (
            <div className="bg-blue-900/20 border border-blue-500/20 p-2 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 mr-2 shrink-0" />
                <div>
                  <div>Circuit is not optimized</div>
                  <div className="text-gray-400 mt-1">Run the optimizer to improve circuit performance</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
