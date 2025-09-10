
/**
 * Workflow Types for Quantum AI integration
 */

export interface WorkflowTask {
  id: string;
  name?: string;
  description?: string;
  type: 'quantum' | 'classical' | 'hybrid';
  parameters: Record<string, any>;
  dependencies: string[];
  dependsOn?: string[];
  priority: number;
  estimatedResources: {
    qubits?: number;
    memory?: number;
    cpuTime?: number;
  };
  // Extended properties for UI and workflow integration
  status?: 'pending' | 'running' | 'processing' | 'completed' | 'failed';
  progress?: number;
  icon?: React.ReactNode;
  quantum?: boolean;
  duration?: number;
  parallelExecutable?: boolean;
  resourceOptimized?: boolean;
  qubits?: number;
  memory?: number;
  cpu?: number;
  resourceIntensity?: 'low' | 'medium' | 'high';
  category?: string;
  // Additional UI properties
  errorMessage?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  tasks: WorkflowTask[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  result?: any;
}

// Updated OptimizationStrategy with the actual values used in the code
export type OptimizationStrategy = 
  | 'minimize-execution-time' 
  | 'maximize-quantum-utilization' 
  | 'minimize-resource-usage' 
  | 'balance-load'
  | 'parallel'
  | 'quantum-priority'
  | 'resource-efficiency'
  | 'balanced';

// Resource allocation model for optimization
export interface ResourceAllocation {
  quantum: {
    tasks: number;
    totalQubits: any;
    avgQubitsPerTask: number;
    circuitOptimizationLevel: number;
    parallelism: number;
    estimatedExecutionTime: number;
  };
  classical: {
    tasks: number;
    totalCpuUtilization: any;
    avgCpuPerTask: number;
    parallelism: number;
    estimatedExecutionTime: number;
  };
  memory: {
    totalRequired: any;
    peakUsage: number;
    optimized: boolean;
  };
}

export interface WorkflowOptimizationResult {
  originalExecutionTime: number;
  optimizedExecutionTime: number;
  timeReduction: number;
  timeReductionPercentage: number;
  parallelizationFactor?: number;
  improvementPercentage?: number;
  taskReordering?: Record<string, number>;
  resourceAllocation?: ResourceAllocation;
  quantumAdvantage?: number;
  quantumSpeedup?: number;
  quantumUtilization?: number;
  criticalPath?: string[];
  bottlenecks?: string[];
  optimizedTasks?: WorkflowTask[];
  optimizationOverhead?: {
    quantumCircuitOptimizationTime?: number;
    quantumOverhead?: number;
    totalOptimizationTime?: number;
  };
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

export interface QuantumNeuralResult {
  accuracy: number;
  loss: number;
  entanglementScore: number;
}

export interface Task {
  id: string;
  name: string;
  status?: string; // Make status optional to fix the error in QuantumFidelityMetrics
  type?: string;
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

export interface GenomicBlockchainData {
  blockchainTxId: string;
  sequenceHash?: string;
  dataHash?: string;
  timestamp: number;
  accessControl: {
    isPublic: boolean;
    allowedAddresses: string[];
    encryptionType?: string;
  };
  blockHeight?: number;
  kontourTokenPrice?: number;
}
