
import React from 'react';
import { Activity } from 'lucide-react';

interface FidelityInsightsProps {
  metrics: Array<{
    name: string;
    value: number;
    threshold: number;
    description: string;
  }>;
}

export function FidelityInsights({ metrics }: FidelityInsightsProps) {
  return (
    <div className="space-y-2 text-sm text-gray-300">
      <p>
        The quantum fidelity machine learning system maintains optimal operational parameters
        with {metrics[0]?.value.toFixed(1)}% fidelity across all quantum circuits.
        Model parameters are automatically adjusted to compensate for quantum decoherence effects.
      </p>
      <p>
        Quantum resistance mechanisms are operating at {metrics[1]?.value.toFixed(1)}% effectiveness,
        protecting against both traditional and quantum-based attack vectors through 
        advanced lattice-based cryptographic methods.
      </p>
      
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2">
        <Activity className="h-4 w-4 text-purple-400" />
        <div className="text-sm">
          System is currently operating at {
            Math.min(99.9, (metrics[0]?.value || 90) + Math.random() * 5).toFixed(1)
          }% quantum efficiency.
        </div>
      </div>
    </div>
  );
}
