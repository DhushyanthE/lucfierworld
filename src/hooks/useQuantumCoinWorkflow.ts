import { useState, useEffect, useCallback } from 'react';
import { quantumCoinWorkflowService, WorkflowState, QuantumCoinBalance, QuantumCoinMarketData } from '@/services/quantum-coin/QuantumCoinWorkflowService';

export function useQuantumCoinWorkflow() {
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [balance, setBalance] = useState<QuantumCoinBalance | null>(null);
  const [marketData, setMarketData] = useState<QuantumCoinMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = quantumCoinWorkflowService.subscribe((state) => {
      setWorkflowState(state);
      setIsLoading(false);
    });

    // Initial data fetch
    fetchInitialData();

    return unsubscribe;
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const [balanceData, marketInfo] = await Promise.all([
        quantumCoinWorkflowService.getQuantumBalance('0x1234567890abcdef'),
        quantumCoinWorkflowService.getQuantumMarketData()
      ]);
      
      setBalance(balanceData);
      setMarketData(marketInfo);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }, []);

  const submitQuantumTask = useCallback(async (
    type: Parameters<typeof quantumCoinWorkflowService.submitQuantumTask>[0],
    input: any,
    priority: Parameters<typeof quantumCoinWorkflowService.submitQuantumTask>[2] = 'medium'
  ) => {
    return await quantumCoinWorkflowService.submitQuantumTask(type, input, priority);
  }, []);

  const executeTransaction = useCallback(async (
    type: Parameters<typeof quantumCoinWorkflowService.executeQuantumTransaction>[0],
    from: string,
    to: string,
    amount: number,
    metadata?: any
  ) => {
    return await quantumCoinWorkflowService.executeQuantumTransaction(type, from, to, amount, metadata);
  }, []);

  const startQuantumMining = useCallback(async (difficulty: number, reward: number) => {
    return await quantumCoinWorkflowService.startQuantumMining(difficulty, reward);
  }, []);

  const performMarketAnalysis = useCallback(async (timeframe: string, indicators: string[]) => {
    return await quantumCoinWorkflowService.performMarketAnalysis(timeframe, indicators);
  }, []);

  const executeTradingStrategy = useCallback(async (strategy: any) => {
    return await quantumCoinWorkflowService.executeTradingStrategy(strategy);
  }, []);

  const refreshData = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  return {
    workflowState,
    balance,
    marketData,
    isLoading,
    submitQuantumTask,
    executeTransaction,
    startQuantumMining,
    performMarketAnalysis,
    executeTradingStrategy,
    refreshData
  };
}