
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletService } from '@/services/walletService';
import { toast } from 'sonner';

export type WalletType = 'metamask' | 'walletconnect' | 'phantom' | 'trustwallet';

interface WalletContextProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  currentWallet: WalletType | null;
  balance: string;
  chainId: number;
  connectWallet: (walletType: WalletType) => Promise<boolean>;
  disconnectWallet: () => void;
}

const defaultWalletContext: WalletContextProps = {
  isConnected: false,
  isConnecting: false,
  walletAddress: null,
  currentWallet: null,
  balance: '0',
  chainId: 11155111,
  connectWallet: async () => false,
  disconnectWallet: () => {}
};

const WalletContext = createContext<WalletContextProps>(defaultWalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentWallet, setCurrentWallet] = useState<WalletType | null>(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(11155111);

  useEffect(() => {
    // Try to reconnect on component mount
    const savedWallet = localStorage.getItem('currentWallet');
    if (savedWallet === 'metamask' || savedWallet === 'walletconnect' || 
        savedWallet === 'phantom' || savedWallet === 'trustwallet') {
      connectWallet(savedWallet as WalletType).catch(console.error);
    }
  }, []);

  const connectWallet = async (walletType: WalletType): Promise<boolean> => {
    try {
      setIsConnecting(true);
      
      // Handle different wallet types
      if (walletType === 'metamask') {
        if (!walletService.isMetaMaskAvailable()) {
          toast.error("MetaMask is not installed", {
            description: "Please install MetaMask to continue",
            action: {
              label: "Install",
              onClick: () => window.open("https://metamask.io/download.html", "_blank")
            }
          });
          return false;
        }
        
        try {
          // Request accounts from MetaMask
          const accounts = await window.ethereum?.request({ 
            method: 'eth_requestAccounts' 
          }) as string[];
          
          if (accounts && accounts.length > 0) {
            // Get ETH balance
            const balanceHex = await window.ethereum?.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            }) as string;
            
            // Convert hex balance to decimal and then to ETH units
            const balanceWei = parseInt(balanceHex, 16);
            const balanceEth = balanceWei / 1e18;
            
            // Get chain ID
            const chainIdHex = await window.ethereum?.request({ 
              method: 'eth_chainId' 
            }) as string;
            const chainIdDecimal = parseInt(chainIdHex, 16);
            
            setWalletAddress(accounts[0]);
            setBalance(balanceEth.toFixed(4));
            setChainId(chainIdDecimal);
            setIsConnected(true);
            setCurrentWallet(walletType);
            
            localStorage.setItem('currentWallet', walletType);
            return true;
          }
        } catch (error: any) {
          if (error.code === 4001) {
            // User rejected the connection
            toast.error("Connection rejected by user");
          } else {
            toast.error(`Error connecting to MetaMask: ${error.message || "Unknown error"}`);
          }
          return false;
        }
      } 
      else if (walletType === 'phantom') {
        if (!walletService.isPhantomAvailable()) {
          toast.error("Phantom wallet is not installed", {
            description: "Please install Phantom wallet to continue",
            action: {
              label: "Install",
              onClick: () => window.open("https://phantom.app/download", "_blank")
            }
          });
          return false;
        }
        
        try {
          // Connect to Phantom wallet
          const connection = await window.phantom?.solana?.connect();
          const publicKey = connection.publicKey.toString();
          
          setWalletAddress(publicKey);
          setBalance('0'); // Would need Solana API to get actual balance
          setChainId(101); // Solana chain ID
          setIsConnected(true);
          setCurrentWallet(walletType);
          
          localStorage.setItem('currentWallet', walletType);
          return true;
        } catch (error: any) {
          toast.error(`Error connecting to Phantom: ${error.message || "Unknown error"}`);
          return false;
        }
      }
      else if (walletType === 'trustwallet') {
        if (!window.trustwallet) {
          toast.error("Trust Wallet is not installed", {
            description: "Please install Trust Wallet to continue",
            action: {
              label: "Install",
              onClick: () => window.open("https://trustwallet.com/download", "_blank")
            }
          });
          return false;
        }
        
        try {
          // For demo purposes since Trust Wallet Web SDK interaction would be similar to MetaMask
          // In a real implementation, we would use the Trust Wallet SDK
          if (window.ethereum?.isTrust) {
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            }) as string[];
            
            if (accounts && accounts.length > 0) {
              const balanceHex = await window.ethereum?.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
              }) as string;
              
              const balanceWei = parseInt(balanceHex, 16);
              const balanceEth = balanceWei / 1e18;
              
              const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' }) as string;
              setWalletAddress(accounts[0]);
              setBalance(balanceEth.toFixed(4));
              setChainId(parseInt(chainIdHex, 16));
              setIsConnected(true);
              setCurrentWallet(walletType);
              
              localStorage.setItem('currentWallet', walletType);
              return true;
            }
          } else {
            toast.error("Trust Wallet EVM provider is unavailable", {
              description: "Open this app inside Trust Wallet or enable its EVM browser provider."
            });
            return false;
          }
        } catch (error: any) {
          toast.error(`Error connecting to Trust Wallet: ${error.message || "Unknown error"}`);
          return false;
        }
      }
      else {
        toast.error(`${walletType} connection is not configured`, {
          description: "No wallet address or balance will be simulated."
        });
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };
  
  const disconnectWallet = () => {
    // Handle different wallet disconnections
    if (currentWallet === 'phantom' && window.phantom?.solana) {
      try {
        window.phantom.solana.disconnect();
      } catch (error) {
        console.error("Error disconnecting Phantom wallet:", error);
      }
    }
    
    setIsConnected(false);
    setWalletAddress(null);
    setCurrentWallet(null);
    setBalance('0');
    
    // Clear saved wallet choice
    localStorage.removeItem('currentWallet');
    
    toast.success('Wallet disconnected');
  };

  const value = {
    isConnected,
    isConnecting,
    walletAddress,
    currentWallet,
    balance,
    chainId,
    connectWallet,
    disconnectWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
