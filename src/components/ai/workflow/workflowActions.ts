
import { toast } from 'sonner';
import { quantumWorkflowManager } from '@/lib/quantum/workflow/QuantumWorkflow';
import { validateWorkflow, trainNeuralNetwork } from './workflowUtils';
import { UIWorkflowStep } from './types';

// Run workflow with quantum integration
export const runWorkflow = async (
  isRunning: boolean,
  workflowId: string | null,
  workflowSteps: UIWorkflowStep[],
  setIsRunning: (isRunning: boolean) => void,
  setActiveStep: (step: string | null) => void,
  setNeuralNetworkAccuracy: (value: number) => void,
  setAgiSynthesisLevel: (value: number) => void,
  setSuperintelligenceScore: (value: number) => void
): Promise<void> => {
  if (isRunning) {
    toast.error("Workflow already in progress");
    return;
  }
  
  if (validateWorkflow(workflowSteps).length > 0) {
    toast.error("Workflow validation failed");
    return;
  }
  
  if (!workflowId) {
    toast.error("Workflow not initialized");
    return;
  }
  
  toast.info("Quantum AI workflow initiated");
  
  try {
    // Train neural network with quantum enhancement
    await trainNeuralNetwork(
      setNeuralNetworkAccuracy,
      setAgiSynthesisLevel,
      setSuperintelligenceScore
    );
    
    // Start the workflow in the backend
    const started = await quantumWorkflowManager.startWorkflow(workflowId);
    
    if (!started) {
      throw new Error("Failed to start workflow");
    }
  } catch (error) {
    console.error("Workflow execution error:", error);
    toast.error(`Workflow execution failed: ${(error as Error).message}`);
    setIsRunning(false);
    setActiveStep(null);
  }
};

// Reset the workflow
export const resetWorkflow = (
  isRunning: boolean,
  workflowId: string | null,
  setWorkflowId: (id: string | null) => void,
  setWorkflowSteps: (updater: (steps: UIWorkflowStep[]) => UIWorkflowStep[]) => void,
  setActiveStep: (step: string | null) => void,
  setNeuralNetworkAccuracy: (value: number) => void,
  setAgiSynthesisLevel: (value: number) => void,
  setSuperintelligenceScore: (value: number) => void,
  setProcessingStatus: (value: Record<string, number>) => void,
  setLastExecutionTime: (value: string | null) => void
): void => {
  if (isRunning) {
    toast.error("Cannot reset while workflow is running");
    return;
  }
  
  try {
    // Create a new workflow to replace the current one
    if (workflowId) {
      const newId = quantumWorkflowManager.createWorkflow("Quantum AI Workflow", {
        quantumSecurityLevel: 4,
        neuralNetworkLayers: 5,
        blockchainIntegration: true,
        genomicsEnabled: true
      });
      setWorkflowId(newId);
    }
    
    // Reset UI state
    setWorkflowSteps(steps => steps.map(step => ({
      ...step,
      status: 'idle',
      progress: 0
    })));
    
    setActiveStep(null);
    setNeuralNetworkAccuracy(0);
    setAgiSynthesisLevel(0);
    setSuperintelligenceScore(0);
    setProcessingStatus({});
    setLastExecutionTime(null);
    
    toast.info("Workflow reset");
  } catch (error) {
    console.error("Error resetting workflow:", error);
    toast.error(`Reset failed: ${(error as Error).message}`);
  }
};
