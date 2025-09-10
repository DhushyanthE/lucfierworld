
import React from 'react';
import { Loader2, Check, AlertCircle, Shield } from 'lucide-react';
import { SecurityMetric } from './types';

interface SecurityMetricsDisplayProps {
  securityMetrics: SecurityMetric[];
  isLoading: boolean;
}

export function SecurityMetricsDisplay({ securityMetrics, isLoading }: SecurityMetricsDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin mb-4" />
        <p className="text-sm text-gray-400">Analyzing quantum security...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {securityMetrics.map((metric, index) => (
        <div 
          key={index} 
          className={`bg-gray-900/50 rounded-lg p-4 border transition-colors hover:border-opacity-50 ${
            metric.isQuantumResistant ? 'border-green-500/20 hover:border-green-500/40' : 'border-orange-500/20 hover:border-orange-500/40'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              metric.isQuantumResistant 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-orange-900/30 text-orange-400'
            }`}>
              {metric.isQuantumResistant ? (
                <Shield className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{metric.algorithm}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  metric.resistanceScore >= 90
                    ? 'bg-green-900/30 text-green-400'
                    : metric.resistanceScore >= 75
                    ? 'bg-blue-900/30 text-blue-400'
                    : 'bg-orange-900/30 text-orange-400'
                }`}>
                  {metric.resistanceScore.toFixed(1)}% Resistant
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-gray-800/50 p-2 rounded">
                  <span className="text-xs text-gray-500 block">Key Size</span>
                  <p className="text-sm font-medium">{metric.keySize} bits</p>
                </div>
                <div className="bg-gray-800/50 p-2 rounded">
                  <span className="text-xs text-gray-500 block">Est. Qubits to Break</span>
                  <p className="text-sm font-medium">{metric.qubitEstimate.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-2.5 mt-3 overflow-hidden">
                <div
                  className={`h-full ${
                    metric.resistanceScore >= 90
                      ? 'bg-gradient-to-r from-green-500 to-green-400'
                      : metric.resistanceScore >= 75
                      ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                      : 'bg-gradient-to-r from-orange-500 to-yellow-400'
                  }`}
                  style={{
                    width: `${Math.min(100, metric.resistanceScore)}%`
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              
              <div className="mt-3 text-xs text-gray-400 flex items-start gap-1">
                <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  {metric.isQuantumResistant
                    ? "This algorithm provides strong protection against both classical and quantum attacks"
                    : "While secure against classical attacks, this algorithm needs stronger quantum resistance"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
