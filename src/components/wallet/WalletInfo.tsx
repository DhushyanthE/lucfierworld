
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Copy, 
  LogOut,
  Check,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/use-wallet';

interface WalletInfoProps {
  onDisconnect: () => void;
}

export default function WalletInfo({ onDisconnect }: WalletInfoProps) {
  const { walletAddress, currentWallet, balance } = useWallet();
  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    
    navigator.clipboard.writeText(walletAddress)
      .then(() => {
        setCopied(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy address:', err);
        toast.error('Failed to copy address');
      });
  };
  
  const getWalletIcon = () => {
    if (currentWallet === 'metamask') {
      return '/icons/metamask-icon.png';
    } else if (currentWallet === 'walletconnect') {
      return '/icons/walletconnect-icon.png';
    } else if (currentWallet === 'phantom') {
      return '/icons/phantom-icon.png';
    } else if (currentWallet === 'trustwallet') {
      return '/icons/trustwallet-icon.png';
    }
    return '/icons/metamask-icon.png'; // Default
  };
  
  const getWalletName = () => {
    if (currentWallet === 'metamask') return 'MetaMask';
    if (currentWallet === 'walletconnect') return 'WalletConnect';
    if (currentWallet === 'phantom') return 'Phantom';
    if (currentWallet === 'trustwallet') return 'Trust Wallet';
    return 'Wallet';
  };
  
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const getExplorerUrl = () => {
    if (!walletAddress) return '#';
    return `https://etherscan.io/address/${walletAddress}`;
  };

  return (
    <div className="bg-gray-900/60 border border-purple-500/20 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-800 mr-3">
            <img src={getWalletIcon()} alt={getWalletName()} className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{getWalletName()}</div>
            <div className="text-xs text-gray-400">Connected</div>
          </div>
        </div>
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDisconnect}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Disconnect
          </Button>
        </div>
      </div>
      
      <div className="mt-3 bg-gray-800/40 rounded p-2 flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-4 w-4 text-purple-400 mr-2" />
          <span className="text-sm text-gray-300 font-mono">
            {walletAddress ? shortenAddress(walletAddress) : '0x0000...0000'}
          </span>
        </div>
        <div className="flex">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"
            onClick={handleCopyAddress}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <a 
            href={getExplorerUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="h-6 w-6 p-0 inline-flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-md ml-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="text-xs text-gray-400">Balance</div>
        <div className="text-lg font-medium text-white">{balance} ETH</div>
      </div>
    </div>
  );
}
