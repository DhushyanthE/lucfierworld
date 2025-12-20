import { useState, useCallback } from 'react';

interface QuantumCoinTransaction {
  id: string;
  type: 'transfer' | 'stake' | 'mint' | 'burn';
  amount: number;
  from: string;
  to: string;
  quantumSignature: string;
  agiOptimized: boolean;
}

interface AGIOptimizationResult {
  originalGasCost: number;
  optimizedGasCost: number;
  savingsPercent: number;
  routeOptimization: string[];
  quantumEnhancement: number;
}

interface QuantumCoinAGIResult {
  transactionId: string;
  transaction: QuantumCoinTransaction;
  agiOptimization: AGIOptimizationResult;
  quantumMetrics: {
    entanglement: number;
    coherence: number;
    fidelity: number;
    superpositionStates: number;
  };
  workflowSteps: Array<{
    step: string;
    status: string;
    duration: number;
    output: any;
  }>;
  superintelligenceScore: number;
}

interface QuantumCoinAGIResponse {
  success: boolean;
  operation: string;
  result: QuantumCoinAGIResult;
  timestamp: string;
}

export function useQuantumCoinAGI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuantumCoinAGIResponse | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<QuantumCoinAGIResponse[]>([]);

  const executeQuantumCoinAGI = useCallback(async (
    operation: string,
    input: any
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quantum-coin-agi`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ operation, input }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Quantum Coin AGI operation failed');
      }

      setResult(data);
      setTransactionHistory(prev => [...prev.slice(-19), data]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transferWithAGI = useCallback(async (
    from: string,
    to: string,
    amount: number
  ) => {
    return executeQuantumCoinAGI('agi-optimized-transfer', {
      transactionType: 'transfer',
      from,
      to,
      amount
    });
  }, [executeQuantumCoinAGI]);

  const stakeWithAGI = useCallback(async (address: string, amount: number) => {
    return executeQuantumCoinAGI('agi-optimized-stake', {
      transactionType: 'stake',
      from: address,
      to: 'staking-contract',
      amount
    });
  }, [executeQuantumCoinAGI]);

  const mintWithAGI = useCallback(async (toAddress: string, amount: number) => {
    return executeQuantumCoinAGI('agi-optimized-mint', {
      transactionType: 'mint',
      from: 'genesis',
      to: toAddress,
      amount
    });
  }, [executeQuantumCoinAGI]);

  const getSuperintelligenceInsights = useCallback(async () => {
    return executeQuantumCoinAGI('superintelligence-analysis', {
      mode: 'full-analysis',
      depth: 'comprehensive'
    });
  }, [executeQuantumCoinAGI]);

  return {
    isLoading,
    error,
    result,
    transactionHistory,
    executeQuantumCoinAGI,
    transferWithAGI,
    stakeWithAGI,
    mintWithAGI,
    getSuperintelligenceInsights
  };
}
