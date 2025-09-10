
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Play, RefreshCw, Cpu } from 'lucide-react';

interface WorkflowHeaderProps {
  isRunning: boolean;
  quantumEnabled: boolean;
  startWorkflow: () => void;
  resetWorkflow: () => void;
}

export function WorkflowHeader({ 
  isRunning, 
  startWorkflow, 
  resetWorkflow,
  quantumEnabled
}: WorkflowHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <CardTitle className="flex items-center gap-2 text-white">
        <Brain className="h-5 w-5 text-purple-400" />
        Genomic AI Workflow
        {quantumEnabled && (
          <Badge variant="outline" className="ml-2 bg-purple-900/40 text-purple-300 border-purple-500/30">
            <Cpu className="h-3 w-3 mr-1" />
            Quantum Enhanced
          </Badge>
        )}
      </CardTitle>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={startWorkflow}
          disabled={isRunning}
          className="bg-purple-900/30 border-purple-500/30 text-purple-300 hover:bg-purple-900/50"
        >
          {isRunning ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-4 w-4 mr-1" />}
          {isRunning ? "Processing..." : "Run Workflow"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetWorkflow}
          disabled={isRunning}
          className="bg-gray-900/30 border-gray-700 text-gray-400 hover:bg-gray-800/50"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
