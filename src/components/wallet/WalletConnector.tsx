
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

  return (
    <>
      {isConnected ? (
        <WalletInfo onDisconnect={handleDisconnectWallet} />
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant={buttonVariant} disabled={isConnecting} className="px-4 py-2 h-10">
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </>
              )}
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
      )}
    </>
  );
};

export default WalletConnector;
