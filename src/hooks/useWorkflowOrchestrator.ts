
/**
 * Workflow Orchestrator Hook
 * 
 * React hook for interacting with the workflow orchestrator
 */

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useWorkflowState } from './workflow-orchestrator/useWorkflowState';
import { useWorkflowActions } from './workflow-orchestrator/useWorkflowActions';
import { useWorkflowSocket } from './workflow-orchestrator/useWorkflowSocket';
import { 
  workflowOrchestratorService, 
  Workflow, 
  WorkflowConfig 
} from '@/lib/quantum/orchestrator/services/workflow-orchestrator.service';
import { WorkflowStepDefinition } from '@/lib/quantum/workflow/types/WorkflowStepTypes';

export interface UseWorkflowOrchestratorOptions {
  autoConnect?: boolean;
  enableRealTimeUpdates?: boolean;
  onWorkflowComplete?: (workflowId: string, results: Record<string, any>) => void;
  onStepComplete?: (workflowId: string, stepId: string, result: any) => void;
  onError?: (error: string) => void;
}

export function useWorkflowOrchestrator(options: UseWorkflowOrchestratorOptions = {}) {
  // Use the state management hook
  const state = useWorkflowState();
  
  // Use the socket management hook
  useWorkflowSocket(options, state.refreshWorkflows);
  
  // Use the actions hook
  const actions = useWorkflowActions(state, options);
  
  // Initial load of workflows
  useEffect(() => {
    if (options.autoConnect) {
      state.refreshWorkflows();
    }
  }, [options.autoConnect, state.refreshWorkflows]);

  // Create a simple workflow step
  const createWorkflowStep = useCallback((
    name: string,
    type: string,
    params?: Record<string, any>,
    dependsOn?: string[]
  ): WorkflowStepDefinition => {
    return {
      id: uuidv4(),
      name,
      type: type as any,
      params,
      dependsOn
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    ...actions,
    createWorkflowStep
  };
}
