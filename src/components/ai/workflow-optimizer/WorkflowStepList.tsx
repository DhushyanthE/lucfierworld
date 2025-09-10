
import React from 'react';
import { WorkflowStep } from './WorkflowStep';
import { WorkflowTask } from '@/lib/quantum/types';

interface WorkflowStepListProps {
  steps: WorkflowTask[];
  activeStep?: string | null;
}

export function WorkflowStepList({ steps, activeStep = null }: WorkflowStepListProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <WorkflowStep 
          key={step.id} 
          step={step} 
          activeStep={activeStep} 
          workflowSteps={steps}
          isLastStep={index === steps.length - 1}
        />
      ))}
    </div>
  );
}
