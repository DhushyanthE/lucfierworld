
import { generateQuantumResistantHash } from '../cryptography';

export interface QuantumSecurityAssessment {
  isQuantumResistant: boolean;
  securityLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
  vulnerabilityScore?: number;
  recommendedKeySize?: number;
  estimatedQubitsCrack?: number;
}

/**
 * Evaluate the security of an IoT device
 * @param deviceId The ID of the device to evaluate
 * @returns A quantum security assessment
 */
export function evaluateDeviceSecurity(deviceId: string | number): QuantumSecurityAssessment {
  // Convert deviceId to string if it's a number
  const deviceIdStr = deviceId.toString();
  
  // Simulate security assessment based on device ID
  const securityHash = generateQuantumResistantHash(deviceIdStr);
  const securityScore = parseInt(securityHash.substring(0, 2), 16) / 255;
  
  let securityLevel: 'high' | 'medium' | 'low';
  if (securityScore > 0.8) {
    securityLevel = 'high';
  } else if (securityScore > 0.5) {
    securityLevel = 'medium';
  } else {
    securityLevel = 'low';
  }
  
  const isQuantumResistant = securityScore > 0.6;
  
  const recommendations = [
    `Device security score: ${(securityScore * 100).toFixed(2)}%`,
    isQuantumResistant ? 'Device uses quantum-resistant security measures.' : 'Upgrade to quantum-resistant security protocols.',
    securityLevel === 'low' ? 'Implement multi-factor authentication.' : '',
    securityLevel === 'medium' ? 'Regularly update device firmware.' : ''
  ].filter(Boolean);
  
  const vulnerabilityScore = 1 - securityScore;
  const recommendedKeySize = isQuantumResistant ? 384 : 256;
  const estimatedQubitsCrack = isQuantumResistant ? 5000 : 2000;

  return {
    isQuantumResistant,
    securityLevel,
    recommendations,
    vulnerabilityScore,
    recommendedKeySize,
    estimatedQubitsCrack
  };
}

/**
 * Generate a security report for an IoT network
 */
export function generateNetworkSecurityReport(devices: { deviceId: string | number }[]): {
  averageSecurityScore: number;
  quantumResistanceCount: number;
  vulnerabilities: string[];
  networkSecurityRating: 'critical' | 'high' | 'medium' | 'low';
  recommendedActions: string[];
} {
  let totalScore = 0;
  let quantumResistantCount = 0;
  const vulnerabilities: string[] = [];
  
  devices.forEach(device => {
    const assessment = evaluateDeviceSecurity(device.deviceId);
    totalScore += (1 - (assessment.vulnerabilityScore || 0));
    if (assessment.isQuantumResistant) {
      quantumResistantCount++;
    }
    vulnerabilities.push(...assessment.recommendations);
  });
  
  const averageSecurityScore = devices.length > 0 ? totalScore / devices.length : 0;
  
  // Determine overall network security rating
  let networkSecurityRating: 'critical' | 'high' | 'medium' | 'low';
  if (averageSecurityScore < 0.3) {
    networkSecurityRating = 'critical';
  } else if (averageSecurityScore < 0.5) {
    networkSecurityRating = 'high';
  } else if (averageSecurityScore < 0.7) {
    networkSecurityRating = 'medium';
  } else {
    networkSecurityRating = 'low';
  }
  
  // Generate recommended actions based on security score
  const recommendedActions = [
    averageSecurityScore < 0.5 ? 'Upgrade all IoT devices to quantum-resistant firmware' : '',
    quantumResistantCount / devices.length < 0.5 ? 'Replace legacy devices with quantum-secure alternatives' : '',
    'Implement regular security audits using quantum verification',
    'Set up automated security monitoring for all IoT endpoints'
  ].filter(Boolean);
  
  return {
    averageSecurityScore,
    quantumResistanceCount: quantumResistantCount,
    vulnerabilities: Array.from(new Set(vulnerabilities)),
    networkSecurityRating,
    recommendedActions
  };
}
