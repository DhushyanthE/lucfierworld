import { useState, useCallback } from 'react';

interface AgentState {
  id: string;
  position: number[];
  rewards: number;
  actions: string[];
  qTable: Record<string, number>;
}

interface ANNLayer {
  type: 'input' | 'hidden' | 'output';
  neurons: number;
  activation: string;
  weights: number[][];
}

interface AgenticWorkflowResult {
  agentId: string;
  state: AgentState;
  annLayers: ANNLayer[];
  decisions: Array<{
    action: string;
    confidence: number;
    reward: number;
  }>;
  workflowStatus: string;
  metrics: {
    totalReward: number;
    explorationRate: number;
    learningProgress: number;
    annAccuracy: number;
  };
}

interface AgenticAIResponse {
  success: boolean;
  workflowType: string;
  result: AgenticWorkflowResult;
  timestamp: string;
  qLearningParams: {
    learningRate: number;
    discountFactor: number;
    explorationRate: number;
  };
}

export function useAgenticAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgenticAIResponse | null>(null);
  const [agentHistory, setAgentHistory] = useState<AgenticAIResponse[]>([]);

  const executeAgenticWorkflow = useCallback(async (
    workflowType: string,
    input: any,
    iterations: number = 50
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agentic-ai-ann`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ workflowType, input, iterations }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Agentic AI workflow failed');
      }

      setResult(data);
      setAgentHistory(prev => [...prev.slice(-9), data]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trainBlockchainAgent = useCallback(async (iterations: number = 100) => {
    return executeAgenticWorkflow('blockchain-optimization', {
      target: 'transaction-throughput',
      constraints: ['gas-efficiency', 'security']
    }, iterations);
  }, [executeAgenticWorkflow]);

  const runAnomalyDetectionAgent = useCallback(async () => {
    return executeAgenticWorkflow('anomaly-detection', {
      mode: 'real-time',
      sensitivity: 0.8
    }, 75);
  }, [executeAgenticWorkflow]);

  const optimizeConsensusAgent = useCallback(async () => {
    return executeAgenticWorkflow('consensus-optimization', {
      algorithm: 'proof-of-neural-work',
      validators: 21
    }, 60);
  }, [executeAgenticWorkflow]);

  return {
    isLoading,
    error,
    result,
    agentHistory,
    executeAgenticWorkflow,
    trainBlockchainAgent,
    runAnomalyDetectionAgent,
    optimizeConsensusAgent
  };
}
