
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface OptimizationControlsProps {
  onOptimizeGateCount: () => void;
  onOptimizeDepth: () => void;
  onReset: () => void;
  onChangeNoiseLevel: (value: number) => void;
  onApplyErrorCorrection: () => void;
  noiseLevel: number;
  errorCorrectionStrength: number;
  onChangeErrorCorrectionStrength: (value: number) => void;
  isOptimizing: boolean;
}

export function OptimizationControls({
  onOptimizeGateCount,
  onOptimizeDepth,
  onReset,
  onChangeNoiseLevel,
  onApplyErrorCorrection,
  noiseLevel,
  errorCorrectionStrength,
  onChangeErrorCorrectionStrength,
  isOptimizing
}: OptimizationControlsProps) {
  return (
    <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-purple-500/20">
      <h3 className="text-lg font-medium text-white">Optimization Controls</h3>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onOptimizeGateCount}
          variant="outline"
          size="sm"
          disabled={isOptimizing}
          className="bg-blue-900/30 text-blue-300 border-blue-500/30 hover:bg-blue-800/40"
        >
          Optimize Gate Count
        </Button>
        
        <Button 
          onClick={onOptimizeDepth}
          variant="outline"
          size="sm"
          disabled={isOptimizing}
          className="bg-green-900/30 text-green-300 border-green-500/30 hover:bg-green-800/40"
        >
          Optimize Circuit Depth
        </Button>
        
        <Button 
          onClick={onReset}
          variant="outline"
          size="sm"
          disabled={isOptimizing}
          className="bg-red-900/30 text-red-300 border-red-500/30 hover:bg-red-800/40"
        >
          Reset Circuit
        </Button>
      </div>
      
      <div className="space-y-6 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400">Quantum Noise Level</label>
            <span className="text-xs bg-purple-900/50 px-2 py-1 rounded text-purple-300">
              {(noiseLevel * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[noiseLevel * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) => onChangeNoiseLevel(values[0] / 100)}
            disabled={isOptimizing}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400">Error Correction Strength</label>
            <span className="text-xs bg-blue-900/50 px-2 py-1 rounded text-blue-300">
              {(errorCorrectionStrength * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[errorCorrectionStrength * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) => onChangeErrorCorrectionStrength(values[0] / 100)}
            disabled={isOptimizing}
          />
        </div>
        
        <Button 
          onClick={onApplyErrorCorrection}
          variant="outline"
          size="sm"
          disabled={isOptimizing}
          className="w-full bg-indigo-900/30 text-indigo-300 border-indigo-500/30 hover:bg-indigo-800/40"
        >
          Apply Error Correction
        </Button>
      </div>
    </div>
  );
}
