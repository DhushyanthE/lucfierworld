
import { ReactNode } from 'react';

// Define the UI WorkflowStep type
export interface UIWorkflowStep {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  description: string;
  icon: ReactNode;
  dependsOn?: string[];
}

export interface WorkflowState {
  workflowSteps: UIWorkflowStep[];
  isRunning: boolean;
  activeStep: string | null;
  lastExecutionTime: string | null;
  errors: string[];
  isValidated: boolean;
  quantumEntanglement: number;
  neuralNetworkAccuracy: number;
  agiSynthesisLevel: number;
  superintelligenceScore: number;
  processingStatus: Record<string, number>;
  workflowId: string | null;
}
