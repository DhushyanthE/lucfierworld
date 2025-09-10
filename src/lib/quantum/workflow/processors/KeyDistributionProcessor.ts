import { QuantumTask } from '../types';
import { 
  simulateQuantumComputation
} from '../utils';
import { bitsToHex, calculateEntanglementScore } from '../utils/cryptography';
import { simulateQuantumDecoherence } from '../utils/simulation';

/**
 * Process quantum key distribution tasks
 * Simulates quantum key distribution protocols for secure communication
 * with enhanced entanglement features and advanced security metrics
 */
export async function processKeyDistributionTask(task: QuantumTask): Promise<any> {
  console.log('Processing key distribution task:', task);
  
  // Record start time for performance metrics
  const startTime = Date.now();
  
  // Simulate quantum processing time with variable delays based on task complexity
  const complexityFactor = task.data.complexity || 1;
  const baseDuration = task.data.priority === 'high' ? 500 : 1500;
  const adjustedDuration = baseDuration * complexityFactor;
  
  await simulateQuantumComputation(adjustedDuration);
  
  // Process based on operation type
  let result;
  try {
    switch (task.data.operation) {
      case 'generate-bb84-keys':
        result = generateBB84Keys(task.data);
        break;
        
      case 'entanglement-key-generation':
        result = generateEntanglementBasedKeys(task.data);
        break;
      
      case 'quantum-key-exchange':
        result = simulateQuantumKeyExchange(task.data);
        break;
        
      case 'verify-qkd-integrity':
        result = verifyQkdIntegrity(task.data);
        break;
        
      case 'twin-field-qkd':
        result = generateTwinFieldQKD(task.data);
        break;
      
      case 'continuous-variable-qkd':
        result = simulateContinuousVariableQKD(task.data);
        break;
        
      case 'quantum-repeater-network':
        result = simulateQuantumRepeaterNetwork(task.data);
        break;
        
      case 'quantum-memory-qkd':
        result = simulateQuantumMemoryQKD(task.data);
        break;
        
      default:
        throw new Error(`Unknown key distribution operation: ${task.data.operation}`);
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
    console.error(`Error in key distribution processing: ${error.message}`);
    throw new Error(`Key distribution operation failed: ${error.message}`);
  }
}

/**
 * Generate quantum keys using the BB84 protocol simulation
 * Enhanced with detailed session statistics and security metrics
 */
function generateBB84Keys(data: any) {
  const keyLength = data.keyLength || 32;
  const errorRate = data.errorRate || 0.05;
  const eavesdropperPresent = data.simulateEavesdropper || false;
  
  // Calculate effective error rate (higher if eavesdropper is present)
  const effectiveErrorRate = eavesdropperPresent ? errorRate * 3 : errorRate;
  
  // Generate basis choices for Alice
  const basisChoices = Array(keyLength).fill(0).map(() => Math.random() > 0.5 ? 'X' : 'Z');
  
  // Generate raw qubits
  const rawBits = Array(keyLength).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
  
  // Simulate Bob's measurements with basis mismatch
  const bobBasisChoices = basisChoices.map(basis => 
    Math.random() > 0.2 ? basis : (basis === 'X' ? 'Z' : 'X'));
  
  // Bob's measurement results
  const bobMeasurements = rawBits.map((bit, i) => {
    // If bases match, result is correct with high probability
    if (basisChoices[i] === bobBasisChoices[i]) {
      return Math.random() > effectiveErrorRate ? bit : (1 - bit);
    } 
    // If bases don't match, result is random
    return Math.random() > 0.5 ? 1 : 0;
  });
  
  // Keep only bits where bases match for the key
  const matchingIndices = basisChoices
    .map((basis, i) => basis === bobBasisChoices[i] ? i : -1)
    .filter(i => i >= 0);
    
  const siftedAliceKey = matchingIndices.map(i => rawBits[i]);
  const siftedBobKey = matchingIndices.map(i => bobMeasurements[i]);
  
  // Calculate error rate in the sifted key
  const bitErrors = siftedAliceKey
    .map((bit, i) => bit === siftedBobKey[i] ? 0 : 1)
    .reduce((sum, val) => sum + val, 0);
  
  const measuredErrorRate = bitErrors / siftedAliceKey.length;
  
  // Error correction and privacy amplification simulation
  // (simplified - in real QKD these are complex procedures)
  let finalKeyLength = siftedAliceKey.length;
  
  // Reduce key length for error correction overhead
  finalKeyLength = Math.floor(finalKeyLength * (1 - measuredErrorRate * 2));
  
  // Reduce key length for privacy amplification
  finalKeyLength = Math.floor(finalKeyLength * 0.8);
  
  // Generate final keys (truncate to final length)
  const finalAliceKey = siftedAliceKey.slice(0, finalKeyLength);
  const finalBobKey = siftedBobKey.slice(0, finalKeyLength);
  
  // Convert binary keys to hex format
  const aliceKeyHex = bitsToHex(finalAliceKey);
  const bobKeyHex = bitsToHex(finalBobKey);
  
  // Calculate security parameters
  const securityAnalysis = analyzeBB84Security(measuredErrorRate, finalKeyLength, keyLength);
  
  return {
    protocol: 'BB84',
    keyLength: finalKeyLength,
    originalBits: keyLength,
    siftedBits: siftedAliceKey.length,
    aliceKeyHex,
    bobKeyHex,
    matchingKeyBits: finalAliceKey.every((bit, i) => bit === finalBobKey[i]),
    sessionMetrics: {
      rawQbitsSent: keyLength,
      basisMatchRate: matchingIndices.length / keyLength,
      measuredErrorRate,
      keyGenerationRate: finalKeyLength / keyLength,
      secureKeyLength: finalKeyLength
    },
    securityMetrics: {
      quantumBitErrorRate: measuredErrorRate,
      eavesdropperDetectionProbability: securityAnalysis.eavesdropperDetectionProbability,
      eavesdropperDetected: securityAnalysis.eavesdropperDetected,
      securityParameter: securityAnalysis.securityParameter,
      confidenceLevel: securityAnalysis.confidenceLevel
    }
  };
}

/**
 * Generate quantum keys based on entanglement
 * Enhanced with detailed entanglement metrics and multi-party capabilities
 */
function generateEntanglementBasedKeys(data: any) {
  const pairCount = data.pairCount || 20;
  const multiParty = data.multiParty || false;
  const partyCount = multiParty ? (data.partyCount || 3) : 2;
  const decoherenceRate = data.decoherenceRate || 0.05;
  
  // Generate entangled qubits with variable fidelity
  const entangledPairs = Array(pairCount).fill(0).map(() => {
    // Generate Bell state (simplified to either |00⟩ or |11⟩)
    const state = Math.random() > 0.5 ? 0 : 1;
    
    // Calculate base fidelity with some noise
    const baseFidelity = 0.95 + Math.random() * 0.05;
    
    // Apply decoherence effect
    const fidelity = baseFidelity * (1 - decoherenceRate * Math.random());
    
    return {
      state,
      fidelity,
      bellState: state === 0 ? 'Phi+' : 'Phi-'
    };
  });
  
  // Extract measurements for each party
  const partyMeasurements = [];
  
  for (let p = 0; p < partyCount; p++) {
    // Each party measures their part of the entangled pairs
    const measurements = entangledPairs.map(pair => {
      // Perfect measurement would give the state
      const perfectResult = pair.state;
      
      // Add noise based on fidelity
      return Math.random() < pair.fidelity ? perfectResult : 1 - perfectResult;
    });
    
    partyMeasurements.push(measurements);
  }
  
  // Apply CHSH test for entanglement verification
  const chshResults = simulateCHSHTest(entangledPairs);
  
  // Calculate entanglement scores between parties
  const entanglementScores = [];
  
  for (let i = 0; i < partyCount; i++) {
    for (let j = i + 1; j < partyCount; j++) {
      entanglementScores.push({
        parties: [i, j],
        score: calculateEntanglementScore(partyMeasurements[i], partyMeasurements[j])
      });
    }
  }
  
  // Generate keys in hex format for all parties
  const partyKeysHex = partyMeasurements.map(measurements => bitsToHex(measurements));
  
  // Calculate error rates between party 0 and all others
  const errorRates = partyMeasurements.slice(1).map((measurements, i) => {
    const errors = measurements.filter((bit, j) => bit !== partyMeasurements[0][j]).length;
    return {
      party: i + 1,
      errorRate: errors / pairCount
    };
  });
  
  // Security analysis
  const securityAnalysis = analyzeEntanglementSecurity(entanglementScores, chshResults);
  
  return {
    protocol: 'E91',
    variant: multiParty ? 'Multi-party' : 'Standard',
    pairCount,
    partyCount,
    partyKeysHex,
    entanglementScores,
    bellTest: chshResults,
    errorRates,
    entanglementMetrics: {
      averageFidelity: entangledPairs.reduce((sum, pair) => sum + pair.fidelity, 0) / pairCount,
      bellInequalityViolation: chshResults.chshValue,
      decoherenceRate,
      efficiency: Math.min(1, chshResults.chshValue / 2.82)
    },
    securityMetrics: securityAnalysis
  };
}

/**
 * Simulate quantum key exchange between parties
 * Enhanced with detailed channel analysis and more metrics
 */
function simulateQuantumKeyExchange(data: any) {
  const keyLength = data.keyLength || 64;
  const protocol = data.protocol || 'BB84-MDI';
  const photonLoss = Math.random() * 0.2; // 0-20% photon loss
  const noiseLevel = Math.random() * 0.05; // 0-5% noise
  const distance = data.distance || 100; // in km
  
  // Calculate distance-dependent losses
  const fiberLoss = 0.2; // dB/km (standard for optical fiber)
  const distanceLoss = 1 - Math.exp(-(distance * fiberLoss) / 10);
  
  // Combine with baseline photon loss
  const effectivePhotonLoss = Math.min(0.95, photonLoss + distanceLoss);
  
  // Number of photons that successfully reached destination
  const successfulPhotons = Math.floor(keyLength * (1 - effectivePhotonLoss));
  
  // Generate raw key bits
  const rawKeyBits = Array(successfulPhotons).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
  
  // Calculate protocol-specific parameters
  const protocolParams = getProtocolParameters(protocol, distance, noiseLevel);
  
  // Error correction and privacy amplification simulation
  const errorCorrectionOverhead = Math.ceil(successfulPhotons * noiseLevel * 1.1);
  const errorCorrectedLength = Math.max(0, successfulPhotons - errorCorrectionOverhead);
  
  // Privacy amplification reduces key length further
  const securityParameter = 64; // bits of security
  const privacyAmplificationReduction = Math.ceil(noiseLevel * successfulPhotons * 2) + securityParameter;
  const finalKeyLength = Math.max(0, errorCorrectedLength - privacyAmplificationReduction);
  
  // Final key after processing
  const finalKeyBits = rawKeyBits.slice(0, finalKeyLength);
  const finalKeyHex = bitsToHex(finalKeyBits);
  
  // Calculate key rate and security metrics
  const keyRate = finalKeyLength / keyLength;
  const securityMultiplier = protocol.includes('MDI') ? 1.2 : 1.0;
  const securityLevel = calculateSecurityLevel(protocol, noiseLevel, distance);
  
  return {
    protocol,
    distance,
    originalLength: keyLength,
    successfulPhotons,
    errorCorrectedLength,
    finalLength: finalKeyLength,
    keyHex: finalKeyHex,
    channelMetrics: {
      distanceLoss,
      photonLoss: effectivePhotonLoss,
      quantumBitErrorRate: noiseLevel,
      maximumDistance: protocolParams.maximumDistance,
      theoreticalKeyRate: protocolParams.keyRate
    },
    securityMetrics: {
      securityParameter: securityLevel,
      informationLeakage: noiseLevel * securityMultiplier,
      secureKeyRate: keyRate,
      eavesdropperDetectionProbability: 1 - Math.pow(1 - noiseLevel, 10)
    },
    performanceMetrics: {
      keyRateBitsPerSecond: Math.floor(finalKeyLength / (distance * 0.01)),
      timeToGenerateKey: Math.ceil(distance * 0.05 + keyLength * 0.02),
      efficiencyRatio: finalKeyLength / keyLength
    }
  };
}

/**
 * Verify integrity of a quantum key distribution system
 * Enhanced with detailed system diagnostics
 */
function verifyQkdIntegrity(data: any) {
  const testKeys = data.testKeys || 5;
  const coherenceTime = data.coherenceTime || 100;
  const systemAge = data.systemAge || 0; // in days
  
  // Generate test results
  const testResults = Array(testKeys).fill(0).map((_, i) => {
    // Simulate quantum state with decoherence over time
    const timeElapsed = Math.random() * 150;
    const initialFidelity = 0.98 + Math.random() * 0.02;
    const currentFidelity = simulateQuantumDecoherence(initialFidelity, timeElapsed, coherenceTime);
    
    // System age affects performance
    const ageFactor = Math.max(0.9, 1 - (systemAge / 1000));
    const adjustedFidelity = currentFidelity * ageFactor;
    
    return {
      testId: `qkd-test-${i + 1}`,
      initialFidelity,
      currentFidelity: adjustedFidelity,
      coherenceTime,
      timeElapsed,
      passed: adjustedFidelity > 0.9,
      metrics: {
        bitErrorRate: (1 - adjustedFidelity) / 2,
        photonicNoise: 0.01 + Math.random() * 0.02,
        detectorEfficiency: 0.85 + Math.random() * 0.1
      }
    };
  });
  
  // Calculate system integrity score
  const overallIntegrity = testResults.reduce(
    (sum, test) => sum + test.currentFidelity,
    0
  ) / testResults.length;
  
  // Detailed component analysis
  const componentAnalysis = analyzeSystemComponents(overallIntegrity, systemAge);
  
  // Generate security vulnerabilities
  const vulnerabilities = generateSecurityVulnerabilities(overallIntegrity);
  
  return {
    systemStatus: overallIntegrity > 0.95 ? 'optimal' : overallIntegrity > 0.9 ? 'good' : 'needs-calibration',
    overallIntegrity,
    systemAge,
    meanTimeBetweenFailures: Math.floor(500 - systemAge * 0.5) + ' days',
    testResults,
    componentAnalysis,
    securityAnalysis: {
      vulnerabilities,
      overallRisk: vulnerabilities.length > 0 ? 'moderate' : 'low',
      securityScore: Math.floor(100 * (1 - (vulnerabilities.length * 0.1))),
      recommendedActions: vulnerabilities.map(v => v.mitigation)
    },
    recommendations: [
      overallIntegrity < 0.92 ? 'Recalibrate quantum channel' : 'System operating within parameters',
      testResults.some(t => !t.passed) ? 'Replace faulty quantum repeaters' : 'All quantum repeaters functional',
      componentAnalysis.some(c => c.status === 'degraded') ? 'Schedule maintenance for degraded components' : 'All components operational',
      `Estimated maximum secure key rate: ${Math.floor(100 * overallIntegrity)}%`
    ]
  };
}

/**
 * Generate keys using Twin-Field QKD (TF-QKD)
 * NEW FUNCTION: Implements advanced TF-QKD for longer distance key exchange
 */
function generateTwinFieldQKD(data: any) {
  const keyLength = data.keyLength || 32;
  const distance = data.distance || 400; // in km
  const phaseError = data.phaseError || 0.1;
  
  // TF-QKD can work over longer distances (currently experimental)
  // Calculate distance-dependent parameters
  const attenuationCoefficient = 0.2; // dB/km
  const channelLoss = distance * attenuationCoefficient;
  
  // Calculate theoretical bound for key rate (simplified)
  const sqrtLoss = Math.sqrt(10 ** (channelLoss / 10));
  const theoreticalBound = 1 / sqrtLoss; // Proportional to square root of channel loss
  
  // Practical efficiency is much lower
  const practicalEfficiency = 0.1;
  const expectedKeyRate = theoreticalBound * practicalEfficiency;
  
  // Success probability based on distance and phase error
  const successProbability = Math.max(0.01, 0.5 - (distance / 2000) - phaseError);
  
  // Generate successful detections
  const detectionsCount = Math.floor(keyLength * successProbability);
  
  // Generate key bits from successful detections
  const keyBits = Array(detectionsCount).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
  
  // Error rate increases with phase error
  const errorRate = Math.min(0.1, phaseError * 0.8);
  
  // Apply errors to Bob's received bits
  const bobKeyBits = keyBits.map(bit => Math.random() < errorRate ? 1 - bit : bit);
  
  // Calculate final key length after error correction and privacy amplification
  const errorCorrectionFactor = 1.2;
  const securityParameter = 64;
  const informationLeakage = Math.ceil(detectionsCount * errorRate * errorCorrectionFactor) + securityParameter;
  const finalKeyLength = Math.max(0, detectionsCount - informationLeakage);
  
  // Final keys
  const aliceKey = keyBits.slice(0, finalKeyLength);
  const bobKey = bobKeyBits.slice(0, finalKeyLength);
  
  // Convert to hex
  const aliceKeyHex = bitsToHex(aliceKey);
  const bobKeyHex = bitsToHex(bobKey);
  
  // Calculate protocol performance metrics
  const keyRate = finalKeyLength / keyLength;
  const bitsPerSecond = Math.floor(finalKeyLength / (1 + distance * 0.01));
  const securityLevel = calculateTFQKDSecurityLevel(distance, errorRate, phaseError);
  
  return {
    protocol: 'TF-QKD',
    variant: data.variant || 'Standard',
    distance,
    initialPulses: keyLength,
    detections: detectionsCount,
    finalKeyLength,
    aliceKeyHex,
    bobKeyHex,
    measurementPhaseError: phaseError,
    matchingKeyBits: aliceKey.every((bit, i) => bit === bobKey[i]),
    channelMetrics: {
      attenuationCoefficient,
      totalLoss: channelLoss,
      errorRate,
      detectionProbability: successProbability
    },
    performanceMetrics: {
      keyRate,
      bitsPerSecond,
      theoreticalBound,
      practicalEfficiency,
      timeToGenerateKey: Math.ceil(distance * 0.05 + keyLength * 0.02)
    },
    securityMetrics: securityLevel
  };
}

/**
 * Simulate Continuous-Variable QKD (CV-QKD)
 * NEW FUNCTION: Implements CV-QKD for high key rates at medium distances
 */
function simulateContinuousVariableQKD(data: any) {
  const keyLength = data.keyLength || 128;
  const distance = data.distance || 80; // in km
  const modulationVariance = data.modulationVariance || 4.0;
  const reconciliationEfficiency = data.reconciliationEfficiency || 0.95;
  
  // Calculate channel parameters
  const excessNoise = 0.01 + (distance / 1000);
  const transmittance = Math.exp(-0.2 * distance / 10);
  
  // Calculate theoretical key rate
  const theoreticalRate = calculateCVQKDRate(
    transmittance, 
    excessNoise, 
    modulationVariance, 
    reconciliationEfficiency
  );
  
  // Number of measurements needed
  const measurementsNeeded = Math.ceil(keyLength / theoreticalRate);
  
  // Generate raw continuous variables (simplified)
  const aliceQuadratures = Array(measurementsNeeded).fill(0)
    .map(() => generateGaussianRandom(0, Math.sqrt(modulationVariance)));
  
  // Calculate Bob's received values with channel noise
  const bobQuadratures = aliceQuadratures.map(q => 
    q * Math.sqrt(transmittance) + 
    generateGaussianRandom(0, Math.sqrt(1 - transmittance + excessNoise))
  );
  
  // Calculate correlation coefficient
  const correlation = calculateCorrelation(aliceQuadratures, bobQuadratures);
  
  // Estimate mutual information
  const mutualInformation = calculateMutualInformation(correlation, modulationVariance);
  
  // Calculate secure key rate after reconciliation
  const secureInformationRate = Math.max(
    0, 
    mutualInformation * reconciliationEfficiency - 
    calculateEveInformation(transmittance, excessNoise, modulationVariance)
  );
  
  // Final key length
  const finalKeyLength = Math.floor(measurementsNeeded * secureInformationRate);
  
  // Generate binary keys from continuous variables (simplified)
  const aliceKey = Array(finalKeyLength).fill(0)
    .map((_, i) => aliceQuadratures[i % aliceQuadratures.length] > 0 ? 1 : 0);
  
  const bobKey = Array(finalKeyLength).fill(0)
    .map((_, i) => bobQuadratures[i % bobQuadratures.length] > 0 ? 1 : 0);
  
  // Apply error correction (simplified)
  const correctedBobKey = bobKey.map((bit, i) => 
    Math.random() < reconciliationEfficiency ? aliceKey[i] : bit
  );
  
  // Convert to hex
  const aliceKeyHex = bitsToHex(aliceKey);
  const bobKeyHex = bitsToHex(correctedBobKey);
  
  // Security analysis
  const securityAnalysis = analyzeCVQKDSecurity(
    transmittance, 
    excessNoise, 
    modulationVariance,
    reconciliationEfficiency
  );
  
  return {
    protocol: 'CV-QKD',
    variant: data.variant || 'Gaussian modulation',
    distance,
    measurementsPerformed: measurementsNeeded,
    finalKeyLength,
    aliceKeyHex,
    bobKeyHex,
    channelParameters: {
      transmittance,
      excessNoise,
      correlation
    },
    informationRates: {
      mutualInformation,
      eveInformation: calculateEveInformation(transmittance, excessNoise, modulationVariance),
      secureInformationRate,
      reconciliationEfficiency
    },
    performanceMetrics: {
      theoreticalRate,
      keyRate: finalKeyLength / measurementsNeeded,
      bitsPerSecond: Math.floor(finalKeyLength / (1 + distance * 0.005)),
      modulationVariance
    },
    securityMetrics: securityAnalysis
  };
}

/**
 * Simulate Quantum Repeater Network for long-distance QKD
 * NEW FUNCTION: Implements quantum repeater networks for extended range
 */
function simulateQuantumRepeaterNetwork(data: any) {
  const totalDistance = data.totalDistance || 800; // in km
  const repeaterCount = data.repeaterCount || 7;
  const keyLength = data.keyLength || 64;
  const protocol = data.protocol || 'memory-assisted';
  
  // Calculate segment length
  const segmentLength = totalDistance / (repeaterCount + 1);
  
  // Create repeater chain
  const repeaters = Array(repeaterCount).fill(0).map((_, i) => {
    const position = (i + 1) * segmentLength;
    const memoryLifetime = 100 + Math.random() * 200; // milliseconds
    const fidelity = 0.9 + Math.random() * 0.1;
    const successRate = Math.max(0.5, 1 - (position / 1600));
    
    return {
      id: `R${i+1}`,
      position,
      memoryLifetime,
      fidelity,
      successRate,
      status: Math.random() > 0.1 ? 'operational' : 'degraded'
    };
  });
  
  // Calculate entanglement distribution for each segment
  const segments = Array(repeaterCount + 1).fill(0).map((_, i) => {
    const startPosition = i * segmentLength;
    const endPosition = (i + 1) * segmentLength;
    const length = segmentLength;
    
    // Calculate success probability based on length
    const baseProbability = Math.exp(-0.2 * length / 10);
    const successProbability = baseProbability * 0.8; // practical efficiency
    
    return {
      id: `S${i+1}`,
      startPosition,
      endPosition,
      length,
      successProbability,
      entanglementRate: Math.floor(10000 * successProbability) / 10000
    };
  });
  
  // Simulate entanglement swapping and key generation
  const entanglementSwaps = simulateEntanglementSwapping(segments, repeaters);
  
  // Calculate end-to-end success probability
  const e2eSuccessProbability = entanglementSwaps.reduce(
    (prob, swap) => prob * swap.successProbability, 
    1
  );
  
  // Calculate expected number of attempts
  const expectedAttempts = Math.ceil(1 / e2eSuccessProbability);
  
  // Calculate time required
  // Speed of light in fiber: ~200,000 km/s
  const speedOfLight = 200000; // km/s
  const segmentTimeMs = segmentLength / speedOfLight * 1000;
  const swappingTimeMs = 10; // 10 ms per swapping operation
  const totalTimePerAttempt = segmentTimeMs + (repeaterCount * swappingTimeMs);
  const totalTimeMs = totalTimePerAttempt * expectedAttempts;
  
  // Calculate key generation rate
  const keyBitsPerSecond = (keyLength / totalTimeMs) * 1000;
  
  // Simulate final key generation
  const successfulBits = Math.floor(keyLength * e2eSuccessProbability);
  const aliceKey = Array(successfulBits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
  const bobKey = aliceKey.map(bit => Math.random() > 0.05 ? bit : 1 - bit); // 5% error rate
  
  // Convert to hex
  const aliceKeyHex = bitsToHex(aliceKey);
  const bobKeyHex = bitsToHex(bobKey);
  
  // Calculate fidelity of end-to-end entanglement
  const endToEndFidelity = calculateE2EFidelity(repeaters);
  
  // Security analysis
  const securityAnalysis = analyzeRepeaterSecurity(repeaters, endToEndFidelity);
  
  return {
    protocol: `Quantum-Repeater-${protocol}`,
    totalDistance,
    repeaterCount,
    segmentLength,
    finalKeyLength: successfulBits,
    aliceKeyHex,
    bobKeyHex,
    repeaters,
    entanglementSwaps,
    networkMetrics: {
      e2eSuccessProbability,
      expectedAttempts,
      totalTimeMs,
      keyBitsPerSecond,
      endToEndFidelity
    },
    resourceRequirements: {
      quantumMemories: repeaterCount * 2,
      entanglementSwaps: repeaterCount,
      classicalCommunicationLinks: repeaterCount + 1
    },
    securityMetrics: securityAnalysis
  };
}

/**
 * Simulate Quantum Memory QKD
 * NEW FUNCTION: Implements QKD with quantum memory for improved efficiency
 */
function simulateQuantumMemoryQKD(data: any) {
  const keyLength = data.keyLength || 64;
  const distance = data.distance || 120; // in km
  const memoryLifetime = data.memoryLifetime || 100; // in ms
  const memoryFidelity = data.memoryFidelity || 0.95;
  const memoryCount = data.memoryCount || 10;
  
  // Calculate channel loss
  const channelLoss = distance * 0.2 / 10; // in dB
  const transmittance = Math.exp(-channelLoss);
  
  // Calculate memory efficiency
  const memoryEfficiency = calculateMemoryEfficiency(
    memoryLifetime, 
    distance, 
    memoryFidelity
  );
  
  // Calculate advantage over standard QKD
  const standardQKDRate = calculateStandardQKDRate(transmittance);
  const memoryEnhancedRate = standardQKDRate * memoryEfficiency * memoryCount;
  const speedupFactor = memoryEnhancedRate / standardQKDRate;
  
  // Simulate memory operation
  const memoryOperations = Array(memoryCount).fill(0).map((_, i) => {
    const initialFidelity = memoryFidelity * (0.95 + Math.random() * 0.1);
    const storageTime = (Math.random() * 0.8 + 0.2) * memoryLifetime;
    const finalFidelity = initialFidelity * Math.exp(-storageTime / memoryLifetime);
    
    return {
      memoryId: `M${i+1}`,
      initialFidelity,
      storageTime,
      finalFidelity,
      successful: finalFidelity > 0.75
    };
  });
  
  // Calculate success rate with memory
  const successfulOperations = memoryOperations.filter(op => op.successful).length;
  const memorySuccessRate = successfulOperations / memoryCount;
  
  // Calculate key generation metrics
  const expectedBits = Math.floor(keyLength * memorySuccessRate * memoryEfficiency);
  const generationTimeMs = (distance / 200000) * 1000 * (keyLength / expectedBits);
  
  // Generate keys
  const aliceKey = Array(expectedBits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
  const errorRate = 0.01 + (1 - memoryFidelity) * 0.5;
  const bobKey = aliceKey.map(bit => Math.random() > errorRate ? bit : 1 - bit);
  
  // Convert to hex
  const aliceKeyHex = bitsToHex(aliceKey);
  const bobKeyHex = bitsToHex(bobKey);
  
  // Security analysis
  const securityAnalysis = analyzeMemoryQKDSecurity(memoryFidelity, errorRate);
  
  return {
    protocol: 'Memory-QKD',
    distance,
    memoryCount,
    memoryLifetime,
    finalKeyLength: expectedBits,
    aliceKeyHex,
    bobKeyHex,
    memoryOperations,
    memoryMetrics: {
      averageFidelity: memoryOperations.reduce((sum, op) => sum + op.finalFidelity, 0) / memoryCount,
      successRate: memorySuccessRate,
      memoryEfficiency,
      speedupFactor
    },
    performanceMetrics: {
      keyGenerationRate: expectedBits / keyLength,
      bitsPerSecond: Math.floor(expectedBits / (generationTimeMs / 1000)),
      generationTimeMs
    },
    securityMetrics: securityAnalysis
  };
}

// --- Helper functions for enhanced key distribution processor ---

/**
 * Analyze BB84 protocol security
 */
function analyzeBB84Security(errorRate: number, finalKeyLength: number, originalLength: number) {
  // Eavesdropper detection probability
  // For intercept-resend attack, each bit has 0.25 probability of causing an error
  const eavesdropperProbabilityPerBit = 0.25;
  
  // Probability of detecting eavesdropper with multiple bits
  const detectionProbability = 1 - Math.pow(
    1 - eavesdropperProbabilityPerBit, 
    originalLength
  );
  
  // Determine if eavesdropper would be detected based on error rate
  // Typical threshold is around 0.11 for BB84
  const eavesdropperDetected = errorRate > 0.11;
  
  // Security parameter (bits of security)
  const securityParameter = Math.floor(finalKeyLength * (1 - errorRate * 2));
  
  // Confidence level in security (decreases with error rate)
  const confidenceLevel = Math.max(0, 1 - (errorRate / 0.11));
  
  return {
    eavesdropperDetectionProbability: detectionProbability,
    eavesdropperDetected,
    securityParameter,
    confidenceLevel
  };
}

/**
 * Simulate CHSH test for entanglement verification
 */
function simulateCHSHTest(entangledPairs: any[]) {
  // CHSH inequality: |<A₁B₁> + <A₁B₂> + <A₂B₁> - <A₂B₂>| ≤ 2 classically
  // Quantum mechanically, this can reach 2√2 ≈ 2.82
  
  // Average fidelity of entangled pairs
  const avgFidelity = entangledPairs.reduce(
    (sum, pair) => sum + pair.fidelity, 
    0
  ) / entangledPairs.length;
  
  // Calculate CHSH value based on fidelity
  // For perfect entanglement (F=1), CHSH = 2√2
  // As fidelity decreases, CHSH approaches 2 (classical bound)
  const perfectCHSH = 2 * Math.sqrt(2);
  const classicalBound = 2;
  
  // Scale between classical and quantum bounds based on fidelity
  const chshValue = classicalBound + (perfectCHSH - classicalBound) * (avgFidelity - 0.5) * 2;
  
  // For perfect entanglement, CHSH = 2√2 ≈ 2.82
  // For classical correlation, CHSH ≤ 2
  // Violation occurs when CHSH > 2
  const violation = chshValue > classicalBound;
  const violationStrength = (chshValue - classicalBound) / (perfectCHSH - classicalBound);
  
  // Simulate measurements for the test
  const measurements = {
    A1B1: avgFidelity,
    A1B2: avgFidelity * 0.7,
    A2B1: avgFidelity * 0.7,
    A2B2: -avgFidelity * 0.7 // This is negative for optimal CHSH
  };
  
  return {
    chshValue,
    violation,
    violationStrength,
    measurements,
    classicalBound,
    quantumBound: perfectCHSH,
    avgFidelity
  };
}

/**
 * Analyze security of entanglement-based QKD
 */
function analyzeEntanglementSecurity(entanglementScores: any[], chshResults: any) {
  // Calculate average entanglement score
  const avgScore = entanglementScores.reduce(
    (sum, item) => sum + item.score, 
    0
  ) / entanglementScores.length;
  
  // Security metrics based on CHSH violation and entanglement scores
  const securityLevel = chshResults.violation ? 'quantum-secure' : 'compromised';
  const maxEavesdropperInfo = Math.max(0, 0.5 - chshResults.violationStrength * 0.5);
  
  // Estimate bits of security
  const securityBits = Math.floor(128 * chshResults.violationStrength);
  
  return {
    securityLevel,
    violationStrength: chshResults.violationStrength,
    avgEntanglementScore: avgScore,
    maxEavesdropperInfo,
    securityBits,
    quantumAdvantage: chshResults.violation
  };
}

/**
 * Get protocol-specific parameters for QKD
 */
function getProtocolParameters(protocol: string, distance: number, noiseLevel: number) {
  // Default parameters
  let maximumDistance = 200;
  let keyRate = Math.exp(-0.2 * distance / 10);
  
  // Adjust based on protocol
  switch(protocol) {
    case 'BB84':
      maximumDistance = 200;
      keyRate = Math.exp(-0.2 * distance / 10) * (1 - 2 * noiseLevel);
      break;
      
    case 'BB84-MDI':
      // Measurement-device-independent QKD
      maximumDistance = 400;
      // MDI-QKD has square-root dependence on transmittance
      keyRate = Math.sqrt(Math.exp(-0.2 * distance / 10)) * (1 - 2 * noiseLevel);
      break;
      
    case 'E91':
      // Entanglement-based
      maximumDistance = 150;
      keyRate = Math.exp(-0.25 * distance / 10) * (1 - 2 * noiseLevel);
      break;
      
    case 'COW':
      // Coherent-One-Way
      maximumDistance = 250;
      keyRate = Math.exp(-0.18 * distance / 10) * (1 - 2 * noiseLevel);
      break;
      
    case 'TF-QKD':
      // Twin-Field QKD
      maximumDistance = 600;
      // TF-QKD has square-root dependence on transmittance
      keyRate = Math.sqrt(Math.exp(-0.2 * distance / 10)) * (1 - 2 * noiseLevel);
      break;
  }
  
  return {
    maximumDistance,
    keyRate: Math.max(0, keyRate)
  };
}

/**
 * Calculate security level for quantum key exchange
 */
function calculateSecurityLevel(protocol: string, noiseLevel: number, distance: number) {
  // Base security parameter starts at 1
  let securityParameter = 1;
  
  // Reduce security with noise
  securityParameter -= noiseLevel * 5;
  
  // Reduce security with distance (approaching maximum theoretical distance)
  const maxDistance = protocol.includes('TF-QKD') ? 600 : 
                     protocol.includes('MDI') ? 400 : 200;
  
  securityParameter -= Math.pow(distance / maxDistance, 2) * 0.5;
  
  // Protocol-specific adjustments
  if (protocol.includes('MDI')) {
    securityParameter += 0.2; // More secure against side channels
  }
  
  if (protocol.includes('E91')) {
    securityParameter += 0.1; // Device-independent security
  }
  
  // Normalize to a reasonable range
  return Math.max(0, Math.min(1, securityParameter));
}

/**
 * Analyze system components for QKD integrity
 */
function analyzeSystemComponents(overallIntegrity: number, systemAge: number) {
  // Component types to analyze
  const componentTypes = [
    'Laser Source',
    'Single-Photon Detector',
    'Quantum Memory',
    'Entanglement Source',
    'Phase Modulator',
    'Polarization Controller',
    'Beam Splitter'
  ];
  
  // Age factor (older systems have more degradation)
  const ageFactor = Math.max(0.9, 1 - (systemAge / 1000));
  
  // Generate component analysis
  return componentTypes.map(type => {
    // Base integrity adjusted by overall system integrity
    const baseIntegrity = overallIntegrity * (0.9 + Math.random() * 0.2);
    
    // Apply age factor
    const adjustedIntegrity = baseIntegrity * ageFactor;
    
    // Determine status
    let status: 'optimal' | 'good' | 'degraded' | 'failing';
    if (adjustedIntegrity > 0.95) status = 'optimal';
    else if (adjustedIntegrity > 0.85) status = 'good';
    else if (adjustedIntegrity > 0.7) status = 'degraded';
    else status = 'failing';
    
    // Maintenance action
    let maintenanceAction: string;
    switch(status) {
      case 'optimal':
      case 'good':
        maintenanceAction = 'Routine inspection';
        break;
      case 'degraded':
        maintenanceAction = 'Calibration needed';
        break;
      case 'failing':
        maintenanceAction = 'Immediate replacement required';
        break;
    }
    
    return {
      type,
      integrity: adjustedIntegrity,
      status,
      maintenanceAction,
      estimatedLifeRemaining: `${Math.floor((adjustedIntegrity / 0.7) * 365)} days`
    };
  });
}

/**
 * Generate security vulnerabilities for QKD system
 */
function generateSecurityVulnerabilities(integrity: number) {
  const vulnerabilities = [];
  
  // Lower integrity means more vulnerabilities
  const vulnerabilityCount = Math.floor((1 - integrity) * 10);
  
  // Potential vulnerabilities
  const potentialVulnerabilities = [
    {
      name: 'Detector Blinding Attack',
      description: 'Vulnerability to detector control via bright illumination',
      severity: 'critical',
      mitigation: 'Install detector monitoring system'
    },
    {
      name: 'Side-Channel Leakage',
      description: 'Information leakage through timing side-channels',
      severity: 'high',
      mitigation: 'Apply constant-time implementation'
    },
    {
      name: 'Trojan Horse Attack',
      description: 'Vulnerability to back-reflection probing attacks',
      severity: 'high',
      mitigation: 'Install optical isolators'
    },
    {
      name: 'Calibration Attack',
      description: 'Exploitation of calibration procedures',
      severity: 'medium',
      mitigation: 'Implement secure calibration protocol'
    },
    {
      name: 'Phase Remapping',
      description: 'Manipulation of quantum states via phase remapping',
      severity: 'medium',
      mitigation: 'Monitor phase stability'
    },
    {
      name: 'Wavelength Dependency',
      description: 'Wavelength-dependent component behavior',
      severity: 'low',
      mitigation: 'Install spectral filters'
    },
    {
      name: 'Time-Shift Attack',
      description: 'Exploitation of detector efficiency mismatch',
      severity: 'high',
      mitigation: 'Implement decoy-state protocol'
    }
  ];
  
  // Select random vulnerabilities based on count
  for (let i = 0; i < vulnerabilityCount; i++) {
    if (i < potentialVulnerabilities.length) {
      vulnerabilities.push(potentialVulnerabilities[i]);
    }
  }
  
  return vulnerabilities;
}

/**
 * Calculate security level for TF-QKD
 */
function calculateTFQKDSecurityLevel(distance: number, errorRate: number, phaseError: number) {
  // Twin-Field QKD security depends on phase error rate and standard error rate
  const maxDistance = 600; // Theoretical limit for TF-QKD
  const distanceFactor = 1 - (distance / maxDistance);
  
  // Phase error is critical for TF-QKD
  const phaseSecurityFactor = 1 - (phaseError * 5);
  
  // Error rate impact
  const errorFactor = 1 - (errorRate * 10);
  
  // Combine factors
  const securityLevel = Math.min(1, Math.max(0, 
    distanceFactor * 0.3 + phaseSecurityFactor * 0.5 + errorFactor * 0.2
  ));
  
  // Estimate secure key fraction
  const secureKeyFraction = Math.max(0, 1 - 2 * errorRate - phaseError);
  
  // Estimate bits of security
  const securityBits = Math.floor(securityLevel * 256);
  
  return {
    securityLevel,
    secureKeyFraction,
    securityBits,
    quantumAdvantage: distance > 400, // TF-QKD has advantage over standard QKD at long distances
    vulnerableTo: phaseError > 0.1 ? ['Phase instability attacks', 'Coherent attacks'] : []
  };
}

/**
 * Generate Gaussian random variable with Box-Muller transform
 */
function generateGaussianRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

/**
 * Calculate correlation between two arrays
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
  const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
  
  // Calculate correlation
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < x.length; i++) {
    const xDiff = x[i] - meanX;
    const yDiff = y[i] - meanY;
    numerator += xDiff * yDiff;
    denomX += xDiff * xDiff;
    denomY += yDiff * yDiff;
  }
  
  if (denomX === 0 || denomY === 0) return 0;
  return numerator / Math.sqrt(denomX * denomY);
}

/**
 * Calculate mutual information from correlation
 */
function calculateMutualInformation(correlation: number, variance: number): number {
  // For Gaussian variables, mutual information can be calculated from correlation
  return -0.5 * Math.log(1 - correlation * correlation);
}

/**
 * Calculate Eve's information in CV-QKD
 */
function calculateEveInformation(
  transmittance: number, 
  excessNoise: number, 
  variance: number
): number {
  // Simplified calculation of Eve's information
  // In a real system, this would involve complex calculation of Holevo bound
  const noiseToSignalRatio = excessNoise / (transmittance * variance);
  return Math.min(1, Math.max(0, noiseToSignalRatio * 2));
}

/**
 * Calculate CV-QKD secure key rate
 */
function calculateCVQKDRate(
  transmittance: number, 
  excessNoise: number, 
  variance: number,
  reconciliationEfficiency: number
): number {
  // Simplified model of CV-QKD rate
  // Based on mutual information minus Eve's information
  
  // Calculate SNR
  const signalVariance = transmittance * variance;
  const noiseVariance = 1 + excessNoise;
  const snr = signalVariance / noiseVariance;
  
  // Calculate mutual information (Shannon formula for Gaussian channel)
  const mutualInfo = 0.5 * Math.log2(1 + snr);
  
  // Eve's information (simplified)
  const eveInfo = calculateEveInformation(transmittance, excessNoise, variance);
  
  // Secure key rate with reconciliation efficiency
  return Math.max(0, reconciliationEfficiency * mutualInfo - eveInfo);
}

/**
 * Analyze CV-QKD security
 */
function analyzeCVQKDSecurity(
  transmittance: number, 
  excessNoise: number, 
  variance: number,
  reconciliationEfficiency: number
) {
  // Calculate secure key rate
  const secureRate = calculateCVQKDRate(
    transmittance, 
    excessNoise, 
    variance,
    reconciliationEfficiency
  );
  
  // Security depends on excess noise primarily
  const securityLevel = Math.max(0, 1 - (excessNoise * 5));
  
  // Protocol is secure if key rate is positive
  const isSecure = secureRate > 0;
  
  // Vulnerabilities based on parameters
  const vulnerabilities = [];
  
  if (excessNoise > 0.1) {
    vulnerabilities.push('High excess noise');
  }
  
  if (reconciliationEfficiency < 0.85) {
    vulnerabilities.push('Low reconciliation efficiency');
  }
  
  if (transmittance < 0.01) {
    vulnerabilities.push('Very high channel loss');
  }
  
  return {
    securityLevel,
    isSecure,
    vulnerabilities,
    secureKeyRate: secureRate,
    securityBits: Math.floor(securityLevel * 256),
    recommendations: [
      excessNoise > 0.05 ? 'Reduce excess noise' : 'Excess noise within acceptable limits',
      reconciliationEfficiency < 0.9 ? 'Improve reconciliation efficiency' : 'Reconciliation efficiency optimal',
      `Estimated security: ${Math.floor(securityLevel * 100)}%`
    ]
  };
}

/**
 * Simulate entanglement swapping operations
 */
function simulateEntanglementSwapping(segments: any[], repeaters: any[]) {
  return repeaters.map((repeater, i) => {
    const leftSegment = segments[i];
    const rightSegment = segments[i + 1];
    
    // Success probability is product of segment probabilities and repeater efficiency
    const successProbability = 
      leftSegment.successProbability * 
      rightSegment.successProbability * 
      repeater.successRate;
    
    // Final fidelity decreases with each swap
    const finalFidelity = 
      Math.min(leftSegment.successProbability, rightSegment.successProbability) * 
      repeater.fidelity;
    
    return {
      repeaterId: repeater.id,
      leftSegmentId: leftSegment.id,
      rightSegmentId: rightSegment.id,
      successProbability,
      finalFidelity,
      swappingTime: 1 + Math.random() * 5 // 1-6 ms
    };
  });
}

/**
 * Calculate end-to-end fidelity for quantum repeater chain
 */
function calculateE2EFidelity(repeaters: any[]): number {
  // End-to-end fidelity decreases with each repeater
  // For n repeaters with individual fidelity F, end-to-end fidelity scales roughly as F^(n+1)
  const avgFidelity = repeaters.reduce((sum, r) => sum + r.fidelity, 0) / repeaters.length;
  
  // Calculate compounded fidelity
  return Math.pow(avgFidelity, repeaters.length + 1);
}

/**
 * Analyze security of quantum repeater network
 */
function analyzeRepeaterSecurity(repeaters: any[], e2eFidelity: number) {
  // Security threshold for Bell inequality violation
  const bellViolationThreshold = 0.78; // Corresponds to CHSH > 2
  
  // Security level based on end-to-end fidelity
  const securityLevel = (e2eFidelity - bellViolationThreshold) / (1 - bellViolationThreshold);
  
  // Check for compromised repeaters
  const degradedRepeaters = repeaters.filter(r => r.status === 'degraded');
  const hasCompromisedNode = degradedRepeaters.length > 0;
  
  // Security bits estimation
  const securityBits = Math.floor(Math.max(0, securityLevel) * 256);
  
  return {
    securityLevel: Math.max(0, securityLevel),
    bellViolation: e2eFidelity > bellViolationThreshold,
    securityBits,
    vulnerableNodes: degradedRepeaters.map(r => r.id),
    hasCompromisedNode,
    quantumAdvantage: true,
    recommendations: [
      e2eFidelity < 0.8 ? 'Improve repeater fidelity' : 'Fidelity within acceptable range',
      degradedRepeaters.length > 0 ? `Replace degraded repeaters: ${degradedRepeaters.map(r => r.id).join(', ')}` : 'All repeaters operational',
      `Estimated security: ${Math.floor(Math.max(0, securityLevel) * 100)}%`
    ]
  };
}

/**
 * Calculate memory efficiency for quantum memory QKD
 */
function calculateMemoryEfficiency(
  memoryLifetime: number, 
  distance: number, 
  fidelity: number
): number {
  // Memory lifetime should be compared to time-of-flight
  // Speed of light in fiber: ~200,000 km/s
  const speedOfLight = 200000; // km/s
  const timeOfFlight = (distance / speedOfLight) * 1000; // ms
  
  // Efficiency decreases when memory lifetime < time-of-flight
  const lifetimeRatio = memoryLifetime / timeOfFlight;
  
  // Fidelity factor
  const fidelityFactor = fidelity * fidelity; // Square for two-photon interference
  
  // Combine factors
  return Math.min(1, lifetimeRatio) * fidelityFactor;
}

/**
 * Calculate standard QKD rate (without memory)
 */
function calculateStandardQKDRate(transmittance: number): number {
  // Standard BB84 rate scales linearly with transmittance
  return transmittance * 0.1; // Practical efficiency factor
}

/**
 * Analyze security of memory QKD
 */
function analyzeMemoryQKDSecurity(memoryFidelity: number, errorRate: number) {
  // Memory fidelity determines security level
  const securityLevel = Math.max(0, memoryFidelity - errorRate * 2);
  
  // Security bits
  const securityBits = Math.floor(securityLevel * 256);
  
  // Protocol is secure if security level is positive
  const isSecure = securityLevel > 0;
  
  return {
    securityLevel,
    isSecure,
    securityBits,
    vulnerableTo: memoryFidelity < 0.9 ? ['Memory decoherence attacks'] : [],
    recommendations: [
      memoryFidelity < 0.9 ? 'Improve memory fidelity' : 'Memory fidelity optimal',
      errorRate > 0.03 ? 'Reduce error rate' : 'Error rate acceptable',
      `Estimated security: ${Math.floor(securityLevel * 100)}%`
    ]
  };
}
