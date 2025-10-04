/**
 * Blockchain-ANN Combined Architecture Types
 */

export type BlockchainLayerType = 'consensus' | 'network' | 'data' | 'smart-contract' | 'transaction';
export type ANNLayerType = 'input' | 'hidden' | 'output' | 'dropout' | 'activation';
export type ActivationFunction = 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'leaky-relu';
export type OptimizationAlgorithm = 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
export type ConsensusType = 'proof-of-neural-work' | 'proof-of-stake' | 'proof-of-authority';

export interface BlockchainLayer {
  id: string;
  type: BlockchainLayerType;
  status: 'active' | 'inactive' | 'syncing' | 'error';
  nodes: number;
  throughput: number;
  latency: number;
  configuration: Record<string, any>;
}

export interface ANNLayer {
  id: string;
  type: ANNLayerType;
  neurons: number;
  activationFunction: ActivationFunction;
  weights?: number[][];
  biases?: number[];
  dropout?: number;
}

export interface BlockchainANNArchitecture {
  id: string;
  name: string;
  version: string;
  blockchainLayers: BlockchainLayer[];
  annLayers: ANNLayer[];
  consensusType: ConsensusType;
  quantumEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingConfiguration {
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: OptimizationAlgorithm;
  lossFunction: string;
  validationSplit: number;
  distributedNodes: number;
  blockchainVerification: boolean;
  quantumEnhancement: boolean;
}

export interface ModelDeployment {
  modelId: string;
  contractAddress: string;
  blockchainNetwork: string;
  deployedAt: Date;
  version: string;
  accuracy: number;
  consensusScore: number;
  ipfsHash?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'data-loading' | 'preprocessing' | 'training' | 'validation' | 'deployment' | 'inference';
  status: 'pending' | 'running' | 'completed' | 'failed';
  blockchainCheckpoint?: string;
  progress: number;
  startTime?: Date;
  endTime?: Date;
  metrics?: Record<string, any>;
}

export interface BlockchainANNWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  architecture: BlockchainANNArchitecture;
  trainingConfig: TrainingConfiguration;
  status: 'draft' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface PerformanceMetrics {
  throughput: number;
  latency: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  energyEfficiency: number;
  blockchainCost: number;
  consensusTime: number;
  trainingTime: number;
}

export interface NodeMetrics {
  nodeId: string;
  isValidator: boolean;
  computePower: number;
  accuracy: number;
  uptime: number;
  reputationScore: number;
  contributedBlocks: number;
  successfulPredictions: number;
}

export interface FederatedLearningSession {
  sessionId: string;
  participants: NodeMetrics[];
  globalModelVersion: number;
  currentRound: number;
  totalRounds: number;
  convergenceThreshold: number;
  aggregatedGradients?: number[][];
  consensusReached: boolean;
}

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  type: 'model-deployment' | 'inference' | 'training-update' | 'consensus-vote';
  data: Record<string, any>;
  timestamp: Date;
  gasUsed: number;
  verified: boolean;
}

export interface SmartContractModel {
  address: string;
  modelName: string;
  architecture: ANNLayer[];
  weights: string; // IPFS hash
  version: number;
  owner: string;
  deployedBlock: number;
  inferenceCount: number;
  accuracyScore: number;
}
