
/**
 * Workflow Type Adapter
 * 
 * Adapts between different workflow type representations in the system
 */

import { Workflow } from '@/lib/quantum/orchestrator/services/workflow-orchestrator.service';

/**
 * Extends the Workflow type with additional properties needed by legacy components
 */
export interface EnhancedWorkflow extends Workflow {
  completedSteps: string[];
}

/**
 * Adapts a standard Workflow to an EnhancedWorkflow
 */
export function adaptWorkflow(workflow: Workflow, stepResults: Record<string, any> = {}): EnhancedWorkflow {
  // Get completed step IDs from the results
  const completedSteps = Object.entries(stepResults)
    .filter(([_, result]) => result?.success)
    .map(([stepId]) => stepId);

  return {
    ...workflow,
    completedSteps
  };
}
