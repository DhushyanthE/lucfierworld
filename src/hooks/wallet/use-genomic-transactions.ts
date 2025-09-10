
import { useCallback } from 'react';
import { getGenomicBlockchainHistory, storeGenomicSequence, calculateGenomicTokenValue, analyzeGenomicData } from '@/lib/quantum/workflow/utils/genomic';
import { ProcessGenomicDataResult, GenomicTransactionHistory } from './types';

export function useGenomicTransactions(
  walletAddress: string | null,
  isConnected: boolean,
  setGenomicTransactions: (transactions: GenomicTransactionHistory[]) => void,
  setIsLoadingTransactions: (loading: boolean) => void,
  setKontourBalance: (updater: (prev: number) => number) => void
) {
  // Load genomic transaction history
  const loadGenomicTransactions = useCallback(async () => {
    if (!walletAddress) return [];
    
    setIsLoadingTransactions(true);
    
    try {
      const transactions = await getGenomicBlockchainHistory(walletAddress);
      setGenomicTransactions(transactions);
      return transactions;
    } catch (error) {
      console.error('Error loading genomic transactions:', error);
      return [];
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [walletAddress, setGenomicTransactions, setIsLoadingTransactions]);
  
  // Process genomic data and earn tokens
  const processGenomicData = useCallback(async (
    sequence: string, 
    isPublic: boolean = false,
    useQuantumEncryption: boolean = true
  ): Promise<ProcessGenomicDataResult> => {
    if (!isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    try {
      // Store the genomic sequence
      const blockchainData = await storeGenomicSequence(
        sequence,
        walletAddress || '0x0',
        {
          isPublic,
          encryptionType: useQuantumEncryption ? 'quantum' : 'standard'
        }
      );
      
      // Calculate token rewards
      const analysis = await analyzeGenomicData(sequence);
      
      const tokenReward = calculateGenomicTokenValue(
        sequence.length,
        analysis.analysis.uniquenessScore,
        blockchainData.accessControl
      );
      
      // Update KTC balance
      setKontourBalance(prevBalance => prevBalance + tokenReward.tokenAmount);
      
      // Refresh transaction history
      loadGenomicTransactions();
      
      return {
        success: true,
        tokens: tokenReward.tokenAmount,
        txId: blockchainData.blockchainTxId
      };
    } catch (error) {
      console.error('Error processing genomic data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [isConnected, walletAddress, loadGenomicTransactions, setKontourBalance]);

  return {
    loadGenomicTransactions,
    processGenomicData
  };
}
