
/**
 * Quantum AI model creation and manipulation
 */

import { QuantumAIModel } from './types';

/**
 * Create a new quantum AI model with initialized weights and biases
 */
export function createQuantumAIModel(
  layers: number[],
  activations: ('relu' | 'tanh' | 'sigmoid' | 'quantum')[]
): QuantumAIModel {
  // Validation
  if (layers.length < 2) {
    throw new Error('Model must have at least input and output layers');
  }
  
  if (activations.length !== layers.length - 1) {
    throw new Error(`Expected ${layers.length - 1} activation functions, got ${activations.length}`);
  }
  
  // Initialize weights and biases
  const weights: number[][] = [];
  const biases: number[][] = [];
  
  // For each layer connection
  for (let i = 0; i < layers.length - 1; i++) {
    const inputSize = layers[i];
    const outputSize = layers[i + 1];
    
    // Initialize weights for this layer connection
    const layerWeights: number[] = [];
    for (let j = 0; j < inputSize * outputSize; j++) {
      // Xavier/Glorot initialization
      const limit = Math.sqrt(6 / (inputSize + outputSize));
      layerWeights.push((Math.random() * 2 * limit) - limit);
    }
    weights.push(layerWeights);
    
    // Initialize biases for this layer
    const layerBiases = Array(outputSize).fill(0).map(() => Math.random() * 0.1);
    biases.push(layerBiases);
  }
  
  // Create quantum properties
  const fidelity = 0.95 + (Math.random() * 0.05); // 0.95-1.0
  const coherenceScore = 0.8 + (Math.random() * 0.2); // 0.8-1.0
  const quantumEntanglementScore = 0.7 + (Math.random() * 0.3); // 0.7-1.0
  
  // Return the complete model
  return {
    layers,
    activations,
    weights,
    biases,
    fidelity,
    coherenceScore,
    quantumEntanglementScore
  };
}

/**
 * Clone a quantum AI model
 */
export function cloneQuantumAIModel(model: QuantumAIModel): QuantumAIModel {
  return {
    layers: [...model.layers],
    activations: [...model.activations],
    weights: model.weights.map(layer => [...layer]),
    biases: model.biases.map(layer => [...layer]),
    fidelity: model.fidelity,
    coherenceScore: model.coherenceScore,
    quantumEntanglementScore: model.quantumEntanglementScore
  };
}

/**
 * Save model to JSON string
 */
export function serializeQuantumAIModel(model: QuantumAIModel): string {
  return JSON.stringify(model);
}

/**
 * Load model from JSON string
 */
export function deserializeQuantumAIModel(json: string): QuantumAIModel {
  return JSON.parse(json) as QuantumAIModel;
}
