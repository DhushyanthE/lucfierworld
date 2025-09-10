
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, Cpu, CheckCircle, Zap } from 'lucide-react';
import { WorkflowEfficiencyMetrics as WorkflowEfficiencyMetricsType } from './useRealTimeWorkflowOptimizer';

interface WorkflowEfficiencyMetricsProps {
  metrics: WorkflowEfficiencyMetricsType;
}

export function WorkflowEfficiencyMetrics({ metrics }: WorkflowEfficiencyMetricsProps) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-200 mb-3">Workflow Efficiency Metrics</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-gray-900/40 border-gray-700/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Execution Time</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {metrics.executionTime.toFixed(1)}s
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Current workflow execution duration
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 border-gray-700/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Parallelization</span>
                </div>
                <Badge variant="outline" className="bg-green-900/20 text-green-300 border-green-500/30">
                  {metrics.parallelizationFactor.toFixed(1)}x
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                Parallel execution improvement factor
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 border-gray-700/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Resource Optimization</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {metrics.resourceOptimization.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.resourceOptimization} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 border-gray-700/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Step Success Rate</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {metrics.stepSuccessRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.stepSuccessRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 border-gray-700/50 lg:col-span-2">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Overall Efficiency</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${
                    metrics.overallEfficiency > 80 
                      ? 'bg-green-900/20 text-green-300 border-green-500/30'
                      : metrics.overallEfficiency > 60
                      ? 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30'
                      : 'bg-red-900/20 text-red-300 border-red-500/30'
                  }`}
                >
                  {metrics.overallEfficiency.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={metrics.overallEfficiency} 
                className="h-3" 
              />
              <div className="text-xs text-gray-400">
                Combined efficiency score across all workflow dimensions
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
