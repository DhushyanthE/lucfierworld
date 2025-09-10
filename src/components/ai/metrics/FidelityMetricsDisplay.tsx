
import React from 'react';
import { Loader2 } from 'lucide-react';
import { FidelityMetric } from './types';

interface FidelityMetricsDisplayProps {
  fidelityMetrics: FidelityMetric[];
  isLoading: boolean;
}

export function FidelityMetricsDisplay({ fidelityMetrics, isLoading }: FidelityMetricsDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin mb-4" />
        <p className="text-sm text-gray-400">Calculating quantum metrics...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fidelityMetrics.map((metric, index) => (
        <div key={index} className="bg-gray-900/50 rounded-lg p-4 space-y-2 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium flex items-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
              {metric.name}
            </h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                metric.value >= metric.threshold
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-orange-900/30 text-orange-400'
              }`}
            >
              {metric.value.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full ${
                metric.value >= metric.threshold
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-400'
              }`}
              style={{
                width: `${Math.min(100, metric.value)}%`
              }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>0%</span>
            <span className="text-xs text-white px-1.5 py-0.5 rounded bg-gray-800">Threshold: {metric.threshold}%</span>
            <span>100%</span>
          </div>
          
          <p className="text-xs text-gray-500">{metric.description}</p>
        </div>
      ))}
    </div>
  );
}
