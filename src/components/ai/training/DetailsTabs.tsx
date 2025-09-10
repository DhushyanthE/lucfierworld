
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface DetailsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  trainingMetrics: {
    accuracy: number;
    loss: number;
    fidelity: number;
    quantumAdvantage: number;
    quantumCoherence?: number;
    quantumEntanglement?: number;
    energyEfficiency?: number;
  };
  currentEpoch: number;
  totalEpochs: number;
}

export function DetailsTabs({
  activeTab,
  setActiveTab,
  trainingMetrics,
  currentEpoch,
  totalEpochs
}: DetailsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-900/30">
          Metrics
        </TabsTrigger>
        <TabsTrigger value="circuit" className="data-[state=active]:bg-purple-900/30">
          Circuit
        </TabsTrigger>
        <TabsTrigger value="visualization" className="data-[state=active]:bg-purple-900/30">
          Visualization
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="metrics" className="space-y-4 mt-4">
        <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Training Metrics</h4>
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="py-1 text-gray-400">Accuracy</td>
                <td className="py-1 text-right text-white">{(trainingMetrics.accuracy * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Loss</td>
                <td className="py-1 text-right text-white">{trainingMetrics.loss.toFixed(4)}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Quantum Fidelity</td>
                <td className="py-1 text-right text-white">{(trainingMetrics.fidelity * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Quantum Advantage</td>
                <td className="py-1 text-right text-white">{trainingMetrics.quantumAdvantage.toFixed(2)}x</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Quantum Coherence</td>
                <td className="py-1 text-right text-white">{((trainingMetrics.quantumCoherence || 0) * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Quantum Entanglement</td>
                <td className="py-1 text-right text-white">{((trainingMetrics.quantumEntanglement || 0) * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Energy Efficiency</td>
                <td className="py-1 text-right text-white">{((trainingMetrics.energyEfficiency || 0) * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Learning Rate</td>
                <td className="py-1 text-right text-white">0.001</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Optimizer</td>
                <td className="py-1 text-right text-white">Quantum Adam</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Batch Size</td>
                <td className="py-1 text-right text-white">32</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400">Training Progress</td>
                <td className="py-1 text-right text-white">{Math.floor(currentEpoch / totalEpochs * 100)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>
      
      <TabsContent value="circuit" className="space-y-4 mt-4">
        <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Quantum Circuit</h4>
          
          <div className="circuit-visualization h-20 w-full relative">
            {/* Horizontal wires */}
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="circuit-wire absolute left-0 right-0 bg-gray-600/30 h-[1px]" 
                style={{ top: `${10 + i * 20}px` }}
              />
            ))}
            
            {/* Quantum gates */}
            {[
              { top: 5, left: 30, type: 'H', qubit: 0 },
              { top: 25, left: 80, type: 'X', qubit: 1 },
              { top: 45, left: 30, type: 'H', qubit: 2 },
              { top: 5, left: 130, type: 'CNOT', qubit: 0, target: 1 },
              { top: 25, left: 180, type: 'Z', qubit: 1 },
              { top: 45, left: 230, type: 'H', qubit: 2 },
            ].map((gate, i) => (
              <div 
                key={i} 
                className="absolute quantum-gate bg-purple-900/50 border border-purple-500 w-8 h-8 flex items-center justify-center text-xs font-bold rounded"
                style={{ 
                  top: `${gate.top}px`, 
                  left: `${gate.left}px`
                }}
              >
                {gate.type}
              </div>
            ))}
            
            {/* CNOT connectors */}
            <div className="absolute w-1 bg-purple-500/70 h-20 left-[134px] top-[10px]" />
            <div className="absolute w-2 h-2 bg-purple-500 rounded-full left-[133px] top-[30px]" />
          </div>
          
          <div className="mt-3 text-xs text-gray-400">
            Quantum circuit with 3 qubits, featuring Hadamard, X, Z gates and CNOT entanglements
          </div>

          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Quantum Training Parameters</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-400">Quantum Layers</div>
                <div className="text-white">2</div>
              </div>
              <div>
                <div className="text-gray-400">Circuit Depth</div>
                <div className="text-white">3</div>
              </div>
              <div>
                <div className="text-gray-400">Gate Set</div>
                <div className="text-white">Parameterized</div>
              </div>
              <div>
                <div className="text-gray-400">Noise Model</div>
                <div className="text-white">Depolarizing</div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="visualization" className="space-y-4 mt-4">
        <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Training Visualization</h4>
          
          <div className="space-y-4">
            {/* Loss and Accuracy Chart (simulated with bars) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Model Convergence</span>
                <span className="text-gray-300">Epoch {currentEpoch}/{totalEpochs}</span>
              </div>
              <div className="h-24 bg-gray-800/50 rounded border border-gray-700 p-2 flex items-end">
                {Array(10).fill(0).map((_, i) => {
                  const epochFraction = currentEpoch / totalEpochs;
                  const height = i < Math.floor(epochFraction * 10) ? 
                    70 * (1 - trainingMetrics.loss) * Math.min(1, (i+1) / 10 * 2) : 
                    4;
                  
                  return (
                    <div 
                      key={i} 
                      className="w-full mx-0.5 rounded-t"
                      style={{
                        height: `${height}px`,
                        backgroundColor: `rgba(147, 51, 234, ${Math.min(0.3 + i * 0.07, 0.9)})`
                      }}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Quantum Metrics */}
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Quantum Fidelity</div>
              <Progress value={trainingMetrics.fidelity * 100} className="h-2" />
              
              <div className="text-xs text-gray-400 mt-2">Quantum Coherence</div>
              <Progress value={(trainingMetrics.quantumCoherence || 0) * 100} className="h-2" />
              
              <div className="text-xs text-gray-400 mt-2">Quantum Entanglement</div>
              <Progress value={(trainingMetrics.quantumEntanglement || 0) * 100} className="h-2" />
              
              <div className="text-xs text-gray-400 mt-2">Quantum Advantage</div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-purple-400">
                      {trainingMetrics.quantumAdvantage.toFixed(1)}x
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-purple-400">
                      Target: 32x
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    style={{ width: `${Math.min(trainingMetrics.quantumAdvantage/32*100, 100)}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
                  />
                </div>
              </div>
            </div>
            
            {/* Layer Activations (simulated) */}
            <div>
              <div className="text-xs text-gray-400 mb-1">Layer Activations</div>
              <div className="grid grid-cols-8 gap-1 h-8">
                {Array(8).fill(0).map((_, i) => {
                  const activation = Math.random() * 0.5 + 0.3;
                  return (
                    <div 
                      key={i}
                      className="rounded"
                      style={{
                        height: '100%',
                        background: `rgba(147, 51, 234, ${activation})`
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
