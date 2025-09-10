
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Cpu, Zap, BrainCircuit, Shuffle } from 'lucide-react';
import {
  calculateCircuitDepth,
  calculateCircuitFidelity,
  optimizeCircuitGateCount,
  optimizeCircuitDepth,
} from '@/lib/quantum/workflow/utils/circuitOptimizer';
import { circuitOptimizer } from '@/lib/quantum/CircuitOptimizer';

// Helper function to convert between the two QuantumCircuit types
const adaptCircuit = (circuit: any): any => {
  // Make sure we have all the required fields for our component's state
  return {
    ...circuit,
    numQubits: circuit.numQubits || circuit.qubits || 3,
    name: circuit.name || `Circuit-${Date.now()}`,
    gates: circuit.gates || [],
    depth: circuit.depth || 0,
    fidelity: circuit.fidelity || 1.0
  };
};

// Helper function to convert optimizer circuit type to workflow circuit type
const convertToWorkflowCircuit = (circuit: any): any => {
  return {
    numQubits: circuit.qubits || circuit.numQubits || 3,
    gates: circuit.gates || [],
    depth: circuit.depth || 0,
    fidelity: circuit.fidelity || 1.0,
    name: circuit.name || `Circuit-${Date.now()}`
  };
};

export function CircuitVisualizer() {
  const [circuit, setCircuit] = useState(() => {
    const initialCircuit = circuitOptimizer.generateSampleCircuit(5, 'medium');
    return convertToWorkflowCircuit(initialCircuit);
  });
  
  const [optimizationLevel, setOptimizationLevel] = useState<number>(0.5);
  const [randomComplexity, setRandomComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  
  useEffect(() => {
    // Recalculate depth and fidelity when circuit changes
    const depth = calculateCircuitDepth(circuit);
    const fidelity = calculateCircuitFidelity(circuit);
    
    setCircuit(prevCircuit => ({
      ...prevCircuit,
      depth: depth,
      fidelity: fidelity
    }));
  }, [circuit.gates]);

  const handleOptimizeCircuit = async () => {
    try {
      setIsOptimizing(true);
      // Use the adapter function to ensure type compatibility and handle the Promise properly
      const optimizationResult = await circuitOptimizer.optimizeCircuit(circuit);
      
      // Now that we have the resolved Promise value, we can safely access originalCircuit
      if (optimizationResult && optimizationResult.originalCircuit) {
        const adaptedCircuit = convertToWorkflowCircuit(optimizationResult.originalCircuit);
        setCircuit(adaptedCircuit);
        
        toast.success('Circuit optimized successfully', {
          description: `Improved fidelity by ${((adaptedCircuit.fidelity - circuit.fidelity) * 100).toFixed(1)}%`
        });
      }
    } catch (error) {
      console.error('Circuit optimization error:', error);
      toast.error('Failed to optimize circuit');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateRandomCircuit = () => {
    try {
      // Use generateSampleCircuit instead of generateRandomCircuit
      const randomCircuit = circuitOptimizer.generateSampleCircuit(
        randomComplexity === 'simple' ? 3 : 
        randomComplexity === 'medium' ? 5 : 8,
        randomComplexity
      );
      
      // Use the adapter function to ensure type compatibility
      const adaptedCircuit = convertToWorkflowCircuit(randomCircuit);
      setCircuit(adaptedCircuit);
      
      toast.success('Random circuit generated', {
        description: `${adaptedCircuit.gates.length} gates with ${adaptedCircuit.numQubits} qubits`
      });
    } catch (error) {
      console.error('Circuit generation error:', error);
      toast.error('Failed to generate random circuit');
    }
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <Cpu className="h-5 w-5 mr-2 text-purple-400" />
            Circuit Visualizer
          </div>
          <Badge className="bg-purple-900/40 text-purple-300">
            Depth: {circuit.depth}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/40 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Optimization Level</h4>
              <Slider
                defaultValue={[optimizationLevel * 100]}
                max={100}
                step={1}
                onValueChange={(value) => setOptimizationLevel(value[0] / 100)}
                className="text-purple-500"
              />
              <div className="text-xs text-gray-400 mt-1">
                Adjust the level of circuit optimization
              </div>
            </div>
            
            <div className="bg-gray-900/40 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Random Circuit Complexity</h4>
              <Select value={randomComplexity} onValueChange={value => setRandomComplexity(value as 'simple' | 'medium' | 'complex')}>
                <SelectTrigger className="bg-gray-800/50">
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-400 mt-1">
                Set the complexity level for random circuit generation
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={handleOptimizeCircuit}
              disabled={isOptimizing}
              className="bg-black/40 border-purple-500/30 text-purple-300 hover:bg-black/60"
            >
              {isOptimizing ? (
                <span className="flex items-center">
                  <Shuffle className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </span>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Circuit
                </>
              )}
            </Button>
            
            <Button
              onClick={handleGenerateRandomCircuit}
              disabled={isOptimizing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Generate Random
            </Button>
          </div>
          
          <div className="bg-gray-900/40 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">Circuit Details</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Qubits:</span>
                <span className="ml-1">{circuit.numQubits}</span>
              </div>
              <div>
                <span className="text-gray-400">Gates:</span>
                <span className="ml-1">{circuit.gates.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Fidelity:</span>
                <span className="ml-1">{(circuit.fidelity * 100).toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-gray-400">Depth:</span>
                <span className="ml-1">{circuit.depth}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
