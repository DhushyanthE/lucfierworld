
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { AIModelSelector } from '@/components/workflow/AIModelSelector';
import { WorkflowHeader } from './WorkflowHeader';
import { WorkflowStepList } from './WorkflowStepList';
import { WorkflowStatus } from './WorkflowStatus';
import { useGenomicWorkflow } from './useGenomicWorkflow';
import { defaultGenomicWorkflowConfig } from './config/workflowConfig';

export function GenomicAIWorkflow() {
  const {
    steps,
    activeModel,
    isRunning,
    currentStepId,
    lastExecutionTime,
    quantumEnabled,
    handleModelChange,
    startWorkflow,
    resetWorkflow
  } = useGenomicWorkflow(defaultGenomicWorkflowConfig);

  // Get current step name
  const currentStepName = currentStepId 
    ? steps.find(step => step.id === currentStepId)?.name 
    : undefined;

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <WorkflowHeader 
          isRunning={isRunning}
          startWorkflow={startWorkflow}
          resetWorkflow={resetWorkflow}
          quantumEnabled={quantumEnabled}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Model Selector */}
        <AIModelSelector 
          activeModel={activeModel} 
          onModelChange={handleModelChange}
          disabled={isRunning}
        />
        
        {/* Workflow Steps */}
        <WorkflowStepList 
          steps={steps}
          currentStepId={currentStepId}
        />
      </CardContent>
      
      <CardFooter className="border-t border-gray-800 pt-4">
        <WorkflowStatus 
          isRunning={isRunning}
          currentStepName={currentStepName}
          lastExecutionTime={lastExecutionTime}
          quantumEnabled={quantumEnabled}
        />
      </CardFooter>
    </Card>
  );
}
