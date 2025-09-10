
/**
 * Genomic Transaction History Functions
 */

import { GenomicTransactionHistory } from './types';

/**
 * Retrieve genomic blockchain transaction history
 */
export async function getGenomicBlockchainHistory(address: string): Promise<GenomicTransactionHistory[]> {
  // Simulate blockchain query time
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Generate random number of transactions
  const txCount = Math.floor(Math.random() * 5) + 2;
  const currentTime = Date.now();
  
  // Generate random transactions
  return Array.from({ length: txCount }, (_, i) => {
    const type = ['store', 'access', 'analyze'][Math.floor(Math.random() * 3)];
    const timestamp = currentTime - (i * 86400000); // Each 1 day apart
    
    return {
      txId: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      type,
      timestamp,
      blockNumber: 10000000 + Math.floor(Math.random() * 1000000),
      data: {
        hash: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        tokens: Math.floor(Math.random() * 100) + 10
      }
    };
  });
}
