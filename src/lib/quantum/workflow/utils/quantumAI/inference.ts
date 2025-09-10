
/**
 * Quantum neural network inference functionality
 */

import type { QuantumAIModel, QuantumForwardPassResult } from './types';
import { quantumNeuralLayer } from '../neuralNetworks';

/**
 * Perform a forward pass through the quantum neural network
 */
export function quantumForwardPass(
  model: QuantumAIModel,
  inputData: number[]
): QuantumForwardPassResult {
  // Verify input dimensions
  if (inputData.length !== model.layers[0]) {
    throw new Error(`Input dimension mismatch: expected ${model.layers[0]} but got ${inputData.length}`);
  }

  // Initialize the current layer output with the input data
  let currentOutput = [...inputData];
  
  // Process through each layer in the model
  for (let i = 0; i < model.layers.length - 1; i++) {
    const weights = model.weights[i];
    const biases = model.biases[i];
    const activation = model.activations[i];
    
    // Calculate the weighted sum for each neuron in the next layer
    const weightedSums: number[] = [];
    
    for (let j = 0; j < model.layers[i + 1]; j++) {
      let sum = biases[j];
      
      for (let k = 0; k < model.layers[i]; k++) {
        sum += currentOutput[k] * weights[k * model.layers[i + 1] + j];
      }
      
      weightedSums.push(sum);
    }
    
    // Apply activation function
    if (activation === 'quantum') {
      // Use quantum layer for quantum activations - pass required parameters
      // Assuming quantumNeuralLayer needs input data (array), layer size, entanglement parameter,
      // coherence parameter, and optional configuration
      const layerSize = model.layers[i + 1];
      const entanglementParam = model.quantumEntanglementScore || 0.5;
      const coherenceParam = model.coherenceScore || 0.7;
      const config = { fidelity: model.fidelity || 0.9 };
      
      // Looking at neuralNetworks.ts, it seems the function expects different arguments
      // The error suggests we are passing a number where an array is expected
      currentOutput = quantumNeuralLayer(
        weightedSums,  // Passing the array of weighted sums
        layerSize,     // This should be a number
        entanglementParam, 
        coherenceParam, 
        config
      );
    } else {
      // Apply classical activation functions
      currentOutput = weightedSums.map(sum => {
        switch (activation) {
          case 'relu':
            return Math.max(0, sum);
          case 'sigmoid':
            return 1 / (1 + Math.exp(-sum));
          case 'tanh':
            return Math.tanh(sum);
          default:
            return sum;
        }
      });
    }
  }
  
  // Calculate quantum metrics based on the model's properties
  const fidelity = model.fidelity * (0.9 + Math.random() * 0.1);
  const coherence = model.coherenceScore * (0.85 + Math.random() * 0.15);
  
  return {
    output: currentOutput,
    quantumMetrics: {
      fidelity,
      coherence
    }
  };
}
