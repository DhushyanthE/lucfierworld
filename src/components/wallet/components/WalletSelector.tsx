
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, RefreshCw, Wallet, Layers } from "lucide-react";
import { useWallet } from '@/hooks/use-wallet';

interface WalletSelectorProps {
  onConnect: (walletType: string) => void;
  isOpen: boolean;
  onClose: () => void;
  selectedWalletType: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

const wallets = [
  { 
    id: "metamask", 
    name: "MetaMask", 
    icon: "orange", 
    description: "Connect to Ethereum",
    network: "ethereum",
    iconComponent: <div className="bg-orange-500 p-2 rounded-full mr-3"><Wallet className="h-5 w-5 text-white" /></div>
  },
  { 
    id: "phantom", 
    name: "Phantom Wallet", 
    icon: "purple", 
    description: "Connect to Solana",
    network: "solana",
    iconComponent: <div className="bg-purple-500 p-2 rounded-full mr-3"><Wallet className="h-5 w-5 text-white" /></div>
  },
  { 
    id: "trustwallet", 
    name: "Trust Wallet", 
    icon: "blue", 
    description: "Multi-chain wallet",
    network: "multi-chain",
    iconComponent: <div className="bg-blue-500 p-2 rounded-full mr-3"><Layers className="h-5 w-5 text-white" /></div>
  }
];

export function WalletSelector({ 
  onConnect, 
  isOpen, 
  onClose,
  selectedWalletType,
  connectionStatus
}: WalletSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border border-purple-500/30 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              onClick={() => onConnect(wallet.id)}
              className={`flex justify-between items-center w-full bg-gray-800 border-purple-500/30 hover:bg-gray-700 py-6 group transition-all duration-300 ${
                selectedWalletType === wallet.id && connectionStatus === 'connecting' ? 'animate-pulse' : ''
              }`}
              disabled={connectionStatus === 'connecting'}
            >
              <div className="flex items-center">
                {wallet.iconComponent}
                <div className="text-left">
                  <p className="font-medium text-white">{wallet.name}</p>
                  <p className="text-xs text-gray-400">{wallet.description}</p>
                </div>
              </div>
              {connectionStatus === 'connecting' && selectedWalletType === wallet.id ? (
                <RefreshCw className="h-4 w-4 text-purple-400 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
