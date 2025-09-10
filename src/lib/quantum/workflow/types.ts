
/**
 * Types for quantum circuit workflow optimization
 */

export interface WorkflowTask {
  id: string;
  name: string;
  type: 'quantum' | 'classical' | 'hybrid';
  duration?: number;
  dependencies: string[];
  dependsOn?: string[]; // Added this field for backward compatibility
  estimatedResources?: {
    qubits?: number;
    memory?: number;
    cpuTime?: number;
  };
  parameters?: Record<string, any>;
  parallelExecutable?: boolean;
  priority?: number;
  status?: 'pending' | 'processing' | 'running' | 'completed' | 'failed';
}

export interface Task {
  id: string;
  name: string;
  type?: string;
  status?: string;
  priority?: number;
  data?: any;
  operation?: string;
  parameters?: any;
}

export interface TaskWithStatus extends Task {
  progress: number;
  result?: any;
  error?: string;
  createdAt?: number;
  startTime?: number;
  completedAt?: number;
}

export interface QuantumTask {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  data: any;
  params?: Record<string, any>;
  result?: Record<string, any>;
  timestamp?: number;
  createdAt: Date | number;
  startTime?: number;
  completedAt?: number;
  processingTime?: number;
  error?: string;
  failureAnalysis?: {
    errorType: string;
    recoverable: boolean;
    retryCount: number;
  };
}

export interface QuantumWorkflowState {
  tasks: {[key: string]: QuantumTask};
  status: string;
  processingQueue: string[];
  completedTasks: string[];
  activeTaskId: string | null;
}

// Add the simulateQuantumNeuralComputation function
export async function simulateQuantumNeuralComputation(
  qnnLayers: number, 
  inputDimension: number
): Promise<{
  success: boolean;
  fidelity: number;
  coherenceTime: number;
  entanglementScore?: number;
}> {
  // Simulate quantum neural network processing time
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Calculate simulated metrics
  const fidelity = 0.85 + (Math.random() * 0.15);
  const coherenceTime = 100 + (Math.random() * 400);
  const entanglementScore = qnnLayers > 2 ? 0.75 + (Math.random() * 0.25) : 0.5 + (Math.random() * 0.25);
  
  // Determine success based on fidelity threshold
  const success = fidelity > 0.9;
  
  return {
    success,
    fidelity,
    coherenceTime,
    entanglementScore
  };
}

export interface WorkflowOptimizationResult {
  originalExecutionTime: number;
  optimizedExecutionTime: number;
  timeReduction: number;
  timeReductionPercentage: number;
  quantumAdvantage: number;
  quantumSpeedup: number;
  quantumUtilization: number;
  improvementPercentage: number;
  criticalPath: string[];
  optimizedTasks: WorkflowTask[];
  bottlenecks: string[];
  resourceAllocation: any;
  taskReordering: Record<string, number>;
  optimizationOverhead: {
    quantumCircuitOptimizationTime: number;
    totalOptimizationTime: number;
  };
}

export interface CircuitOptimizationOptions {
  method: 'depth' | 'gates' | 'fidelity';
  iterations: number;
  preserveFunctionality: boolean;
  errorCorrection?: number;
  noiseLevel?: number;
}

export interface CircuitOptimizationResult {
  originalFidelity: number;
  optimizedFidelity: number;
  gateReduction: number;
  depthReduction: number;
  executionTimeImprovement: number;
  quantumResourceSavings: number;
  optimizedCircuit: any;
  optimizationSteps: any[];
}

export interface QuantumProcessorEvent {
  type: QuantumProcessorEventType;
  timestamp: number;
  data?: any;
}

export type QuantumProcessorEventType = 
  | 'connect'
  | 'disconnect'
  | 'taskcreated'
  | 'taskcompleted'
  | 'taskfailed'
  | 'statuschange'
  | 'error';

export type ProcessorEventCallback = (event: QuantumProcessorEvent) => void;
