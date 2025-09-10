
/**
 * Blockchain utilities for quantum-enhanced operations
 */

/**
 * Generates mock transactionId for demonstration purposes
 */
export function generateTransactionId(): string {
  return `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
}

/**
 * Create a quantum-resistant blockchain hash
 */
export function createQuantumHash(data: any): string {
  // For real implementation, this would use quantum-resistant algorithms
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Make it look like a proper hash
  return `0x${hash.toString(16).padStart(64, '0')}`;
}

/**
 * Verifies a transaction on the blockchain
 */
export async function verifyBlockchainTransaction(txId: string): Promise<{
  verified: boolean;
  block: number;
  confirmations: number;
  timestamp: number;
}> {
  // Simulate blockchain verification
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, verification succeeds 90% of the time
  const verified = Math.random() > 0.1;
  
  return {
    verified,
    block: Math.floor(Math.random() * 1000000) + 15000000,
    confirmations: Math.floor(Math.random() * 100) + 5,
    timestamp: Date.now() - (Math.floor(Math.random() * 100000))
  };
}

/**
 * Create a quantum-secured blockchain transaction
 * This is a simulated function that would normally interact with a blockchain network
 */
export async function createBlockchainTransaction(
  from: string,
  to: string,
  data: any,
  useQuantumSecurity: boolean = true
): Promise<{
  txId: string;
  successful: boolean;
  blockNumber?: number;
  error?: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate 95% success rate
  const isSuccessful = Math.random() > 0.05;
  
  if (isSuccessful) {
    return {
      txId: generateTransactionId(),
      successful: true,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000
    };
  } else {
    return {
      txId: '',
      successful: false,
      error: 'Transaction failed due to network congestion'
    };
  }
}

/**
 * Get the historical record of blockchain transactions for genomic data
 */
export async function getGenomicBlockchainHistory(address: string) {
  // Simulate blockchain data fetch
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock transaction history
  const transactionCount = Math.floor(Math.random() * 20) + 5;
  const transactions = [];
  
  const types = ['storage', 'verification', 'access', 'update', 'token-reward'];
  
  const now = Date.now();
  
  for (let i = 0; i < transactionCount; i++) {
    const timestamp = now - (i * 86400000 * (Math.random() * 2 + 0.5)); // Random days back
    
    transactions.push({
      txId: generateTransactionId(),
      type: types[Math.floor(Math.random() * types.length)],
      timestamp,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      data: {
        sequenceId: `seq_${Math.random().toString(36).substring(2, 9)}`,
        operation: types[Math.floor(Math.random() * types.length)],
        dataSize: Math.floor(Math.random() * 100000) + 1000
      }
    });
  }
  
  // Sort by timestamp (newest first)
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}
