
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { QuantumTrainingAdvancedOptions } from '@/services/quantum/models/QuantumModelTypes';

interface QuantumAdvancedOptionsProps {
  options: QuantumTrainingAdvancedOptions;
  onChange: (options: QuantumTrainingAdvancedOptions) => void;
}

export function QuantumAdvancedOptions({ options, onChange }: QuantumAdvancedOptionsProps) {
  const handleOptionChange = (key: keyof QuantumTrainingAdvancedOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800 mb-4 text-sm">
      <h3 className="text-sm font-medium text-purple-300 mb-3">Advanced Quantum Training Options</h3>
      
      <div className="space-y-4">
        {/* Circuit Depth */}
        <div>
          <div className="flex justify-between">
            <Label htmlFor="circuit-depth">Quantum Circuit Depth</Label>
            <span className="text-xs text-gray-400">{options.quantumCircuitDepth}</span>
          </div>
          <Slider
            id="circuit-depth"
            min={1} 
            max={10}
            step={1}
            value={[options.quantumCircuitDepth]}
            onValueChange={(values) => handleOptionChange('quantumCircuitDepth', values[0])}
            className="my-2"
          />
        </div>
        
        {/* Quantum Noise Model */}
        <div>
          <Label htmlFor="noise-model" className="mb-2 block">Noise Model</Label>
          <Select 
            value={options.quantumNoiseModel} 
            onValueChange={(value) => handleOptionChange('quantumNoiseModel', value)}
          >
            <SelectTrigger id="noise-model" className="w-full bg-gray-800/50">
              <SelectValue placeholder="Select noise model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="depolarizing">Depolarizing</SelectItem>
              <SelectItem value="amplitude-damping">Amplitude Damping</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Circuit Optimization Level */}
        <div>
          <Label className="mb-2 block">Circuit Optimization</Label>
          <ToggleGroup 
            type="single" 
            value={options.circuitOptimization}
            onValueChange={(value) => value && handleOptionChange('circuitOptimization', value)}
            className="justify-start"
          >
            <ToggleGroupItem value="none" className="text-xs">None</ToggleGroupItem>
            <ToggleGroupItem value="light" className="text-xs">Light</ToggleGroupItem>
            <ToggleGroupItem value="medium" className="text-xs">Medium</ToggleGroupItem>
            <ToggleGroupItem value="aggressive" className="text-xs">Aggressive</ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {/* Toggle Options */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="gate-type" className="cursor-pointer">Parameterized Gates</Label>
            <Switch 
              id="gate-type" 
              checked={options.parameterizedGates}
              onCheckedChange={(checked) => handleOptionChange('parameterizedGates', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="adaptive-lr" className="cursor-pointer">Adaptive Learning Rate</Label>
            <Switch 
              id="adaptive-lr" 
              checked={options.adaptiveLearningRate}
              onCheckedChange={(checked) => handleOptionChange('adaptiveLearningRate', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="quantum-backprop" className="cursor-pointer">Quantum Backpropagation</Label>
            <Switch 
              id="quantum-backprop" 
              checked={options.quantumBackpropagation}
              onCheckedChange={(checked) => handleOptionChange('quantumBackpropagation', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="memory-opt" className="cursor-pointer">Memory Optimization</Label>
            <Switch 
              id="memory-opt" 
              checked={options.quantumMemoryOptimization}
              onCheckedChange={(checked) => handleOptionChange('quantumMemoryOptimization', checked)}
            />
          </div>
        </div>
        
        {/* Regularization Strength */}
        <div>
          <div className="flex justify-between">
            <Label htmlFor="reg-strength">Regularization Strength</Label>
            <span className="text-xs text-gray-400">{options.regularizationStrength.toFixed(4)}</span>
          </div>
          <Slider
            id="reg-strength"
            min={0.0001} 
            max={0.01}
            step={0.0001}
            value={[options.regularizationStrength]}
            onValueChange={(values) => handleOptionChange('regularizationStrength', values[0])}
            className="my-2"
          />
        </div>
        
        {/* Early Stopping Patience */}
        <div>
          <div className="flex justify-between">
            <Label htmlFor="early-stop">Early Stopping Patience (epochs)</Label>
            <span className="text-xs text-gray-400">{options.earlyStoppingPatience}</span>
          </div>
          <Slider
            id="early-stop"
            min={0} 
            max={50}
            step={1}
            value={[options.earlyStoppingPatience]}
            onValueChange={(values) => handleOptionChange('earlyStoppingPatience', values[0])}
            className="my-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            {options.earlyStoppingPatience === 0 ? 
              "Early stopping disabled" : 
              `Training will stop if no improvement after ${options.earlyStoppingPatience} epochs`}
          </p>
        </div>
      </div>
    </div>
  );
}
