
import React from 'react';
import { Cpu } from 'lucide-react';

interface AGICapability {
  id: string;
  name: string;
  description: string;
  cognitiveLevel: number;
  probabilityOfSuccess: number;
}

interface AGIMetricsProps {
  isLoading: boolean;
  metrics: any;
  capabilities: AGICapability[];
}

export function AGIMetricsTab({ isLoading, metrics, capabilities }: AGIMetricsProps) {
  if (isLoading && !metrics) {
    return (
      <div className="flex justify-center py-8">
        <Cpu className="h-8 w-8 text-indigo-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AGI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/40 p-3 rounded-md flex flex-col">
          <span className="text-xs text-gray-400">Cognitive Capacity</span>
          <span className="text-lg font-medium text-white">
            {metrics?.cognitiveCapacity?.toFixed(1) || '0.0'} / 10
          </span>
        </div>
        <div className="bg-gray-800/40 p-3 rounded-md flex flex-col">
          <span className="text-xs text-gray-400">Quantum Advantage</span>
          <span className="text-lg font-medium text-white">
            {((metrics?.quantumAdvantage || 0) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="bg-gray-800/40 p-3 rounded-md flex flex-col">
          <span className="text-xs text-gray-400">Decisions Made</span>
          <span className="text-lg font-medium text-white">
            {metrics?.totalDecisions?.toLocaleString() || '0'}
          </span>
        </div>
        <div className="bg-gray-800/40 p-3 rounded-md flex flex-col">
          <span className="text-xs text-gray-400">Average Confidence</span>
          <span className="text-lg font-medium text-white">
            {((metrics?.averageConfidence || 0) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* AGI Capabilities */}
      <div className="bg-gray-800/40 p-4 rounded-md">
        <h4 className="text-sm font-medium text-white mb-3">Quantum Intelligence Capabilities</h4>
        <div className="space-y-3">
          {capabilities.map(cap => (
            <div key={cap.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">{cap.name}</div>
                <div className="text-xs text-gray-400">{cap.description}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-xs text-white">
                  Lvl {cap.cognitiveLevel || 0}
                </div>
                <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500" 
                    style={{width: `${(cap.probabilityOfSuccess || 0) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
