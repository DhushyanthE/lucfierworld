
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MarinerWorkflowHeader } from './mariner/MarinerWorkflowHeader';
import { MarinerProgressDisplay } from './mariner/MarinerProgressDisplay';
import { MarinerWorkflowSteps } from './mariner/MarinerWorkflowSteps';
import { MarinerIdleState } from './mariner/MarinerIdleState';
import { useMarinerWorkflow } from './mariner/useMarinerWorkflow';

export function ProjectMarinerWorkflow() {
  const {
    marinerWorkflowId,
    workflowStatus,
    realtimeProgress,
    activeWorkflowSteps,
    stepResults,
    isLoading,
    error,
    launchMarinerWorkflow
  } = useMarinerWorkflow();

  return (
    <Card className="bg-black/70 border-blue-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <MarinerWorkflowHeader
          workflowStatus={workflowStatus}
          isLoading={isLoading}
          onLaunchWorkflow={launchMarinerWorkflow}
        />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Real-time Progress Display */}
          {realtimeProgress && (
            <MarinerProgressDisplay realtimeProgress={realtimeProgress} />
          )}

          {/* Workflow Steps Display */}
          <div className="space-y-2">
            <MarinerWorkflowSteps
              activeWorkflowSteps={activeWorkflowSteps}
              stepResults={stepResults}
              workflowStatus={workflowStatus}
              marinerWorkflowId={marinerWorkflowId}
            />
            
            <MarinerIdleState 
              shouldShow={activeWorkflowSteps.length === 0 && workflowStatus === 'idle'} 
            />
          </div>
          
          {error && (
            <div className="p-3 rounded-md border bg-red-900/20 border-red-500/30 text-red-300">
              <p className="text-sm font-medium">Error: {error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
