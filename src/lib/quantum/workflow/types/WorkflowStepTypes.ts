
/**
 * Workflow Step Type Definitions
 */

export interface WorkflowStepDefinition {
  id: string;
  name: string;
  type: 'agiPlan' | 'quantumCoin' | 'analysis' | 'quantum' | 'genomicsVerify' | 'mlInfer' | 'mlTrain' | 'bigData' | 'gitCommit';
  params?: Record<string, any>;
  dependsOn?: string[];
}

export interface WorkflowResult {
  success: boolean;
  data: any;
  processingTime: number;
}

export type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowStepExecution {
  stepId: string;
  workflowId: string;
  status: WorkflowStepStatus;
  startTime?: number;
  endTime?: number;
  result?: WorkflowResult;
}
