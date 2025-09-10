
/**
 * Type definitions for Quantum AI Training models and options
 */

export interface QuantumTrainingAdvancedOptions {
  quantumCircuitDepth: number;
  quantumNoiseModel: string;
  parameterizedGates: boolean;
  adaptiveLearningRate: boolean;
  regularizationStrength: number;
  quantumBackpropagation: boolean;
  circuitOptimization: 'none' | 'light' | 'medium' | 'aggressive';
  earlyStoppingPatience: number;
  quantumMemoryOptimization: boolean;
}

export interface TrainedQuantumModel {
  id: string;
  name: string;
  type: string;
  weights?: number[][];
  biases?: number[][];
  parameters: any;
  metrics: {
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
    accuracy: number;
    loss: number;
    fidelity: number;
    robustness: number;
    quantumResistance: number;
    quantumAdvantage?: number;
  };
  timestamp: number;
}
