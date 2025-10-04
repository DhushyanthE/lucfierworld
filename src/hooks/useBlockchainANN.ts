/**
 * Custom hook for managing Blockchain-ANN architecture
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  BlockchainANNArchitecture, 
  ModelDeployment,
  PerformanceMetrics,
  BlockchainTransaction,
  ANNLayer
} from '@/types/blockchain-ann.types';
import { blockchainANNOrchestrator } from '@/services/blockchain-ann/BlockchainANNOrchestratorService';
import { useToast } from '@/hooks/use-toast';

export function useBlockchainANN() {
  const [architecture, setArchitecture] = useState<BlockchainANNArchitecture | null>(null);
  const [deployedModels, setDeployedModels] = useState<ModelDeployment[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Initialize architecture
   */
  const initializeArchitecture = useCallback(async (config: {
    name: string;
    consensusType: 'proof-of-neural-work' | 'proof-of-stake' | 'proof-of-authority';
    quantumEnabled: boolean;
    blockchainNodes: number;
    annLayers: Omit<ANNLayer, 'id'>[];
  }) => {
    setIsLoading(true);
    try {
      const arch = await blockchainANNOrchestrator.initializeArchitecture(config);
      setArchitecture(arch);
      
      toast({
        title: "Architecture Initialized",
        description: `${config.name} is ready with ${config.blockchainNodes} nodes`,
      });

      return arch;
    } catch (error) {
      toast({
        title: "Initialization Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Deploy model to blockchain
   */
  const deployModel = useCallback(async (
    modelName: string,
    layers: ANNLayer[],
    weights: number[][][]
  ) => {
    setIsLoading(true);
    try {
      const deployment = await blockchainANNOrchestrator.deployNeuralNetworkToBlockchain(
        modelName,
        layers,
        weights
      );

      setDeployedModels(prev => [...prev, deployment]);

      toast({
        title: "Model Deployed",
        description: `${modelName} deployed at ${deployment.contractAddress.substring(0, 10)}...`,
      });

      return deployment;
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Train distributed model
   */
  const trainModel = useCallback(async (
    modelId: string,
    trainingData: number[][],
    labels: number[][],
    config: any
  ) => {
    setIsLoading(true);
    try {
      const results = await blockchainANNOrchestrator.trainDistributedModel(
        modelId,
        trainingData,
        labels,
        config
      );

      toast({
        title: "Training Completed",
        description: `Model accuracy: ${(results.finalAccuracy * 100).toFixed(2)}%`,
      });

      return results;
    } catch (error) {
      toast({
        title: "Training Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Execute complete workflow
   */
  const executeWorkflow = useCallback(async (workflowConfig: any) => {
    setIsLoading(true);
    try {
      const results = await blockchainANNOrchestrator.executeWorkflow(workflowConfig);

      toast({
        title: "Workflow Completed",
        description: `${workflowConfig.name} executed successfully`,
      });

      return results;
    } catch (error) {
      toast({
        title: "Workflow Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Validate model with consensus
   */
  const validateConsensus = useCallback(async (
    modelId: string,
    input: number[],
    expectedOutput: number[]
  ) => {
    try {
      const results = await blockchainANNOrchestrator.validateModelConsensus(
        modelId,
        input,
        expectedOutput
      );

      if (results.consensusReached) {
        toast({
          title: "Consensus Reached",
          description: `Validator agreement: ${(results.validatorAgreement * 100).toFixed(1)}%`,
        });
      }

      return results;
    } catch (error) {
      toast({
        title: "Consensus Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  /**
   * Refresh metrics
   */
  const refreshMetrics = useCallback(async () => {
    if (!architecture) return;

    try {
      const newMetrics = await blockchainANNOrchestrator.getArchitectureMetrics();
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    }
  }, [architecture]);

  /**
   * Refresh data from orchestrator
   */
  const refreshData = useCallback(() => {
    const arch = blockchainANNOrchestrator.getArchitecture();
    const models = blockchainANNOrchestrator.getDeployedModels();
    const txs = blockchainANNOrchestrator.getTransactions();

    setArchitecture(arch);
    setDeployedModels(models);
    setTransactions(txs);
  }, []);

  // Auto-refresh metrics when architecture changes
  useEffect(() => {
    if (architecture) {
      refreshMetrics();
      const interval = setInterval(refreshMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [architecture, refreshMetrics]);

  return {
    // State
    architecture,
    deployedModels,
    metrics,
    transactions,
    isLoading,

    // Actions
    initializeArchitecture,
    deployModel,
    trainModel,
    executeWorkflow,
    validateConsensus,
    refreshMetrics,
    refreshData
  };
}
