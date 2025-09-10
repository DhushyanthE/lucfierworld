
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Cpu, 
  Zap, 
  GitBranch,
  BarChart3, 
  Settings, 
  RefreshCw, 
  Brain,
  CheckCircle2
} from 'lucide-react';
import { circuitOptimizer, QuantumCircuit, OptimizationResult } from '@/lib/quantum/CircuitOptimizer';

interface CircuitParameter {
  name: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

export function CircuitOptimizationPanel() {
  const [optimizationMethod, setOptimizationMethod] = useState<'depth' | 'fidelity' | 'coherence' | 'balanced' | 'agi'>('balanced');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [circuit, setCircuit] = useState<QuantumCircuit | null>(null);
  const [activeTab, setActiveTab] = useState('parameters');
  const [isAutoOptimize, setIsAutoOptimize] = useState(false);
  
  // Circuit parameters
  const [parameters, setParameters] = useState<CircuitParameter[]>([
    { name: 'Quantum Depth', min: 1, max: 100, step: 1, value: 42 },
    { name: 'Entanglement Rate', min: 0, max: 100, step: 1, value: 85 },
    { name: 'Error Correction', min: 0, max: 100, step: 5, value: 75 },
    { name: 'Qubits', min: 5, max: 100, step: 1, value: 23 },
    { name: 'Gate Fidelity', min: 50, max: 100, step: 1, value: 92 }
  ]);

  // Initialize with a sample circuit
  useEffect(() => {
    const sampleCircuit = circuitOptimizer.generateSampleCircuit(
      parameters.find(p => p.name === 'Qubits')?.value || 10, 
      'medium'
    );
    setCircuit(sampleCircuit);
  }, []);

  // Auto-optimize on parameter changes if enabled
  useEffect(() => {
    if (isAutoOptimize && circuit) {
      const timeoutId = setTimeout(() => {
        handleOptimizeCircuit();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [parameters, isAutoOptimize]);

  // Update a parameter value
  const updateParameter = (name: string, value: number) => {
    setParameters(prev => 
      prev.map(param => 
        param.name === name ? { ...param, value } : param
      )
    );
    
    // Update circuit based on parameters
    if (name === 'Qubits' && circuit) {
      const newCircuit = circuitOptimizer.generateSampleCircuit(value, 'medium');
      setCircuit(newCircuit);
    }
  };

  const handleOptimizeCircuit = async () => {
    if (!circuit) return;
    
    setIsOptimizing(true);
    
    try {
      // Apply current parameters to circuit
      const enhancedCircuit = {
        ...circuit,
        depth: parameters.find(p => p.name === 'Quantum Depth')?.value || circuit.depth,
        qubits: parameters.find(p => p.name === 'Qubits')?.value || circuit.qubits,
      };
      
      const result = await circuitOptimizer.optimizeCircuit(enhancedCircuit, {
        method: optimizationMethod,
        preserveFunctionality: true,
        maxIterations: 100,
        allowApproximation: optimizationMethod !== 'fidelity',
        targetFidelity: parameters.find(p => p.name === 'Gate Fidelity')?.value || 90,
        quantumThreshold: parameters.find(p => p.name === 'Entanglement Rate')?.value || 80,
      });
      
      setOptimizationResult(result);
      
      toast.success("Circuit optimization complete", {
        description: `Improved circuit with ${result.improvements.gateReduction} gate reduction`
      });
    } catch (error) {
      console.error('Circuit optimization error:', error);
      toast.error('Failed to optimize circuit');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Calculate a summary score based on parameters and optimization
  const calculatePerformanceScore = (): number => {
    if (!circuit) return 50;
    
    const depthFactor = Math.min(1, 50 / (parameters.find(p => p.name === 'Quantum Depth')?.value || 50));
    const qubitsFactor = Math.min(1, 20 / (parameters.find(p => p.name === 'Qubits')?.value || 20));
    const fidelityFactor = (parameters.find(p => p.name === 'Gate Fidelity')?.value || 90) / 100;
    const entanglementFactor = (parameters.find(p => p.name === 'Entanglement Rate')?.value || 80) / 100;
    const errorCorrectionFactor = (parameters.find(p => p.name === 'Error Correction')?.value || 70) / 100;
    
    // Calculate base score
    const baseScore = (
      depthFactor * 15 +
      qubitsFactor * 15 +
      fidelityFactor * 30 +
      entanglementFactor * 20 +
      errorCorrectionFactor * 20
    );
    
    // Add optimization bonus if available
    const optimizationBonus = optimizationResult 
      ? (optimizationResult.improvements.fidelityImprovement * 20) + 
        (optimizationResult.improvements.depthReduction * 0.5)
      : 0;
      
    return Math.min(99, baseScore + optimizationBonus);
  };

  const performanceScore = calculatePerformanceScore();

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Cpu className="h-5 w-5 text-purple-400" />
            Circuit Optimizer
            <Badge className="ml-2 bg-purple-900/40 text-purple-300 text-xs">
              v3.5
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-gray-900/40 text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-white"
              onClick={() => {
                const newCircuit = circuitOptimizer.generateSampleCircuit(
                  parameters.find(p => p.name === 'Qubits')?.value || 10, 
                  'medium'
                );
                setCircuit(newCircuit);
                setOptimizationResult(null);
                toast.info("Generated new quantum circuit");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              New Circuit
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="parameters" className="flex items-center gap-2 text-xs">
                <Settings className="h-4 w-4" />
                <span>Parameters</span>
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2 text-xs">
                <GitBranch className="h-4 w-4" />
                <span>Optimization</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2 text-xs">
                <BarChart3 className="h-4 w-4" />
                <span>Results</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Parameters Tab */}
          <TabsContent value="parameters" className="flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {parameters.map((param) => (
                <div key={param.name} className="bg-gray-900/40 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">{param.name}</span>
                    <span className="text-sm font-mono">{param.value}</span>
                  </div>
                  <Slider
                    value={[param.value]}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    onValueChange={(values) => updateParameter(param.name, values[0])}
                    className="my-1"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{param.min}</span>
                    <span>{param.max}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleOptimizeCircuit} 
                variant="default" 
                size="sm"
                disabled={isOptimizing || !circuit}
                className="bg-purple-700 hover:bg-purple-800"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Apply Parameters
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="flex-1 space-y-4">
            <div className="bg-gray-900/40 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Optimization Method</h3>
              <Select
                value={optimizationMethod}
                onValueChange={(value: any) => setOptimizationMethod(value)}
              >
                <SelectTrigger className="bg-gray-800/50">
                  <SelectValue placeholder="Select optimization method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="depth">Circuit Depth Reduction</SelectItem>
                  <SelectItem value="fidelity">Fidelity Optimization</SelectItem>
                  <SelectItem value="coherence">Coherence Enhancement</SelectItem>
                  <SelectItem value="balanced">Balanced Optimization</SelectItem>
                  <SelectItem value="agi">AGI-Enhanced Optimization</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {optimizationMethod === 'depth' && 'Focuses on reducing circuit depth and gate count'}
                {optimizationMethod === 'fidelity' && 'Prioritizes quantum operation fidelity over speed'}
                {optimizationMethod === 'coherence' && 'Optimizes for maintaining quantum coherence'}
                {optimizationMethod === 'balanced' && 'Balances depth, fidelity and error correction'}
                {optimizationMethod === 'agi' && 'Uses artificial general intelligence for optimal circuit design'}
              </p>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-300">Auto-Optimize</span>
                <Button 
                  variant={isAutoOptimize ? "default" : "outline"}
                  size="sm"
                  className={isAutoOptimize ? "bg-purple-700 hover:bg-purple-800" : ""}
                  onClick={() => setIsAutoOptimize(!isAutoOptimize)}
                >
                  {isAutoOptimize ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Enabled
                    </>
                  ) : (
                    'Enable'
                  )}
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-900/40 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Advanced Settings</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Max Iterations</span>
                    <span>100</span>
                  </div>
                  <Progress value={100} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Allow Approximation</span>
                    <span>{optimizationMethod !== 'fidelity' ? 'Yes' : 'No'}</span>
                  </div>
                  <Progress value={optimizationMethod !== 'fidelity' ? 100 : 0} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Preserve Functionality</span>
                    <span>Yes</span>
                  </div>
                  <Progress value={100} className="h-1.5" />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleOptimizeCircuit} 
                variant="default"
                disabled={isOptimizing || !circuit}
                className="bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-800 hover:to-blue-800"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing Circuit...
                  </>
                ) : (
                  <>
                    {optimizationMethod === 'agi' ? (
                      <Brain className="h-4 w-4 mr-2" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Optimize Quantum Circuit
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="flex-1 space-y-4">
            <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Performance Score</h3>
                <Badge 
                  className={`
                    ${performanceScore > 90 ? 'bg-green-900/40 text-green-300' : 
                      performanceScore > 75 ? 'bg-blue-900/40 text-blue-300' :
                      performanceScore > 60 ? 'bg-yellow-900/40 text-yellow-300' :
                      'bg-red-900/40 text-red-300'
                    }
                  `}
                >
                  {performanceScore > 90 ? 'Excellent' : 
                    performanceScore > 75 ? 'Good' :
                    performanceScore > 60 ? 'Average' : 
                    'Poor'
                  }
                </Badge>
              </div>
              
              <div className="relative h-8 w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 rounded-full opacity-20"></div>
                <div className="absolute inset-0 flex items-center">
                  <div className="h-8 bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 rounded-l-full" style={{ width: `${performanceScore}%` }}></div>
                  <div className="absolute left-0 w-full flex justify-center">
                    <div className="bg-black/80 rounded-full px-2 py-1 border border-white/20">
                      <span className="text-white font-bold">{performanceScore.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {optimizationResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/40 p-3 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Gate Reduction</h3>
                    <div className="text-2xl font-bold text-center text-green-400">
                      {optimizationResult.improvements.gateReduction}
                    </div>
                    <Progress 
                      value={Math.min(100, optimizationResult.improvements.gateReduction * 5)}
                      className="h-2 mt-2"
                    />
                  </div>
                  <div className="bg-gray-900/40 p-3 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Depth Reduction</h3>
                    <div className="text-2xl font-bold text-center text-blue-400">
                      {optimizationResult.improvements.depthReduction}
                    </div>
                    <Progress 
                      value={Math.min(100, optimizationResult.improvements.depthReduction * 10)}
                      className="h-2 mt-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/40 p-3 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Fidelity Improvement</h3>
                    <div className="text-2xl font-bold text-center text-purple-400">
                      {(optimizationResult.improvements.fidelityImprovement * 100).toFixed(1)}%
                    </div>
                    <Progress 
                      value={optimizationResult.improvements.fidelityImprovement * 100}
                      className="h-2 mt-2"
                    />
                  </div>
                  <div className="bg-gray-900/40 p-3 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Coherence Improvement</h3>
                    <div className="text-2xl font-bold text-center text-yellow-400">
                      {(optimizationResult.improvements.coherenceImprovement * 100).toFixed(1)}%
                    </div>
                    <Progress 
                      value={optimizationResult.improvements.coherenceImprovement * 100}
                      className="h-2 mt-2"
                    />
                  </div>
                </div>
                
                {optimizationMethod === 'agi' && (
                  <div className="bg-gray-900/40 p-3 rounded-lg">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      AGI Suggestions
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {optimizationResult.agiSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-center text-xs text-gray-500">
                  Optimization completed in {(optimizationResult.optimizationTime / 1000).toFixed(2)}s using {optimizationResult.optimizationMethod} method
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Cpu className="h-12 w-12 mb-3 opacity-30" />
                <p>No optimization results yet</p>
                <p className="text-sm mt-2">Run the optimizer to see performance metrics</p>
                
                <Button 
                  onClick={handleOptimizeCircuit} 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  disabled={isOptimizing || !circuit}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Run Optimization
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
