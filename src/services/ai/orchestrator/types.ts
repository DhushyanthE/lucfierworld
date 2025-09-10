
import { AIModelType, WorkflowStepType } from '@/types';

export interface WorkflowOrchestratorConfig {
  modelType: AIModelType;
  quantumEnabled: boolean;
  blockchainEnabled: boolean;
  dataProcessingEnabled: boolean;
}

export interface WorkflowExecutionResult {
  success: boolean;
  startTime: Date;
  endTime: Date;
  processingTime: number;
  steps: {
    id: string;
    name: string;
    status: 'completed' | 'failed' | 'skipped';
    startTime?: Date;
    endTime?: Date;
    error?: string;
  }[];
  transactionIds: string[];
  model: AIModelType;
  insights: string[];
}

export interface WorkflowContext {
  sessionId: string;
  currentStepId: string | null;
  genomicData?: {
    hash: string;
    size: number;
    timestamp: number;
  };
  blockchainData?: {
    transactionId: string;
    blockNumber: number;
    timestamp: number;
  };
  aiAnalysis?: {
    model: AIModelType;
    confidenceScore: number;
    insights: string[];
    processingTime: number;
  };
}
