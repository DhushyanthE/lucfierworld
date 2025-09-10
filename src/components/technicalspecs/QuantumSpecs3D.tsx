
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Layers } from 'lucide-react';

export function QuantumSpecs3D() {
  const specs = {
    qubits: 128,
    coherenceTime: 250, // microseconds
    gateErrorRate: 0.0025, // 0.25%
    readoutFidelity: 0.985, // 98.5%
    connectivity: 'All-to-All',
    architecture: 'Superconducting',
    temperatureOperation: 0.015, // Kelvin
    quantumVolume: 2048
  };
  
  const normalizeValue = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };
  
  // Calculate normalized values
  const coherenceTimeNormalized = normalizeValue(specs.coherenceTime, 0, 500);
  const readoutFidelityNormalized = specs.readoutFidelity * 100;
  const gateErrorRateInverted = (1 - specs.gateErrorRate) * 100;
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-400" />
          <span>Quantum Processing Specifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-400">Total Qubits</span>
                <span className="text-white">{specs.qubits}</span>
              </div>
              <Progress 
                value={normalizeValue(specs.qubits, 0, 200)} 
                color="bg-blue-500"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-400">Coherence Time</span>
                <span className="text-white">{specs.coherenceTime} μs</span>
              </div>
              <Progress 
                value={coherenceTimeNormalized} 
                color="bg-green-500"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-400">Readout Fidelity</span>
                <span className="text-white">{(specs.readoutFidelity * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={readoutFidelityNormalized} 
                color="bg-purple-500"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-400">Gate Accuracy</span>
                <span className="text-white">{(gateErrorRateInverted).toFixed(2)}%</span>
              </div>
              <Progress 
                value={gateErrorRateInverted} 
                color="bg-amber-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Architecture</div>
              <div className="flex items-center">
                <Layers className="h-4 w-4 text-purple-400 mr-2" />
                <div className="text-sm">{specs.architecture}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Optimized for quantum supremacy
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Connectivity</div>
              <div className="text-sm">{specs.connectivity}</div>
              <div className="text-xs text-gray-500 mt-1">
                Enables complex entanglement
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Quantum Volume</div>
              <div className="text-sm">{specs.quantumVolume}</div>
              <div className="text-xs text-gray-500 mt-1">
                Performance benchmark
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Operating Temp.</div>
              <div className="text-sm">{specs.temperatureOperation} K</div>
              <div className="text-xs text-gray-500 mt-1">
                Near absolute zero
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-3 rounded-lg border border-purple-500/20">
          <div className="text-sm font-medium mb-2">Quantum Performance Index</div>
          <div className="flex items-center">
            <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: '78%' }}></div>
            </div>
            <span className="text-sm font-medium text-white ml-3">78.3/100</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Performance rating based on coherence time, gate fidelity, and qubit count
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
