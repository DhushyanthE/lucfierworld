
import React from 'react';
import { FidelityMetricsDisplay } from './FidelityMetricsDisplay';
import { FidelityMetric } from './types';
import { Activity } from 'lucide-react';

interface FidelityTabContentProps {
  fidelityMetrics: FidelityMetric[];
  isLoading: boolean;
}

export function FidelityTabContent({ fidelityMetrics, isLoading }: FidelityTabContentProps) {
  // Calculate average fidelity score
  const averageFidelity = fidelityMetrics.length > 0
    ? fidelityMetrics.reduce((sum, metric) => sum + metric.value, 0) / fidelityMetrics.length
    : 0;
  
  // Count metrics above threshold
  const metricsAboveThreshold = fidelityMetrics.filter(metric => metric.value >= metric.threshold).length;
  
  return (
    <div className="space-y-4">
      <div className="bg-purple-900/20 text-purple-300 p-4 rounded-md text-sm border border-purple-500/20">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-purple-400 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Quantum Fidelity Metrics</h4>
            <p className="text-xs">
              Quantum fidelity metrics represent the reliability and accuracy of quantum operations 
              in the system. Higher values indicate better quantum circuit performance.
            </p>
          </div>
        </div>
        
        {fidelityMetrics.length > 0 && !isLoading && (
          <div className="grid grid-cols-2 gap-4 mt-4 bg-purple-950/30 p-3 rounded-md">
            <div className="text-center">
              <div className="text-xs text-purple-300 mb-1">Average Fidelity</div>
              <div className="text-xl font-bold text-white">
                {averageFidelity.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-purple-300 mb-1">Metrics Above Threshold</div>
              <div className="text-xl font-bold text-white">
                {metricsAboveThreshold}/{fidelityMetrics.length}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <FidelityMetricsDisplay fidelityMetrics={fidelityMetrics} isLoading={isLoading} />
    </div>
  );
}
