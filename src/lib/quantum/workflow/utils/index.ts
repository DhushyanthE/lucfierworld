
/**
 * Re-export all quantum utility functions
 */

export * from './simulation';
export * from './cryptography';
// Explicitly re-export to avoid ambiguity
export { 
  quantumNeuralLayer,
  classicalNeuralLayer,
  quantumForwardPass,
  generateQuantumEmbeddings
} from './neuralNetworks';
export * from './fidelityModel';
export * from './circuitOptimizer';
export * from './blockchain'; // Updated to use the new blockchain module
export * from './quantumAI'; // This now re-exports from the modular structure
export * from './quantumDataScience';
export * from './quantumCloud';
export * from './iot'; // Updated to use the new IoT module

// Make sure these utility functions are exported
export { simulateQuantumDecoherence } from './simulation';
export { bitsToHex, calculateEntanglementScore, evaluateQuantumResistance } from './cryptography';
// Use export type for TypeScript interfaces with isolatedModules enabled
export type { BlockchainParameters } from './blockchain/types';
