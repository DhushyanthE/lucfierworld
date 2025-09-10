
/**
 * Re-export all IoT-related functionality
 */

// Re-export from dataPackets
export { 
  createIoTDataPacket, 
  verifyIoTDataPacket 
} from './dataPackets';
export type { IoTDataPacket } from './dataPackets';

// Re-export from quantumIntegration - using the correct function name
export { 
  processIoTWithGenomicBlockchain,
  prepareIoTDataForBlockchain,
  verifyIoTDataWithQuantumCrypto
} from './quantumIntegration';
export type { 
  IoTIntegrationResult,
  QuantumVerifiedIoTData
} from './quantumIntegration';

// Re-export IoTDeviceData type from genomicBlockchain via dataPackets
export type { IoTDeviceData } from './dataPackets';
