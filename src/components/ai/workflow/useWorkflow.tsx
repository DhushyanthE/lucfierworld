
import { useState, useEffect, useCallback } from 'react';
import { realTimeQuantumProcessor } from '@/lib/quantum/RealTimeQuantumProcessor';
import { quantumWorkflowManager } from '@/lib/quantum/workflow/QuantumWorkflow';
import { UIWorkflowStep } from './types';
import { validateWorkflow, calculateQuantumEntanglement } from './workflowUtils';
import { runWorkflow, resetWorkflow } from './workflowActions';

export function useWorkflow(initialSteps: UIWorkflowStep[]) {
  const [workflowSteps, setWorkflowSteps] = useState<UIWorkflowStep[]>(initialSteps);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [lastExecutionTime, setLastExecutionTime] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(true);
  const [quantumEntanglement, setQuantumEntanglement] = useState(0);
  const [neuralNetworkAccuracy, setNeuralNetworkAccuracy] = useState(0);
  const [agiSynthesisLevel, setAgiSynthesisLevel] = useState(0);
  const [superintelligenceScore, setSuperintelligenceScore] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<Record<string, number>>({});
  const [workflowId, setWorkflowId] = useState<string | null>(null);

  // Validate workflow wrapper for the hook
  const validateWorkflowAndUpdateState = useCallback(() => {
    const validationErrors = validateWorkflow(workflowSteps);
    setErrors(validationErrors);
    setIsValidated(validationErrors.length === 0);
    
    // Calculate quantum entanglement score for the workflow
    if (validationErrors.length === 0) {
      const entanglementScore = calculateQuantumEntanglement(workflowSteps);
      setQuantumEntanglement(entanglementScore);
    }
    
    return validationErrors.length === 0;
  }, [workflowSteps]);

  // Create a quantum workflow in the manager
  useEffect(() => {
    if (!workflowId) {
      const id = quantumWorkflowManager.createWorkflow("Quantum AI Workflow", {
        quantumSecurityLevel: 4,
        neuralNetworkLayers: 5,
        blockchainIntegration: true,
        genomicsEnabled: true
      });
      setWorkflowId(id);
    }
  }, [workflowId]);

  // Monitor workflow status changes
  useEffect(() => {
    if (!workflowId) return;
    
    const interval = setInterval(() => {
      const workflow = quantumWorkflowManager.getWorkflow(workflowId);
      
      if (workflow) {
        // Update UI based on workflow status
        setIsRunning(workflow.isRunning);
        
        if (workflow.currentStepId) {
          setActiveStep(workflow.currentStepId);
        }
        
        // Update steps based on backend workflow status
        if (workflow.steps) {
          setWorkflowSteps(steps => steps.map(step => {
            const backendStep = workflow.steps[step.id];
            if (backendStep) {
              // Map backend status to UI status
              let uiStatus: 'idle' | 'running' | 'completed' | 'failed';
              switch (backendStep.status) {
                case 'idle': uiStatus = 'idle'; break;
                case 'running': uiStatus = 'running'; break;
                case 'completed': uiStatus = 'completed'; break;
                case 'error': uiStatus = 'failed'; break;
                default: uiStatus = 'idle';
              }
              
              return {
                ...step,
                status: uiStatus,
                progress: backendStep.progress
              };
            }
            return step;
          }));
        }
        
        // Update last execution time if workflow completed
        if (!workflow.isRunning && workflow.completedAt && workflow.startedAt) {
          const executionTime = Math.round((workflow.completedAt.getTime() - workflow.startedAt.getTime()) / 1000);
          setLastExecutionTime(executionTime.toString());
        }
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [workflowId]);

  // Validate workflow when steps change
  useEffect(() => {
    validateWorkflowAndUpdateState();
  }, [workflowSteps, validateWorkflowAndUpdateState]);

  // Run workflow wrapped for state management
  const handleRunWorkflow = useCallback(async () => {
    return runWorkflow(
      isRunning,
      workflowId,
      workflowSteps,
      setIsRunning,
      setActiveStep,
      setNeuralNetworkAccuracy,
      setAgiSynthesisLevel,
      setSuperintelligenceScore
    );
  }, [isRunning, workflowId, workflowSteps]);

  // Reset workflow wrapped for state management
  const handleResetWorkflow = useCallback(() => {
    resetWorkflow(
      isRunning,
      workflowId,
      setWorkflowId,
      setWorkflowSteps,
      setActiveStep,
      setNeuralNetworkAccuracy,
      setAgiSynthesisLevel,
      setSuperintelligenceScore,
      setProcessingStatus,
      setLastExecutionTime
    );
  }, [isRunning, workflowId]);

  return {
    workflowSteps,
    setWorkflowSteps,
    isRunning,
    activeStep,
    runWorkflow: handleRunWorkflow,
    resetWorkflow: handleResetWorkflow,
    lastExecutionTime,
    errors,
    isValidated,
    quantumEntanglement,
    neuralNetworkAccuracy,
    agiSynthesisLevel,
    superintelligenceScore,
    processingStatus
  };
}

// Update the import path in the original file so it's re-exported properly
export { UIWorkflowStep } from './types';
