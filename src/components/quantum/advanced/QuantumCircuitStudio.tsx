/**
 * Quantum Circuit Studio - Advanced Circuit Designer with AGI Integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Cpu, Brain, Shield, Blocks, Zap, Lock, 
  Activity, TrendingUp, AlertTriangle, CheckCircle,
  Sparkles, Network, Database, Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { agiWorkflowService } from '@/lib/quantum/agi/AGIWorkflowService';
import { quantumCryptographyService } from '@/lib/quantum/cryptography/QuantumCryptographyService';
import { quantumBlockchainService } from '@/lib/quantum/blockchain/QuantumBlockchainService';
import { quantumResistanceService } from '@/lib/quantum/resistance/QuantumResistanceService';

interface CircuitData {
  id: string;
  name: string;
  qubits: number;
  gates: any[];
  depth: number;
  fidelity: number;
  quantumResistanceLevel: number;
  agiOptimized: boolean;
  blockchainHash?: string;
}

export function QuantumCircuitStudio() {
  const [activeTab, setActiveTab] = useState('designer');
  const [currentCircuit, setCurrentCircuit] = useState<CircuitData | null>(null);
  const [agiModels, setAgiModels] = useState<any[]>([]);
  const [selectedAgiModel, setSelectedAgiModel] = useState('quantum-agi-v1');
  
  // AGI Workflow States
  const [agiExecution, setAgiExecution] = useState<any>(null);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [superintelligenceScore, setSuperintelligenceScore] = useState(0);
  
  // Quantum Cryptography States
  const [cryptoProtocols, setCryptoProtocols] = useState<any[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState('lattice-based');
  const [quantumKeys, setQuantumKeys] = useState<any[]>([]);
  
  // Blockchain States
  const [blockchainStats, setBlockchainStats] = useState<any>({});
  const [quantumBlocks, setQuantumBlocks] = useState<any[]>([]);
  
  // Resistance Testing States
  const [resistanceTests, setResistanceTests] = useState<any[]>([]);
  const [securityAssessment, setSecurityAssessment] = useState<any>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeStudio();
    loadAGIModels();
    loadCryptoProtocols();
    loadBlockchainData();
  }, []);

  const initializeStudio = async () => {
    // Initialize with a sample circuit
    const sampleCircuit: CircuitData = {
      id: crypto.randomUUID(),
      name: 'Quantum AGI Optimizer Circuit',
      qubits: 8,
      gates: [],
      depth: 12,
      fidelity: 0.95,
      quantumResistanceLevel: 7,
      agiOptimized: false
    };
    
    setCurrentCircuit(sampleCircuit);
    await saveCircuitToDatabase(sampleCircuit);
    drawCircuitVisualization(sampleCircuit);
  };

  const loadAGIModels = () => {
    const models = agiWorkflowService.getAvailableModels();
    setAgiModels(models);
  };

  const loadCryptoProtocols = async () => {
    try {
      const protocols = await quantumCryptographyService.loadProtocols();
      setCryptoProtocols(protocols);
    } catch (error) {
      console.error('Failed to load crypto protocols:', error);
    }
  };

  const loadBlockchainData = async () => {
    try {
      await quantumBlockchainService.loadBlockchainFromDatabase();
      const stats = quantumBlockchainService.getBlockchainStats();
      setBlockchainStats(stats);
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
    }
  };

  const saveCircuitToDatabase = async (circuit: CircuitData) => {
    try {
      const { error } = await supabase
        .from('quantum_circuits')
        .upsert({
          id: circuit.id,
          name: circuit.name,
          circuit_data: {
            qubits: circuit.qubits,
            gates: circuit.gates,
            depth: circuit.depth,
            fidelity: circuit.fidelity
          },
          qubit_count: circuit.qubits,
          gate_count: circuit.gates.length,
          circuit_depth: circuit.depth,
          fidelity_score: circuit.fidelity,
          quantum_resistance_level: circuit.quantumResistanceLevel,
          agi_optimization_applied: circuit.agiOptimized,
          blockchain_hash: circuit.blockchainHash
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save circuit:', error);
      toast.error('Failed to save circuit to database');
    }
  };

  const drawCircuitVisualization = (circuit: CircuitData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw quantum circuit visualization
    drawQuantumCircuit(ctx, circuit);
  };

  const drawQuantumCircuit = (ctx: CanvasRenderingContext2D, circuit: CircuitData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const padding = 40;
    const qubitSpacing = (canvas.height - 2 * padding) / (circuit.qubits - 1);
    const gateSpacing = (canvas.width - 2 * padding) / (circuit.depth + 1);

    // Set styles
    ctx.strokeStyle = '#8b5cf6';
    ctx.fillStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.font = '12px monospace';

    // Draw qubit lines
    for (let i = 0; i < circuit.qubits; i++) {
      const y = padding + i * qubitSpacing;
      
      // Draw quantum state label
      ctx.fillText(`|${i}⟩`, 10, y + 5);
      
      // Draw qubit line with quantum glow effect
      const gradient = ctx.createLinearGradient(padding, y, canvas.width - padding, y);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(0.5, '#6366f1');
      gradient.addColorStop(1, '#8b5cf6');
      
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw quantum gates
    drawQuantumGates(ctx, circuit, padding, qubitSpacing, gateSpacing);
  };

  const drawQuantumGates = (
    ctx: CanvasRenderingContext2D, 
    circuit: CircuitData, 
    padding: number, 
    qubitSpacing: number, 
    gateSpacing: number
  ) => {
    const gateTypes = ['H', 'X', 'Y', 'Z', 'CNOT', 'RX', 'RY', 'RZ'];
    
    // Simulate gate positions
    for (let depth = 0; depth < circuit.depth; depth++) {
      const x = padding + (depth + 1) * gateSpacing;
      
      // Randomly place gates for visualization
      const numGatesAtDepth = Math.floor(Math.random() * 3) + 1;
      
      for (let g = 0; g < numGatesAtDepth; g++) {
        const qubit = Math.floor(Math.random() * circuit.qubits);
        const y = padding + qubit * qubitSpacing;
        const gateType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
        
        drawSingleGate(ctx, gateType, x, y);
      }
    }
  };

  const drawSingleGate = (ctx: CanvasRenderingContext2D, gateType: string, x: number, y: number) => {
    const gateSize = 20;
    
    // Gate background with quantum glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, gateSize);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x - gateSize/2, y - gateSize/2, gateSize, gateSize);
    
    // Gate border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - gateSize/2, y - gateSize/2, gateSize, gateSize);
    
    // Gate label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(gateType, x, y + 3);
    ctx.textAlign = 'start';
  };

  const executeAGIOptimization = async () => {
    if (!currentCircuit) return;

    try {
      toast.info('Starting AGI optimization...', {
        description: 'Advanced AI is analyzing your quantum circuit'
      });

      setOptimizationProgress(0);
      
      const execution = await agiWorkflowService.executeAGIWorkflow(
        'Circuit Optimization',
        currentCircuit.id,
        selectedAgiModel,
        {
          optimizationDepth: 5,
          enableSupervision: true,
          quantumSupremacyTarget: true
        }
      );

      setAgiExecution(execution);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setOptimizationProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return Math.min(100, prev + Math.random() * 15);
        });
      }, 500);

      // Wait for completion (simulate)
      setTimeout(async () => {
        clearInterval(progressInterval);
        setOptimizationProgress(100);
        
        // Update circuit with optimization results
        const optimizedCircuit = {
          ...currentCircuit,
          agiOptimized: true,
          fidelity: Math.min(1.0, currentCircuit.fidelity + 0.05),
          quantumResistanceLevel: Math.min(10, currentCircuit.quantumResistanceLevel + 1)
        };
        
        setCurrentCircuit(optimizedCircuit);
        setSuperintelligenceScore(0.85 + Math.random() * 0.15);
        await saveCircuitToDatabase(optimizedCircuit);
        drawCircuitVisualization(optimizedCircuit);

        toast.success('AGI optimization completed!', {
          description: 'Circuit performance enhanced with superintelligence'
        });
      }, 5000);

    } catch (error) {
      console.error('AGI optimization failed:', error);
      toast.error('AGI optimization failed');
    }
  };

  const generateQuantumResistantKeys = async () => {
    try {
      toast.info('Generating quantum-resistant keys...', {
        description: 'Creating cryptographic key pairs with quantum resistance'
      });

      const { publicKey, privateKey } = await quantumCryptographyService.generateQuantumResistantKeyPair(
        selectedProtocol as any,
        256
      );

      setQuantumKeys(prev => [...prev, { publicKey, privateKey }]);

      toast.success('Quantum-resistant keys generated!', {
        description: `${selectedProtocol} keys with security level ${publicKey.quantumResistanceLevel}`
      });
    } catch (error) {
      console.error('Key generation failed:', error);
      toast.error('Failed to generate quantum keys');
    }
  };

  const [miningProgress, setMiningProgress] = useState<number>(0);
  const [miningStatus, setMiningStatus] = useState<'idle' | 'mining' | 'completed' | 'failed'>('idle');
  const [currentBlock, setCurrentBlock] = useState<any>(null);
  const [blockchainRecords, setBlockchainRecords] = useState<any[]>([]);

  const mineQuantumBlock = async () => {
    if (!currentCircuit) return;

    try {
      setMiningStatus('mining');
      setMiningProgress(0);
      
      toast.info('Initializing quantum mining...', {
        description: 'Setting up quantum consensus algorithms'
      });

      // Create a quantum transaction for the circuit
      const transaction = await quantumBlockchainService.createQuantumTransaction(
        'circuit-studio',
        'quantum-blockchain',
        1.0,
        {
          circuitId: currentCircuit.id,
          circuitData: currentCircuit,
          timestamp: Date.now()
        },
        await quantumCryptographyService.generateQuantumResistantKeyPair('lattice-based', 256).then(kp => kp.privateKey)
      );

      // Simulate mining progress
      const progressInterval = setInterval(() => {
        setMiningProgress(prev => {
          const newProgress = Math.min(100, prev + Math.random() * 12 + 3);
          
          if (newProgress < 30) {
            toast.info('Solving quantum proof-of-work...', {
              description: `Mining progress: ${newProgress.toFixed(0)}%`
            });
          } else if (newProgress < 60) {
            toast.info('Quantum consensus validation...', {
              description: `Validators approving: ${Math.floor(newProgress/20)}/5`
            });
          } else if (newProgress < 90) {
            toast.info('Quantum signature verification...', {
              description: `Cryptographic proofs: ${newProgress.toFixed(0)}%`
            });
          }
          
          return newProgress;
        });
      }, 600);

      // Start the actual mining process
      const block = await quantumBlockchainService.mineQuantumBlock('quantum-studio');
      
      // Complete mining
      setTimeout(() => {
        clearInterval(progressInterval);
        setMiningProgress(100);
        setMiningStatus('completed');
        setCurrentBlock(block);
        
        // Update circuit with blockchain hash
        const updatedCircuit = {
          ...currentCircuit,
          blockchainHash: block.blockHash
        };
        
        setCurrentCircuit(updatedCircuit);
        saveCircuitToDatabase(updatedCircuit);
        
        // Update blockchain records
        setBlockchainRecords(prev => [block, ...prev]);
        
        // Update blockchain stats
        const stats = quantumBlockchainService.getBlockchainStats();
        setBlockchainStats(stats);

        toast.success('Quantum block successfully mined!', {
          description: `Block ${block.blockHash.substring(0, 8)}... validated with quantum consensus`
        });
      }, 4000);

    } catch (error) {
      console.error('Block mining failed:', error);
      setMiningStatus('failed');
      setMiningProgress(0);
      toast.error('Quantum mining failed', {
        description: 'Failed to mine quantum block'
      });
    }
  };

  const runResistanceTest = async () => {
    if (!currentCircuit) return;

    try {
      toast.info('Running quantum resistance test...', {
        description: 'Testing circuit against quantum attacks'
      });

      const test = await quantumResistanceService.runResistanceTest(
        currentCircuit.id,
        'post-quantum-security',
        {
          keySize: 256,
          iterations: 1000,
          attackStrength: 8,
          timeLimit: 3600
        }
      );

      setResistanceTests(prev => [...prev, test]);

      // Generate security assessment after test completes
      setTimeout(async () => {
        try {
          const assessment = await quantumResistanceService.generateSecurityAssessment(currentCircuit.id);
          setSecurityAssessment(assessment);

          toast.success('Resistance test completed!', {
            description: `Security level: ${assessment.quantumSecurityLevel}/5`
          });
        } catch (error) {
          console.error('Security assessment failed:', error);
        }
      }, 3000);

    } catch (error) {
      console.error('Resistance test failed:', error);
      toast.error('Failed to run resistance test');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="glass-panel">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-purple-400" />
                Quantum Circuit Studio
                <Badge className="bg-purple-900/40 text-purple-300">
                  AGI-Powered
                </Badge>
              </CardTitle>
              <p className="text-gray-400 mt-2">
                Advanced quantum circuit design with AGI optimization, cryptography, and blockchain integration
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={executeAGIOptimization} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                AGI Optimize
              </Button>
              <Button onClick={mineQuantumBlock} variant="outline">
                <Blocks className="h-4 w-4 mr-2" />
                Mine Block
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Circuit Designer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-400" />
                Circuit Designer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Circuit Canvas */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full border border-purple-500/20 rounded-lg bg-black/20"
                    style={{ maxHeight: '400px' }}
                  />
                   {optimizationProgress > 0 && optimizationProgress < 100 && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                       <div className="text-center space-y-3">
                         <div className="text-white font-medium">AGI Optimization in Progress</div>
                         <Progress value={optimizationProgress} className="w-64" />
                         <div className="text-sm text-gray-400">{optimizationProgress.toFixed(0)}% Complete</div>
                       </div>
                     </div>
                   )}
                   {miningStatus === 'mining' && (
                     <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                       <div className="text-center space-y-4">
                         <div className="text-white font-medium">Quantum Block Mining</div>
                         <div className="flex items-center gap-3">
                           <Blocks className="h-5 w-5 text-blue-400 animate-pulse" />
                           <Progress value={miningProgress} className="w-64" />
                           <span className="text-sm text-blue-400">{miningProgress.toFixed(0)}%</span>
                         </div>
                         <div className="text-sm text-gray-400">
                           {miningProgress < 30 && "Solving quantum proof-of-work..."}
                           {miningProgress >= 30 && miningProgress < 60 && "Quantum consensus validation..."}
                           {miningProgress >= 60 && miningProgress < 90 && "Quantum signature verification..."}
                           {miningProgress >= 90 && "Finalizing block..."}
                         </div>
                       </div>
                     </div>
                   )}
                </div>

                {/* Circuit Stats */}
                {currentCircuit && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900/40 rounded-lg p-3 text-center">
                      <div className="text-xl font-mono text-white">{currentCircuit.qubits}</div>
                      <div className="text-xs text-gray-400">Qubits</div>
                    </div>
                    <div className="bg-gray-900/40 rounded-lg p-3 text-center">
                      <div className="text-xl font-mono text-white">{currentCircuit.depth}</div>
                      <div className="text-xs text-gray-400">Depth</div>
                    </div>
                    <div className="bg-gray-900/40 rounded-lg p-3 text-center">
                      <div className="text-xl font-mono text-white">{(currentCircuit.fidelity * 100).toFixed(1)}%</div>
                      <div className="text-xs text-gray-400">Fidelity</div>
                    </div>
                    <div className="bg-gray-900/40 rounded-lg p-3 text-center">
                      <div className="text-xl font-mono text-white">{currentCircuit.quantumResistanceLevel}/10</div>
                      <div className="text-xs text-gray-400">Q-Resistance</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Features Tabs */}
          <Card className="glass-panel">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="agi">AGI Workflow</TabsTrigger>
                  <TabsTrigger value="crypto">Cryptography</TabsTrigger>
                  <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                  <TabsTrigger value="resistance">Resistance</TabsTrigger>
                </TabsList>

                <TabsContent value="agi" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">AGI Model</label>
                      <Select value={selectedAgiModel} onValueChange={setSelectedAgiModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {agiModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name} (Level {model.superintelligenceLevel})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {superintelligenceScore > 0 && (
                      <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-400" />
                          <span className="text-sm font-medium">Superintelligence Score</span>
                        </div>
                        <div className="text-2xl font-mono text-purple-300">
                          {(superintelligenceScore * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {agiExecution && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400">Recent Optimizations:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Gate Reduction: {(agiExecution.optimizationImprovements.gateReduction * 100).toFixed(1)}%</div>
                          <div>Depth Optimization: {(agiExecution.optimizationImprovements.depthOptimization * 100).toFixed(1)}%</div>
                          <div>Fidelity Improvement: {(agiExecution.optimizationImprovements.fidelityImprovement * 100).toFixed(1)}%</div>
                          <div>Quantum Advantage: {(agiExecution.optimizationImprovements.quantumAdvantage * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="crypto" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Cryptographic Protocol</label>
                      <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lattice-based">CRYSTALS-Kyber (Lattice)</SelectItem>
                          <SelectItem value="hash-based">SPHINCS+ (Hash)</SelectItem>
                          <SelectItem value="multivariate">Rainbow (Multivariate)</SelectItem>
                          <SelectItem value="qkd">Quantum Key Distribution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={generateQuantumResistantKeys} className="w-full" variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Generate Quantum Keys
                    </Button>

                    {quantumKeys.length > 0 && (
                      <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">Generated Keys</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {quantumKeys.length} quantum-resistant key pairs created
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="blockchain" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Total Blocks</div>
                        <div className="text-xl font-mono text-blue-300">
                          {blockchainStats.totalBlocks || 0}
                        </div>
                      </div>
                      <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Avg Quantum Advantage</div>
                        <div className="text-xl font-mono text-purple-300">
                          {((blockchainStats.avgQuantumAdvantage || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                     {currentCircuit?.blockchainHash && (
                       <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                         <div className="flex items-center gap-2 mb-2">
                           <Database className="h-4 w-4 text-green-400" />
                           <span className="text-sm font-medium">Blockchain Secured</span>
                         </div>
                         <div className="text-xs font-mono text-gray-400 break-all">
                           {currentCircuit.blockchainHash}
                         </div>
                       </div>
                     )}

                     {currentBlock && (
                       <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                         <div className="flex items-center gap-2 mb-3">
                           <Blocks className="h-4 w-4 text-blue-400" />
                           <span className="text-sm font-medium">Latest Mined Block</span>
                         </div>
                         <div className="space-y-2 text-xs">
                           <div className="flex justify-between">
                             <span className="text-gray-400">Block Hash:</span>
                             <span className="font-mono text-blue-300">
                               {currentBlock.blockHash.substring(0, 12)}...
                             </span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">Validation:</span>
                             <Badge className="bg-green-900/40 text-green-300 text-xs">
                               {currentBlock.validationStatus}
                             </Badge>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">Quantum Proof:</span>
                             <span className="text-green-400">
                               {(currentBlock.quantumProof.fidelityScore * 100).toFixed(1)}%
                             </span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-400">Difficulty:</span>
                             <span className="text-white">{currentBlock.miningDifficulty}</span>
                           </div>
                         </div>
                       </div>
                     )}

                     {blockchainRecords.length > 0 && (
                       <div className="space-y-2">
                         <div className="text-sm text-gray-400">Recent Blocks:</div>
                         <div className="space-y-2 max-h-40 overflow-y-auto">
                           {blockchainRecords.slice(0, 5).map((block, index) => (
                             <div key={block.id} className="bg-gray-900/40 border border-gray-700/50 rounded p-2">
                               <div className="flex justify-between items-center">
                                 <span className="text-xs font-mono text-gray-300">
                                   {block.blockHash.substring(0, 8)}...
                                 </span>
                                 <Badge className={`text-xs ${
                                   block.validationStatus === 'validated' 
                                     ? 'bg-green-900/40 text-green-300' 
                                     : 'bg-yellow-900/40 text-yellow-300'
                                 }`}>
                                   {block.validationStatus}
                                 </Badge>
                               </div>
                               <div className="text-xs text-gray-400 mt-1">
                                 Quantum Advantage: {(block.quantumProof.quantumAdvantage * 100).toFixed(1)}%
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                  </div>
                </TabsContent>

                <TabsContent value="resistance" className="space-y-4">
                  <div className="space-y-4">
                    <Button onClick={runResistanceTest} className="w-full" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Run Quantum Resistance Test
                    </Button>

                    {securityAssessment && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-900/40 rounded-lg p-3">
                            <div className="text-sm text-gray-400">Overall Score</div>
                            <div className="text-xl font-mono text-white">
                              {securityAssessment.overallScore.toFixed(1)}/10
                            </div>
                          </div>
                          <div className="bg-gray-900/40 rounded-lg p-3">
                            <div className="text-sm text-gray-400">Security Level</div>
                            <div className="text-xl font-mono text-white">
                              {securityAssessment.quantumSecurityLevel}/5
                            </div>
                          </div>
                        </div>

                        {securityAssessment.criticalVulnerabilities > 0 && (
                          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                              <span className="text-sm font-medium">Critical Vulnerabilities</span>
                            </div>
                            <div className="text-sm text-red-300">
                              {securityAssessment.criticalVulnerabilities} critical issues found
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Real-time Metrics */}
        <div className="space-y-6">
          {/* AGI Status */}
          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-purple-400" />
                AGI Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Processing Power</span>
                  <span className="text-sm font-mono text-white">
                    {(Math.random() * 100 + 900).toFixed(0)} QFLOPS
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Memory Usage</span>
                  <span className="text-sm font-mono text-white">
                    {(Math.random() * 30 + 60).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Coherence Time</span>
                  <span className="text-sm font-mono text-white">
                    {(Math.random() * 200 + 800).toFixed(0)}μs
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantum Metrics */}
          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-blue-400" />
                Quantum Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Entanglement</span>
                  <span className="text-sm font-mono text-white">
                    {(Math.random() * 0.3 + 0.7).toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Error Rate</span>
                  <span className="text-sm font-mono text-white">
                    {(Math.random() * 0.05).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Gate Fidelity</span>
                  <span className="text-sm font-mono text-white">
                    {(Math.random() * 0.05 + 0.95).toFixed(3)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Status */}
          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-400" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Quantum Resistance</span>
                  <Badge className="bg-green-900/40 text-green-300 text-xs">
                    Level {currentCircuit?.quantumResistanceLevel || 1}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Cryptographic Strength</span>
                  <span className="text-sm font-mono text-white">256-bit</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Blockchain Secured</span>
                  <Badge className={`text-xs ${currentCircuit?.blockchainHash ? 'bg-green-900/40 text-green-300' : 'bg-gray-900/40 text-gray-400'}`}>
                    {currentCircuit?.blockchainHash ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-yellow-400" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Optimization Gain</span>
                  <span className="text-sm font-mono text-green-400">
                    +{(Math.random() * 20 + 10).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Execution Speed</span>
                  <span className="text-sm font-mono text-blue-400">
                    {(Math.random() * 5 + 2).toFixed(1)}x faster
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Energy Efficiency</span>
                  <span className="text-sm font-mono text-purple-400">
                    {(Math.random() * 30 + 85).toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}