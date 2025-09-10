
/**
 * Utility functions for the DNA Sequence Processor
 */

// Validate DNA sequence contains only valid bases
export function validateSequence(sequence: string): boolean {
  return /^[ACGT]+$/i.test(sequence);
}

// Generate a unique ID for a sequence
export function generateSequenceId(): string {
  return `seq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Generate a quantum-resistant hash for the sequence
export function generateQuantumHash(sequence: string): string {
  // In a real implementation, this would use a quantum-resistant hashing algorithm
  // For simulation purposes, we're generating a random hash
  return Array(40)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

// Find genomic patterns in the sequence
export function findPatterns(sequence: string): import('./types').PatternResult[] {
  // In a real implementation, this would use quantum algorithms to find patterns
  // For simulation, we'll return random patterns
  const patternCount = Math.floor(Math.random() * 5) + 1;
  const patterns: import('./types').PatternResult[] = [];
  
  const patternTypes: import('./types').PatternResult['patternType'][] = ['repeat', 'snp', 'inversion', 'translocation'];
  
  for (let i = 0; i < patternCount; i++) {
    patterns.push({
      patternType: patternTypes[Math.floor(Math.random() * patternTypes.length)],
      position: Math.floor(Math.random() * sequence.length),
      length: Math.floor(Math.random() * 20) + 5,
      confidence: Math.random() * 0.3 + 0.7 // 70-100%
    });
  }
  
  return patterns;
}

// Calculate match score for the sequence
export function calculateMatchScore(sequence: string): number {
  // In a real implementation, this would compare against reference sequences
  // For simulation, we'll return a random match score between 70-100%
  return Math.random() * 0.3 + 0.7;
}

// Generate a simulated blockchain transaction ID
export function generateTxId(): string {
  return `tx_${Array(64)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')}`;
}
