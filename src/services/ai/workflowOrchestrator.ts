
// This file re-exports everything from the orchestrator module
// for backward compatibility and simpler imports

import { orchestratorService } from './orchestrator/orchestrator.service';

// Re-export all types and services
export * from './orchestrator';

// Re-export the singleton instance as workflowOrchestrator 
// to maintain backward compatibility with existing imports
export const workflowOrchestrator = orchestratorService;
export default workflowOrchestrator;
