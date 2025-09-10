
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@/contexts/wallet-context';
import { WalletType } from '@/contexts/wallet-context';
import WalletItem from './WalletItem';
import WalletInfo from './WalletInfo';

interface WalletConnectorProps {
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ 
  buttonVariant = 'default'
}) => {
  const { isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConnectWallet = async (walletType: WalletType) => {
    try {
      const success = await connectWallet(walletType);
      if (success) {
        setDialogOpen(false);
        toast.success(`Connected to ${walletType}`);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Connection failed', {
        description: 'Failed to connect to wallet'
      });
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
  };

  // Fast connect function - tries MetaMask first, then Phantom
  const handleFastConnect = async () => {
    // Check for MetaMask first (most common)
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      await handleConnectWallet('metamask');
      return;
    }
    
    // Then check for Phantom
    if (typeof window !== 'undefined' && window.phantom?.solana) {
      await handleConnectWallet('phantom');
      return;
    }
    
    // If neither is available, open the dialog
    setDialogOpen(true);
  };

  return (
    <>
      {isConnected ? (
        <WalletInfo onDisconnect={handleDisconnectWallet} />
      ) : (
        <div className="flex gap-2">
          {/* Fast Connect Button */}
          <Button 
            onClick={handleFastConnect}
            variant="default" 
            disabled={isConnecting} 
            className="px-4 py-2 h-10 bg-purple-600 hover:bg-purple-700"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Quick Connect
              </>
            )}
          </Button>

          {/* Regular Connect Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isConnecting} className="px-3 py-2 h-10">
                More
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-black/70 border-purple-500/20 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-center text-lg font-semibold text-white">
                  Connect Wallet
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 mt-4">
                <WalletItem 
                  name="MetaMask" 
                  icon="/icons/metamask-icon.png" 
                  onClick={() => handleConnectWallet('metamask')}
                />
                <WalletItem 
                  name="Trust Wallet" 
                  icon="/icons/trustwallet-icon.png" 
                  onClick={() => handleConnectWallet('trustwallet')}
                />
                <WalletItem 
                  name="Phantom" 
                  icon="/icons/phantom-icon.png" 
                  onClick={() => handleConnectWallet('phantom')}
                />
                <WalletItem 
                  name="WalletConnect" 
                  icon="/icons/walletconnect-icon.png" 
                  onClick={() => handleConnectWallet('walletconnect')}
                  disabled={true}
                  tooltip="Coming soon"
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                Connect your wallet to access quantum network features
              </p>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default WalletConnector;
