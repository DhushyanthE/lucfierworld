
import React from 'react';
import { SecurityMetricsDisplay } from './SecurityMetricsDisplay';
import { SecurityMetric } from './types';
import { Shield } from 'lucide-react';

interface SecurityTabContentProps {
  securityMetrics: SecurityMetric[];
  isLoading: boolean;
}

export function SecurityTabContent({ securityMetrics, isLoading }: SecurityTabContentProps) {
  // Calculate quantum-resistant percentage
  const quantumResistantPercentage = securityMetrics.length > 0
    ? (securityMetrics.filter(metric => metric.isQuantumResistant).length / securityMetrics.length) * 100
    : 0;
  
  // Calculate average resistance score
  const averageResistanceScore = securityMetrics.length > 0
    ? securityMetrics.reduce((sum, metric) => sum + metric.resistanceScore, 0) / securityMetrics.length
    : 0;
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-900/20 text-blue-300 p-4 rounded-md text-sm border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Post-Quantum Cryptography Evaluation</h4>
            <p className="text-xs">
              These algorithms are evaluated for resistance against quantum computing attacks.
              Post-quantum cryptography methods are designed to withstand attacks from quantum computers.
            </p>
          </div>
        </div>
        
        {securityMetrics.length > 0 && !isLoading && (
          <div className="grid grid-cols-2 gap-4 mt-4 bg-blue-950/30 p-3 rounded-md">
            <div className="text-center">
              <div className="text-xs text-blue-300 mb-1">Quantum Resistant</div>
              <div className="text-xl font-bold text-white">
                {quantumResistantPercentage.toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-300 mb-1">Average Resistance Score</div>
              <div className="text-xl font-bold text-white">
                {averageResistanceScore.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
      
      <SecurityMetricsDisplay securityMetrics={securityMetrics} isLoading={isLoading} />
    </div>
  );
}
