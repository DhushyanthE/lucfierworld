
/**
 * Type definitions for AGI Orchestrator
 */

// Event types
export interface DataRegisteredEvent {
  dataId: string;
  owner: string;
  ipfsHash: string;
  timestamp: number;
}

export interface AccessRequestedEvent {
  dataId: string;
  requestId: string;
  requester: string;
  purpose: string;
  timestamp: number;
}

export interface DataSummarizedEvent {
  dataId: string;
  summaryCID: string;
  summary: string;
}

export interface AccessDecisionEvent {
  dataId: string;
  requestId: string;
  requester: string;
  assessmentCID: string;
  assessment: string;
  approved: boolean;
}

// AGI Processor types
export interface AgiBrainResult {
  result: string;
  reasoning: string;
  confidence: number;
  quantumEnhanced: boolean;
}

// Event Listener type
export type OrchestratorEventListener<T = any> = (data: T) => void;

// Orchestrator event
export interface OrchestratorEvent<T = any> {
  type: string;
  data: T;
}

// Orchestrator status
export interface OrchestratorStatus {
  isRunning: boolean;
  quantumSeedEnabled: boolean;
  registeredEventTypes: string[];
}

// IPFS Storage types
export interface IpfsStorageResult {
  cid: string;
  size: number;
  path: string;
}
