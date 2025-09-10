
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, TrendingDown, Zap, CheckCircle } from 'lucide-react';
import { NeuralNetworkStats as NeuralNetworkStatsType } from './useRealTimeWorkflowOptimizer';

interface NeuralNetworkStatsProps {
  stats: NeuralNetworkStatsType;
}

export function NeuralNetworkStats({ stats }: NeuralNetworkStatsProps) {
  const accuracyPercentage = stats.accuracy * 100;
  const validationPercentage = stats.validationScore * 100;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-purple-400" />
        <div className="text-sm font-medium text-gray-200">Neural Network Enhancement</div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-gray-900/40 border-gray-700/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Accuracy</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {accuracyPercentage.toFixed(2)}%
                </span>
              </div>
              <Progress value={accuracyPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 border-gray-700/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-gray-300">Loss</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {stats.loss.toFixed(4)}
                </span>
              </div>
              <Progress value={(1 - stats.loss) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 border-gray-700/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Validation</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {validationPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={validationPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 border-gray-700/50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Training Progress</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Epochs: {stats.epochs}/100</div>
                <div>Learning Rate: {stats.learningRate}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
