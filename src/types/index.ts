
// Export AI Model types
export type AIModelType = 'gpt' | 'claude' | 'gemini' | 'deepseek';

// Export Workflow Status types
export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed';

// Export Blockchain Verification Status
export type VerificationStatus = 'pending' | 'verifying' | 'success' | 'failure';

// Export Trade Signal Type
export interface TradeSignal {
  type: 'BUY' | 'SELL';
  symbol: string;
  price: number;
  confidence: number;
  timestamp: number;
}

// Export Workflow Step Type
export interface WorkflowStepType {
  id: string;
  name: string;
  status: WorkflowStatus;
  progress: number;
  description?: string;
  dependsOn?: string[];
}

// Export Real-time Workflow Context
export interface RealTimeWorkflowContext {
  activeModel: AIModelType;
  optimizationLevel: number;
  quantumEnabled: boolean;
  blockchainVerification: boolean;
  lastExecutionTime?: Date;
}
