
export interface TrainedQuantumModel {
  id?: string;
  name?: string;
  type?: string;
  weights?: number[][];
  biases?: number[][];
  parameters?: any;
  metrics?: {
    epoch: number;
    accuracy: number;
    loss: number;
    fidelity: number;
    quantumCoherence: number;
    quantumEntanglement?: number;
  }[];
  config?: {
    layers: number[];
    activations: string[];
  };
  trainingOptions?: any;
  trainingStamps?: {
    epochCount: number;
  };
  finalMetrics: {
    loss: number;
    accuracy: number;
    fidelity: number;
    robustness: number;
    quantumResistance: number;
    quantumAdvantage?: number;
  };
  timestamp?: number;
}

export interface ModelPrediction {
  result: number[];
  confidence: number;
  executionTime: number;
}
