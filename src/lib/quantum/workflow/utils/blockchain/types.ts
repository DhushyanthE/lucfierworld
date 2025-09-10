
/**
 * Type definitions for blockchain-related functionality
 */

export interface BlockchainParameters {
  blockSize: number;
  consensusAlgorithm: string;
  networkTopology: string;
  shardCount: number;
  transactionValidationMethod: string;
  transactionLimit: number;
  dataRate: number;
  nodesCount: number;
  consensusMechanism?: string;
  transactionFee?: number;
  nodeCount?: number;
  quantumResistance?: number;
  transactionSpeed?: number;
  energyEfficiency?: number;
  neuralNetworkLayers?: number;
  aiEnhanced?: boolean;
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  gasPrice: number;
  gasLimit: number;
  data?: string;
  nonce: number;
  blockNumber?: number;
  timestamp?: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface BlockchainBlock {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactions: string[];
  transactionCount: number;
  size: number;
}

export interface BlockchainNetwork {
  name: string;
  chainId: number;
  nodes: number;
  activeValidators: number;
  totalStaked?: number;
  blockTime: number;
  tps: number;
  lastBlockNumber: number;
}

export interface TransactionSimulationResult {
  success: boolean;
  processedCount: number;
  avgProcessingTime: number;
  successRate: number;
  energyEfficiency: number;
  hash: string;
  blockHeight: number;
  quantumSecure: boolean;
  bigDataMetrics?: BigDataMetrics;
}

export interface BigDataMetrics {
  processingVolume: number;
  storageThroughput: number;
  compressionRatio: number;
  dataParallelism: number;
  distributedNodesUtilized: number;
  quantumEnhanced: boolean;
}

export interface BlockchainAIEnhancementResult {
  success: boolean;
  processingTimeReduction: number;
  throughputIncrease: number;
  energyEfficiencyGain: number;
  securityScore: number;
  predictionAccuracy: number;
  capabilities: BigDataCapability[];
  
  // Adding missing properties needed by BigDataWorkflowService
  anomalyDetectionRate: number;
  quantumAdvantage: number;
  bigDataCapabilities?: BigDataCapability[];
  
  // Adding property used in aiEnhancer.ts
  aiModel?: string;
  enhancedModel?: any;
  enhancedFeatures?: string[];
  performanceImprovement?: number;
  embeddingDimensions?: number;
  trainingEpochs?: number;
  quantumLayers?: number;
}

export interface BigDataCapability {
  name: string;
  level: number;
  description: string;
  enabled: boolean;
  quantumAccelerated: boolean;
  
  // Adding properties used in aiEnhancer.ts
  processingModel?: string;
  scalingFactor?: number;
  applicableDomains?: string[];
}
