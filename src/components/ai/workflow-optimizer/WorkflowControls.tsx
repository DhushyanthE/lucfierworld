
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, Zap, RefreshCw } from 'lucide-react';

interface WorkflowControlsProps {
  workflowActive: boolean;
  optimizing: boolean;
  toggleWorkflow: () => void;
  optimizeWorkflow: () => void;
}

export function WorkflowControls({ 
  workflowActive, 
  optimizing, 
  toggleWorkflow, 
  optimizeWorkflow 
}: WorkflowControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 bg-black/50 border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
        onClick={toggleWorkflow}
        disabled={optimizing}
      >
        {workflowActive ? 
          <PauseIcon className="h-4 w-4 mr-1.5" /> : 
          <PlayIcon className="h-4 w-4 mr-1.5" />}
        {workflowActive ? 'Pause' : 'Start'} Workflow
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 bg-black/50 border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
        onClick={optimizeWorkflow}
        disabled={optimizing || workflowActive}
      >
        {optimizing ? 
          <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" /> : 
          <Zap className="h-4 w-4 mr-1.5" />}
        {optimizing ? 'Optimizing...' : 'Optimize'}
      </Button>
    </div>
  );
}
