
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface WorkflowStepProps {
  step: {
    id: string;
    name: string;
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
    description: string;
    icon?: React.ReactNode;
    dependsOn?: string[];
  };
  activeStep?: string;
  workflowSteps: Array<{
    id: string;
    name: string;
    status: 'idle' | 'running' | 'completed' | 'failed';
  }>;
  isLastStep?: boolean;
}

export function WorkflowStep({ step, activeStep, workflowSteps, isLastStep }: WorkflowStepProps) {
  // Check if all dependencies are completed
  const canRun = !step.dependsOn || step.dependsOn.every(depId => {
    const depStep = workflowSteps.find(s => s.id === depId);
    return depStep && depStep.status === 'completed';
  });
  
  // Get status classes for styling
  const getStatusClasses = () => {
    if (step.status === 'running') {
      return 'border-blue-500 bg-blue-900/20';
    } else if (step.status === 'completed') {
      return 'border-green-500 bg-green-900/20';
    } else if (step.status === 'failed') {
      return 'border-red-500 bg-red-900/20';
    } else if (activeStep === step.id) {
      return 'border-purple-500 bg-purple-900/20';
    } else if (canRun) {
      return 'border-gray-600 bg-gray-900/50 hover:border-purple-500/70';
    } else {
      return 'border-gray-800 bg-gray-900/30 opacity-60';
    }
  };
  
  return (
    <div 
      className={`relative rounded-lg p-3 ${getStatusClasses()} transition-all duration-300 overflow-hidden`}
    >
      {/* Step content */}
      <div className="z-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-medium">
            {step.icon}
            <span>{step.name}</span>
          </div>
          
          <StatusBadge status={step.status} progress={step.progress} />
        </div>
        
        <div className="mt-2 text-xs text-gray-400">{step.description}</div>
      </div>
      
      {/* Progress bar for running tasks */}
      {step.status === 'running' && (
        <div className="absolute bottom-0 left-0 h-1 bg-blue-500" 
          style={{ width: `${step.progress}%` }} 
        />
      )}
      
      {/* Connection line to next step */}
      {!isLastStep && (
        <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-0">
          <svg width="16" height="10">
            <line x1="0" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1" className="text-gray-700" />
            <polygon points="16,5 11,2 11,8" fill="currentColor" className="text-gray-700" />
          </svg>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, progress }: { status: string, progress: number }) {
  if (status === 'running') {
    return (
      <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-500/50">
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
        {progress}%
      </Badge>
    );
  } else if (status === 'completed') {
    return (
      <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-500/50">
        Completed
      </Badge>
    );
  } else if (status === 'failed') {
    return (
      <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-500/50">
        Failed
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-gray-900/30 text-gray-400 border-gray-700/50">
        Waiting
      </Badge>
    );
  }
}
