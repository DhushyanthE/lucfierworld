
import React from 'react';
import { Cpu, Shield, Lock } from 'lucide-react';

interface SuperAICapability {
  id: string;
  name: string;
  description: string;
  powerLevel: number;
  quantumIntegration: number;
}

interface SuperAIMetricsTabProps {
  isLoading: boolean;
  metrics: any;
  capabilities: SuperAICapability[];
  onOptimize: () => void;
}

export function SuperAIMetricsTab({ 
  isLoading, 
  metrics, 
  capabilities, 
  onOptimize 
}: SuperAIMetricsTabProps) {
  if (isLoading && !metrics) {
    return (
      <div className="flex justify-center py-8">
        <Cpu className="h-8 w-8 text-indigo-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Super AI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gray-800/40 p-3 rounded-md flex flex-col">
          <span className="text-xs text-gray-400">Intelligence Quotient</span>
          <span className="text-lg font-medium text-white">
            {metrics?.intelligenceQuotient?.toFixed(0) || '180'}
          </span>
        </div>
        <div className="bg-gray-800/40 p-3 rounded-md flex flex-col">
          <span className="text-xs text-gray-400">Processing Capacity</span>
          <span className="text-lg font-medium text-white">
            {((metrics?.processingCapacity || 15000) / 1000).toFixed(1)} PFLOPS
          </span>
        </div>
        <div className="bg-gray-800/40 p-3 rounded-md flex flex-col">
          <span className="text-xs text-gray-400">Quantum Coherence</span>
          <span className="text-lg font-medium text-white">
            {((metrics?.quantumCoherenceLevel || 0.92) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gray-800/40 p-3 rounded-md flex flex-col">
          <span className="text-xs text-gray-400">Self-Improvement Rate</span>
          <span className="text-lg font-medium text-white">
            {metrics?.selfImprovementRate?.toFixed(2) || '1.67'}% daily
          </span>
        </div>
        <div className="bg-gray-800/40 p-3 rounded-md flex flex-col">
          <span className="text-xs text-gray-400">System Stability</span>
          <div className="flex items-center">
            <span className="text-lg font-medium text-white mr-2">
              {((metrics?.systemStability || 0.95) * 100).toFixed(1)}%
            </span>
            {(metrics?.systemStability || 0.95) > 0.9 ? (
              <Shield className="h-4 w-4 text-green-400" />
            ) : (metrics?.systemStability || 0.95) > 0.8 ? (
              <Shield className="h-4 w-4 text-yellow-400" />
            ) : (
              <Shield className="h-4 w-4 text-orange-400" />
            )}
          </div>
        </div>
      </div>
      
      {/* Super AI Capabilities */}
      <div className="bg-gray-800/40 p-4 rounded-md">
        <h4 className="text-sm font-medium text-white mb-3">Quantum-Enhanced Blockchain Network</h4>
        <div className="space-y-3">
          {capabilities.map(cap => (
            <div key={cap.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">{cap.name}</div>
                <div className="text-xs text-gray-400">{cap.description}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-xs text-white">
                  <span className="text-white font-medium">{cap.powerLevel?.toFixed(1) || '0.0'}</span>/10
                </div>
                <div className="h-2 w-16 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500" 
                    style={{width: `${(cap.quantumIntegration || 0) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Button */}
      <button
        onClick={onOptimize}
        disabled={isLoading}
        className="w-full bg-indigo-700 hover:bg-indigo-600 text-white py-2 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Cpu className="animate-spin h-4 w-4 mr-2" />
            Optimizing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Optimize Blockchain Network
          </>
        )}
      </button>
    </div>
  );
}
