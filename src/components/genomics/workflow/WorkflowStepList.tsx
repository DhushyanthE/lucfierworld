
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, Play, Lock } from 'lucide-react';
import { WorkflowStepType } from '@/types';
import { WorkflowStep } from './WorkflowStep';

interface WorkflowStepListProps {
  steps: WorkflowStepType[];
  currentStepId: string | null;
}

export function WorkflowStepList({ steps, currentStepId }: WorkflowStepListProps) {
  return (
    <div className="space-y-2 mt-4">
      <div className="text-sm font-medium text-gray-300 flex items-center">
        <Database className="h-4 w-4 mr-1" />
        Workflow Steps
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {steps.map((step) => (
          <WorkflowStep 
            key={step.id} 
            step={step} 
            isActive={currentStepId === step.id} 
          />
        ))}
      </div>
    </div>
  );
}
