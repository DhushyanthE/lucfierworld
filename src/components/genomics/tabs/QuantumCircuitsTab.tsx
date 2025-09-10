
import React from 'react';
import { Cpu } from 'lucide-react';
import { EnhancedCircuitVisualizer } from '@/components/quantum/EnhancedCircuitVisualizer';

export function QuantumCircuitsTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Quantum Circuit Configuration</h2>
        </div>
        <p className="text-gray-400 max-w-3xl">
          Customize quantum circuits for genomic data processing with our enhanced visualizer
        </p>
      </div>
      
      <EnhancedCircuitVisualizer />
    </div>
  );
}
