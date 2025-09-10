import React from 'react';
import { useWallet } from '@/contexts/wallet-context';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';

export function WalletStatus() {
  const { isConnected, currentWallet, walletAddress, balance } = useWallet();

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Not Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-400">
      <CheckCircle className="h-4 w-4" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {currentWallet?.charAt(0).toUpperCase() + currentWallet?.slice(1)}
        </span>
        <span className="text-xs text-gray-400">
          {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
        </span>
      </div>
    </div>
  );
}