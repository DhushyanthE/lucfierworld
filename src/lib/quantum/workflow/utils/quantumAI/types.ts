
/**
 * Type definitions for Quantum AI models and operations
 */

// Defines the structure for a Quantum AI Model
export interface QuantumAIModel {
  // Array of layer sizes, including input and output
  layers: number[];
  
  // Activation functions for each layer connection
  activations: ('relu' | 'tanh' | 'sigmoid' | 'quantum')[];
  
  // Weights for connections between layers
  weights: number[][];
  
  // Biases for each layer (except input)
  biases: number[][];
  
  // Quantum properties
  fidelity?: number;
  coherenceScore?: number;
  quantumEntanglementScore?: number;
}

// Result of a forward pass through the quantum neural network
export interface QuantumForwardPassResult {
  output: number[];
  quantumMetrics: {
    fidelity: number;
    coherence: number;
  };
}

// Configuration for quantum neural training
export interface QuantumTrainingConfig {
  learningRate: number;
  epochs: number;
  batchSize: number;
  useQuantumBackprop: boolean;
  quantumNoiseLevel?: number;
  errorCorrectionEnabled?: boolean;
}

// Result of training a quantum neural network
export interface QuantumTrainingResult {
  model: QuantumAIModel;
  trainingLoss: number[];
  validationLoss: number[];
  accuracy: number;
  quantumMetrics: {
    fidelity: number;
    coherence: number;
    entanglementScore: number;
  };
}

// Configuration for evaluation
export interface QuantumEvaluationConfig {
  useQuantumEnhancement: boolean;
  metricTypes: string[];
  confusionMatrix: boolean;
}

// Result of evaluating a quantum neural network
export interface QuantumEvaluationResult {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix?: number[][];
  quantumAdvantage: number;
}
