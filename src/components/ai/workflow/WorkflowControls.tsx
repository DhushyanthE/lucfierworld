
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, StopCircle, RefreshCw } from 'lucide-react';

interface WorkflowControlsProps {
  runWorkflow: () => void;
  resetWorkflow: () => void;
  isRunning: boolean;
  hasErrors: boolean;
  isValidated: boolean;
  quantumEntanglement: number;
}

export function WorkflowControls({ 
  runWorkflow, 
  resetWorkflow, 
  isRunning, 
  hasErrors, 
  isValidated,
  quantumEntanglement
}: WorkflowControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="mr-1">
        <Badge 
          variant="outline"
          className={`text-xs ${
            isRunning 
              ? 'bg-blue-900/30 text-blue-400 border-blue-500/50' 
              : hasErrors
              ? 'bg-red-900/30 text-red-400 border-red-500/50'
              : isValidated
              ? 'bg-green-900/30 text-green-400 border-green-500/50'
              : 'bg-gray-900/30 text-gray-400 border-gray-700/50'
          }`}
        >
          {isRunning ? 'Running' : hasErrors ? 'Error' : isValidated ? 'Validated' : 'Ready'}
        </Badge>
      </div>
      
      <Button 
        size="sm"
        variant="outline"
        className={
          isRunning 
            ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400' 
            : 'bg-green-900/20 hover:bg-green-900/30 text-green-400'
        }
        onClick={isRunning ? resetWorkflow : runWorkflow}
        disabled={hasErrors && !isRunning}
      >
        {isRunning ? (
          <><StopCircle className="h-4 w-4 mr-1" /> Stop</>
        ) : (
          <><PlayCircle className="h-4 w-4 mr-1" /> Run</>
        )}
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        className="bg-gray-900/20 hover:bg-gray-900/30"
        onClick={resetWorkflow}
        disabled={isRunning}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
