
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, Shield, Database, GitBranch } from 'lucide-react';

export default function BlockchainNetwork() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Quantum Blockchain Network
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/70 border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Network className="h-5 w-5 text-purple-400" />
                Network Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Nodes:</span>
                  <span className="text-white font-medium">1,428</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction Rate:</span>
                  <span className="text-white font-medium">4,280 TPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Block Time:</span>
                  <span className="text-white font-medium">0.2 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Security Level:</span>
                  <span className="text-white font-medium">Level 4 (High)</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/70 border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-purple-400" />
                Security Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Post-Quantum Encryption:</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Smart Contract Audits:</span>
                  <span className="text-white font-medium">100% Coverage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Attack Resistance:</span>
                  <span className="text-white font-medium">99.997%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Resistance Score:</span>
                  <span className="text-white font-medium">9.8/10</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-black/70 border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-purple-400" />
                Blockchain Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain Size:</span>
                  <span className="text-white font-medium">285 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Compression:</span>
                  <span className="text-white font-medium">Quantum Optimized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Availability:</span>
                  <span className="text-white font-medium">99.9999%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Storage Efficiency:</span>
                  <span className="text-white font-medium">87% Improvement</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/70 border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GitBranch className="h-5 w-5 text-purple-400" />
                Network Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum AI Integration:</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Genomic Data Processing:</span>
                  <span className="text-white font-medium">12.8 TB/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cross-chain Bridges:</span>
                  <span className="text-white font-medium">8 Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Integration Protocol:</span>
                  <span className="text-white font-medium">QuantumBridge v2.4</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
