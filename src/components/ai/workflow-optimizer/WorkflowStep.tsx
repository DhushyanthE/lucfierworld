
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { WorkflowTask } from '@/lib/quantum/types';

interface WorkflowStepProps {
  step: WorkflowTask;
  activeStep?: string | null;
  workflowSteps: WorkflowTask[];
  isLastStep: boolean;
}

export function WorkflowStep({ step, activeStep, isLastStep }: WorkflowStepProps) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      idle: { bg: 'bg-gray-800', text: 'text-gray-400', border: 'border-gray-700' },
      running: { bg: 'bg-blue-900/20', text: 'text-blue-300', border: 'border-blue-500/30' },
      completed: { bg: 'bg-green-900/20', text: 'text-green-300', border: 'border-green-500/30' },
      failed: { bg: 'bg-red-900/20', text: 'text-red-300', border: 'border-red-500/30' }
    };

    const config = statusConfig[step.status];
    
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${config.bg} ${config.text} ${config.border}`}
      >
        {getStatusIcon()}
        <span className="ml-1 capitalize">{step.status}</span>
      </Badge>
    );
  };

  const isActive = activeStep === step.name;

  return (
    <div className={`p-3 rounded-md border transition-all duration-200 ${
      isActive
        ? 'bg-blue-900/20 border-blue-500/50 shadow-md'
        : step.status === 'completed'
        ? 'bg-green-900/10 border-green-500/20'
        : step.status === 'failed'
        ? 'bg-red-900/10 border-red-500/20'
        : 'bg-gray-900/40 border-gray-700/50 hover:border-gray-600/50'
    }`}>
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium text-sm text-white">{step.name}</div>
        {getStatusBadge()}
      </div>
      
      {step.status === 'running' && (
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-300">{step.progress}%</span>
          </div>
          <Progress value={step.progress} className="h-1" />
        </div>
      )}
      
      {step.status === 'completed' && (
        <div className="text-xs text-green-400">
          ✓ Optimization complete
        </div>
      )}
    </div>
  );
}
