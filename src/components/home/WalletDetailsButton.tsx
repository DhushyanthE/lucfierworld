
import React from "react";
import { WalletConnect } from "@/components/wallet/WalletConnect";

interface WalletDetailsButtonProps {
  selectedWallet: string | null;
  onToggleWalletDetails: () => void;
  onConnectWallet: (walletType: string) => void;
}

export function WalletDetailsButton({ 
  selectedWallet, 
  onToggleWalletDetails,
  onConnectWallet 
}: WalletDetailsButtonProps) {
  if (!selectedWallet) return null;
  
  return (
    <div className="fixed bottom-20 right-6">
      <button 
        onClick={onToggleWalletDetails}
        className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="View wallet details"
      >
        <WalletConnect onConnect={onConnectWallet} selectedWallet={selectedWallet} />
      </button>
    </div>
  );
}
