
/**
 * Workflow State Management Hook
 */

import { useState, useCallback } from 'react';
import { 
  workflowOrchestratorService, 
  Workflow 
} from '@/lib/quantum/orchestrator/services/workflow-orchestrator.service';
import { WorkflowStepDefinition, WorkflowResult } from '@/lib/quantum/workflow/types/WorkflowStepTypes';

export interface WorkflowState {
  activeWorkflows: Workflow[];
  activeWorkflowId: string | null;
  activeWorkflowSteps: WorkflowStepDefinition[];
  stepResults: Record<string, WorkflowResult>;
  isLoading: boolean;
  error: string | null;
}

export function useWorkflowState() {
  const [state, setState] = useState<WorkflowState>({
    activeWorkflows: [],
    activeWorkflowId: null,
    activeWorkflowSteps: [],
    stepResults: {},
    isLoading: false,
    error: null
  });

  // Load all active workflows
  const refreshWorkflows = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // This is a simulation since workflowOrchestratorService doesn't have a getAllWorkflows method
      // In a real implementation, you would call that method
      const workflows = Array.from(
        Object.values(workflowOrchestratorService)
          .find(val => val instanceof Map)?.values() || []
      ) as Workflow[];

      setState(prev => ({
        ...prev,
        activeWorkflows: workflows,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load workflows'
      }));
    }
  }, []);

  const updateState = useCallback((updates: Partial<WorkflowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    ...state,
    refreshWorkflows,
    updateState
  };
}
