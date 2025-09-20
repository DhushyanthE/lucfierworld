import { useState, useEffect, useCallback } from 'react';
import { quantumMiningService, MiningSession, QuantumMiningConfig, MiningBlock } from '@/services/quantum-mining/QuantumMiningService';

export function useQuantumMining() {
  const [activeSessions, setActiveSessions] = useState<MiningSession[]>([]);
  const [blockchainStats, setBlockchainStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to mining updates
    const unsubscribe = quantumMiningService.subscribe((session) => {
      setActiveSessions(prev => {
        const index = prev.findIndex(s => s.id === session.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = session;
          return updated;
        } else {
          return [...prev, session];
        }
      });
    });

    // Load initial data
    loadInitialData();

    return unsubscribe;
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const stats = quantumMiningService.getBlockchainStats();
      const sessions = quantumMiningService.getActiveSessions();
      
      setBlockchainStats(stats);
      setActiveSessions(sessions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading mining data:', error);
      setIsLoading(false);
    }
  }, []);

  const startMining = useCallback(async (config: QuantumMiningConfig) => {
    try {
      const sessionId = await quantumMiningService.startMiningSession(config);
      return sessionId;
    } catch (error) {
      console.error('Error starting mining:', error);
      throw error;
    }
  }, []);

  const stopMining = useCallback(async (sessionId: string) => {
    try {
      await quantumMiningService.stopMiningSession(sessionId);
    } catch (error) {
      console.error('Error stopping mining:', error);
      throw error;
    }
  }, []);

  const mineBlock = useCallback(async (config: QuantumMiningConfig): Promise<MiningBlock> => {
    try {
      return await quantumMiningService.mineQuantumBlock(config);
    } catch (error) {
      console.error('Error mining block:', error);
      throw error;
    }
  }, []);

  const addTransaction = useCallback(async (transaction: any) => {
    try {
      return await quantumMiningService.addTransaction(transaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    const stats = quantumMiningService.getBlockchainStats();
    setBlockchainStats(stats);
  }, []);

  return {
    activeSessions,
    blockchainStats,
    isLoading,
    startMining,
    stopMining,
    mineBlock,
    addTransaction,
    refreshStats
  };
}