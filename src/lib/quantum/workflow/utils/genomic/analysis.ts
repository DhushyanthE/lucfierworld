
/**
 * Genomic Data Analysis Functions
 */

import { GenomicAnalysisResult } from './types';

/**
 * Analyze genomic data
 */
export async function analyzeGenomicData(sequence: string): Promise<GenomicAnalysisResult> {
  // Simulate analysis time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Calculate base composition
  const totalLength = sequence.length;
  const countA = (sequence.match(/A/g) || []).length;
  const countC = (sequence.match(/C/g) || []).length;
  const countG = (sequence.match(/G/g) || []).length;
  const countT = (sequence.match(/T/g) || []).length;
  
  const baseComposition = {
    A: countA / totalLength || 0.25,
    C: countC / totalLength || 0.25,
    G: countG / totalLength || 0.25,
    T: countT / totalLength || 0.25
  };
  
  // Calculate GC content
  const gcContent = (countG + countC) / totalLength || 0.5;
  
  // Generate random patterns
  const patternCount = Math.floor(Math.random() * 10) + 1;
  const patterns = Array.from({ length: patternCount }, (_, i) => ({
    id: `pattern-${i}`,
    sequence: `${sequence.substring(0, Math.min(10, sequence.length))}...`,
    significance: Math.random(),
    locations: [Math.floor(Math.random() * totalLength)]
  }));
  
  return {
    hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    analysis: {
      baseComposition,
      gcContent,
      uniquenessScore: 0.1 + (Math.random() * 0.9),
      patternCount,
      potentialGenes: Math.floor(Math.random() * 5) + 1
    },
    patterns
  };
}

/**
 * Calculate genomic token value
 */
export function calculateGenomicTokenValue(
  sequenceLength: number,
  uniquenessScore: number,
  accessControl: {
    isPublic: boolean;
    allowedAddresses: string[];
    encryptionType?: string;
  }
): {
  tokenAmount: number;
  bonusFactors: {
    lengthFactor: number;
    uniquenessFactor: number;
    publicFactor: number;
    quantumFactor: number;
  };
} {
  // Calculate base amount
  const baseAmount = Math.floor(sequenceLength / 10);
  
  // Calculate bonus factors
  const lengthFactor = Math.min(2.0, 0.5 + (sequenceLength / 1000));
  const uniquenessFactor = uniquenessScore * 2;
  const publicFactor = accessControl.isPublic ? 1.2 : 0.9;
  const quantumFactor = accessControl.encryptionType === 'quantum' ? 1.5 : 1.0;
  
  // Calculate total amount
  const tokenAmount = Math.floor(baseAmount * lengthFactor * uniquenessFactor * publicFactor * quantumFactor);
  
  return {
    tokenAmount,
    bonusFactors: {
      lengthFactor,
      uniquenessFactor,
      publicFactor,
      quantumFactor
    }
  };
}
