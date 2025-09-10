
/**
 * IoT sensor simulation utilities
 */

import { IoTDeviceConfig, IoTSensorReading, IoTSensorType } from './types';

/**
 * Simulate IoT sensor readings based on device configuration
 */
export function simulateIoTReadings(
  deviceConfig: IoTDeviceConfig
): IoTSensorReading[] {
  const readings: IoTSensorReading[] = [];
  const timestamp = Date.now();
  
  for (const sensorType of deviceConfig.sensors) {
    let value: number;
    let unit: string;
    let accuracy: number;
    
    // Generate realistic sensor values based on type
    switch (sensorType) {
      case IoTSensorType.TEMPERATURE:
        value = 20 + Math.random() * 10 - 5; // 15-25°C
        unit = '°C';
        accuracy = 0.5;
        break;
      case IoTSensorType.HUMIDITY:
        value = 40 + Math.random() * 30; // 40-70%
        unit = '%';
        accuracy = 2;
        break;
      case IoTSensorType.PRESSURE:
        value = 1000 + Math.random() * 50 - 25; // 975-1025 hPa
        unit = 'hPa';
        accuracy = 1;
        break;
      case IoTSensorType.MOTION:
        value = Math.random() > 0.7 ? 1 : 0; // binary motion detection
        unit = 'state';
        accuracy = 1;
        break;
      case IoTSensorType.LIGHT:
        value = Math.random() * 1000; // 0-1000 lux
        unit = 'lux';
        accuracy = 5;
        break;
      case IoTSensorType.SOUND:
        value = 30 + Math.random() * 50; // 30-80 dB
        unit = 'dB';
        accuracy = 3;
        break;
      case IoTSensorType.GPS:
        value = Math.random() * 180 - 90; // latitude or longitude
        unit = 'degrees';
        accuracy = 0.0001;
        break;
      case IoTSensorType.ACCELEROMETER:
        value = Math.random() * 2 - 1; // -1 to 1 g
        unit = 'g';
        accuracy = 0.01;
        break;
      default:
        value = Math.random() * 100;
        unit = 'units';
        accuracy = 1;
    }
    
    readings.push({
      sensorType,
      value: parseFloat(value.toFixed(4)),
      unit,
      timestamp,
      accuracy
    });
  }
  
  return readings;
}
