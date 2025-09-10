
import React from 'react';
import { ArrowRight, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { WorkflowStepDefinition, WorkflowResult } from '@/lib/quantum/workflow/types/WorkflowStepTypes';

interface MarinerWorkflowStepsProps {
  activeWorkflowSteps: WorkflowStepDefinition[];
  stepResults: Record<string, WorkflowResult>;
  workflowStatus: 'idle' | 'running' | 'completed' | 'failed';
  marinerWorkflowId: string | null;
}

export function MarinerWorkflowSteps({ 
  activeWorkflowSteps, 
  stepResults, 
  workflowStatus, 
  marinerWorkflowId 
}: MarinerWorkflowStepsProps) {
  return (
    <div className="space-y-2">
      {activeWorkflowSteps.map((step, index) => {
        const stepResult = marinerWorkflowId ? stepResults[step.id] : undefined;
        const isCompleted = stepResult && stepResult.success;
        const isFailed = stepResult && !stepResult.success;
        const isActive = workflowStatus === 'running' && !isCompleted && !isFailed && 
          activeWorkflowSteps.slice(0, index).every(s => marinerWorkflowId && stepResults[s.id]?.success);
        
        return (
          <div 
            key={step.id}
            className={`p-3 rounded-md border flex items-center justify-between ${
              isActive ? 'bg-blue-900/20 border-blue-500/30 animate-pulse' :
              isCompleted ? 'bg-green-900/20 border-green-500/30' :
              isFailed ? 'bg-red-900/20 border-red-500/30' :
              'bg-gray-900/40 border-gray-700/50'
            }`}
          >
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold bg-gray-800 text-gray-300">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{step.name}</span>
            </div>
            <div>
              {isActive && <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />}
              {isCompleted && <Check className="h-4 w-4 text-green-400" />}
              {isFailed && <AlertTriangle className="h-4 w-4 text-red-400" />}
              {!isActive && !isCompleted && !isFailed && (
                <ArrowRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
