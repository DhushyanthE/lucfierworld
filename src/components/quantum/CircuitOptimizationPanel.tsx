
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, GitMerge, BarChart3, Layers, MoveUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { circuitOptimizer } from '@/lib/quantum/CircuitOptimizer';

export function CircuitOptimizationPanel() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizationMethod, setOptimizationMethod] = useState<string>('balanced');
  const [preserveFunctionality, setPreserveFunctionality] = useState(true);
  const [maxIterations, setMaxIterations] = useState(20);
  const [allowApproximation, setAllowApproximation] = useState(false);
  const [targetFidelity, setTargetFidelity] = useState(0.95);
  const [optimizationResult, setOptimizationResult] = useState<any | null>(null);

  const startOptimization = async () => {
    setIsOptimizing(true);
    setProgress(0);
    setOptimizationResult(null);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newValue = prev + (Math.random() * 5);
        return Math.min(newValue, 99);
      });
    }, 100);
    
    try {
      // Call the circuit optimizer with the appropriate options
      const options = {
        method: optimizationMethod as any,
        preserveFunctionality,
        maxIterations,
        allowApproximation,
        targetFidelity,
        quantumThreshold: 0.8
      };
      
      // Generate a sample circuit to optimize
      const sampleCircuit = circuitOptimizer.generateSampleCircuit(
        6, 
        optimizationMethod === 'depth' ? 'complex' : 'medium'
      );

      // Optimize the sample circuit
      const result = await circuitOptimizer.optimizeCircuit(sampleCircuit, options);
      
      // Simulate completion
      setProgress(100);
      clearInterval(progressInterval);
      
      // Set the optimization result
      setOptimizationResult(result);
      
      toast.success("Circuit optimization complete", {
        description: `Improved efficiency by ${Math.round(result.improvements.gateReduction)}%`
      });
    } catch (error) {
      console.error("Optimization error:", error);
      toast.error("Optimization failed", {
        description: "Please check the console for details"
      });
    } finally {
      clearInterval(progressInterval);
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800/50">
        <h3 className="text-lg font-medium text-white mb-4">Circuit Optimization Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="method">Optimization Strategy</Label>
            <Select value={optimizationMethod} onValueChange={setOptimizationMethod}>
              <SelectTrigger id="method" className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="depth">Gate Depth Reduction</SelectItem>
                <SelectItem value="fidelity">Fidelity Improvement</SelectItem>
                <SelectItem value="coherence">Quantum Coherence</SelectItem>
                <SelectItem value="balanced">Balanced Approach</SelectItem>
                <SelectItem value="agi">AGI-Assisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="iterations">Max Iterations: {maxIterations}</Label>
            <Slider 
              id="iterations"
              min={5} 
              max={50} 
              step={5} 
              value={[maxIterations]} 
              onValueChange={(values) => setMaxIterations(values[0])} 
              disabled={isOptimizing}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="preserve" className="flex-1">Preserve Functionality</Label>
            <Switch 
              id="preserve" 
              checked={preserveFunctionality} 
              onCheckedChange={setPreserveFunctionality}
              disabled={isOptimizing}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="approximation" className="flex-1">Allow Approximation</Label>
            <Switch 
              id="approximation" 
              checked={allowApproximation} 
              onCheckedChange={setAllowApproximation}
              disabled={isOptimizing || preserveFunctionality}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fidelity">Target Fidelity: {targetFidelity.toFixed(2)}</Label>
            <Slider 
              id="fidelity"
              min={0.8} 
              max={1} 
              step={0.01} 
              value={[targetFidelity]} 
              onValueChange={(values) => setTargetFidelity(values[0])} 
              disabled={isOptimizing}
            />
          </div>
        </div>
        
        <Button 
          onClick={startOptimization}
          disabled={isOptimizing}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isOptimizing ? (
            <>
              <GitMerge className="h-4 w-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Start Optimization
            </>
          )}
        </Button>
        
        {isOptimizing && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </div>
      
      {optimizationResult && (
        <Card className="bg-gray-900/40 border-purple-500/20">
          <CardContent className="pt-6 pb-4">
            <h3 className="text-lg font-medium text-white mb-4">Optimization Results</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-3 flex flex-col items-center">
                <BarChart3 className="h-5 w-5 text-green-400 mb-1" />
                <div className="text-xs text-gray-400">Gate Reduction</div>
                <div className="text-lg text-green-400 font-mono">
                  {optimizationResult.improvements.gateReduction}%
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 flex flex-col items-center">
                <Layers className="h-5 w-5 text-blue-400 mb-1" />
                <div className="text-xs text-gray-400">Depth Reduction</div>
                <div className="text-lg text-blue-400 font-mono">
                  {optimizationResult.improvements.depthReduction}%
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 flex flex-col items-center">
                <Zap className="h-5 w-5 text-yellow-400 mb-1" />
                <div className="text-xs text-gray-400">Fidelity Improvement</div>
                <div className="text-lg text-yellow-400 font-mono">
                  {(optimizationResult.improvements.fidelityImprovement * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 flex flex-col items-center">
                <MoveUpRight className="h-5 w-5 text-purple-400 mb-1" />
                <div className="text-xs text-gray-400">Coherence Boost</div>
                <div className="text-lg text-purple-400 font-mono">
                  {(optimizationResult.improvements.coherenceImprovement * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">AGI Suggestions:</h4>
              <ul className="text-xs text-gray-400 space-y-1 list-disc pl-5">
                {optimizationResult.agiSuggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 text-right">
              Optimization time: {(optimizationResult.optimizationTime / 1000).toFixed(2)}s |
              Method: {optimizationResult.optimizationMethod}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
