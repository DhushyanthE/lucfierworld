
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { WalletSelector } from "./components/WalletSelector";
import { ConnectedWallet } from "./components/ConnectedWallet";
import { LanguagePicker } from "./components/LanguagePicker";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";

interface WalletProps {
  onConnect: (walletType: string) => void;
  selectedWallet: string | null;
}

export function WalletConnect({ onConnect, selectedWallet }: WalletProps) {
  const { isConnected, balance, walletAddress } = useWallet();
  const [open, setOpen] = useState(false);
  const [balances, setBalances] = useState({
    QNTM: "25000.00",
    ETH: "1.2345",
    BTC: "0.0821",
    SOL: "45.678",
    USDT: "5000.00"
  });
  const [showBalances, setShowBalances] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>(
    isConnected ? 'connected' : 'disconnected'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<string | null>(selectedWallet);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Sync with wallet context
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
      setShowBalances(true);
      if (balance) {
        setBalances(prev => ({
          ...prev,
          ETH: balance
        }));
      }
    } else {
      setConnectionStatus('disconnected');
      setShowBalances(false);
    }
  }, [isConnected, balance]);

  const handleConnect = async (walletType: string) => {
    setConnectionStatus('connecting');
    setSelectedWalletType(walletType);
    
    try {
      onConnect(walletType);
      
      // The real connection happens in the wallet context
      // Here we just update UI state
      setTimeout(() => {
        if (isConnected) {
          setOpen(false);
          setConnectionStatus('connected');
          setShowBalances(true);
          toast.success(`Connected successfully to ${walletType}`);
        }
      }, 500);
    } catch (error) {
      console.error("Wallet connection error:", error);
      setConnectionStatus('disconnected');
      toast.error("Failed to connect wallet");
    }
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setShowBalances(false);
    setSelectedWalletType(null);
    onConnect('');
    toast.success("Disconnected successfully");
  };

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      setBalances(prev => ({
        ...prev,
        QNTM: (parseFloat(prev.QNTM) + (Math.random() * 10 - 5)).toFixed(2),
        ETH: balance || (parseFloat(prev.ETH) + (Math.random() * 0.05 - 0.025)).toFixed(4),
        BTC: (parseFloat(prev.BTC) + (Math.random() * 0.005 - 0.0025)).toFixed(4),
        SOL: (parseFloat(prev.SOL) + (Math.random() * 0.5 - 0.25)).toFixed(3),
        USDT: (parseFloat(prev.USDT) + (Math.random() * 10 - 5)).toFixed(2)
      }));
      setIsRefreshing(false);
      toast.success("Balance refreshed successfully");
    }, 1500);
  };

  if (!selectedWallet && !isConnected) {
    return (
      <>
        <Button 
          onClick={() => setOpen(true)}
          className="bg-black/40 hover:bg-black/60 text-white border border-purple-500/30 transition-all duration-300 hover:scale-105"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>

        <WalletSelector
          isOpen={open}
          onClose={() => setOpen(false)}
          onConnect={handleConnect}
          selectedWalletType={selectedWalletType}
          connectionStatus={connectionStatus}
        />
      </>
    );
  }

  return (
    <>
      <ConnectedWallet
        selectedWallet={selectedWallet || ''}
        balances={balances}
        onRefreshBalance={handleRefreshBalance}
        onDisconnect={handleDisconnect}
        isRefreshing={isRefreshing}
        showLanguageSelector={showLanguageSelector}
        onToggleLanguageSelector={() => setShowLanguageSelector(!showLanguageSelector)}
        walletAddress={walletAddress || ''}
      />
      
      <LanguagePicker
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        showSelector={showLanguageSelector}
        onToggleSelector={() => setShowLanguageSelector(!showLanguageSelector)}
      />
    </>
  );
}
