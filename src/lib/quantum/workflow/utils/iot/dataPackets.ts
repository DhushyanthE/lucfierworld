
/**
 * Re-export the IoT device data type
 */

export type { IoTDeviceData } from '../genomicBlockchain';

export interface IoTDataPacket {
  deviceId: string;
  timestamp: number;
  data: {
    [key: string]: number | string | boolean;
  };
  signature?: string;
  encrypted: boolean;
}

export function createIoTDataPacket(deviceId: string, data: Record<string, any>): IoTDataPacket {
  return {
    deviceId,
    timestamp: Date.now(),
    data,
    encrypted: Math.random() > 0.5
  };
}

export function verifyIoTDataPacket(packet: IoTDataPacket): boolean {
  // Simplified verification, always returns true in this mock
  return true;
}
