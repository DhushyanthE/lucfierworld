
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, BarChart4 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TrainingProgressProps {
  isTraining: boolean;
  currentEpoch: number;
  totalEpochs: number;
  trainingProgress: number;
  trainingMetrics: {
    accuracy: number;
    loss: number;
    fidelity: number;
    quantumAdvantage: number;
    quantumCoherence?: number;
    quantumEntanglement?: number;
    energyEfficiency?: number;
  };
  onStartTraining: () => void;
  onEpochsChange: (epochs: number) => void;
}

export function TrainingProgress({
  isTraining,
  currentEpoch,
  totalEpochs,
  trainingProgress,
  trainingMetrics,
  onStartTraining,
  onEpochsChange
}: TrainingProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm font-medium">Progress</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Epoch {currentEpoch}/{totalEpochs}
          </span>
          {!isTraining && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Epochs:</span>
              <Input 
                type="number" 
                value={totalEpochs} 
                onChange={e => onEpochsChange(parseInt(e.target.value) || 10)}
                className="h-6 w-16 py-0 px-1 text-xs bg-gray-800 border-gray-700"
                min={10}
                max={1000}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <Progress value={trainingProgress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800 text-center">
          <div className="text-xs text-gray-400 mb-1">Accuracy</div>
          <div className="text-xl font-bold text-white">{(trainingMetrics.accuracy * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800 text-center">
          <div className="text-xs text-gray-400 mb-1">Loss</div>
          <div className="text-xl font-bold text-white">{trainingMetrics.loss.toFixed(4)}</div>
        </div>
      </div>
      
      {!isTraining && currentEpoch === 0 ? (
        <Button 
          onClick={onStartTraining} 
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isTraining}
        >
          <Play className="h-4 w-4 mr-2" />
          Start Training
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Quantum Fidelity</div>
            <div className="text-sm text-white">{(trainingMetrics.fidelity * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">Quantum Advantage</div>
            <div className="text-sm text-white">{trainingMetrics.quantumAdvantage.toFixed(1)}x</div>
          </div>
        </div>
      )}

      {(isTraining || currentEpoch > 0) && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-gray-900/40 p-2 rounded-lg border border-gray-800 text-center">
            <div className="text-xs text-gray-400">Coherence</div>
            <div className="text-sm text-white">{((trainingMetrics.quantumCoherence || 0) * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-900/40 p-2 rounded-lg border border-gray-800 text-center">
            <div className="text-xs text-gray-400">Entanglement</div>
            <div className="text-sm text-white">{((trainingMetrics.quantumEntanglement || 0) * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-900/40 p-2 rounded-lg border border-gray-800 text-center">
            <div className="text-xs text-gray-400">Efficiency</div>
            <div className="text-sm text-white">{((trainingMetrics.energyEfficiency || 0) * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
