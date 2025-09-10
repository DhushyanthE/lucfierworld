
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play, Lock } from 'lucide-react';
import { WorkflowStepType } from '@/types';

interface WorkflowStepProps {
  step: WorkflowStepType;
  isActive: boolean;
}

export function WorkflowStep({ step, isActive }: WorkflowStepProps) {
  return (
    <div
      className={`p-2 rounded-md border ${
        isActive
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
              <Play className="h-3 w-3 mr-1" />
            ) : step.status === 'failed' ? (
              <Lock className="h-3 w-3 mr-1" />
            ) : null}
            {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
          </Badge>
        </div>
      </div>
      
      {/* Progress bar */}
      {step.status === 'running' && (
        <div className="w-full bg-gray-700/30 rounded-full h-1 mt-2">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${step.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
