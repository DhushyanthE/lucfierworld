
import React from 'react';
import { Brain, Cpu, BarChart4 } from 'lucide-react';

interface QuantumAIStatsProps {
  optimizationCount: number;
}

export function QuantumAIStats({ optimizationCount }: QuantumAIStatsProps) {
  return (
    <div className="bg-gradient-to-r from-black to-blue-950/20 p-4 rounded-lg border border-blue-500/10">
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Brain className="h-4 w-4 mr-2 text-blue-400" />
        Quantum AI Integration
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Predictions Accuracy</div>
          <div className="text-2xl font-semibold text-white">94.7%</div>
          <div className="text-xs text-gray-500 mt-1">+2.3% with quantum optimization</div>
        </div>
        
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Processing Speed</div>
          <div className="text-2xl font-semibold text-white">378x</div>
          <div className="text-xs text-gray-500 mt-1">faster than classical computing</div>
        </div>
        
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Optimizations</div>
          <div className="text-2xl font-semibold text-white">{optimizationCount}</div>
          <div className="text-xs text-gray-500 mt-1">self-improving algorithms</div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1 mb-1">
          <Cpu className="h-3.5 w-3.5 text-blue-400" />
          <span>Quantum-assisted machine learning models enhance prediction accuracy and processing speed</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart4 className="h-3.5 w-3.5 text-blue-400" />
          <span>Neural networks optimized for complex pattern recognition in multi-dimensional datasets</span>
        </div>
      </div>
    </div>
  );
}
