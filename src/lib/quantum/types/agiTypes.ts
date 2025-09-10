
/**
 * AGI Module Type Definitions
 * 
 * TypeScript interfaces for the Artificial General Intelligence (AGI) module
 */

export interface AGIProcessInput {
  operation: string;
  complexity: 'low' | 'medium' | 'high';
  contextData?: Record<string, any>;
}

export interface AGIProcessResult {
  success: boolean;
  operationId: string;
  metrics: {
    executionTime: number;
    confidenceScore: number;
    quantumUtilization: number;
  };
  results: any;
}

export interface AGIMetrics {
  cognitiveCapacity: number;
  quantumAdvantage: number;
  neuronsEquivalent: number;
  circuitDepth: number;
  totalDecisions: number;
  averageConfidence: number;
  systemComplexity: number;
  adaptabilityScore: number;
  selfImprovementRate: number;
  insightGenerationLevel: number;
  operationsCount: number;
  lastExecutionTime: number;
}

export interface AGICapability {
  id: string;
  name: string;
  description: string;
  type: 'cognitive' | 'analytical' | 'quantum' | 'learning' | 'blockchain';
  confidence: number;
}
