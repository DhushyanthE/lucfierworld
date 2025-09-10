
export type QuantumCoinFeature = 
  | "governance"
  | "tokenomics"
  | "defi"
  | "nft"
  | "mining";

export interface AIGenerationRequest {
  prompt: string;
  context?: string;
  feature?: QuantumCoinFeature;
  maxLength?: number;
  neuralAnalysis?: boolean;
}

export interface NeuralNetworkOutput {
  patterns: any[];
  confidenceScore: number;
  analysisTime: number;
  recommendations?: string[];
  // Adding these properties used in neuralNetworkService.ts
  securityScore?: number;
  vectorEmbedding?: number[];
  classification?: string;
  anomalyDetection?: {
    isAnomaly: boolean;
    score: number;
    reason?: string;
  };
  quantumResistanceMetric?: number;
}

export interface AIGenerationResponse {
  text: string;
  status: 'success' | 'error';
  message?: string;
  neuralOutput?: NeuralNetworkOutput;
  dataAnalysis?: any;
  optimizedMetrics?: any;
  iotAnalysis?: any;
  workflowOptimization?: any;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface AIModelConfig {
  name: string;
  version: string;
  parameters: number;
  quantumEnhanced: boolean;
  capabilities: string[];
}

export interface SecurityAnalysisParams {
  network: string;
  depth: number;
  includeQuantum: boolean;
}

export interface SecurityAnalysisResult {
  score: number;
  vulnerabilities: string[];
  quantumResistance: number;
  recommendations: string[];
}

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  quantumEnhanced?: boolean;
}

// Adding the missing interface types used in neuralNetworkService.ts
export interface NeuralNetworkParams {
  layers?: number;
  neurons?: number;
  activationFunction?: string;
  epochs?: number;
  batchSize?: number;
}

export interface QuantumSecurityAnalysis {
  resistanceScore: number;
  vulnerabilities: string[];
  recommendations: string[];
  quantumSafeAlgorithms: string[];
}
