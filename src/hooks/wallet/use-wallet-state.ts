
import { useState, useEffect } from 'react';
import { useWallet as useWalletContext } from '@/contexts/wallet-context';
import { setupAccountChangeListener, setupNetworkChangeListener, isPhantomInstalled, isTrustWalletInstalled } from '@/lib/ethers';
import { QuantumSecurityStatus, GenomicTransactionHistory } from './types';
import { getQuantumSecurityStatus } from '@/lib/quantum/getQuantumSecurityStatus';
import { walletService } from '@/services/walletService';

export function useWalletState() {
  const walletContext = useWalletContext();
  const [quantumSecurity, setQuantumSecurity] = useState<QuantumSecurityStatus | null>(null);
  const [genomicTransactions, setGenomicTransactions] = useState<GenomicTransactionHistory[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [kontourBalance, setKontourBalance] = useState<number>(0);
  
  useEffect(() => {
    if (walletContext.isConnected && walletContext.currentWallet) {
      // Setup appropriate listeners based on wallet type
      let removeAccountListener = () => {};
      let removeNetworkListener = () => {};
      
      if (walletContext.currentWallet === 'metamask') {
        removeAccountListener = setupAccountChangeListener((accounts) => {
          if (accounts.length === 0) {
            walletContext.disconnectWallet();
          } else if (accounts[0] !== walletContext.walletAddress) {
            walletContext.connectWallet('metamask');
          }
        });
        
        removeNetworkListener = setupNetworkChangeListener(() => {
          walletContext.connectWallet('metamask');
        });
      }
      
      // Check quantum security status when wallet is connected
      const checkQuantumSecurity = async () => {
        if (walletContext.walletAddress) {
          try {
            const securityStatus = await getQuantumSecurityStatus(walletContext.walletAddress);
            setQuantumSecurity(securityStatus);
            
            // Load Kontour Coin balance
            await loadWalletData();
          } catch (error) {
            console.error('Error getting quantum security status:', error);
          }
        }
      };
      
      const loadWalletData = async () => {
        try {
          // Simulate loading Kontour Coin balance
          // In a real implementation, this would call the actual balance API
          setKontourBalance(Math.floor(Math.random() * 1000) + 100);
        } catch (error) {
          console.error('Error loading wallet data:', error);
        }
      };
      
      checkQuantumSecurity();
      
      return () => {
        removeAccountListener();
        removeNetworkListener();
      };
    }
  }, [walletContext.isConnected, walletContext.currentWallet, walletContext.walletAddress]);

  return {
    walletContext,
    quantumSecurity,
    genomicTransactions,
    setGenomicTransactions,
    isLoadingTransactions,
    setIsLoadingTransactions,
    kontourBalance,
    setKontourBalance,
    isPhantomInstalled: () => walletService.isPhantomAvailable(),
    isTrustWalletInstalled: () => typeof window !== 'undefined' && !!window.trustwallet
  };
}
