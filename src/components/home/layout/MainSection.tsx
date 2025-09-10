
import React from "react";
import { HomeContent } from "@/components/home/HomeContent";
import { WalletDetailsButton } from "@/components/home/WalletDetailsButton";
import { TokenPrice } from "@/services/exchangeService";

interface MainSectionProps {
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
  onToggleWalletDetails: () => void;
}

export function MainSection({
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
  onConnectWallet,
  onToggleWalletDetails
}: MainSectionProps) {
  return (
    <div className="container mx-auto px-6">
      <HomeContent 
        showSwap={showSwap}
        showAIChat={showAIChat}
        showCharts={showCharts}
        showWalletDetails={showWalletDetails}
        selectedWallet={selectedWallet}
        prices={prices}
        selectedToken={selectedToken}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTrySwap={onTrySwap}
        onConnectWallet={onConnectWallet}
      />
      
      <WalletDetailsButton 
        selectedWallet={selectedWallet}
        onToggleWalletDetails={onToggleWalletDetails}
        onConnectWallet={onConnectWallet}
      />
    </div>
  );
}
