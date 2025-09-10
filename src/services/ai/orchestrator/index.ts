
export * from './types';
export * from './orchestrator.service';
export * from './ai-processor';
export * from './event-manager';
export * from './ipfs.service';

import { orchestratorService } from './orchestrator.service';

// Re-export the singleton instance as the default export
// to maintain backward compatibility with existing imports
export default orchestratorService;
