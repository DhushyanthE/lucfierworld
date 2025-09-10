
import { AIModelType, RealTimeWorkflowContext, WorkflowStepType } from '@/types';
import { AIWorkflowResponse } from '@/services/ai/aiWorkflowService';
import { Dispatch, SetStateAction } from 'react';

export interface WorkflowState {
  workflowId: string | null;
  steps: WorkflowStepType[];
  isRunning: boolean;
  currentStepId: string | null;
  lastResponse: AIWorkflowResponse | null;
  activeModel: AIModelType;
  optimizationLevel: number;
  quantumEnabled: boolean;
  blockchainVerification: boolean;
  lastExecutionTime?: Date;
}

export interface WorkflowStateWithUpdaters extends WorkflowState {
  // State updater functions
  setSteps: Dispatch<SetStateAction<WorkflowStepType[]>>;
  setIsRunning: Dispatch<SetStateAction<boolean>>;
  setCurrentStepId: Dispatch<SetStateAction<string | null>>;
  setLastResponse: Dispatch<SetStateAction<AIWorkflowResponse | null>>;
  setActiveModel: Dispatch<SetStateAction<AIModelType>>;
  setOptimizationLevel: Dispatch<SetStateAction<number>>;
  setQuantumEnabled: Dispatch<SetStateAction<boolean>>;
  setBlockchainVerification: Dispatch<SetStateAction<boolean>>;
  setLastExecutionTime: Dispatch<SetStateAction<Date | undefined>>;
}

export interface UseRealTimeWorkflowOptions {
  initialSteps?: WorkflowStepType[];
  defaultModel?: AIModelType;
  enableQuantum?: boolean;
  enableBlockchain?: boolean;
}

export interface WorkflowActions {
  setSteps: Dispatch<SetStateAction<WorkflowStepType[]>>;
  switchModel: (model: AIModelType) => void;
  startWorkflow: () => Promise<void>;
  resetWorkflow: () => void;
  setOptimizationLevel: (level: number) => void;
  toggleQuantum: () => void;
  toggleBlockchainVerification: () => void;
  getWorkflowContext: () => RealTimeWorkflowContext;
}
