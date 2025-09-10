
import { useCallback } from 'react';
import { toast } from 'sonner';
import { AIModelType, RealTimeWorkflowContext, WorkflowStepType } from '@/types';
import { aiWorkflowService, AIWorkflowRequest } from '@/services/ai/aiWorkflowService';
import { WorkflowActions, WorkflowStateWithUpdaters } from './types';

/**
 * Hook to provide workflow actions based on workflow state
 */
export function useWorkflowActions(state: WorkflowStateWithUpdaters): WorkflowActions {
  
  // Switch AI model
  const switchModel = useCallback((model: AIModelType) => {
    if (state.isRunning) {
      toast.error("Cannot switch models while workflow is running");
      return;
    }
    
    state.setActiveModel(model);
    toast.success(`Switched to ${model.toUpperCase()} model`);
  }, [state.isRunning, state.setActiveModel]);
  
  // Start workflow execution
  const startWorkflow = useCallback(async () => {
    if (state.isRunning) {
      toast.error("Workflow is already running");
      return;
    }
    
    if (!state.workflowId) {
      toast.error("Workflow not initialized");
      return;
    }
    
    try {
      state.setIsRunning(true);
      const startTime = new Date();
      
      // Process each step with AI integration
      for (const step of state.steps) {
        state.setCurrentStepId(step.id);
        
        // Update step status
        state.setSteps(current => 
          current.map(s => s.id === step.id ? { ...s, status: 'running', progress: 0 } : s)
        );
        
        // Process step with AI
        const request: AIWorkflowRequest = {
          prompt: `Process workflow step: ${step.name}`,
          modelType: state.activeModel,
          workflowId: state.workflowId,
          contextData: {
            stepType: step.name.toLowerCase().includes('quantum') ? 'quantum' : 
                      step.name.toLowerCase().includes('genomic') ? 'genomic' : 'standard'
          },
          temperature: 0.7
        };
        
        // Update progress in increments
        const progressInterval = setInterval(() => {
          state.setSteps(current => 
            current.map(s => s.id === step.id ? 
              { ...s, progress: Math.min(s.progress + 5, 95) } : s
            )
          );
        }, 200);
        
        try {
          // Process with AI
          const response = await aiWorkflowService.processWorkflowStep(request);
          state.setLastResponse(response);
          
          // Mark step as completed
          clearInterval(progressInterval);
          state.setSteps(current => 
            current.map(s => s.id === step.id ? 
              { ...s, status: 'completed', progress: 100 } : s
            )
          );
          
          // Small delay between steps
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          clearInterval(progressInterval);
          state.setSteps(current => 
            current.map(s => s.id === step.id ? 
              { ...s, status: 'failed', progress: s.progress } : s
            )
          );
          throw error;
        }
      }
      
      // Workflow completed
      state.setIsRunning(false);
      state.setCurrentStepId(null);
      const endTime = new Date();
      state.setLastExecutionTime(endTime);
      
      toast.success("Workflow completed successfully", {
        description: `Execution time: ${((endTime.getTime() - startTime.getTime()) / 1000).toFixed(1)} seconds`
      });
    } catch (error) {
      console.error("Workflow execution error:", error);
      state.setIsRunning(false);
      toast.error("Workflow execution failed");
    }
  }, [
    state.workflowId, 
    state.steps, 
    state.isRunning, 
    state.activeModel, 
    state.setIsRunning,
    state.setCurrentStepId,
    state.setSteps,
    state.setLastResponse,
    state.setLastExecutionTime
  ]);
  
  // Reset workflow
  const resetWorkflow = useCallback(() => {
    if (state.isRunning) {
      toast.error("Cannot reset while workflow is running");
      return;
    }
    
    state.setSteps(current => 
      current.map(step => ({
        ...step,
        status: 'idle',
        progress: 0
      }))
    );
    
    state.setCurrentStepId(null);
    state.setLastResponse(null);
    toast.info("Workflow reset");
  }, [state.isRunning, state.setSteps, state.setCurrentStepId, state.setLastResponse]);
  
  // Set optimization level
  const setOptimizationLevel = useCallback((level: number) => {
    if (level < 1) level = 1;
    if (level > 5) level = 5;
    state.setOptimizationLevel(level);
  }, [state.setOptimizationLevel]);
  
  // Toggle quantum processing
  const toggleQuantum = useCallback(() => {
    state.setQuantumEnabled(prev => !prev);
  }, [state.setQuantumEnabled]);
  
  // Toggle blockchain verification
  const toggleBlockchainVerification = useCallback(() => {
    state.setBlockchainVerification(prev => !prev);
  }, [state.setBlockchainVerification]);
  
  // Get workflow context
  const getWorkflowContext = useCallback((): RealTimeWorkflowContext => {
    return {
      activeModel: state.activeModel,
      optimizationLevel: state.optimizationLevel,
      quantumEnabled: state.quantumEnabled,
      blockchainVerification: state.blockchainVerification,
      lastExecutionTime: state.lastExecutionTime
    };
  }, [
    state.activeModel,
    state.optimizationLevel, 
    state.quantumEnabled, 
    state.blockchainVerification, 
    state.lastExecutionTime
  ]);
  
  return {
    setSteps: state.setSteps,
    switchModel,
    startWorkflow,
    resetWorkflow,
    setOptimizationLevel,
    toggleQuantum,
    toggleBlockchainVerification,
    getWorkflowContext
  };
}
