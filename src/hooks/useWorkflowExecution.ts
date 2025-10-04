/**
 * Custom hook for managing workflow execution
 */

import { useState, useCallback } from 'react';
import { 
  BlockchainANNWorkflow, 
  WorkflowStep,
  BlockchainANNArchitecture,
  TrainingConfiguration
} from '@/types/blockchain-ann.types';
import { workflowExecutionEngine } from '@/services/blockchain-ann/workflow/WorkflowExecutionEngine';
import { useToast } from '@/hooks/use-toast';

export function useWorkflowExecution() {
  const [workflows, setWorkflows] = useState<BlockchainANNWorkflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<BlockchainANNWorkflow | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const { toast } = useToast();

  /**
   * Create a new workflow
   */
  const createWorkflow = useCallback((config: {
    name: string;
    description: string;
    architecture: BlockchainANNArchitecture;
    trainingConfig: TrainingConfiguration;
    steps: Omit<WorkflowStep, 'id' | 'status' | 'progress'>[];
  }) => {
    try {
      const workflow = workflowExecutionEngine.createWorkflow(config);
      setWorkflows(prev => [...prev, workflow]);
      setCurrentWorkflow(workflow);

      toast({
        title: "Workflow Created",
        description: `${config.name} with ${config.steps.length} steps`,
      });

      return workflow;
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  /**
   * Execute a workflow
   */
  const executeWorkflow = useCallback(async (workflowId: string) => {
    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      const results = await workflowExecutionEngine.executeWorkflow(
        workflowId,
        (step: WorkflowStep) => {
          // Update current workflow state
          setCurrentWorkflow(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              steps: prev.steps.map(s => s.id === step.id ? step : s)
            };
          });

          // Update progress
          const workflow = workflowExecutionEngine.getWorkflowStatus(workflowId);
          if (workflow) {
            const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
            setExecutionProgress((completedSteps / workflow.steps.length) * 100);
          }
        }
      );

      toast({
        title: "Workflow Completed",
        description: `Completed ${results.completedSteps}/${results.totalSteps} steps in ${(results.executionTime / 1000).toFixed(1)}s`,
      });

      // Refresh workflow list
      refreshWorkflows();

      return results;
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [toast]);

  /**
   * Cancel workflow execution
   */
  const cancelWorkflow = useCallback(async (workflowId: string) => {
    try {
      await workflowExecutionEngine.cancelWorkflow(workflowId);
      refreshWorkflows();

      toast({
        title: "Workflow Cancelled",
        description: "Execution has been stopped",
      });
    } catch (error) {
      toast({
        title: "Cancel Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  }, [toast]);

  /**
   * Retry failed workflow
   */
  const retryWorkflow = useCallback(async (workflowId: string) => {
    try {
      await workflowExecutionEngine.retryWorkflow(workflowId);
      refreshWorkflows();

      toast({
        title: "Workflow Reset",
        description: "Ready for retry",
      });
    } catch (error) {
      toast({
        title: "Retry Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  }, [toast]);

  /**
   * Get workflow metrics
   */
  const getWorkflowMetrics = useCallback((workflowId: string) => {
    try {
      return workflowExecutionEngine.getWorkflowMetrics(workflowId);
    } catch (error) {
      console.error('Failed to get workflow metrics:', error);
      return null;
    }
  }, []);

  /**
   * Refresh workflows from engine
   */
  const refreshWorkflows = useCallback(() => {
    const allWorkflows = workflowExecutionEngine.getAllWorkflows();
    setWorkflows(allWorkflows);

    if (currentWorkflow) {
      const updated = allWorkflows.find(w => w.id === currentWorkflow.id);
      if (updated) {
        setCurrentWorkflow(updated);
      }
    }
  }, [currentWorkflow]);

  /**
   * Select a workflow as current
   */
  const selectWorkflow = useCallback((workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      setCurrentWorkflow(workflow);
    }
  }, [workflows]);

  return {
    // State
    workflows,
    currentWorkflow,
    isExecuting,
    executionProgress,

    // Actions
    createWorkflow,
    executeWorkflow,
    cancelWorkflow,
    retryWorkflow,
    getWorkflowMetrics,
    refreshWorkflows,
    selectWorkflow
  };
}
