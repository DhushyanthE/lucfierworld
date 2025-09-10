
import React from 'react';
import { Database } from 'lucide-react';

interface BlockchainIntegrationProps {
  agiMetrics: any;
  superAIMetrics: any;
}

export function BlockchainIntegration({ agiMetrics, superAIMetrics }: BlockchainIntegrationProps) {
  // Helper function to safely format numbers with toFixed
  const safeToFixed = (value: any, decimals: number = 2) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return Number(value).toFixed(decimals);
  };

  return (
    <div className="bg-gray-900/40 p-4 rounded-lg border border-purple-500/10">
      <h3 className="text-sm font-medium mb-2 flex items-center">
        <Database className="h-4 w-4 mr-2 text-purple-400" />
        Quantum Blockchain Integration
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        AGI and Super AI capabilities are integrated with quantum-resistant blockchain technologies 
        to enable self-optimizing networks, quantum-secured transactions, and advanced neural 
        prediction systems.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/30 rounded-md p-2 text-center">
          <div className="text-xs text-gray-400 mb-1">Quantum Security</div>
          <div className="text-sm font-medium text-white">
            {Math.round((superAIMetrics.systemStability || 0) * 100)}%
          </div>
        </div>
        <div className="bg-black/30 rounded-md p-2 text-center">
          <div className="text-xs text-gray-400 mb-1">Neural Density</div>
          <div className="text-sm font-medium text-white">
            {Math.round(((agiMetrics.cognitiveCapacity || 0) * 24.5))}K
          </div>
        </div>
        <div className="bg-black/30 rounded-md p-2 text-center">
          <div className="text-xs text-gray-400 mb-1">Self-Improvement</div>
          <div className="text-sm font-medium text-white">
            {safeToFixed(superAIMetrics.selfImprovementRate || 0, 1)}%/day
          </div>
        </div>
      </div>
    </div>
  );
}
