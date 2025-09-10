
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, Zap } from 'lucide-react';
import { useNetworkState } from './blockchain/useNetworkState';
import { NetworkVisualization } from './blockchain/NetworkVisualization';
import { NetworkStats } from './blockchain/NetworkStats';

export function QuantumBlockchainNetwork() {
  const { networkNodes, networkStats, isOptimizing, optimizeNetwork } = useNetworkState();

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Network className="h-5 w-5 text-purple-400" />
            <span>Quantum-Enhanced Blockchain Network</span>
          </CardTitle>
          <button
            onClick={optimizeNetwork}
            disabled={isOptimizing}
            className="bg-purple-700/70 hover:bg-purple-600/70 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 transition-colors"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin h-3 w-3 border border-t-2 border-white rounded-full mr-1"></div>
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3" />
                Optimize Network
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Network Visualization */}
          <NetworkVisualization networkNodes={networkNodes} />
          
          {/* Network Stats */}
          <NetworkStats stats={networkStats} />
        </div>
      </CardContent>
    </Card>
  );
}
