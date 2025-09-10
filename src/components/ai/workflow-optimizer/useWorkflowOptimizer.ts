
import { useState, useEffect } from 'react';
import { workflowOptimizer } from '@/lib/quantum/workflow/WorkflowOptimizer';
import { WorkflowTask } from '@/lib/quantum/workflow/types';
import { toast } from 'sonner';

export function useWorkflowOptimizer(initialSteps: WorkflowTask[]) {
  const [workflowActive, setWorkflowActive] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [steps, setSteps] = useState<WorkflowTask[]>(initialSteps);

  // Toggle workflow active state
  const toggleWorkflow = () => {
    if (!workflowActive) {
      setWorkflowActive(true);
      simulateWorkflowProgress();
      toast.info("Workflow started");
    } else {
      setWorkflowActive(false);
      toast.info("Workflow paused");
    }
  };
  
  // Simulate workflow step progress
  const simulateWorkflowProgress = () => {
    // Reset all steps to initial state if starting over
    setSteps(prev => prev.map(step => ({
      ...step,
      status: step.id === 'data-collection' ? 'running' : 'pending',
    })));
  };

  // Simulate workflow optimization
  const optimizeWorkflow = () => {
    setOptimizing(true);
    
    // Convert steps to workflow tasks with proper types
    const tasks: WorkflowTask[] = steps.map(step => ({
      id: step.id,
      name: step.name || "",
      type: step.type || 'classical', // Ensure type is properly typed
      parameters: step.parameters || {},
      dependencies: step.dependencies || [],
      priority: step.priority || 1,
      estimatedResources: step.estimatedResources || {},
      // Add other required fields
      status: step.status,
      duration: step.duration
    }));
    
    // Optimize workflow
    try {
      const result = workflowOptimizer.optimizeWorkflow(tasks, 'balanced');
      setOptimizationResult(result);
      
      toast.success("Workflow optimized", {
        description: `Reduced execution time by ${result.timeReductionPercentage.toFixed(1)}%`
      });
    } catch (error) {
      console.error("Error optimizing workflow:", error);
      toast.error("Failed to optimize workflow");
    } finally {
      setOptimizing(false);
    }
  };

  // Monitor and update workflow progress
  useEffect(() => {
    if (!workflowActive) return;
    
    const interval = setInterval(() => {
      setSteps(prevSteps => {
        // Find the currently running step, if any
        const runningStepIndex = prevSteps.findIndex(step => step.status === 'running');
        
        // If no running step or all completed
        if (runningStepIndex === -1) {
          // Find the next step to run
          const nextStepIndex = prevSteps.findIndex(step => step.status === 'pending');
          if (nextStepIndex === -1) {
            // All steps completed
            clearInterval(interval);
            toast.success("Workflow completed successfully");
            setWorkflowActive(false);
            return prevSteps;
          }
          
          // Check if dependencies are met
          const nextStep = prevSteps[nextStepIndex];
          const stepDependencies = nextStep.dependencies || [];
          
          if (stepDependencies && stepDependencies.length > 0) {
            const dependenciesMet = stepDependencies.every(depId => 
              prevSteps.find(s => s.id === depId)?.status === 'completed'
            );
            
            if (!dependenciesMet) {
              // Dependencies not met, find another step
              const alternateStepIndex = prevSteps.findIndex(step => 
                step.status === 'pending' && 
                (!step.dependencies || step.dependencies.length === 0 || 
                  step.dependencies.every(depId => 
                    prevSteps.find(s => s.id === depId)?.status === 'completed'
                  )
                )
              );
              
              if (alternateStepIndex === -1) return prevSteps; // No eligible steps
              
              // Start the alternate step
              const newSteps = [...prevSteps];
              newSteps[alternateStepIndex] = {
                ...newSteps[alternateStepIndex],
                status: 'running'
              };
              return newSteps;
            }
          }
          
          // Start the next step
          const newSteps = [...prevSteps];
          newSteps[nextStepIndex] = {
            ...newSteps[nextStepIndex],
            status: 'running'
          };
          return newSteps;
        }
        
        // Update the running step
        const newSteps = [...prevSteps];
        const currentStep = newSteps[runningStepIndex];

        // Step completed
        newSteps[runningStepIndex] = {
          ...currentStep,
          status: 'completed'
        };
        
        // Show toast for step completion
        toast.info(`Step completed: ${currentStep.name}`);
        
        return newSteps;
      });
    }, 1500); // Update every 1.5 seconds
    
    return () => clearInterval(interval);
  }, [workflowActive]);

  return {
    steps,
    setSteps,
    workflowActive,
    optimizing,
    optimizationResult,
    toggleWorkflow,
    optimizeWorkflow
  };
}
