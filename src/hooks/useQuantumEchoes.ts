import { useState, useCallback } from 'react';

interface QuantumEchoPattern {
  layerId: number;
  patternType: string;
  amplitude: number;
  phase: number;
  coherence: number;
  securityLevel: number;
  interferenceDetected: boolean;
}

interface EchoTransferResult {
  success: boolean;
  patterns: QuantumEchoPattern[];
  totalSecurityScore: number;
  transferIntegrity: number;
  quantumFidelity: number;
  echoResonance: number;
}

interface QuantumEchoesResponse {
  success: boolean;
  operation: string;
  result: EchoTransferResult;
  timestamp: string;
  patternCount: number;
  layerDetails: Array<{ id: number; name: string; type: string }>;
}

export function useQuantumEchoes() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuantumEchoesResponse | null>(null);

  const executeQuantumEchoes = useCallback(async (
    operation: string,
    input: any,
    securityLevel: 'standard' | 'high' | 'maximum' = 'standard'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quantum-echoes-algorithm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ operation, input, securityLevel }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Quantum echoes operation failed');
      }

      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transferWithPatternLayers = useCallback(async (
    fromAddress: string,
    toAddress: string,
    amount: number
  ) => {
    return executeQuantumEchoes('security-transfer', {
      from: fromAddress,
      to: toAddress,
      amount,
      timestamp: Date.now()
    }, 'maximum');
  }, [executeQuantumEchoes]);

  const verifyPatternIntegrity = useCallback(async (transactionId: string) => {
    return executeQuantumEchoes('verify-integrity', {
      transactionId,
      timestamp: Date.now()
    }, 'high');
  }, [executeQuantumEchoes]);

  return {
    isLoading,
    error,
    result,
    executeQuantumEchoes,
    transferWithPatternLayers,
    verifyPatternIntegrity
  };
}
