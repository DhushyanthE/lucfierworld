
import { TrainedQuantumModel } from "@/services/quantum/models/QuantumModelTypes";
import { ModelTransferResult } from "@/lib/quantum/workflow/types/QuantumTask";
import { connectTrainingToAssistant as connectTraining } from "./workflow-optimizer/training-integration";

// Re-export the training integration function
export const connectTrainingToAssistant = connectTraining;

/**
 * Re-export workflow optimizer functionality from the refactored location
 */
export { 
  RealTimeWorkflowOptimizer,
  WorkflowMetrics,
  WorkflowEfficiencyChart,
  WorkflowControls,
  WorkflowStep,
  WorkflowStepList,
  useWorkflowOptimizer,
  initializeWorkflowSteps
} from './workflow-optimizer/index';
