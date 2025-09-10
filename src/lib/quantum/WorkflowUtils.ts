import SHA256 from 'crypto-js/sha256';
import { QUANTUM_CONFIG } from '../../config/env';

/**
 * Generates a hash of the provided data
 * 
 * @param data Data to hash
 * @returns SHA-256 hash string
 */
export const generateHash = (data: any): string => {
  return SHA256(JSON.stringify(data)).toString();
};

/**
 * Processes a quantum transaction with post-quantum cryptography
 * 
 * @param sender The sender's wallet address
 * @param recipient The recipient's wallet address
 * @param amount The transaction amount
 * @param difficulty The mining difficulty (determines proof of work complexity)
 * @param options Additional transaction options
 * @returns Transaction data with hash and proof of work
 */
export const processQuantumTransaction = (
  sender: string,
  recipient: string,
  amount: number,
  difficulty: number = QUANTUM_CONFIG.MIN_DIFFICULTY,
  options?: { complexity?: number; note?: string }
) => {
  // Validate inputs
  if (!sender || !recipient) {
    throw new Error('Invalid sender or recipient address');
  }
  
  if (amount <= 0) {
    throw new Error('Transaction amount must be greater than 0');
  }
  
  // Cap difficulty between min and max values
  const safeDifficulty = Math.min(
    Math.max(difficulty, QUANTUM_CONFIG.MIN_DIFFICULTY),
    QUANTUM_CONFIG.MAX_DIFFICULTY
  );
  
  // Transaction timestamp
  const timestamp = Date.now();
  
  // Transaction data
  const transactionData = {
    sender,
    recipient,
    amount,
    timestamp,
    complexity: options?.complexity || 1.0,
    note: options?.note || '',
    qubits: QUANTUM_CONFIG.QUBITS
  };
  
  // Calculate transaction hash
  const hash = SHA256(JSON.stringify(transactionData)).toString();
  
  // Perform proof of work (find nonce with required difficulty)
  const { nonce, isValid } = performQuantumProofOfWork(hash, safeDifficulty);
  
  // Calculate transaction fee based on complexity and amount
  const fee = calculateTransactionFee(amount, safeDifficulty, options?.complexity || 1.0);
  
  return {
    ...transactionData,
    hash,
    nonce,
    isValid,
    fee,
    difficulty: safeDifficulty
  };
};

/**
 * Performs a quantum-resistant proof of work algorithm
 * 
 * @param hash The transaction hash to prove work on
 * @param difficulty The mining difficulty (higher is more difficult)
 * @returns The nonce that satisfies the difficulty and validity status
 */
const performQuantumProofOfWork = (hash: string, difficulty: number) => {
  // Target: hash must start with 'difficulty' number of zeros
  const target = Array(difficulty + 1).join('0');
  
  let nonce = 0;
  let valid = false;
  let attempt = '';
  
  // Find a nonce that produces a hash with the required difficulty
  while (!valid && nonce < 100000) { // Limit iterations for performance
    attempt = SHA256(hash + nonce).toString();
    valid = attempt.substring(0, difficulty) === target;
    if (!valid) nonce++;
  }
  
  return {
    nonce,
    isValid: valid,
    proof: attempt
  };
};

/**
 * Calculates transaction fee based on amount and difficulty
 * 
 * @param amount Transaction amount
 * @param difficulty Mining difficulty
 * @param complexity Additional complexity multiplier
 * @returns Calculated fee
 */
export const calculateTransactionFee = (
  amount: number,
  difficulty: number,
  complexity: number = 1.0
) => {
  // Base fee is 0.1% of the transaction amount
  const baseFee = amount * 0.001;
  
  // Difficulty adjustment (higher difficulty = higher fee)
  const difficultyMultiplier = 1 + ((difficulty - QUANTUM_CONFIG.MIN_DIFFICULTY) / 20);
  
  // Final fee with complexity adjustment
  const fee = baseFee * difficultyMultiplier * complexity;
  
  // Round to 4 decimal places
  return parseFloat(fee.toFixed(4));
};

/**
 * Estimates confirmation time in milliseconds based on network conditions
 * 
 * @param difficulty Current network difficulty
 * @param networkLoad Current network load (0.0 to 1.0)
 * @returns Estimated confirmation time in milliseconds
 */
export const estimateConfirmationTime = (
  difficulty: number,
  networkLoad: number = 0.5
) => {
  // Base time for standard difficulty (4)
  const baseTime = 5000; // 5 seconds
  
  // Difficulty scaling factor
  const difficultyFactor = Math.pow(2, difficulty - QUANTUM_CONFIG.MIN_DIFFICULTY);
  
  // Network load scaling (exponential increase as network approaches capacity)
  const loadFactor = networkLoad < 0.8 
    ? 1 + networkLoad
    : 1 + Math.pow(networkLoad, 3); // Exponential increase when network is congested
  
  // Final estimation
  return baseTime * difficultyFactor * loadFactor;
};

/**
 * Simulates quantum entanglement verification for transaction security
 * 
 * @param transactionHash The hash to verify
 * @returns Verification result with entropy score
 */
export const simulateQuantumVerification = (transactionHash: string) => {
  // Extract entropy source from hash
  const entropySource = transactionHash.slice(0, 16);
  
  // Convert to numerical seed
  const seed = Array.from(entropySource).reduce(
    (acc, char) => acc + char.charCodeAt(0), 0
  );
  
  // Simulate quantum randomness
  const random = new Array(QUANTUM_CONFIG.ENTANGLEMENT_DEPTH).fill(0)
    .map(() => Math.sin(seed * Math.random()) * Math.cos(seed * Math.random()))
    .map(val => Math.abs(val));
  
  // Calculate verification metrics
  const entropyScore = random.reduce((acc, val) => acc + val, 0) / random.length;
  const securityLevel = Math.min(1.0, entropyScore * 1.2);
  
  return {
    verified: securityLevel > 0.6,
    securityLevel: parseFloat(securityLevel.toFixed(4)),
    entropyScore: parseFloat(entropyScore.toFixed(4)),
    quantumSignature: transactionHash.slice(0, 32)
  };
};

export default {
  processQuantumTransaction,
  calculateTransactionFee,
  estimateConfirmationTime,
  simulateQuantumVerification,
  generateHash
};
