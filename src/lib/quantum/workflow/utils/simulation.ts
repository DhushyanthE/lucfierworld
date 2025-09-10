
/**
 * Quantum simulation utility functions
 */

/**
 * Simulate quantum computation delay to mimic real quantum processing
 */
export function simulateQuantumComputation(time: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * Simulate quantum decoherence over time
 * @param initialFidelity Initial quantum state fidelity
 * @param timeElapsed Time elapsed since preparation
 * @param coherenceTime System coherence time constant
 * @returns Current fidelity after decoherence
 */
export function simulateQuantumDecoherence(
  initialFidelity: number,
  timeElapsed: number,
  coherenceTime: number
): number {
  // Quantum decoherence model based on exponential decay
  const decayFactor = Math.exp(-timeElapsed / coherenceTime);
  
  // Calculate current fidelity with decay
  const currentFidelity = initialFidelity * decayFactor + (1 - decayFactor) * 0.5;
  
  // Add small random noise
  const noise = (Math.random() - 0.5) * 0.05;
  
  // Return final fidelity (bounded between 0.5 and 1.0)
  return Math.min(1.0, Math.max(0.5, currentFidelity + noise));
}
