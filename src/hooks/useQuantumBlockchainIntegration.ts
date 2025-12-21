import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SecurityLayerResult {
  layer: number;
  score: number;
  passed: boolean;
}

export interface SecurityResult {
  securityScore: number;
  layerResults: SecurityLayerResult[];
  integrityHash: string;
  timestamp: string;
}

export interface QuantumResult {
  echoResonance: number;
  quantumFidelity: number;
  coherenceMap: number[];
  entanglementMatrix: number[][];
}

export interface AgenticMetrics {
  totalReward: number;
  learningProgress: number;
  annAccuracy: number;
  explorationRate: number;
}

export interface AgenticResult {
  metrics: AgenticMetrics;
  decisions: Array<{ state: string; action: number; reward: number }>;
}

export interface AGIWorkflowResult {
  superintelligenceScore: number;
  workflowResults: Array<{ stage: string; status: string; metrics: any }>;
  agiOptimization: { savingsPercent: number; quantumEnhancement: number };
  finalOutput: any;
}

export interface UnifiedIntegrationResult {
  success: boolean;
  timestamp: string;
  security?: SecurityResult;
  quantum?: QuantumResult;
  agentic?: AgenticResult;
  agi?: AGIWorkflowResult;
  integration?: {
    status: string;
    totalProcessingSteps: number;
    overallScore: number;
  };
}

export type OperationType = 
  | 'full-integration'
  | 'security-only'
  | 'quantum-only'
  | 'neural-training'
  | 'agi-workflow';

export interface IntegrationConfig {
  episodes?: number;
  securityLevel?: 'standard' | 'high' | 'maximum';
  enableRealtime?: boolean;
  pollInterval?: number;
}

export function useQuantumBlockchainIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UnifiedIntegrationResult | null>(null);
  const [history, setHistory] = useState<UnifiedIntegrationResult[]>([]);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<{
    lastUpdate: Date | null;
    updateCount: number;
    avgProcessingTime: number;
  }>({
    lastUpdate: null,
    updateCount: 0,
    avgProcessingTime: 0,
  });

  const executeOperation = useCallback(async (
    operation: OperationType,
    input: any,
    config?: IntegrationConfig
  ): Promise<UnifiedIntegrationResult> => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quantum-blockchain-unified`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ operation, input, config }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: UnifiedIntegrationResult = await response.json();

      if (!data.success) {
        throw new Error('Operation failed');
      }

      const processingTime = Date.now() - startTime;

      setResult(data);
      setHistory(prev => [...prev.slice(-19), data]);
      setRealtimeMetrics(prev => ({
        lastUpdate: new Date(),
        updateCount: prev.updateCount + 1,
        avgProcessingTime: (prev.avgProcessingTime * prev.updateCount + processingTime) / (prev.updateCount + 1),
      }));

      toast({
        title: 'Integration Complete',
        description: `${operation} processed in ${processingTime}ms`,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Integration Error',
        description: message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeFullIntegration = useCallback(async (
    input: any,
    config?: IntegrationConfig
  ) => {
    return executeOperation('full-integration', input, config);
  }, [executeOperation]);

  const executeSecurityCheck = useCallback(async (input: any) => {
    return executeOperation('security-only', input);
  }, [executeOperation]);

  const executeQuantumEchoes = useCallback(async (input: any) => {
    return executeOperation('quantum-only', input);
  }, [executeOperation]);

  const executeNeuralTraining = useCallback(async (episodes: number = 100) => {
    return executeOperation('neural-training', {}, { episodes });
  }, [executeOperation]);

  const executeAGIWorkflow = useCallback(async (input: any) => {
    return executeOperation('agi-workflow', input);
  }, [executeOperation]);

  // Real-time polling
  const startRealtimePolling = useCallback((
    operation: OperationType,
    input: any,
    intervalMs: number = 5000
  ) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    setIsRealtimeActive(true);
    
    // Execute immediately
    executeOperation(operation, input).catch(console.error);

    // Set up polling
    pollingRef.current = setInterval(() => {
      executeOperation(operation, input).catch(console.error);
    }, intervalMs);

    toast({
      title: 'Real-time Monitoring Started',
      description: `Polling every ${intervalMs / 1000} seconds`,
    });
  }, [executeOperation]);

  const stopRealtimePolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsRealtimeActive(false);
    
    toast({
      title: 'Real-time Monitoring Stopped',
      description: 'Polling disabled',
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Computed metrics from latest result
  const computedMetrics = {
    securityScore: result?.security?.securityScore ?? 0,
    quantumFidelity: result?.quantum?.quantumFidelity ? result.quantum.quantumFidelity * 100 : 0,
    annAccuracy: result?.agentic?.metrics.annAccuracy ? result.agentic.metrics.annAccuracy * 100 : 0,
    superintelligenceScore: result?.agi?.superintelligenceScore ? result.agi.superintelligenceScore * 100 : 0,
    overallScore: result?.integration?.overallScore ?? 0,
    patternLayersPassed: result?.security?.layerResults.filter(l => l.passed).length ?? 0,
    totalPatternLayers: 20,
  };

  return {
    // State
    isLoading,
    error,
    result,
    history,
    isRealtimeActive,
    realtimeMetrics,
    computedMetrics,

    // Operations
    executeOperation,
    executeFullIntegration,
    executeSecurityCheck,
    executeQuantumEchoes,
    executeNeuralTraining,
    executeAGIWorkflow,

    // Real-time controls
    startRealtimePolling,
    stopRealtimePolling,
  };
}
