
/**
 * IoT device and sensor types for quantum integration
 */

/**
 * IoT device security levels
 */
export enum IoTSecurityLevel {
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  QUANTUM_RESISTANT = 'quantum-resistant'
}

/**
 * IoT sensor types
 */
export enum IoTSensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  MOTION = 'motion',
  LIGHT = 'light',
  SOUND = 'sound',
  GPS = 'gps',
  ACCELEROMETER = 'accelerometer'
}

/**
 * IoT device configuration
 */
export interface IoTDeviceConfig {
  id: string;
  name: string;
  sensors: IoTSensorType[];
  transmitFrequency: number; // seconds
  securityLevel: IoTSecurityLevel;
  batteryLevel: number; // percentage
  firmwareVersion: string;
}

/**
 * IoT sensor data reading
 */
export interface IoTSensorReading {
  sensorType: IoTSensorType;
  value: number;
  unit: string;
  timestamp: number;
  accuracy: number;
}

/**
 * Secure IoT data packet with quantum resistance
 */
export interface SecureIoTDataPacket {
  deviceId: string;
  readings: IoTSensorReading[];
  timestamp: number;
  hash: string;
  signatureMethod: 'quantum-resistant' | 'classical';
  encryptionStrength: number;
  batteryLevel: number;
}

/**
 * Security evaluation result
 */
export interface IoTSecurityEvaluation {
  isQuantumResistant: boolean;
  vulnerabilityScore: number;
  recommendedUpgrades: string[];
  estimatedUpgradeCost: number;
}

/**
 * Quantum verification result
 */
export interface QuantumVerificationResult {
  verified: boolean;
  securityLevel: number;
  entropyScore: number;
  quantumSignature: string;
}
