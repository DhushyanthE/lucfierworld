
/**
 * Quantum AI embeddings for data representation
 */

import { QuantumAIModel } from './types';
import { quantumForwardPass } from './inference';

/**
 * Generate embeddings from data using a quantum AI model
 * Extract the activations from a middle layer as embeddings
 */
export function generateQuantumEmbeddings(
  model: QuantumAIModel,
  inputData: number[][],
  embeddingSize: number = 32
): number[][] {
  console.log(`Generating ${embeddingSize}-dimensional quantum embeddings for ${inputData.length} examples`);
  
  // Find a middle layer close to the desired embedding size
  let targetLayerIndex = -1;
  let minSizeDiff = Infinity;
  
  for (let i = 0; i < model.layers.length; i++) {
    const diff = Math.abs(model.layers[i] - embeddingSize);
    if (diff < minSizeDiff) {
      minSizeDiff = diff;
      targetLayerIndex = i;
    }
  }
  
  // If no suitable layer found, use the second-to-last layer
  if (targetLayerIndex < 0) {
    targetLayerIndex = Math.max(0, model.layers.length - 2);
  }
  
  const embeddings: number[][] = [];
  
  // Process each input
  for (const input of inputData) {
    // Generate a partial forward pass to the target layer
    let currentOutput = [...input];
    
    // Only process up to the target layer
    for (let i = 0; i < targetLayerIndex; i++) {
      const weights = model.weights[i];
      const biases = model.biases[i];
      const activation = model.activations[i];
      
      // Calculate weighted sums
      const weightedSums: number[] = [];
      for (let j = 0; j < model.layers[i + 1]; j++) {
        let sum = biases[j];
        for (let k = 0; k < model.layers[i]; k++) {
          sum += currentOutput[k] * weights[k * model.layers[i + 1] + j];
        }
        weightedSums.push(sum);
      }
      
      // Apply activation function
      currentOutput = weightedSums.map(sum => {
        switch (activation) {
          case 'relu':
            return Math.max(0, sum);
          case 'sigmoid':
            return 1 / (1 + Math.exp(-sum));
          case 'tanh':
            return Math.tanh(sum);
          case 'quantum':
            // Simple approximation for quantum activation
            return Math.tanh(sum) * (0.8 + Math.random() * 0.4);
          default:
            return sum;
        }
      });
    }
    
    // Use the activations as embeddings
    embeddings.push(currentOutput);
  }
  
  return embeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimensions don't match: ${a.length} vs ${b.length}`);
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  return dotProduct / (normA * normB);
}

/**
 * Find nearest neighbors in embedding space
 */
export function findNearestNeighbors(
  queryEmbedding: number[],
  embeddingDatabase: number[][],
  k: number = 5
): { index: number, similarity: number }[] {
  const similarities: { index: number, similarity: number }[] = embeddingDatabase.map(
    (embedding, index) => ({
      index,
      similarity: cosineSimilarity(queryEmbedding, embedding)
    })
  );
  
  // Sort by similarity (highest first)
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  // Return top k
  return similarities.slice(0, k);
}
