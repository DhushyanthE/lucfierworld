
/**
 * Ethers integration utilities
 * Provides tools for integrating with Ethereum wallets
 */

import { QuantumSecurityStatus } from '@/hooks/wallet/types';

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && 
         !!window.ethereum && 
         !!window.ethereum.isMetaMask;
}

/**
 * Check if Phantom wallet is installed
 */
export function isPhantomInstalled(): boolean {
  return typeof window !== 'undefined' && 
         !!window.phantom && 
         !!window.phantom.solana;
}

/**
 * Check if Trust wallet is installed
 */
export function isTrustWalletInstalled(): boolean {
  return typeof window !== 'undefined' && 
         (!!window.trustwallet || (!!window.ethereum && !!window.ethereum.isTrust));
}

/**
 * Set up a listener for account changes
 */
export function setupAccountChangeListener(callback: (accounts: string[]) => void): () => void {
  if (typeof window !== 'undefined' && window.ethereum) {
    const handleAccountsChanged = (accounts: string[]) => {
      callback(accounts);
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }
  
  // Return a no-op function if ethereum is not available
  return () => {};
}

/**
 * Set up a listener for network changes
 */
export function setupNetworkChangeListener(callback: () => void): () => void {
  if (typeof window !== 'undefined' && window.ethereum) {
    const handleChainChanged = () => {
      callback();
    };
    
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }
  
  // Return a no-op function if ethereum is not available
  return () => {};
}

/**
 * Assess the quantum security status of a wallet address
 * @param address Wallet address to analyze
 * @returns Quantum security assessment
 */
export async function getQuantumSecurityStatus(address: string): Promise<QuantumSecurityStatus> {
  // In a real implementation, this would analyze the address's cryptographic properties
  // For demo purposes, we generate a simulated security assessment
  
  // Generate random security metrics
  const securityLevel = Math.random();
  
  // Create security status
  const status: QuantumSecurityStatus = {
    isQuantumResistant: securityLevel > 0.6,
    securityLevel: securityLevel > 0.8 ? 'high' : securityLevel > 0.5 ? 'medium' : 'low',
    vulnerabilities: Math.floor((1 - securityLevel) * 10),
    recommendations: []
  };
  
  // Generate recommendations based on security level
  if (securityLevel < 0.5) {
    status.recommendations = [
      'Migrate to a quantum-resistant wallet',
      'Update encryption algorithms to post-quantum standards',
      'Enable quantum secure backup mechanisms'
    ];
  } else if (securityLevel < 0.8) {
    status.recommendations = [
      'Consider upgrading to quantum-resistant signature schemes',
      'Enable quantum entropy sources for key generation'
    ];
  } else {
    status.recommendations = [
      'Your wallet has strong quantum resistance',
      'Continue monitoring for advances in quantum computing'
    ];
  }
  
  return status;
}
