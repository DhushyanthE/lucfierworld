import { useState, useEffect, useCallback } from 'react';
import { 
  improvedAGIWorkflowService, 
  AGIWorkflowState, 
  AGIWorkflowTask 
} from '@/services/agi/ImprovedAGIWorkflowService';

export interface UseAGIWorkflowReturn {
  workflowState: AGIWorkflowState | null;
  isLoading: boolean;
  submitTask: (
    type: AGIWorkflowTask['type'],
    input: any,
    options?: any
  ) => Promise<string>;
  executeWorkflowPattern: (patternId: string, context: any) => Promise<string[]>;
  startAdvancedReasoning: (problem: string, complexity?: 'simple' | 'moderate' | 'complex' | 'extreme') => Promise<string[]>;
  optimizeMultiModalLearning: (domains: string[], data: any, transferLearning?: boolean) => Promise<string>;
  performCreativeSynthesis: (inputs: any[], creativityLevel?: number) => Promise<string>;
  performAdvancedPrediction: (context: any, horizon: number, confidenceLevel?: number) => Promise<string>;
  pauseWorkflow: () => void;
  resumeWorkflow: () => void;
  cancelTask: (taskId: string) => boolean;
  getTaskAnalytics: (timeRange?: number) => any;
  refreshWorkflow: () => void;
}

export function useAGIWorkflow(): UseAGIWorkflowReturn {
  const [workflowState, setWorkflowState] = useState<AGIWorkflowState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to workflow state changes
    const unsubscribe = improvedAGIWorkflowService.subscribe((state) => {
      setWorkflowState(state);
      setIsLoading(false);
    });

    // Initialize with current state
    setWorkflowState(improvedAGIWorkflowService.getWorkflowState());
    setIsLoading(false);

    return unsubscribe;
  }, []);

  const submitTask = useCallback(async (
    type: AGIWorkflowTask['type'],
    input: any,
    options: any = {}
  ): Promise<string> => {
    return await improvedAGIWorkflowService.submitTask(type, input, options);
  }, []);

  const executeWorkflowPattern = useCallback(async (
    patternId: string,
    context: any
  ): Promise<string[]> => {
    return await improvedAGIWorkflowService.executeWorkflowPattern(patternId, context);
  }, []);

  const startAdvancedReasoning = useCallback(async (
    problem: string,
    complexity: 'simple' | 'moderate' | 'complex' | 'extreme' = 'moderate'
  ): Promise<string[]> => {
    return await improvedAGIWorkflowService.startAdvancedReasoningWorkflow(problem, complexity);
  }, []);

  const optimizeMultiModalLearning = useCallback(async (
    domains: string[],
    data: any,
    transferLearning: boolean = true
  ): Promise<string> => {
    return await improvedAGIWorkflowService.optimizeMultiModalLearning(domains, data, transferLearning);
  }, []);

  const performCreativeSynthesis = useCallback(async (
    inputs: any[],
    creativityLevel: number = 0.8
  ): Promise<string> => {
    return await improvedAGIWorkflowService.performCreativeSynthesis(inputs, creativityLevel);
  }, []);

  const performAdvancedPrediction = useCallback(async (
    context: any,
    horizon: number,
    confidenceLevel: number = 0.95
  ): Promise<string> => {
    return await improvedAGIWorkflowService.performAdvancedPrediction(context, horizon, confidenceLevel);
  }, []);

  const pauseWorkflow = useCallback(() => {
    improvedAGIWorkflowService.pauseWorkflow();
  }, []);

  const resumeWorkflow = useCallback(() => {
    improvedAGIWorkflowService.resumeWorkflow();
  }, []);

  const cancelTask = useCallback((taskId: string): boolean => {
    return improvedAGIWorkflowService.cancelTask(taskId);
  }, []);

  const getTaskAnalytics = useCallback((timeRange?: number): any => {
    return improvedAGIWorkflowService.getTaskAnalytics(timeRange);
  }, []);

  const refreshWorkflow = useCallback(() => {
    setWorkflowState(improvedAGIWorkflowService.getWorkflowState());
  }, []);

  return {
    workflowState,
    isLoading,
    submitTask,
    executeWorkflowPattern,
    startAdvancedReasoning,
    optimizeMultiModalLearning,
    performCreativeSynthesis,
    performAdvancedPrediction,
    pauseWorkflow,
    resumeWorkflow,
    cancelTask,
    getTaskAnalytics,
    refreshWorkflow
  };
}