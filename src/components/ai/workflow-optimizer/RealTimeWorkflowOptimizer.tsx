
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, TrendingUp, Activity, Cpu, RefreshCw } from 'lucide-react';
import { WorkflowStepList } from './WorkflowStepList';
import { WorkflowMetrics } from './WorkflowMetrics';
import { NeuralNetworkStats } from './NeuralNetworkStats';
import { WorkflowEfficiencyMetrics } from './WorkflowEfficiencyMetrics';
import { RealTimeMetrics } from './RealTimeMetrics';
import { useRealTimeWorkflowOptimizer } from './useRealTimeWorkflowOptimizer';

export function RealTimeWorkflowOptimizer() {
  const {
    steps,
    metrics,
    neuralNetworkStats,
    workflowEfficiencyMetrics,
    realTimeMetrics,
    isRunning,
    activeStep,
    efficiency,
    startOptimization,
    resetOptimizer,
    lastOptimizationTime
  } = useRealTimeWorkflowOptimizer();

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            Real-Time Workflow Optimizer
            {efficiency > 85 && (
              <Badge variant="outline" className="ml-2 bg-green-900/40 text-green-300 border-green-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                High Efficiency
              </Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startOptimization}
              disabled={isRunning}
              className="bg-purple-900/30 border-purple-500/30 text-purple-300 hover:bg-purple-900/50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-1" />
                  Start Optimization
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetOptimizer}
              disabled={isRunning}
              className="bg-gray-900/30 border-gray-700 text-gray-400 hover:bg-gray-800/50"
            >
              Reset
            </Button>
          </div>
        </div>
        
        {/* Overall Progress */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-300">Optimization Progress</div>
              <div className="text-sm text-gray-400">{Math.round(efficiency)}%</div>
            </div>
            <Progress value={efficiency} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Real-Time Metrics */}
        <RealTimeMetrics metrics={realTimeMetrics} />
        
        {/* Performance Metrics Grid */}
        <WorkflowMetrics metrics={metrics} />
        
        {/* Workflow Efficiency Metrics */}
        <WorkflowEfficiencyMetrics metrics={workflowEfficiencyMetrics} />
        
        {/* Neural Network Statistics */}
        <NeuralNetworkStats stats={neuralNetworkStats} />
        
        {/* Workflow Steps */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-blue-400" />
            <div className="text-sm font-medium text-gray-200">Optimization Steps</div>
          </div>
          <WorkflowStepList steps={steps} activeStep={activeStep} />
        </div>
        
        {/* Status Footer */}
        <div className="pt-4 border-t border-gray-800">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Cpu className="h-3 w-3" />
              {isRunning ? `Processing: ${activeStep || 'Initializing'}` : 'Ready for optimization'}
            </div>
            {lastOptimizationTime && (
              <div>Last optimization: {lastOptimizationTime.toLocaleTimeString()}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
