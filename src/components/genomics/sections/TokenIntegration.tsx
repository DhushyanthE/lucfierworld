
import React from 'react';
import { CircleDollarSign, Database, Network, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TokenIntegration() {
  return (
    <Card className="bg-black/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 text-purple-400" /> 
          QNTM Token Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-400" />
              <h3 className="font-medium text-white">Data Contribution</h3>
            </div>
            <p className="text-sm text-gray-400">
              Earn QNTM tokens by contributing genomic data to the network. Rewards are based on data uniqueness and quality.
            </p>
            <div className="bg-purple-900/20 p-2 rounded-lg text-xs text-purple-300 mt-2">
              Earn 1 QNTM per 1,000 base pairs + quality bonuses
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium text-white">Research Access</h3>
            </div>
            <p className="text-sm text-gray-400">
              Use QNTM tokens to access the genomic research network, analyze datasets, and collaborate with other researchers.
            </p>
            <div className="bg-blue-900/20 p-2 rounded-lg text-xs text-blue-300 mt-2">
              Stake 100 QNTM for premium research tools access
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-white">Governance Rights</h3>
            </div>
            <p className="text-sm text-gray-400">
              Participate in network governance decisions, vote on privacy policies, and shape the future of genomic data sharing.
            </p>
            <div className="bg-green-900/20 p-2 rounded-lg text-xs text-green-300 mt-2">
              1 QNTM = 1 vote in governance decisions
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white mb-1">Current QNTM Token Stats</h3>
              <p className="text-sm text-gray-400">
                Powering the world's first quantum-secured genomic data network
              </p>
            </div>
            <div className="bg-black/50 py-1 px-3 rounded-full text-purple-300 text-sm font-medium">
              $5.67 USD
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">Total Supply</div>
              <div className="text-white font-medium">1,000,000,000</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">Circulating</div>
              <div className="text-white font-medium">243,587,921</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs text-gray-400">Genomic Records</div>
              <div className="text-white font-medium">3,724,591</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
