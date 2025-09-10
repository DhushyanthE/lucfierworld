
import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface WalletAddressProps {
  address: string | null;
}

export function WalletAddress({ address }: WalletAddressProps) {
  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard!");
    }
  };

  return (
    <div className="flex items-center">
      {address ? (
        <div 
          onClick={copyToClipboard}
          className="bg-black/20 text-gray-300 px-3 py-1.5 rounded-lg border border-purple-500/20 
                     flex items-center gap-2 cursor-pointer hover:bg-black/40 transition-colors"
        >
          <span className="font-mono">{shortenAddress(address)}</span>
          <Copy className="h-4 w-4 text-gray-500" />
        </div>
      ) : (
        <div className="text-gray-500">No wallet connected</div>
      )}
    </div>
  );
}
