
/**
 * Workflow Actions Hook
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { 
  workflowOrchestratorService, 
  WorkflowConfig 
} from '@/lib/quantum/orchestrator/services/workflow-orchestrator.service';
import { UseWorkflowOrchestratorOptions } from '../useWorkflowOrchestrator';

interface WorkflowStateActions {
  refreshWorkflows: () => void;
  updateState: (updates: any) => void;
  activeWorkflowId: string | null;
  stepResults: Record<string, any>;
  activeWorkflowSteps: any[];
}

export function useWorkflowActions(
  state: WorkflowStateActions,
  options: UseWorkflowOrchestratorOptions
) {
  // Create a new workflow
  const createWorkflow = useCallback((config: WorkflowConfig): string => {
    try {
      const workflowId = workflowOrchestratorService.createWorkflow(config);
      
      toast.success(`Workflow created: ${config.name}`, {
        description: `ID: ${workflowId}`
      });
      
      state.refreshWorkflows();
      return workflowId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create workflow';
      toast.error('Workflow creation failed', {
        description: errorMessage
      });
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      throw error;
    }
  }, [state.refreshWorkflows, options.onError]);

  // Start a workflow
  const startWorkflow = useCallback((workflowId: string): boolean => {
    try {
      const result = workflowOrchestratorService.startWorkflow(workflowId);
      
      if (result) {
        toast.info('Workflow started', {
          description: `Workflow ${workflowId} is now running`
        });
        
        state.updateState({ activeWorkflowId: workflowId });
      } else {
        toast.error('Failed to start workflow', {
          description: 'The workflow may already be running or not found'
        });
      }
      
      state.refreshWorkflows();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start workflow';
      toast.error('Workflow start failed', {
        description: errorMessage
      });
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      return false;
    }
  }, [state, options.onError]);

  // Cancel a workflow
  const cancelWorkflow = useCallback((workflowId: string): boolean => {
    try {
      const result = workflowOrchestratorService.cancelWorkflow(workflowId);
      
      if (result) {
        toast.info('Workflow canceled', {
          description: `Workflow ${workflowId} has been canceled`
        });
        
        if (state.activeWorkflowId === workflowId) {
          state.updateState({ activeWorkflowId: null });
        }
      } else {
        toast.error('Failed to cancel workflow', {
          description: 'The workflow may not be running or not found'
        });
      }
      
      state.refreshWorkflows();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel workflow';
      toast.error('Workflow cancellation failed', {
        description: errorMessage
      });
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      return false;
    }
  }, [state, options.onError]);

  // Retry a failed workflow
  const retryWorkflow = useCallback((workflowId: string): boolean => {
    try {
      const result = workflowOrchestratorService.retryWorkflow(workflowId);
      
      if (result) {
        toast.info('Workflow restarted', {
          description: `Workflow ${workflowId} is being retried`
        });
        
        state.updateState({ activeWorkflowId: workflowId });
      } else {
        toast.error('Failed to retry workflow', {
          description: 'The workflow may not be in a failed state or not found'
        });
      }
      
      state.refreshWorkflows();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retry workflow';
      toast.error('Workflow retry failed', {
        description: errorMessage
      });
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      return false;
    }
  }, [state, options.onError]);

  // Get workflow details
  const getWorkflowDetails = useCallback((workflowId: string) => {
    try {
      const workflow = workflowOrchestratorService.getWorkflow(workflowId);
      const results = workflowOrchestratorService.getWorkflowResults(workflowId);
      
      if (workflow) {
        state.updateState({
          activeWorkflowId: workflowId,
          activeWorkflowSteps: workflow.steps,
          stepResults: results || {}
        });
        
        return { workflow, results };
      } else {
        state.updateState({
          error: `Workflow ${workflowId} not found`
        });
        
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get workflow details';
      
      state.updateState({
        error: errorMessage
      });
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      return null;
    }
  }, [state, options.onError]);

  return {
    createWorkflow,
    startWorkflow,
    cancelWorkflow,
    retryWorkflow,
    getWorkflowDetails
  };
}
