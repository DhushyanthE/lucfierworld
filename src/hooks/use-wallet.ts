
import { isMetaMaskInstalled } from '@/lib/ethers';
import { useWalletState } from './wallet/use-wallet-state';
import { useGenomicTransactions } from './wallet/use-genomic-transactions';
import { useTokenTransfers } from './wallet/use-token-transfers';
import { 
  QuantumSecurityStatus, 
  GenomicTransactionHistory, 
  ProcessGenomicDataResult,
  TransferKontourTokensResult 
} from './wallet/types';

// Re-export types for external usage
export type { 
  QuantumSecurityStatus, 
  GenomicTransactionHistory,
  ProcessGenomicDataResult,
  TransferKontourTokensResult 
};

export interface UseWalletReturn {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  currentWallet: string | null;
  balance: string;
  chainId: number;
  connectWallet: (walletType: string) => Promise<boolean>;
  disconnectWallet: () => void;
  isMetaMaskInstalled: () => boolean;
  isPhantomInstalled: () => boolean;
  isTrustWalletInstalled: () => boolean;
  quantumSecurity: QuantumSecurityStatus | null;
  genomicTransactions: GenomicTransactionHistory[];
  isLoadingTransactions: boolean;
  kontourBalance: number;
  loadGenomicTransactions: () => Promise<GenomicTransactionHistory[]>;
  processGenomicData: (sequence: string, isPublic?: boolean, useQuantumEncryption?: boolean) => Promise<ProcessGenomicDataResult>;
  transferKontourTokens: (recipient: string, amount: number) => Promise<TransferKontourTokensResult>;
}

export function useWallet(): UseWalletReturn {
  // Get wallet state (context, quantum security, balance, etc.)
  const {
    walletContext,
    quantumSecurity,
    genomicTransactions,
    setGenomicTransactions,
    isLoadingTransactions,
    setIsLoadingTransactions,
    kontourBalance,
    setKontourBalance,
    isPhantomInstalled,
    isTrustWalletInstalled
  } = useWalletState();
  
  // Get genomic transaction functions
  const {
    loadGenomicTransactions,
    processGenomicData
  } = useGenomicTransactions(
    walletContext.walletAddress,
    walletContext.isConnected,
    setGenomicTransactions,
    setIsLoadingTransactions,
    setKontourBalance
  );
  
  // Get token transfer functions
  const { transferKontourTokens } = useTokenTransfers(
    walletContext.walletAddress,
    walletContext.isConnected,
    kontourBalance,
    setKontourBalance,
    loadGenomicTransactions
  );

  return {
    ...walletContext,
    isMetaMaskInstalled,
    isPhantomInstalled,
    isTrustWalletInstalled,
    quantumSecurity,
    genomicTransactions,
    isLoadingTransactions,
    kontourBalance,
    loadGenomicTransactions,
    processGenomicData,
    transferKontourTokens
  };
}
