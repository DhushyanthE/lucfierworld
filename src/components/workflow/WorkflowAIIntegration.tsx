
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Brain, Play, RefreshCw, Cpu, Lock, Zap } from 'lucide-react';
import { AIModelSelector } from './AIModelSelector';
import { useRealTimeWorkflow } from '@/hooks/useRealTimeWorkflow';
import { WorkflowStepType, AIModelType } from '@/types';

interface WorkflowAIIntegrationProps {
  initialSteps: WorkflowStepType[];
  defaultModel?: AIModelType;
}

export function WorkflowAIIntegration({ 
  initialSteps,
  defaultModel = 'gpt'
}: WorkflowAIIntegrationProps) {
  const {
    steps,
    isRunning,
    currentStepId,
    lastResponse,
    activeModel,
    switchModel,
    startWorkflow,
    resetWorkflow,
    optimizationLevel,
    setOptimizationLevel,
    quantumEnabled,
    toggleQuantum,
    blockchainVerification,
    toggleBlockchainVerification,
    lastExecutionTime
  } = useRealTimeWorkflow({
    initialSteps,
    defaultModel,
    enableQuantum: true,
    enableBlockchain: true
  });
  
  // Current step name for display
  const currentStepName = currentStepId ? 
    steps.find(step => step.id === currentStepId)?.name : 
    undefined;

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            AI-Powered Workflow Integration
            {quantumEnabled && (
              <Badge variant="outline" className="ml-2 bg-purple-900/40 text-purple-300 border-purple-500/30">
                <Cpu className="h-3 w-3 mr-1" />
                Quantum Enhanced
              </Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startWorkflow}
              disabled={isRunning}
              className="bg-purple-900/30 border-purple-500/30 text-purple-300 hover:bg-purple-900/50"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isRunning ? "Processing..." : "Run Workflow"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetWorkflow}
              disabled={isRunning}
              className="bg-gray-900/30 border-gray-700 text-gray-400 hover:bg-gray-800/50"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <AIModelSelector 
              activeModel={activeModel}
              onModelChange={switchModel}
              disabled={isRunning}
            />
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="optimization" className="text-sm font-medium text-gray-200">
                  Optimization Level
                </Label>
                <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-500/30">
                  Level {optimizationLevel}
                </Badge>
              </div>
              <Slider
                id="optimization"
                min={1}
                max={5}
                step={1}
                value={[optimizationLevel]}
                onValueChange={value => setOptimizationLevel(value[0])}
                disabled={isRunning}
                className="py-2"
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="quantum" className="text-sm font-medium text-gray-200">
                    Quantum Processing
                  </Label>
                  <p className="text-xs text-gray-400">
                    Enable quantum-enhanced calculations
                  </p>
                </div>
                <Switch
                  id="quantum"
                  checked={quantumEnabled}
                  onCheckedChange={toggleQuantum}
                  disabled={isRunning}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="blockchain" className="text-sm font-medium text-gray-200">
                    Blockchain Verification
                  </Label>
                  <p className="text-xs text-gray-400">
                    Secure results with blockchain
                  </p>
                </div>
                <Switch
                  id="blockchain"
                  checked={blockchainVerification}
                  onCheckedChange={toggleBlockchainVerification}
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-200">Workflow Steps</div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-2 rounded-md border ${
                    currentStepId === step.id
                      ? 'bg-blue-900/20 border-blue-500/50'
                      : step.status === 'completed'
                      ? 'bg-green-900/20 border-green-500/30'
                      : step.status === 'failed'
                      ? 'bg-red-900/20 border-red-500/30'
                      : 'bg-gray-900/40 border-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm">{step.name}</div>
                    <div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          step.status === 'running'
                            ? 'bg-blue-900/20 text-blue-300 border-blue-500/30'
                            : step.status === 'completed'
                            ? 'bg-green-900/20 text-green-300 border-green-500/30'
                            : step.status === 'failed'
                            ? 'bg-red-900/20 text-red-300 border-red-500/30'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                      >
                        {step.status === 'running' ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : step.status === 'completed' ? (
                          <Zap className="h-3 w-3 mr-1" />
                        ) : step.status === 'failed' ? (
                          <Lock className="h-3 w-3 mr-1" />
                        ) : null}
                        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {step.status === 'running' && (
                    <div className="w-full bg-gray-700/30 rounded-full h-1 mt-2">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {lastResponse && (
              <div className="mt-4 p-3 bg-gray-900/60 border border-gray-700 rounded-md">
                <div className="text-sm font-medium text-gray-200 mb-1">Last AI Response</div>
                <p className="text-sm text-gray-300">{lastResponse.result}</p>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <div>Confidence: {(lastResponse.confidence * 100).toFixed(1)}%</div>
                  <div>Processing time: {lastResponse.processingTime.toFixed(0)}ms</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-800 pt-4">
        <div className="w-full flex justify-between items-center text-xs text-gray-400">
          <div>{isRunning ? `Processing: ${currentStepName}` : 'Ready'}</div>
          {lastExecutionTime && (
            <div>Last run: {lastExecutionTime.toLocaleTimeString()}</div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
