
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Server } from 'lucide-react';

interface CloudResourcesMetricsProps {
  cloudResources: {
    cpuUtilization: number;
    memoryUsage: number;
    networkEfficiency: number;
    storageOptimization: number;
  };
  isLoading: boolean;
  optimizeCloudResources: () => Promise<void>;
}

export function CloudResourcesMetrics({
  cloudResources,
  isLoading,
  optimizeCloudResources
}: CloudResourcesMetricsProps) {
  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-500/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <Server className="h-4 w-4 mr-2 text-blue-400" />
          Cloud Computing Resources
        </h3>
        <Button
          onClick={optimizeCloudResources}
          size="sm"
          variant="outline"
          className="h-7 text-xs border-blue-500/30 bg-blue-950/20 hover:bg-blue-900/30"
          disabled={isLoading}
        >
          {isLoading ? 'Optimizing...' : 'Optimize'}
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">CPU Utilization</span>
            <span className="text-xs text-blue-300">{Math.round(cloudResources.cpuUtilization * 100)}%</span>
          </div>
          <Progress value={cloudResources.cpuUtilization * 100} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Memory Usage</span>
            <span className="text-xs text-blue-300">{Math.round(cloudResources.memoryUsage * 100)}%</span>
          </div>
          <Progress value={cloudResources.memoryUsage * 100} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Network Efficiency</span>
            <span className="text-xs text-blue-300">{Math.round(cloudResources.networkEfficiency * 100)}%</span>
          </div>
          <Progress value={cloudResources.networkEfficiency * 100} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Storage Optimization</span>
            <span className="text-xs text-blue-300">{Math.round(cloudResources.storageOptimization * 100)}%</span>
          </div>
          <Progress value={cloudResources.storageOptimization * 100} className="h-1" />
        </div>
      </div>
    </div>
  );
}
