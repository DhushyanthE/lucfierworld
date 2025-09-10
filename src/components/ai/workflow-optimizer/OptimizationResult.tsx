
import React from 'react';
import { Zap } from 'lucide-react';

interface OptimizationResultProps {
  result: {
    originalExecutionTime: number;
    optimizedExecutionTime: number;
    timeReductionPercentage: number;
    quantumSpeedup: number;
    parallelizationFactor: number;
  } | null;
}

export function OptimizationResult({ result }: OptimizationResultProps) {
  if (!result) return null;
  
  return (
    <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
      <h3 className="text-sm font-medium text-purple-300 flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4" />
        Optimization Results
      </h3>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-black/30 p-2 rounded flex flex-col">
          <span className="text-gray-400">Original Time</span>
          <span className="text-white">{result.originalExecutionTime.toFixed(1)}ms</span>
        </div>
        <div className="bg-black/30 p-2 rounded flex flex-col">
          <span className="text-gray-400">Optimized Time</span>
          <span className="text-green-400">{result.optimizedExecutionTime.toFixed(1)}ms</span>
        </div>
        <div className="bg-black/30 p-2 rounded flex flex-col">
          <span className="text-gray-400">Time Reduction</span>
          <span className="text-purple-300">{result.timeReductionPercentage.toFixed(1)}%</span>
        </div>
        <div className="bg-black/30 p-2 rounded flex flex-col">
          <span className="text-gray-400">Quantum Speedup</span>
          <span className="text-purple-300">{result.quantumSpeedup.toFixed(2)}x</span>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-purple-200/80">
        Workflow optimized with {result.parallelizationFactor.toFixed(2)}x 
        parallelization factor, utilizing quantum speedup where possible.
      </div>
    </div>
  );
}
