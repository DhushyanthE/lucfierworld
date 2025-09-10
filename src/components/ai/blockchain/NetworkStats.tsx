
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface NetworkStatsProps {
  stats: {
    totalNodes: number;
    activeNodes: number;
    transactionsPerSecond: number;
    averageBlockTime: number;
    quantumNodesPercentage: number;
    networkSecurity: number;
  };
}

export function NetworkStats({ stats }: NetworkStatsProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Network Statistics</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <div className="text-xs text-gray-400">Total Nodes</div>
            <div className="text-sm font-medium text-white">{stats.totalNodes}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Active Nodes</div>
            <div className="text-sm font-medium text-white">
              {stats.activeNodes} ({Math.round((stats.activeNodes / stats.totalNodes) * 100)}%)
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400">Transactions/sec</div>
            <div className="text-sm font-medium text-white">{stats.transactionsPerSecond.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Block Time</div>
            <div className="text-sm font-medium text-white">{stats.averageBlockTime.toFixed(1)}s</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-gray-400">Quantum Nodes</div>
            <div className="text-xs font-medium text-purple-400">
              {stats.quantumNodesPercentage.toFixed(1)}%
            </div>
          </div>
          <Progress value={stats.quantumNodesPercentage} className="h-1" />
        </div>
        
        <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-gray-400">Network Security</div>
            <div className={`text-xs font-medium ${
              stats.networkSecurity >= 80 ? 'text-green-400' :
              stats.networkSecurity >= 60 ? 'text-blue-400' :
              stats.networkSecurity >= 40 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {stats.networkSecurity.toFixed(1)}%
            </div>
          </div>
          <Progress 
            value={stats.networkSecurity} 
            className={`h-1 ${
              stats.networkSecurity >= 80 ? 'bg-green-900/50' :
              stats.networkSecurity >= 60 ? 'bg-blue-900/50' :
              stats.networkSecurity >= 40 ? 'bg-yellow-900/50' :
              'bg-red-900/50'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
