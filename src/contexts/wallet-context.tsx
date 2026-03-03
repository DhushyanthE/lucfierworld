
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
  chainId: 1,
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
  const [chainId, setChainId] = useState(1);

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
              
              setWalletAddress(accounts[0]);
              setBalance(balanceEth.toFixed(4));
              setChainId(1); // Default to ETH mainnet
              setIsConnected(true);
              setCurrentWallet(walletType);
              
              localStorage.setItem('currentWallet', walletType);
              return true;
            }
          } else {
            // Fallback to mock connection for demo purposes
            const mockAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
            const mockBalance = (Math.random() * 10).toFixed(4);
            
            setWalletAddress(mockAddress);
            setBalance(mockBalance);
            setChainId(1);
            setIsConnected(true);
            setCurrentWallet(walletType);
            
            localStorage.setItem('currentWallet', walletType);
            toast.success("Connected to Trust Wallet (Demo Mode)");
            return true;
          }
        } catch (error: any) {
          toast.error(`Error connecting to Trust Wallet: ${error.message || "Unknown error"}`);
          return false;
        }
      }
      else {
        // For demo or other wallet types
        // Simulate a connection
        const mockAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const mockBalance = (Math.random() * 10).toFixed(4);
        
        setIsConnected(true);
        setWalletAddress(mockAddress);
        setCurrentWallet(walletType);
        setBalance(mockBalance);
        setChainId(1); // Ethereum mainnet
        
        localStorage.setItem('currentWallet', walletType);
        return true;
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
