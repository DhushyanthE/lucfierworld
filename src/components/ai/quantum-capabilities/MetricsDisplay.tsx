
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface MetricsDisplayProps {
  agiMetrics: any;
  superAIMetrics: any;
}

export function MetricsDisplay({ agiMetrics, superAIMetrics }: MetricsDisplayProps) {
  // Helper function to safely format numbers with toFixed
  const safeToFixed = (value: any, decimals: number = 2) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return Number(value).toFixed(decimals);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-gray-900/40 rounded-lg p-3 border border-purple-500/10">
        <div className="text-xs text-gray-400 mb-1">AGI Cognitive Capacity</div>
        <div className="text-xl font-semibold text-white">{safeToFixed(agiMetrics.cognitiveCapacity)}</div>
        <Progress value={(agiMetrics.cognitiveCapacity || 0) * 10} className="h-1 mt-2" />
      </div>
      <div className="bg-gray-900/40 rounded-lg p-3 border border-purple-500/10">
        <div className="text-xs text-gray-400 mb-1">Quantum Advantage</div>
        <div className="text-xl font-semibold text-white">{safeToFixed((agiMetrics.quantumAdvantage || 0) * 100, 1)}%</div>
        <Progress value={(agiMetrics.quantumAdvantage || 0) * 100} className="h-1 mt-2" />
      </div>
      <div className="bg-gray-900/40 rounded-lg p-3 border border-purple-500/10">
        <div className="text-xs text-gray-400 mb-1">Super AI IQ</div>
        <div className="text-xl font-semibold text-white">{Math.round(superAIMetrics.intelligenceQuotient || 0)}</div>
        <Progress value={((superAIMetrics.intelligenceQuotient || 0) / 300) * 100} className="h-1 mt-2" />
      </div>
      <div className="bg-gray-900/40 rounded-lg p-3 border border-purple-500/10">
        <div className="text-xs text-gray-400 mb-1">Processing Capacity</div>
        <div className="text-xl font-semibold text-white">{Math.round((superAIMetrics.processingCapacity || 0) / 1000)} TFLOPS</div>
        <Progress value={((superAIMetrics.processingCapacity || 0) / 20000) * 100} className="h-1 mt-2" />
      </div>
    </div>
  );
}
