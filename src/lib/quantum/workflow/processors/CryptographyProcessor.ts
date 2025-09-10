import { QuantumTask } from '../types';
import { 
  simulateQuantumComputation, 
  generateQuantumResistantHash
} from '../utils';

/**
 * Process cryptography tasks with quantum resistance
 * Enhanced with advanced quantum algorithmic techniques and security metrics
 */
export async function processCryptographyTask(task: QuantumTask): Promise<any> {
  console.log('Processing cryptography task:', task);
  
  // Record start time for performance metrics
  const startTime = Date.now();
  
  // Simulate quantum processing time with variable delays based on task complexity
  const complexityFactor = task.data.complexity || 1;
  const baseDuration = task.data.priority === 'high' ? 800 : 2000;
  const adjustedDuration = baseDuration * complexityFactor;
  
  await simulateQuantumComputation(adjustedDuration);
  
  // Process based on operation type
  let result;
  try {
    switch (task.data.operation) {
      case 'generate-hash':
        result = generateQuantumHash(task.data);
        break;
        
      case 'verify-signature':
        result = verifyQuantumSignature(task.data);
        break;
      
      case 'encrypt-data':
        result = encryptWithQuantumResistance(task.data);
        break;
        
      case 'evaluate-algorithm':
        result = evaluateAlgorithm(task.data);
        break;
        
      case 'hybrid-encryption':
        result = performHybridEncryption(task.data);
        break;
        
      case 'lattice-based-signing':
        result = performLatticeBasedSigning(task.data);
        break;
        
      case 'post-quantum-tls':
        result = simulatePostQuantumTLS(task.data);
        break;
        
      case 'quantum-random':
        result = generateQuantumRandomness(task.data);
        break;
        
      default:
        throw new Error(`Unknown cryptography operation: ${task.data.operation}`);
    }
    
    // Add performance metrics and metadata to the result
    const processingTime = Date.now() - startTime;
    
    return {
      ...result,
      _metadata: {
        taskId: task.id,
        processingTime,
        timestamp: new Date().toISOString(),
        priority: task.data.priority,
        complexity: complexityFactor
      }
    };
  } catch (error) {
    console.error(`Error in cryptography processing: ${error.message}`);
    throw new Error(`Cryptography operation failed: ${error.message}`);
  }
}

/**
 * Generate quantum-resistant hash for data
 * Enhanced with additional security metrics and entropy analysis
 */
function generateQuantumHash(data: any) {
  const input = data.input || '';
  const algorithm = data.algorithm || 'quantum-resistant-hash';
  
  // Generate hash using quantum-resistant algorithm
  const hash = generateQuantumResistantHash(input);
  
  // Generate advanced entropy metrics
  const entropyLevel = calculateEntropyLevel(hash);
  const quantumSecurityEstimate = estimateQuantumSecurity(algorithm, entropyLevel);
  
  return {
    operation: 'hash',
    input: typeof input === 'string' ? input.substring(0, 20) + '...' : '[complex data]',
    algorithm,
    hash,
    metadata: {
      entropy: entropyLevel,
      collisionResistance: quantumSecurityEstimate.collisionResistance,
      quantumSecurity: quantumSecurityEstimate.securityLevel,
      bitStrength: quantumSecurityEstimate.bitStrength,
      estimatedQuantumResistanceYears: quantumSecurityEstimate.estimatedYears
    }
  };
}

/**
 * Verify a quantum-resistant signature
 * Enhanced with security confidence metrics and attack vector analysis
 */
function verifyQuantumSignature(data: any) {
  const signatureValid = data.forceInvalid ? false : Math.random() > 0.1;
  const algorithm = data.algorithm || 'dilithium';
  
  // Simulate verification delay based on signature complexity
  const verificationTime = Math.random() * 500 + 300;
  
  // Generate advanced security analysis
  const securityAnalysis = analyzeSignatureSecurity(algorithm, data.keySize || 3072);
  
  return {
    operation: 'verify',
    documentId: data.documentId || 'doc-' + Math.random().toString(16).slice(2, 10),
    signatureAlgorithm: algorithm,
    isValid: signatureValid,
    verificationTime,
    details: signatureValid
      ? { 
          status: 'valid', 
          confidence: 0.9 + Math.random() * 0.1,
          securityLevel: securityAnalysis.securityLevel,
          postQuantumSafe: securityAnalysis.isPostQuantumSafe,
          entropyBits: securityAnalysis.entropyBits
        }
      : { 
          status: 'invalid', 
          reason: determineInvalidReason(), 
          confidence: 0.95 + Math.random() * 0.05,
          attackVector: determineAttackVector(algorithm)
        }
  };
}

/**
 * Analyze signature security for an algorithm
 */
function analyzeSignatureSecurity(algorithm: string, keySize: number) {
  // Determine if post-quantum safe
  const postQuantumAlgorithms = ['dilithium', 'falcon', 'sphincs+', 'picnic', 'rainbow'];
  const isPostQuantumSafe = postQuantumAlgorithms.some(pq => 
    algorithm.toLowerCase().includes(pq));
  
  // Calculate security level
  let securityLevel = 'medium';
  if (isPostQuantumSafe && keySize >= 3072) securityLevel = 'high';
  else if (isPostQuantumSafe && keySize >= 2048) securityLevel = 'medium-high';
  else if (!isPostQuantumSafe && keySize >= 4096) securityLevel = 'medium';
  else if (!isPostQuantumSafe && keySize < 2048) securityLevel = 'low';
  
  return {
    securityLevel,
    isPostQuantumSafe,
    entropyBits: Math.min(256, isPostQuantumSafe ? keySize / 4 : keySize / 16)
  };
}

/**
 * Encrypt data with quantum-resistant algorithms
 * Enhanced with detailed encryption metrics and performance analysis
 */
function encryptWithQuantumResistance(data: any) {
  const inputSize = data.inputSize || 1024; // bytes
  const algorithm = data.algorithm || 'kyber';
  const securityLevel = data.securityLevel || 'medium';
  
  // Calculate security parameters based on security level
  const keySize = getKeySize(algorithm, securityLevel);
  const rounds = getRounds(algorithm, securityLevel);
  
  // Calculate simulated encryption metrics
  const encryptionTime = calculateEncryptionTime(algorithm, inputSize, keySize, rounds);
  const outputSize = calculateOutputSize(algorithm, inputSize, keySize);
  
  // Calculate algorithm-specific metrics
  const algorithmMetrics = calculateAlgorithmMetrics(algorithm, keySize, rounds);
  
  // Simulate ciphertext (just for demonstration)
  const ciphertextPreview = Array(8).fill(0)
    .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
    .join('');
  
  return {
    operation: 'encrypt',
    algorithm,
    securityLevel,
    inputSize,
    outputSize,
    keySize,
    rounds,
    encryptionTime,
    ciphertextPreview: ciphertextPreview + '...',
    metrics: {
      securityLevel: algorithmMetrics.securityLevel,
      performanceOverhead: algorithmMetrics.performanceOverhead,
      quantumResistance: algorithmMetrics.quantumResistance,
      memoryUsage: Math.round(outputSize * 1.2),
      energyEfficiency: algorithmMetrics.energyEfficiency
    }
  };
}

/**
 * Evaluate cryptographic algorithm's quantum resistance
 * Enhanced with comprehensive security analysis
 */
function evaluateAlgorithm(data: any) {
  const algorithm = data.algorithm || 'dilithium';
  const keySize = data.keySize || 2048;
  
  // Evaluate quantum resistance
  const evaluation = evaluateQuantumResistance(algorithm);
  
  // Add additional security metrics for the enhanced evaluation
  const quantumBitStrength = algorithm.toLowerCase().includes('dilithium') ? keySize / 4 :
                            algorithm.toLowerCase().includes('kyber') ? keySize / 3.5 :
                            algorithm.toLowerCase().includes('falcon') ? keySize / 4 :
                            algorithm.toLowerCase().includes('sphincs') ? keySize / 2 :
                            keySize / 8;
  
  const classicalBitStrength = algorithm.toLowerCase().includes('aes') ? keySize :
                              algorithm.toLowerCase().includes('chacha') ? keySize :
                              algorithm.toLowerCase().includes('rsa') ? keySize / 3 :
                              algorithm.toLowerCase().includes('ecdsa') ? keySize / 2 :
                              keySize / 1.5;
  
  // Enhanced evaluation with detailed metrics
  const enhancedEvaluation = {
    ...evaluation,
    quantumBitStrength,
    classicalBitStrength,
    detailedAnalysis: {
      quantumAttackComplexity: Math.pow(2, quantumBitStrength),
      classicalAttackComplexity: Math.pow(2, classicalBitStrength),
      timeToBreakClassical: estimateTimeToBreak(classicalBitStrength, 'classical'),
      timeToBreakQuantum: estimateTimeToBreak(quantumBitStrength, 'quantum'),
      algorithmClass: getAlgorithmClass(algorithm),
      vulnerabilities: findKnownVulnerabilities(algorithm),
      nistCategory: getNistCategory(algorithm)
    }
  };
  
  return {
    algorithm,
    keySize,
    evaluation: enhancedEvaluation,
    recommendations: [
      evaluation.isQuantumResistant
        ? `${algorithm} is quantum resistant at ${keySize} bits`
        : `${algorithm} is vulnerable to quantum attacks at ${keySize} bits`,
      evaluation.recommendedKeySize > keySize
        ? `Increase key size to at least ${evaluation.recommendedKeySize} bits`
        : `Current key size is adequate`,
      `Estimated qubits to break: ${evaluation.estimatedQubitsCrack.toLocaleString()}`,
      ...enhancedEvaluation.detailedAnalysis.vulnerabilities.map(v => `Vulnerability: ${v.description} (Severity: ${v.severity})`)
    ]
  };
}

/**
 * Perform hybrid encryption (classical + quantum-resistant)
 * NEW FUNCTION: Creates a hybrid encryption scheme using both
 * classical and quantum-resistant algorithms for transition security
 */
function performHybridEncryption(data: any) {
  const inputSize = data.inputSize || 2048; // bytes
  const classicalAlgorithm = data.classicalAlgorithm || 'AES-256';
  const quantumAlgorithm = data.quantumAlgorithm || 'kyber-1024';
  
  // Simulate hybrid encryption process
  const classicalKeySize = getKeySize(classicalAlgorithm, 'high');
  const quantumKeySize = getKeySize(quantumAlgorithm, 'high');
  
  // Calculate simulated encryption metrics
  const classicalTime = calculateEncryptionTime(classicalAlgorithm, inputSize, classicalKeySize, 14);
  const quantumTime = calculateEncryptionTime(quantumAlgorithm, inputSize, quantumKeySize, 3);
  const totalTime = classicalTime + quantumTime + 50; // 50ms for coordination
  
  // Calculate output size with hybrid approach
  const classicalOutput = calculateOutputSize(classicalAlgorithm, inputSize, classicalKeySize);
  const quantumOutput = calculateOutputSize(quantumAlgorithm, classicalOutput, quantumKeySize);
  
  // Security analysis
  const hybridSecurityAnalysis = analyzeHybridSecurity(classicalAlgorithm, quantumAlgorithm);
  
  return {
    operation: 'hybrid-encryption',
    classicalAlgorithm,
    quantumAlgorithm,
    inputSize,
    totalOutputSize: quantumOutput,
    encapsulationSize: quantumKeySize + classicalKeySize,
    totalEncryptionTime: totalTime,
    securityAnalysis: hybridSecurityAnalysis,
    metrics: {
      classicalSecurityBits: hybridSecurityAnalysis.classicalSecurityBits,
      quantumSecurityBits: hybridSecurityAnalysis.quantumSecurityBits,
      effectiveSecurityLevel: hybridSecurityAnalysis.effectiveSecurityLevel,
      overheadPercentage: (quantumOutput / inputSize - 1) * 100
    }
  };
}

/**
 * Perform lattice-based digital signature
 * NEW FUNCTION: Implements lattice-based signature schemes
 */
function performLatticeBasedSigning(data: any) {
  const algorithm = data.algorithm || 'CRYSTALS-Dilithium';
  const documentSize = data.documentSize || 10240; // bytes
  const securityLevel = data.securityLevel || 'high';
  
  // Calculate parameters based on security level
  const parameterSet = getLatticeParameters(algorithm, securityLevel);
  
  // Simulate signing
  const signingTime = Math.random() * 100 + 150 + (documentSize / 1024);
  const signatureSize = calculateLatticeSignatureSize(algorithm, parameterSet);
  
  // Generate simulated signature preview
  const signaturePreview = Array(16).fill(0)
    .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
    .join('');
  
  // Security analysis
  const securityAnalysis = analyzeLatticeSecurityParameters(algorithm, parameterSet);
  
  return {
    operation: 'lattice-signing',
    algorithm,
    documentSize,
    signatureSize,
    parameterSet,
    signaturePreview: signaturePreview + '...',
    signingTime,
    verificationTime: signingTime * 0.3,
    security: {
      nistLevel: securityAnalysis.nistLevel,
      classicalBits: securityAnalysis.classicalBits,
      quantumBits: securityAnalysis.quantumBits,
      estimatedSecureUntil: securityAnalysis.secureUntilYear
    }
  };
}

/**
 * Simulate Post-Quantum TLS handshake
 * NEW FUNCTION: Simulates quantum-resistant TLS handshake protocols
 */
function simulatePostQuantumTLS(data: any) {
  const tlsVersion = data.tlsVersion || '1.3-PQ';
  const keyExchangeMethod = data.keyExchange || 'Kyber+X25519';
  const authenticationType = data.authentication || 'Dilithium+ECDSA';
  
  // Simulate handshake timing
  const clientHelloTime = 25 + Math.random() * 10;
  const serverHelloTime = 30 + Math.random() * 15;
  const keyExchangeTime = 150 + Math.random() * 50;
  const finishTime = 40 + Math.random() * 20;
  
  const totalHandshakeTime = clientHelloTime + serverHelloTime + keyExchangeTime + finishTime;
  
  // Analyze security and performance
  const securityLevel = analyzeTLSSecurity(keyExchangeMethod, authenticationType);
  const handshakeSize = calculateTLSHandshakeSize(keyExchangeMethod, authenticationType);
  
  return {
    operation: 'post-quantum-tls',
    tlsVersion,
    keyExchange: keyExchangeMethod,
    authentication: authenticationType,
    handshakeTime: Math.round(totalHandshakeTime),
    handshakeSize,
    rounds: 2,
    securityAnalysis: {
      forwardSecrecy: true,
      quantumResistant: securityLevel.quantumResistant,
      securityStrength: securityLevel.securityStrength,
      knownVulnerabilities: 0,
      hybridMode: keyExchangeMethod.includes('+') || authenticationType.includes('+')
    },
    timings: {
      clientHello: clientHelloTime,
      serverHello: serverHelloTime,
      keyExchange: keyExchangeTime,
      finish: finishTime
    }
  };
}

/**
 * Generate quantum-based randomness
 * NEW FUNCTION: Simulates generation of true quantum randomness 
 */
function generateQuantumRandomness(data: any) {
  const bytesRequested = data.bytes || 128;
  const entropySource = data.source || 'qrng';
  
  // Calculate extraction time based on quantum source
  const extractionTime = Math.log2(bytesRequested) * 15 + Math.random() * 40;
  
  // Generate simulated random bytes
  const randomBytes = Array(Math.min(32, bytesRequested))
    .fill(0)
    .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
    .join('');
  
  // Statistical quality assessment
  const statisticalTests = runStatisticalTests(entropySource);
  
  return {
    operation: 'quantum-random',
    bytesRequested,
    entropySource,
    extractionTime,
    randomSample: randomBytes + (bytesRequested > 32 ? '...' : ''),
    entropyBits: bytesRequested * 8 * statisticalTests.qualityFactor,
    statisticalAnalysis: statisticalTests,
    certifiable: entropySource === 'qrng',
    applicationSuggestions: suggestRandomnessApplications(bytesRequested, statisticalTests.qualityFactor)
  };
}

// --- Helper functions for enhanced cryptography processor ---

/**
 * Calculate entropy level from a hash
 */
function calculateEntropyLevel(hash: string): number {
  // Simple entropy calculation (in a real system, would be more sophisticated)
  const uniqueChars = new Set(hash.split('')).size;
  const charsetSize = 16; // Hexadecimal hash
  
  return 0.7 + (uniqueChars / charsetSize) * 0.3;
}

/**
 * Estimate quantum security based on algorithm and entropy
 */
function estimateQuantumSecurity(algorithm: string, entropyLevel: number) {
  // Base security levels
  const securityMap: Record<string, any> = {
    'quantum-resistant-hash': {
      collisionResistance: 'high',
      securityLevel: 'post-quantum',
      bitStrength: 256,
      estimatedYears: 30
    },
    'sha3': {
      collisionResistance: 'high',
      securityLevel: 'transitional',
      bitStrength: 192,
      estimatedYears: 10
    },
    'blake2': {
      collisionResistance: 'high',
      securityLevel: 'transitional',
      bitStrength: 224,
      estimatedYears: 15
    },
    'sha256': {
      collisionResistance: 'medium',
      securityLevel: 'classical',
      bitStrength: 128, // Effective against quantum
      estimatedYears: 5
    }
  };
  
  // Get base values or defaults
  const base = securityMap[algorithm] || securityMap['quantum-resistant-hash'];
  
  // Adjust based on entropy
  const entropyFactor = entropyLevel / 0.85; // Normalize around expected value
  const adjustedYears = Math.round(base.estimatedYears * entropyFactor);
  const adjustedBits = Math.round(base.bitStrength * entropyFactor);
  
  return {
    ...base,
    bitStrength: adjustedBits,
    estimatedYears: adjustedYears
  };
}

/**
 * Determine reason for invalid signature
 */
function determineInvalidReason(): string {
  const reasons = [
    'Signature mismatch',
    'Invalid key format',
    'Corrupted signature data',
    'Incorrect public key',
    'Message tampering detected',
    'Signature expired'
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}

/**
 * Determine potential attack vector for a compromised signature
 */
function determineAttackVector(algorithm: string): string {
  const classicalAttacks = [
    'Birthday attack',
    'Collision attack',
    'Preimage attack',
    'Side-channel analysis',
    'Fault injection',
    'Timing attack'
  ];
  
  const quantumAttacks = [
    'Shor\'s algorithm',
    'Grover\'s algorithm',
    'Quantum state estimation',
    'Quantum amplitude amplification'
  ];
  
  const postQuantumAlgorithms = ['dilithium', 'falcon', 'rainbow', 'sphincs+', 'picnic'];
  const isPostQuantum = postQuantumAlgorithms.some(pq => algorithm.toLowerCase().includes(pq));
  
  if (isPostQuantum) {
    return classicalAttacks[Math.floor(Math.random() * classicalAttacks.length)];
  } else {
    return Math.random() > 0.5 
      ? quantumAttacks[Math.floor(Math.random() * quantumAttacks.length)]
      : classicalAttacks[Math.floor(Math.random() * classicalAttacks.length)];
  }
}

/**
 * Get key size based on algorithm and security level
 */
function getKeySize(algorithm: string, securityLevel: string): number {
  // Key size mapping for different algorithms and security levels
  const keySizes: Record<string, Record<string, number>> = {
    'kyber': { 'low': 512, 'medium': 768, 'high': 1024 },
    'ntru': { 'low': 509, 'medium': 677, 'high': 1087 },
    'saber': { 'low': 2048, 'medium': 3072, 'high': 4096 },
    'classic-mceliece': { 'low': 3584, 'medium': 4608, 'high': 6688 },
    'frodo': { 'low': 640, 'medium': 976, 'high': 1344 },
    'AES': { 'low': 128, 'medium': 192, 'high': 256 },
    'AES-256': { 'low': 256, 'medium': 256, 'high': 256 },
    'dilithium': { 'low': 1024, 'medium': 1280, 'high': 1792 }
  };
  
  // Find best match for algorithm
  let bestMatch = 'kyber'; // Default
  for (const key in keySizes) {
    if (algorithm.toLowerCase().includes(key.toLowerCase())) {
      bestMatch = key;
      break;
    }
  }
  
  return keySizes[bestMatch]?.[securityLevel] || 1024; // Default to 1024 if not found
}

/**
 * Get number of rounds for an algorithm and security level
 */
function getRounds(algorithm: string, securityLevel: string): number {
  // Rounds mapping for different algorithms and security levels
  const roundsMap: Record<string, Record<string, number>> = {
    'kyber': { 'low': 10, 'medium': 12, 'high': 14 },
    'ntru': { 'low': 1, 'medium': 1, 'high': 1 },
    'AES': { 'low': 10, 'medium': 12, 'high': 14 },
    'dilithium': { 'low': 3, 'medium': 4, 'high': 5 }
  };
  
  // Find best match for algorithm
  let bestMatch = 'kyber'; // Default
  for (const key in roundsMap) {
    if (algorithm.toLowerCase().includes(key.toLowerCase())) {
      bestMatch = key;
      break;
    }
  }
  
  return roundsMap[bestMatch]?.[securityLevel] || 10; // Default to 10 if not found
}

/**
 * Calculate encryption time based on algorithm parameters
 */
function calculateEncryptionTime(
  algorithm: string, 
  inputSize: number, 
  keySize: number, 
  rounds: number
): number {
  // Base factor based on algorithm type
  const algorithmFactor = 
    algorithm.toLowerCase().includes('aes') ? 0.5 :
    algorithm.toLowerCase().includes('kyber') ? 1.2 :
    algorithm.toLowerCase().includes('ntru') ? 1.8 :
    algorithm.toLowerCase().includes('saber') ? 1.5 :
    algorithm.toLowerCase().includes('mceliece') ? 2.5 :
    1.0;
  
  // Calculate time based on parameters
  const baseTime = 10 + (inputSize / 1024) * 5;
  const keyFactor = Math.log2(keySize) / 10;
  const roundFactor = rounds * 0.5;
  
  return Math.floor(baseTime * algorithmFactor * keyFactor * roundFactor);
}

/**
 * Calculate output size based on algorithm parameters
 */
function calculateOutputSize(
  algorithm: string, 
  inputSize: number, 
  keySize: number
): number {
  // Calculate expansion factor based on algorithm
  const expansionFactor = 
    algorithm.toLowerCase().includes('aes') ? 1.0 :
    algorithm.toLowerCase().includes('kyber') ? 1.3 :
    algorithm.toLowerCase().includes('ntru') ? 1.5 :
    algorithm.toLowerCase().includes('mceliece') ? 2.0 :
    1.2;
  
  // Add overhead for key size and algorithm-specific metadata
  const overhead = Math.ceil(keySize / 8) + 16;
  
  return Math.floor(inputSize * expansionFactor) + overhead;
}

/**
 * Calculate algorithm-specific metrics
 */
function calculateAlgorithmMetrics(
  algorithm: string, 
  keySize: number, 
  rounds: number
): Record<string, any> {
  // Base metrics by algorithm family
  const familyMetrics: Record<string, any> = {
    'lattice': {
      securityLevel: 'AES-256 equivalent',
      performanceOverhead: 15,
      quantumResistance: 'high',
      energyEfficiency: 0.7
    },
    'code': {
      securityLevel: 'AES-192 equivalent',
      performanceOverhead: 30,
      quantumResistance: 'high',
      energyEfficiency: 0.5
    },
    'multivariate': {
      securityLevel: 'AES-192 equivalent',
      performanceOverhead: 40,
      quantumResistance: 'medium',
      energyEfficiency: 0.4
    },
    'hash': {
      securityLevel: 'AES-256 equivalent',
      performanceOverhead: 10,
      quantumResistance: 'high',
      energyEfficiency: 0.8
    },
    'symmetric': {
      securityLevel: 'classical only',
      performanceOverhead: 5,
      quantumResistance: 'none',
      energyEfficiency: 0.9
    }
  };
  
  // Determine algorithm family
  let family = 'lattice'; // Default
  if (algorithm.toLowerCase().includes('kyber') || 
      algorithm.toLowerCase().includes('ntru') || 
      algorithm.toLowerCase().includes('dilithium') || 
      algorithm.toLowerCase().includes('falcon')) {
    family = 'lattice';
  } else if (algorithm.toLowerCase().includes('mceliece') || 
             algorithm.toLowerCase().includes('goppa')) {
    family = 'code';
  } else if (algorithm.toLowerCase().includes('rainbow') || 
             algorithm.toLowerCase().includes('oil')) {
    family = 'multivariate';
  } else if (algorithm.toLowerCase().includes('sphincs') || 
             algorithm.toLowerCase().includes('hash')) {
    family = 'hash';
  } else if (algorithm.toLowerCase().includes('aes')) {
    family = 'symmetric';
  }
  
  // Get base metrics for the family
  const metrics = { ...familyMetrics[family] };
  
  // Adjust metrics based on key size and rounds
  metrics.performanceOverhead = metrics.performanceOverhead * (keySize / 1024) * (rounds / 10);
  
  return metrics;
}

/**
 * Estimate time to break a cryptosystem
 */
function estimateTimeToBreak(bitStrength: number, attackerType: 'classical' | 'quantum'): string {
  if (attackerType === 'quantum') {
    // Quantum attacks effectively halve bit security for symmetric algorithms
    // and can break many asymmetric algorithms
    bitStrength = Math.floor(bitStrength / 2);
  }
  
  if (bitStrength < 64) return 'Hours to days';
  if (bitStrength < 80) return 'Weeks to months';
  if (bitStrength < 112) return 'Years';
  if (bitStrength < 128) return 'Decades';
  if (bitStrength < 192) return 'Centuries';
  if (bitStrength < 256) return 'Millennia';
  
  return 'Beyond foreseeable future';
}

/**
 * Get the class of cryptographic algorithm
 */
function getAlgorithmClass(algorithm: string): string {
  const lowerAlgo = algorithm.toLowerCase();
  
  if (lowerAlgo.includes('kyber') || 
      lowerAlgo.includes('ntru') || 
      lowerAlgo.includes('saber') ||
      lowerAlgo.includes('dilithium') ||
      lowerAlgo.includes('falcon')) {
    return 'Lattice-based';
  }
  
  if (lowerAlgo.includes('mceliece') || lowerAlgo.includes('goppa')) {
    return 'Code-based';
  }
  
  if (lowerAlgo.includes('rainbow') || lowerAlgo.includes('oil')) {
    return 'Multivariate';
  }
  
  if (lowerAlgo.includes('sphincs') || lowerAlgo.includes('hash')) {
    return 'Hash-based';
  }
  
  if (lowerAlgo.includes('dsa') || 
      lowerAlgo.includes('rsa') || 
      lowerAlgo.includes('ecdsa')) {
    return 'Traditional public-key';
  }
  
  if (lowerAlgo.includes('aes') || lowerAlgo.includes('chacha')) {
    return 'Symmetric';
  }
  
  return 'Unknown';
}

/**
 * Find known vulnerabilities for an algorithm
 */
function findKnownVulnerabilities(algorithm: string): Array<{description: string, severity: string}> {
  const lowerAlgo = algorithm.toLowerCase();
  const vulnerabilities = [];
  
  // Example vulnerabilities (in a real system, would come from a database)
  if (lowerAlgo.includes('rsa')) {
    vulnerabilities.push({
      description: 'Vulnerable to Shor\'s algorithm on quantum computers',
      severity: 'Critical'
    });
  }
  
  if (lowerAlgo.includes('dsa') || lowerAlgo.includes('ecdsa')) {
    vulnerabilities.push({
      description: 'Vulnerable to quantum attacks using Shor\'s algorithm',
      severity: 'Critical'
    });
    
    if (lowerAlgo.includes('ecdsa')) {
      vulnerabilities.push({
        description: 'Requires high-quality randomness for k-value',
        severity: 'Medium'
      });
    }
  }
  
  if (lowerAlgo.includes('rainbow')) {
    vulnerabilities.push({
      description: 'Recent cryptanalytic attacks have weakened security margins',
      severity: 'High'
    });
  }
  
  // Post-quantum algorithms generally have fewer known vulnerabilities
  // but may have implementation concerns
  if (lowerAlgo.includes('kyber') || lowerAlgo.includes('dilithium')) {
    vulnerabilities.push({
      description: 'Side-channel attacks possible with naive implementations',
      severity: 'Medium'
    });
  }
  
  // If no specific vulnerabilities, return generic note for newer algorithms
  if (vulnerabilities.length === 0 && 
      (lowerAlgo.includes('kyber') || 
       lowerAlgo.includes('ntru') || 
       lowerAlgo.includes('dilithium'))) {
    vulnerabilities.push({
      description: 'Still undergoing cryptanalysis; security margins may change',
      severity: 'Low'
    });
  }
  
  return vulnerabilities;
}

/**
 * Get NIST security category for algorithm
 */
function getNistCategory(algorithm: string): string {
  const lowerAlgo = algorithm.toLowerCase();
  
  // NIST PQC standardization categories
  if (lowerAlgo.includes('kyber')) return 'NIST PQC Round 3 Winner - KEM';
  if (lowerAlgo.includes('dilithium')) return 'NIST PQC Round 3 Winner - Signature';
  if (lowerAlgo.includes('falcon')) return 'NIST PQC Round 3 Winner - Signature';
  if (lowerAlgo.includes('sphincs+')) return 'NIST PQC Round 3 Winner - Signature (Alternate)';
  
  if (lowerAlgo.includes('ntru')) return 'NIST PQC Round 3 Finalist';
  if (lowerAlgo.includes('saber')) return 'NIST PQC Round 3 Finalist';
  if (lowerAlgo.includes('classic-mceliece')) return 'NIST PQC Round 3 Finalist';
  
  if (lowerAlgo.includes('bike')) return 'NIST PQC Round 4 Candidate';
  if (lowerAlgo.includes('hqc')) return 'NIST PQC Round 4 Candidate';
  
  // Traditional algorithms
  if (lowerAlgo.includes('aes')) return 'NIST FIPS 197';
  if (lowerAlgo.includes('sha3')) return 'NIST FIPS 202';
  if (lowerAlgo.includes('sha2') || lowerAlgo.includes('sha-2')) return 'NIST FIPS 180-4';
  if (lowerAlgo.includes('rsa')) return 'NIST FIPS 186-4';
  if (lowerAlgo.includes('dsa')) return 'NIST FIPS 186-4';
  if (lowerAlgo.includes('ecdsa')) return 'NIST FIPS 186-4';
  
  return 'Not categorized by NIST';
}

/**
 * Analyze security of hybrid cryptographic approach
 */
function analyzeHybridSecurity(classicalAlgorithm: string, quantumAlgorithm: string) {
  // Determine security levels
  const classicalSecurityMap: Record<string, number> = {
    'AES-128': 128,
    'AES-192': 192,
    'AES-256': 256,
    'ChaCha20': 256,
    'RSA-2048': 112,
    'RSA-4096': 150,
    'ECDSA-P256': 128,
    'ECDSA-P384': 192
  };
  
  const quantumSecurityMap: Record<string, number> = {
    'kyber-512': 128,
    'kyber-768': 192,
    'kyber-1024': 256,
    'ntru-hps-2048': 128,
    'ntru-hps-4096': 192,
    'dilithium-2': 128,
    'dilithium-3': 192,
    'dilithium-5': 256,
    'falcon-512': 128,
    'falcon-1024': 256
  };
  
  // Find matching security level or default
  let classicalSecurityBits = 128;
  let quantumSecurityBits = 128;
  
  for (const [algo, bits] of Object.entries(classicalSecurityMap)) {
    if (classicalAlgorithm.toLowerCase().includes(algo.toLowerCase())) {
      classicalSecurityBits = bits;
      break;
    }
  }
  
  for (const [algo, bits] of Object.entries(quantumSecurityMap)) {
    if (quantumAlgorithm.toLowerCase().includes(algo.toLowerCase())) {
      quantumSecurityBits = bits;
      break;
    }
  }
  
  // Analyze quantum vulnerability of classical algorithm
  const classicalVulnerable = 
    classicalAlgorithm.toLowerCase().includes('rsa') || 
    classicalAlgorithm.toLowerCase().includes('dsa') || 
    classicalAlgorithm.toLowerCase().includes('ecdsa');
  
  // Determine effective security (minimum with consideration for quantum vulnerability)
  const classicalEffectiveBits = classicalVulnerable ? Math.floor(classicalSecurityBits / 2) : classicalSecurityBits;
  const effectiveSecurityBits = Math.min(classicalEffectiveBits, quantumSecurityBits);
  
  // Map bits to security level
  let effectiveSecurityLevel = 'unknown';
  if (effectiveSecurityBits >= 256) effectiveSecurityLevel = 'very high';
  else if (effectiveSecurityBits >= 192) effectiveSecurityLevel = 'high';
  else if (effectiveSecurityBits >= 128) effectiveSecurityLevel = 'medium';
  else effectiveSecurityLevel = 'low';
  
  return {
    classicalSecurityBits,
    quantumSecurityBits,
    effectiveSecurityBits,
    effectiveSecurityLevel,
    quantumResistant: effectiveSecurityBits >= 128,
    hybridAdvantage: !classicalVulnerable || quantumSecurityBits >= classicalSecurityBits
  };
}

/**
 * Get lattice-based parameter set based on security level
 */
function getLatticeParameters(algorithm: string, securityLevel: string) {
  const parameterSets: Record<string, Record<string, string>> = {
    'CRYSTALS-Dilithium': {
      'low': 'Dilithium2',
      'medium': 'Dilithium3',
      'high': 'Dilithium5'
    },
    'CRYSTALS-Kyber': {
      'low': 'Kyber512',
      'medium': 'Kyber768',
      'high': 'Kyber1024'
    },
    'Falcon': {
      'low': 'Falcon-512',
      'medium': 'Falcon-1024',
      'high': 'Falcon-1024'
    }
  };
  
  // Find best match for algorithm
  let bestMatch = 'CRYSTALS-Dilithium'; // Default
  for (const key in parameterSets) {
    if (algorithm.includes(key)) {
      bestMatch = key;
      break;
    }
  }
  
  return parameterSets[bestMatch][securityLevel] || parameterSets[bestMatch]['medium'];
}

/**
 * Calculate size of lattice-based signature
 */
function calculateLatticeSignatureSize(algorithm: string, parameterSet: string): number {
  // Approximate signature sizes in bytes
  const signatureSizes: Record<string, number> = {
    'Dilithium2': 2420,
    'Dilithium3': 3293,
    'Dilithium5': 4595,
    'Falcon-512': 666,
    'Falcon-1024': 1280
  };
  
  return signatureSizes[parameterSet] || 3000;
}

/**
 * Analyze security of lattice parameters
 */
function analyzeLatticeSecurityParameters(algorithm: string, parameterSet: string) {
  // NIST security levels and estimated bits of security
  const securityAnalysis: Record<string, Record<string, any>> = {
    'Dilithium2': {
      nistLevel: 2,
      classicalBits: 128,
      quantumBits: 128,
      secureUntilYear: 2040
    },
    'Dilithium3': {
      nistLevel: 3,
      classicalBits: 192,
      quantumBits: 192,
      secureUntilYear: 2050
    },
    'Dilithium5': {
      nistLevel: 5,
      classicalBits: 256,
      quantumBits: 256,
      secureUntilYear: 2065
    },
    'Kyber512': {
      nistLevel: 1,
      classicalBits: 128,
      quantumBits: 118,
      secureUntilYear: 2035
    },
    'Kyber768': {
      nistLevel: 3,
      classicalBits: 192,
      quantumBits: 174,
      secureUntilYear: 2045
    },
    'Kyber1024': {
      nistLevel: 5,
      classicalBits: 256,
      quantumBits: 230,
      secureUntilYear: 2060
    },
    'Falcon-512': {
      nistLevel: 1,
      classicalBits: 128,
      quantumBits: 115,
      secureUntilYear: 2035
    },
    'Falcon-1024': {
      nistLevel: 5,
      classicalBits: 256,
      quantumBits: 230,
      secureUntilYear: 2060
    }
  };
  
  return securityAnalysis[parameterSet] || securityAnalysis['Dilithium3'];
}

/**
 * Analyze security of post-quantum TLS configuration
 */
function analyzeTLSSecurity(keyExchange: string, authentication: string) {
  // Basic security assessment
  let quantumResistant = 
    keyExchange.toLowerCase().includes('kyber') || 
    keyExchange.toLowerCase().includes('ntru');
  
  let authenticationQuantumResistant =
    authentication.toLowerCase().includes('dilithium') ||
    authentication.toLowerCase().includes('falcon') ||
    authentication.toLowerCase().includes('sphincs');
  
  // If either part uses hybrid, it adds some protection
  if (keyExchange.includes('+') || authentication.includes('+')) {
    quantumResistant = quantumResistant || keyExchange.includes('+');
    authenticationQuantumResistant = authenticationQuantumResistant || authentication.includes('+');
  }
  
  // Overall security strength
  const securityStrength = 
    (quantumResistant ? 2 : 0) + 
    (authenticationQuantumResistant ? 2 : 0) + 
    (quantumResistant && authenticationQuantumResistant ? 1 : 0);
  
  // Return normalized rating
  return {
    quantumResistant: quantumResistant && authenticationQuantumResistant,
    keyExchangeSecure: quantumResistant,
    authenticationSecure: authenticationQuantumResistant,
    securityStrength: Math.min(5, securityStrength)
  };
}

/**
 * Calculate size of TLS handshake with post-quantum algorithms
 */
function calculateTLSHandshakeSize(keyExchange: string, authentication: string): number {
  let size = 1000; // Base TLS handshake size
  
  // Add size for key exchange
  if (keyExchange.toLowerCase().includes('kyber')) {
    size += keyExchange.toLowerCase().includes('1024') ? 1500 : 800;
  } else if (keyExchange.toLowerCase().includes('ntru')) {
    size += 1200;
  }
  
  // Add size for hybrid key exchange
  if (keyExchange.includes('+')) {
    size += 300; // Additional classical component
  }
  
  // Add size for authentication
  if (authentication.toLowerCase().includes('dilithium')) {
    size += 3000;
  } else if (authentication.toLowerCase().includes('falcon')) {
    size += 1000;
  } else if (authentication.toLowerCase().includes('sphincs')) {
    size += 8000;
  }
  
  // Add size for hybrid authentication
  if (authentication.includes('+')) {
    size += 500; // Additional classical component
  }
  
  return size;
}

/**
 * Run statistical tests on random data
 */
function runStatisticalTests(entropySource: string) {
  // Quality factor based on source
  const baseQualityFactor = 
    entropySource === 'qrng' ? 0.98 :
    entropySource === 'hybrid' ? 0.95 :
    entropySource === 'pseudo' ? 0.85 :
    0.90;
  
  // Small random variation
  const qualityFactor = baseQualityFactor * (0.98 + Math.random() * 0.04);
  
  // Simulate common statistical test results
  return {
    qualityFactor,
    passedFrequencyTest: qualityFactor > 0.9,
    passedRunsTest: qualityFactor > 0.85,
    passedEntropyEstimate: qualityFactor > 0.8,
    chiSquareResult: 0.1 + Math.random() * 0.2,
    autocorrelation: 0.0 + Math.random() * 0.05,
    shannonEntropy: 7.95 + Math.random() * 0.1
  };
}

/**
 * Suggest applications for quantum randomness
 */
function suggestRandomnessApplications(bytes: number, qualityFactor: number): string[] {
  const suggestions = [];
  
  if (bytes >= 32 && qualityFactor > 0.9) {
    suggestions.push('Cryptographic key generation');
    suggestions.push('Secure nonce creation');
  }
  
  if (bytes >= 128 && qualityFactor > 0.85) {
    suggestions.push('Game randomization');
    suggestions.push('Scientific simulations');
  }
  
  if (bytes >= 1024 && qualityFactor > 0.8) {
    suggestions.push('Statistical sampling');
    suggestions.push('Randomized algorithms');
  }
  
  if (qualityFactor > 0.95) {
    suggestions.push('High-security financial transactions');
    suggestions.push('Government-grade encryption');
  }
  
  return suggestions.length > 0 ? suggestions : ['General purpose randomization'];
}

/**
 * Evaluate if an encryption algorithm is quantum resistant
 */
function evaluateQuantumResistance(data: any): {
  isQuantumResistant: boolean;
  securityLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
  recommendedKeySize: number;
  estimatedQubitsCrack: number;
} {
  const algorithm = data.algorithm || 'AES';
  const keySize = data.keySize || 256;
  
  // Determine if the algorithm is quantum resistant
  const quantumResistant = ['Kyber', 'Dilithium', 'Falcon', 'SPHINCS+', 'AES'].includes(algorithm);
  
  // Determine security level
  let securityLevel: 'high' | 'medium' | 'low' = 'medium';
  if (quantumResistant && keySize >= 256) {
    securityLevel = 'high';
  } else if (quantumResistant && keySize >= 128) {
    securityLevel = 'medium';
  } else {
    securityLevel = 'low';
  }
  
  // Generate recommendations
  const recommendations = [];
  if (securityLevel !== 'high') {
    recommendations.push(`Increase key size to at least ${algorithm === 'AES' ? 256 : 384} bits`);
  }
  if (!quantumResistant) {
    recommendations.push('Consider using a quantum-resistant algorithm like Kyber or Dilithium');
  }
  recommendations.push('Implement periodic key rotation');
  
  const recommendedKeySize = quantumResistant ? Math.max(256, keySize) : 384;
  const estimatedQubitsCrack = quantumResistant ? 5000 + (keySize * 10) : 2500 + (keySize * 5);
  
  return {
    isQuantumResistant: quantumResistant,
    securityLevel,
    recommendations,
    recommendedKeySize,
    estimatedQubitsCrack
  };
}
