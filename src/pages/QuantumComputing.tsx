
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Zap, Activity, Gauge } from 'lucide-react';

export default function QuantumComputing() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Quantum Computing Platform
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/70 border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Cpu className="h-5 w-5 text-purple-400" />
                Quantum Processing Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Available QPUs:</span>
                  <span className="text-white font-medium">64</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Bits (Qubits):</span>
                  <span className="text-white font-medium">512 per QPU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coherence Time:</span>
                  <span className="text-white font-medium">1250 microseconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gate Fidelity:</span>
                  <span className="text-white font-medium">99.98%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/70 border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-purple-400" />
                Quantum Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Operation Queue:</span>
                  <span className="text-white font-medium">42 Pending</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing Speed:</span>
                  <span className="text-white font-medium">1.8 PFLOPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Utilization:</span>
                  <span className="text-white font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Error Correction:</span>
                  <span className="text-white font-medium">Surface Code</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-black/70 border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-purple-400" />
                Quantum Algorithms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Shor's Algorithm:</span>
                  <span className="text-white font-medium">Optimized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Grover's Search:</span>
                  <span className="text-white font-medium">Enhanced (v3.2)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Custom Algorithms:</span>
                  <span className="text-white font-medium">24 Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Machine Learning:</span>
                  <span className="text-white font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/70 border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Gauge className="h-5 w-5 text-purple-400" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Volume:</span>
                  <span className="text-white font-medium">128</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Circuit Layer Operations:</span>
                  <span className="text-white font-medium">3,200 CLOPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Advantage:</span>
                  <span className="text-green-400 font-medium">Achieved</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">System Stability:</span>
                  <span className="text-white font-medium">99.96%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
