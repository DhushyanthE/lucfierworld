
import React from "react";
import { SwapSection } from "@/components/home/SwapSection";
import { ChartsSection } from "@/components/home/ChartsSection";
import { AIChat } from "@/components/chat/AIChat";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { HomeContentSection } from "@/components/home/HomeContentSection";
import { TokenPrice } from "@/services/exchangeService";

interface HomeContentProps {
  showSwap: boolean;
  showAIChat: boolean;
  showCharts: boolean;
  showWalletDetails: boolean;
  selectedWallet: string | null;
  prices: TokenPrice[];
  selectedToken: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTrySwap: () => void;
  onConnectWallet: (walletType: string) => void;
}

export function HomeContent({
  showSwap,
  showAIChat,
  showCharts,
  showWalletDetails,
  selectedWallet,
  prices,
  selectedToken,
  activeTab,
  setActiveTab,
  onTrySwap,
  onConnectWallet
}: HomeContentProps) {
  if (showWalletDetails && selectedWallet) {
    return (
      <div className="flex justify-center">
        <WalletConnect onConnect={onConnectWallet} selectedWallet={selectedWallet} />
      </div>
    );
  }
  
  if (showSwap) {
    return <SwapSection prices={prices} selectedToken={selectedToken} />;
  }
  
  if (showAIChat) {
    return (
      <div className="flex justify-center">
        <AIChat />
      </div>
    );
  }
  
  if (showCharts) {
    return <ChartsSection prices={prices} />;
  }
  
  return (
    <HomeContentSection 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onTrySwap={onTrySwap}
    />
  );
}
