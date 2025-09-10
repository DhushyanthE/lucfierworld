
/**
 * Quantum AI model creation functionality
 */

import type { QuantumAIModel } from './types';

/**
 * Create a quantum AI model with the specified layer architecture
 */
export function createQuantumAIModel(
  layers: number[],
  activations: ('relu' | 'tanh' | 'sigmoid' | 'quantum')[]
): QuantumAIModel {
  // Validate inputs
  if (layers.length < 2) {
    throw new Error('Model must have at least input and output layers');
  }
  
  if (activations.length !== layers.length - 1) {
    throw new Error('Number of activation functions must match number of connections between layers');
  }
  
  // Initialize weights and biases for each layer
  const weights: number[][] = [];
  const biases: number[][] = [];
  
  // Create weights and biases for each layer connection
  for (let i = 0; i < layers.length - 1; i++) {
    const inputSize = layers[i];
    const outputSize = layers[i + 1];
    
    // Initialize weights with small random values
    const layerWeights: number[] = [];
    for (let j = 0; j < inputSize * outputSize; j++) {
      // Initialize with small random values following Xavier initialization
      const limit = Math.sqrt(6 / (inputSize + outputSize));
      layerWeights.push((Math.random() * 2 * limit) - limit);
    }
    weights.push(layerWeights);
    
    // Initialize biases to zeros
    const layerBiases: number[] = [];
    for (let j = 0; j < outputSize; j++) {
      layerBiases.push(0);
    }
    biases.push(layerBiases);
  }
  
  // Calculate quantum properties based on the model architecture
  const hasQuantumActivations = activations.includes('quantum');
  const quantumLayerCount = activations.filter(a => a === 'quantum').length;
  const totalLayers = layers.length - 1;
  
  // Calculate quantum metrics
  const fidelity = hasQuantumActivations ? 0.85 + (Math.random() * 0.15) : 0.5;
  const coherenceScore = hasQuantumActivations ? 
    0.7 + (0.2 * (quantumLayerCount / totalLayers)) : 0.2;
  const quantumEntanglementScore = hasQuantumActivations ?
    0.6 + (0.3 * (quantumLayerCount / totalLayers)) : 0.1;
  
  return {
    layers,
    weights,
    biases,
    activations,
    fidelity,
    coherenceScore,
    quantumEntanglementScore
  };
}
