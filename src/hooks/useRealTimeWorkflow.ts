
import { UseRealTimeWorkflowOptions } from './workflow/types';
import { useWorkflowState } from './workflow/useWorkflowState';
import { useWorkflowActions } from './workflow/useWorkflowActions';

/**
 * Hook for managing a real-time AI workflow with quantum and blockchain capabilities
 */
export function useRealTimeWorkflow(options: UseRealTimeWorkflowOptions = {}) {
  // Get workflow state
  const state = useWorkflowState(options);
  
  // Get workflow actions based on state
  const actions = useWorkflowActions(state);
  
  // Return combined state and actions
  return {
    // State
    steps: state.steps,
    isRunning: state.isRunning,
    currentStepId: state.currentStepId,
    lastResponse: state.lastResponse,
    activeModel: state.activeModel,
    optimizationLevel: state.optimizationLevel,
    quantumEnabled: state.quantumEnabled,
    blockchainVerification: state.blockchainVerification,
    lastExecutionTime: state.lastExecutionTime,
    
    // Actions
    setSteps: actions.setSteps,
    switchModel: actions.switchModel,
    startWorkflow: actions.startWorkflow,
    resetWorkflow: actions.resetWorkflow,
    setOptimizationLevel: actions.setOptimizationLevel,
    toggleQuantum: actions.toggleQuantum,
    toggleBlockchainVerification: actions.toggleBlockchainVerification,
    getWorkflowContext: actions.getWorkflowContext
  };
}
