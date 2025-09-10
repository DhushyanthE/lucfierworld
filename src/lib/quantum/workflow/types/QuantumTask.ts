
export interface QuantumTask {
  id: string;
  type: 'training' | 'inference' | 'optimization';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  params: Record<string, any>;
  result?: Record<string, any>;
  timestamp: number;
}

export interface TrainingTask extends QuantumTask {
  type: 'training';
  params: {
    modelId: string;
    epochs: number;
    configuration: Record<string, any>;
    advancedOptions?: Record<string, any>;
  };
  result?: {
    accuracy: number;
    loss: number;
    quantumMetrics: {
      fidelity: number;
      coherence: number;
      entanglement: number;
      quantumAdvantage: number;
    }
  };
}

export interface ModelTransferResult {
  success: boolean;
  transferredAt: number;
  modelId: string;
  chatEnhancementLevel: number;
  assistantCapabilities: string[];
}
