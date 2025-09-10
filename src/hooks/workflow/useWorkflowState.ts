
import { useState, useEffect } from 'react';
import { quantumWorkflowManager } from '@/lib/quantum/workflow/QuantumWorkflow';
import { AIModelType, WorkflowStepType } from '@/types';
import { AIWorkflowResponse } from '@/services/ai/aiWorkflowService';
import { UseRealTimeWorkflowOptions, WorkflowState, WorkflowStateWithUpdaters } from './types';

/**
 * Hook to manage the state of a real-time workflow
 */
export function useWorkflowState(options: UseRealTimeWorkflowOptions = {}): WorkflowStateWithUpdaters {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [steps, setSteps] = useState<WorkflowStepType[]>(options.initialSteps || []);
  const [activeModel, setActiveModel] = useState<AIModelType>(options.defaultModel || 'gpt');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIWorkflowResponse | null>(null);
  const [optimizationLevel, setOptimizationLevel] = useState(1);
  const [quantumEnabled, setQuantumEnabled] = useState(options.enableQuantum || false);
  const [blockchainVerification, setBlockchainVerification] = useState(options.enableBlockchain || false);
  const [lastExecutionTime, setLastExecutionTime] = useState<Date | undefined>(undefined);
  
  // Initialize workflow
  useEffect(() => {
    if (!workflowId) {
      const id = quantumWorkflowManager.createWorkflow("Real-Time AI Workflow", {
        quantumSecurityLevel: quantumEnabled ? 4 : 1,
        neuralNetworkLayers: 5,
        blockchainIntegration: blockchainVerification,
        genomicsEnabled: false
      });
      setWorkflowId(id);
      console.log("Created workflow with ID:", id);
    }
  }, [workflowId, quantumEnabled, blockchainVerification]);

  // Create a state object combining both the state values and updater functions
  const state: WorkflowStateWithUpdaters = {
    // State values
    workflowId,
    steps,
    activeModel,
    isRunning,
    currentStepId,
    lastResponse,
    optimizationLevel,
    quantumEnabled,
    blockchainVerification,
    lastExecutionTime,
    
    // State updater functions
    setSteps,
    setIsRunning,
    setCurrentStepId,
    setLastResponse,
    setActiveModel,
    setOptimizationLevel,
    setQuantumEnabled,
    setBlockchainVerification,
    setLastExecutionTime
  };
  
  return state;
}
