
import React from 'react';
import { RefreshCw, LogOut, Settings, Globe } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ConnectedWalletProps {
  selectedWallet: string;
  balances: { [key: string]: string };
  onRefreshBalance: () => void;
  onDisconnect: () => void;
  isRefreshing: boolean;
  showLanguageSelector: boolean;
  onToggleLanguageSelector: () => void;
  walletAddress: string;
}

export function ConnectedWallet({
  selectedWallet,
  balances,
  onRefreshBalance,
  onDisconnect,
  isRefreshing,
  onToggleLanguageSelector,
  walletAddress
}: ConnectedWalletProps) {
  // Format wallet address for display
  const formattedAddress = walletAddress ? 
    `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` :
    "Not Connected";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-1 bg-purple-900/50 hover:bg-purple-900/70 px-3 py-1.5 rounded-lg border border-purple-500/30 transition-colors">
          <div className={`h-2 w-2 rounded-full ${selectedWallet ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-white text-sm">{selectedWallet || "Not Connected"}</span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 bg-gray-900 border border-purple-500/30 text-white">
        <div className="p-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Connected Wallet</h3>
            <span className="text-xs text-purple-400">{selectedWallet}</span>
          </div>
          
          <div className="mt-1 text-xs text-gray-400 break-all">
            {walletAddress}
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Object.entries(balances).map(([token, amount]) => (
              <div key={token} className="bg-gray-800/50 rounded-md p-2">
                <div className="text-xs text-gray-400">{token}</div>
                <div className="font-medium">{amount}</div>
              </div>
            ))}
          </div>
        </div>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <DropdownMenuItem 
          onClick={onRefreshBalance}
          className="cursor-pointer flex items-center text-gray-300 hover:text-white hover:bg-gray-800"
          disabled={isRefreshing}
        >
          <RefreshCw 
            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin text-purple-500' : ''}`} 
          />
          {isRefreshing ? "Refreshing..." : "Refresh Balance"}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={onToggleLanguageSelector}
          className="cursor-pointer flex items-center text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Globe className="mr-2 h-4 w-4" />
          Language Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => {}}  
          className="cursor-pointer flex items-center text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Settings className="mr-2 h-4 w-4" />
          Wallet Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <DropdownMenuItem 
          onClick={onDisconnect}
          className="cursor-pointer flex items-center text-red-400 hover:text-red-300 hover:bg-gray-800"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
