
/**
 * Type definitions for real-time quantum processing
 */

import { QuantumTask } from '../workflow/types';

/**
 * Callback type for task updates
 */
export type TaskUpdateCallback = (task: QuantumTask) => void;

/**
 * Interface for processors that can handle quantum tasks
 */
export interface QuantumTaskProcessor {
  processTask(task: QuantumTask): Promise<any>;
  canProcess(task: QuantumTask): boolean;
}

/**
 * Real-time processing metrics
 */
export interface RealTimeProcessingMetrics {
  processingRate: number; // tasks per second
  averageProcessingTime: number; // ms
  queueLength: number;
  activeProcessors: number;
  quantumUtilization: number; // 0-1
}

/**
 * Types of real-time quantum processors
 */
export enum QuantumProcessorType {
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  QUANTUM = 'quantum'
}

/**
 * Real-time processor configuration
 */
export interface ProcessorConfiguration {
  type: QuantumProcessorType;
  maxConcurrentTasks: number;
  priorityThreshold: number;
  errorCorrectionEnabled: boolean;
  quantumFidelityTarget: number;
}

/**
 * Quantum processor event types
 */
export type QuantumProcessorEventType = 'connect' | 'disconnect' | 'task-update' | 'error';

/**
 * Quantum processor event interface
 */
export interface QuantumProcessorEvent {
  type: QuantumProcessorEventType;
  timestamp: number;
  data?: any;
}

/**
 * Processor event callback type
 */
export type ProcessorEventCallback = (event: QuantumProcessorEvent) => void;

