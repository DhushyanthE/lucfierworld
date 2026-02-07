import { useState, useCallback } from 'react';

interface QuantumSubspace {
  id: string;
  dimension: number;
  qubits: number;
  compressionRatio: number;
  securityLevel: 'standard' | 'enhanced' | 'maximum';
  active: boolean;
}

interface ThreatPattern {
  id: string;
  type: 'malware' | 'ddos' | 'intrusion' | 'phishing' | 'ransomware' | 'apt' | 'zero-day';
  signature: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  quantumSignature: number[];
  subspaceVector: number[];
  detectedAt: string;
  neutralized: boolean;
}

interface HoneypotNode {
  id: string;
  type: 'high-interaction' | 'low-interaction' | 'quantum-trap';
  status: 'active' | 'triggered' | 'analyzing';
  attractorStrength: number;
  capturedThreats: number;
  quantumEntanglement: number;
}

interface QNNLayer {
  id: string;
  neurons: number;
  quantumGates: string[];
  activationFunction: string;
  entanglementDepth: number;
  subspaceProjection: number[];
}

interface FirewallMetrics {
  threatsDetected: number;
  threatsNeutralized: number;
  defenseScore: number;
  quantumFidelity: number;
  subspaceEfficiency: number;
  echoResonance?: number;
  layersPassed?: number;
  totalLayers?: number;
}

interface DefenseCycleResult {
  success: boolean;
  cycle?: {
    threats: ThreatPattern[];
    echoAnalysis: {
      recognizedPatterns: string[];
      echoResonance: number;
      patternClusters: Record<string, number>;
    };
    attractorResult: {
      capturedThreats: ThreatPattern[];
      attractorMetrics: {
        totalAttractions: number;
        successfulCaptures: number;
        quantumDeception: number;
      };
    };
    defense: {
      defenseActions: Array<{
        threatId: string;
        action: string;
        layer: string;
        success: boolean;
      }>;
      overallDefenseScore: number;
    };
    auditEntry: {
      blockHash: string;
      previousHash: string;
      merkleRoot: string;
      nonce: number;
      timestamp: string;
    };
  };
  metrics?: FirewallMetrics;
}

export function useQuantumFirewall() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subspaces, setSubspaces] = useState<QuantumSubspace[]>([]);
  const [honeypots, setHoneypots] = useState<HoneypotNode[]>([]);
  const [qnnLayers, setQnnLayers] = useState<QNNLayer[]>([]);
  const [threats, setThreats] = useState<ThreatPattern[]>([]);
  const [metrics, setMetrics] = useState<FirewallMetrics | null>(null);
  const [lastCycleResult, setLastCycleResult] = useState<DefenseCycleResult | null>(null);

  const executeOperation = useCallback(async (operation: string, input?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quantum-firewall`,
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
        throw new Error(data.error || 'Quantum Firewall operation failed');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeFirewall = useCallback(async (mode: 'passive' | 'active' | 'aggressive' = 'active') => {
    const result = await executeOperation('initialize', { mode });
    if (result.firewallState) {
      setSubspaces(result.firewallState.subspaces);
      setHoneypots(result.firewallState.honeypots);
      setQnnLayers(result.firewallState.qnnLayers);
    }
    return result;
  }, [executeOperation]);

  const scanForThreats = useCallback(async () => {
    const result = await executeOperation('threat-scan', {});
    if (result.threats) {
      setThreats(result.threats);
    }
    return result;
  }, [executeOperation]);

  const activateHoneypots = useCallback(async () => {
    const result = await executeOperation('activate-honeypots', {});
    if (result.honeypots) {
      setHoneypots(result.honeypots);
    }
    return result;
  }, [executeOperation]);

  const runQNNDefense = useCallback(async (currentThreats?: ThreatPattern[]) => {
    const result = await executeOperation('qnn-defense', { threats: currentThreats || threats });
    if (result.qnnLayers) {
      setQnnLayers(result.qnnLayers);
    }
    return result;
  }, [executeOperation, threats]);

  const runSubspaceTeleport = useCallback(async (data: any) => {
    return executeOperation('subspace-teleport', { data });
  }, [executeOperation]);

  const runErrorCorrection = useCallback(async () => {
    return executeOperation('error-correction', {});
  }, [executeOperation]);

  const runFullDefenseCycle = useCallback(async () => {
    const result = await executeOperation('full-defense-cycle', {});
    if (result.cycle) {
      setThreats(result.cycle.threats);
    }
    if (result.metrics) {
      setMetrics(result.metrics);
    }
    setLastCycleResult(result);
    return result;
  }, [executeOperation]);

  const runQuantumEchoesIntegration = useCallback(async (currentThreats?: ThreatPattern[]) => {
    const result = await executeOperation('quantum-echoes-integration', { threats: currentThreats || threats });
    return result;
  }, [executeOperation, threats]);

  return {
    isLoading,
    error,
    subspaces,
    honeypots,
    qnnLayers,
    threats,
    metrics,
    lastCycleResult,
    initializeFirewall,
    scanForThreats,
    activateHoneypots,
    runQNNDefense,
    runSubspaceTeleport,
    runErrorCorrection,
    runFullDefenseCycle,
    runQuantumEchoesIntegration,
  };
}
