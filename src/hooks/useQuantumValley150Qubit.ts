/**
 * Quantum Valley 150-Qubit Hook
 * 
 * React hook for managing 150-qubit quantum processing operations,
 * algorithm execution, and real-time metrics updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  quantumValleyBackendService,
  type AlgorithmMethod,
  type TransactionAnalysisRequest,
  type TransactionAnalysisResult,
  type BackendWorkflowState
} from '@/services/backend/QuantumValleyBackendService';
import { type QuantumValley150QubitMetrics } from '@/lib/quantum/valley/QuantumValley150QubitService';
import { toast } from 'sonner';

export interface UseQuantumValley150QubitState {
  isInitialized: boolean;
  isProcessing: boolean;
  metrics: QuantumValley150QubitMetrics | null;
  algorithmMethods: AlgorithmMethod[];
  workflowState: BackendWorkflowState | null;
  lastAnalysis: TransactionAnalysisResult | null;
  error: string | null;
}

export interface UseQuantumValley150QubitActions {
  initialize: () => Promise<void>;
  analyzeTransaction: (request: TransactionAnalysisRequest) => Promise<TransactionAnalysisResult | null>;
  refreshMetrics: () => Promise<void>;
  resetWorkflow: () => void;
}

export function useQuantumValley150Qubit(): [UseQuantumValley150QubitState, UseQuantumValley150QubitActions] {
  const [state, setState] = useState<UseQuantumValley150QubitState>({
    isInitialized: false,
    isProcessing: false,
    metrics: null,
    algorithmMethods: [],
    workflowState: null,
    lastAnalysis: null,
    error: null
  });

  // Initialize the quantum valley service
  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));
      
      await quantumValleyBackendService.initialize();
      
      const [metrics, algorithmMethods, workflowState] = await Promise.all([
        quantumValleyBackendService.getMetrics(),
        quantumValleyBackendService.getAlgorithmMethods(),
        quantumValleyBackendService.getWorkflowState()
      ]);

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isProcessing: false,
        metrics,
        algorithmMethods,
        workflowState
      }));

      toast.success('Quantum Valley 150-Qubit System Initialized', {
        description: `Ready with ${algorithmMethods.length} algorithms`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage 
      }));
      
      toast.error('Initialization Failed', {
        description: errorMessage,
      });
    }
  }, []);

  // Analyze transaction with selected algorithm
  const analyzeTransaction = useCallback(async (request: TransactionAnalysisRequest): Promise<TransactionAnalysisResult | null> => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));
      
      const result = await quantumValleyBackendService.analyzeTransaction(request);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastAnalysis: result
      }));

      toast.success('Transaction Analysis Complete', {
        description: `Pattern ${result.pattern} detected with ${result.confidence.toFixed(1)}% confidence`,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage 
      }));
      
      toast.error('Analysis Failed', {
        description: errorMessage,
      });

      return null;
    }
  }, []);

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    try {
      const [metrics, workflowState] = await Promise.all([
        quantumValleyBackendService.getMetrics(),
        quantumValleyBackendService.getWorkflowState()
      ]);

      setState(prev => ({
        ...prev,
        metrics,
        workflowState
      }));
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    }
  }, []);

  // Reset workflow state
  const resetWorkflow = useCallback(() => {
    quantumValleyBackendService.resetWorkflowState();
    setState(prev => ({
      ...prev,
      workflowState: quantumValleyBackendService.getWorkflowState(),
      lastAnalysis: null,
      error: null
    }));
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Periodic metrics refresh
  useEffect(() => {
    if (!state.isInitialized) return;

    const interval = setInterval(() => {
      refreshMetrics();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [state.isInitialized, refreshMetrics]);

  return [
    state,
    {
      initialize,
      analyzeTransaction,
      refreshMetrics,
      resetWorkflow
    }
  ];
}

// Specialized hook for real-time workflow monitoring
export function useQuantumValleyWorkflow() {
  const [workflowState, setWorkflowState] = useState<BackendWorkflowState | null>(null);

  useEffect(() => {
    const updateWorkflowState = () => {
      setWorkflowState(quantumValleyBackendService.getWorkflowState());
    };

    // Initial state
    updateWorkflowState();

    // Poll for updates during processing
    const interval = setInterval(updateWorkflowState, 500);
    
    return () => clearInterval(interval);
  }, []);

  return workflowState;
}

// Hook for algorithm method selection and details
export function useAlgorithmMethods() {
  const [methods, setMethods] = useState<AlgorithmMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<AlgorithmMethod | null>(null);

  useEffect(() => {
    const loadMethods = async () => {
      try {
        const algorithmMethods = await quantumValleyBackendService.getAlgorithmMethods();
        setMethods(algorithmMethods);
        if (algorithmMethods.length > 0) {
          setSelectedMethod(algorithmMethods[0]);
        }
      } catch (error) {
        console.error('Failed to load algorithm methods:', error);
      }
    };

    loadMethods();
  }, []);

  const selectMethod = useCallback((methodType: AlgorithmMethod['type']) => {
    const method = methods.find(m => m.type === methodType);
    if (method) {
      setSelectedMethod(method);
    }
  }, [methods]);

  return {
    methods,
    selectedMethod,
    selectMethod
  };
}