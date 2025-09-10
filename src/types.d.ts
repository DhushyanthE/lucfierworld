
// AI Model Types
export type AIModelType = 'gpt' | 'claude' | 'gemini' | 'deepseek';

// Workflow Step Type
export interface WorkflowStepType {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  description?: string;
  dependsOn?: string[];
}

// Workflow Context Type
export interface RealTimeWorkflowContext {
  activeModel: AIModelType;
  optimizationLevel: number;
  quantumEnabled: boolean;
  blockchainVerification: boolean;
  lastExecutionTime?: Date;
}
