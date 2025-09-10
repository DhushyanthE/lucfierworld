
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { realTimeQuantumProcessor } from '@/lib/quantum/RealTimeQuantumProcessor';
import { QuantumCircuitVisualizer } from './QuantumCircuitVisualizer';
import { CircuitOptimizationPanel } from './CircuitOptimizationPanel';
import { RealTimeCircuitUpdater } from './RealTimeCircuitUpdater';
import { Cpu, Zap, BarChart3, GitBranch, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function EnhancedCircuitVisualizer() {
  const [activeTab, setActiveTab] = useState('visualizer');
  const [isConnected, setIsConnected] = useState(false);
  const [coherence, setCoherence] = useState(85);
  const [processingPower, setProcessingPower] = useState(0);
  const [optimizationLevel, setOptimizationLevel] = useState(3);
  const processorStatusInterval = useRef<number | null>(null);
  const [entanglementScore, setEntanglementScore] = useState(0.75);
  const [circuitDepth, setCircuitDepth] = useState(0);
  const [quantumError, setQuantumError] = useState(0);
  const [activeQubits, setActiveQubits] = useState(0);

  useEffect(() => {
    // Connect to quantum processor when component mounts
    const connect = async () => {
      try {
        // Add connection listener
        const removeConnectListener = realTimeQuantumProcessor.addEventListener('connect', () => {
          setIsConnected(true);
          toast.success("Connected to quantum processor", {
            description: "Real-time quantum circuit updates enabled"
          });
          
          // Start monitoring processor status
          startProcessorMonitoring();
        });
        
        // Add error listener
        const removeErrorListener = realTimeQuantumProcessor.addEventListener('error', (error) => {
          toast.error("Quantum processor error", {
            description: error?.message || "Connection issue detected"
          });
        });

        // Connect to the quantum processor
        realTimeQuantumProcessor.connect();
        
        return () => {
          removeConnectListener();
          removeErrorListener();
          if (processorStatusInterval.current) {
            clearInterval(processorStatusInterval.current);
          }
          realTimeQuantumProcessor.disconnect();
        };
      } catch (error) {
        console.error("Failed to connect to quantum processor:", error);
        toast.error("Failed to connect to quantum processor");
      }
    };
    
    connect();
  }, []);

  // Start monitoring processor status with periodic updates
  const startProcessorMonitoring = () => {
    if (processorStatusInterval.current) {
      clearInterval(processorStatusInterval.current);
    }
    
    // Update status every 2 seconds
    processorStatusInterval.current = window.setInterval(() => {
      if (realTimeQuantumProcessor.isConnected()) {
        const status = realTimeQuantumProcessor.getStatus();
        setCoherence(Math.round(status.fidelity * 100));
        setEntanglementScore(status.fidelity * 0.9 + Math.random() * 0.1);
        setQuantumError(status.errorRate * 100);
        setActiveQubits(status.qubits);
        
        // Simulate fluctuating processing power
        setProcessingPower(prev => {
          const target = isConnected ? 85 + Math.random() * 15 : 0;
          return prev * 0.7 + target * 0.3; // Smooth transition
        });
        
        // Set circuit depth based on active qubits with some randomness
        setCircuitDepth(Math.max(3, Math.floor(activeQubits / 2 + Math.random() * 3)));
      }
    }, 2000);
  };

  const handleReconnect = () => {
    if (realTimeQuantumProcessor.isConnected()) {
      realTimeQuantumProcessor.disconnect();
      setIsConnected(false);
      toast.info("Disconnected from quantum processor");
      
      // Reconnect after a short delay
      setTimeout(() => {
        realTimeQuantumProcessor.connect();
      }, 1000);
    } else {
      realTimeQuantumProcessor.connect();
    }
  };

  const handleOptimizationChange = (value: number[]) => {
    setOptimizationLevel(value[0]);
    toast.info(`Optimization level set to ${value[0]}`);
  };

  const executeCircuit = async () => {
    toast.info("Executing quantum circuit", {
      description: "Processing on quantum backend..."
    });
    
    try {
      // Simulate circuit execution with the quantum processor
      const result = await realTimeQuantumProcessor.execute('circuit', {
        gates: Array(circuitDepth).fill(null).map(() => ({ type: 'random' })),
        qubits: activeQubits
      });
      
      toast.success("Circuit executed successfully", {
        description: `Achieved ${(result.fidelity * 100).toFixed(1)}% fidelity`
      });
    } catch (error) {
      console.error("Circuit execution error:", error);
      toast.error("Circuit execution failed");
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            Quantum Circuit Visualizer
            {isConnected && (
              <Badge className="ml-2 bg-green-900/50 text-green-300 text-xs">Connected</Badge>
            )}
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReconnect}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
          >
            {isConnected ? <RotateCcw className="h-4 w-4 mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
            {isConnected ? 'Reconnect' : 'Connect'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="bg-gray-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-400">Quantum Coherence</div>
            <div className="flex items-center mt-1">
              <div className="text-xl text-white font-mono mr-1">{coherence}</div>
              <div className="text-xs text-gray-400">%</div>
            </div>
            <div className="mt-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${coherence > 80 ? 'bg-green-500' : coherence > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${coherence}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-400">Processing Power</div>
            <div className="flex items-center mt-1">
              <div className="text-xl text-white font-mono mr-1">{processingPower.toFixed(1)}</div>
              <div className="text-xs text-gray-400">QFLOPS</div>
            </div>
            <div className="mt-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${isConnected ? (processingPower / 100) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-400">Active Qubits</div>
            <div className="flex items-center mt-1">
              <div className="text-xl text-white font-mono mr-1">{activeQubits}</div>
              <div className="text-xs text-gray-400">qubits</div>
            </div>
            <div className="mt-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500"
                style={{ width: `${(activeQubits / 100) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-400">Quantum Error</div>
            <div className="flex items-center mt-1">
              <div className="text-xl text-white font-mono mr-1">{quantumError.toFixed(2)}</div>
              <div className="text-xs text-gray-400">%</div>
            </div>
            <div className="mt-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: `${quantumError * 5}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900/60 mb-4">
            <TabsTrigger value="visualizer">Circuit Design</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualizer" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-400">
                Circuit Depth: <span className="text-white">{circuitDepth}</span>
              </div>
              
              <Button 
                onClick={executeCircuit}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!isConnected}
              >
                <Zap className="h-4 w-4 mr-1" />
                Execute Circuit
              </Button>
            </div>
            
            <RealTimeCircuitUpdater
              isConnected={isConnected}
              entanglementScore={entanglementScore}
            />
            
            <QuantumCircuitVisualizer />
          </TabsContent>
          
          <TabsContent value="optimization" className="space-y-4">
            <div className="space-y-1 mb-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400">Optimization Level</label>
                <span className="text-xs font-mono bg-gray-800 px-2 py-0.5 rounded-md">
                  {optimizationLevel}/10
                </span>
              </div>
              <Slider 
                value={[optimizationLevel]}
                min={1}
                max={10}
                step={1}
                onValueChange={handleOptimizationChange}
                className="py-4"
              />
            </div>
            
            <CircuitOptimizationPanel />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/60 rounded-lg p-4 flex flex-col h-40 justify-center items-center">
                <BarChart3 className="h-16 w-16 text-purple-400 mb-2 opacity-50" />
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">Performance Analytics</div>
                  <Button size="sm" variant="outline" disabled={!isConnected}>
                    Generate Report
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-900/60 rounded-lg p-4 flex flex-col h-40 justify-center items-center">
                <GitBranch className="h-16 w-16 text-purple-400 mb-2 opacity-50" />
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">Circuit History</div>
                  <Button size="sm" variant="outline" disabled={!isConnected}>
                    View Versions
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
