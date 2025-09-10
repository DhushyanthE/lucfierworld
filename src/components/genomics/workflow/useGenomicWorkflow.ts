
import { useState } from 'react';
import { AIModelType, WorkflowStepType } from '@/types';
import { workflowOrchestrator } from '@/services/ai/workflowOrchestrator';
import { generateTransactionId } from '@/lib/quantum/workflow/utils/blockchain';
import { getGenomicWorkflowSteps } from './workflowSteps';
import { GenomicWorkflowConfig, defaultGenomicWorkflowConfig } from './config/workflowConfig';

export function useGenomicWorkflow(config: GenomicWorkflowConfig = defaultGenomicWorkflowConfig) {
  const [steps, setSteps] = useState<WorkflowStepType[]>(getGenomicWorkflowSteps());
  const [activeModel, setActiveModel] = useState<AIModelType>(config.defaultModel);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [lastExecutionTime, setLastExecutionTime] = useState<Date | null>(null);
  const [quantumEnabled, setQuantumEnabled] = useState(config.quantumEnabled);
  const [blockchainVerification, setBlockchainVerification] = useState(config.blockchainVerification);
  const [workflowId] = useState(generateTransactionId());

  // Handle AI model change
  const handleModelChange = (model: AIModelType) => {
    if (!isRunning) {
      setActiveModel(model);
    }
  };

  // Start workflow execution
  const startWorkflow = async () => {
    if (isRunning) return;

    setIsRunning(true);
    
    try {
      // Update UI steps to running
      setSteps(prevSteps => 
        prevSteps.map(step => ({
          ...step,
          status: 'idle',
          progress: 0
        }))
      );

      // Configure orchestrator
      workflowOrchestrator.configure({
        modelType: activeModel,
        quantumEnabled,
        blockchainEnabled: blockchainVerification,
        dataProcessingEnabled: true
      });

      // Process steps sequentially
      for (const step of steps) {
        setCurrentStepId(step.id);
        
        // Update step to running
        setSteps(prevSteps => 
          prevSteps.map(s => s.id === step.id ? 
            { ...s, status: 'running', progress: 0 } : s
          )
        );
        
        // Progress update interval
        const progressInterval = setInterval(() => {
          setSteps(prevSteps => 
            prevSteps.map(s => s.id === step.id && s.status === 'running' ? 
              { ...s, progress: Math.min(s.progress + 5, 95) } : s
            )
          );
        }, 200);
        
        // Simulate step execution
        const stepDelay = 1500 + Math.random() * 1500;
        await new Promise(resolve => setTimeout(resolve, stepDelay));
        
        // Clear interval and mark step complete
        clearInterval(progressInterval);
        setSteps(prevSteps => 
          prevSteps.map(s => s.id === step.id ? 
            { ...s, status: 'completed', progress: 100 } : s
          )
        );
      }
      
      setLastExecutionTime(new Date());
      
    } catch (error) {
      console.error("Workflow execution error:", error);
      
      // Mark current step as failed
      if (currentStepId) {
        setSteps(prevSteps => 
          prevSteps.map(s => s.id === currentStepId ? 
            { ...s, status: 'failed' } : s
          )
        );
      }
      
    } finally {
      setIsRunning(false);
      setCurrentStepId(null);
    }
  };

  // Reset workflow
  const resetWorkflow = () => {
    if (isRunning) return;
    
    setSteps(getGenomicWorkflowSteps());
    setCurrentStepId(null);
  };

  return {
    steps,
    activeModel,
    isRunning,
    currentStepId,
    lastExecutionTime,
    quantumEnabled,
    blockchainVerification,
    workflowId,
    handleModelChange,
    startWorkflow,
    resetWorkflow
  };
}
