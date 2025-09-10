
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ship, Rocket, RefreshCw, Check, AlertTriangle } from 'lucide-react';

interface MarinerWorkflowHeaderProps {
  workflowStatus: 'idle' | 'running' | 'completed' | 'failed';
  isLoading: boolean;
  onLaunchWorkflow: () => void;
}

export function MarinerWorkflowHeader({ 
  workflowStatus, 
  isLoading, 
  onLaunchWorkflow 
}: MarinerWorkflowHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <CardTitle className="flex items-center gap-2">
        <Ship className="h-5 w-5 text-blue-400" />
        <span>Project Mariner Workflow</span>
        {workflowStatus === 'running' && (
          <Badge variant="outline" className="bg-blue-900/40 text-blue-300 border-blue-500/30 animate-pulse">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Running
          </Badge>
        )}
        {workflowStatus === 'completed' && (
          <Badge variant="outline" className="bg-green-900/40 text-green-300 border-green-500/30">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )}
        {workflowStatus === 'failed' && (
          <Badge variant="outline" className="bg-red-900/40 text-red-300 border-red-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )}
      </CardTitle>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onLaunchWorkflow}
        disabled={workflowStatus === 'running' || isLoading}
        className={`${
          workflowStatus !== 'running'
            ? 'bg-blue-900/30 border-blue-500/30 text-blue-300 hover:bg-blue-900/50'
            : 'bg-gray-900/30 border-gray-700 text-gray-400'
        }`}
      >
        {workflowStatus === 'running' ? (
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4 mr-1" />
        )}
        {workflowStatus === 'running' ? "Processing..." : "Launch Workflow"}
      </Button>
    </div>
  );
}
