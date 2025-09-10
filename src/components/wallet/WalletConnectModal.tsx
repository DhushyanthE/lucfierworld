
import { useState } from "react";
import { Wallet, CreditCard, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { toast } from "sonner";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { 
    connectWallet, 
    isConnecting, 
    isMetaMaskInstalled, 
    isPhantomInstalled,
    isTrustWalletInstalled 
  } = useWallet();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const handleConnect = async (type: 'metamask' | 'phantom' | 'trustwallet') => {
    setConnectingWallet(type);
    
    try {
      // Check if wallet is installed
      if (type === 'metamask' && !isMetaMaskInstalled()) {
        toast.error("MetaMask is not installed", {
          description: "Please install MetaMask to continue",
          action: {
            label: "Install",
            onClick: () => window.open("https://metamask.io/download.html", "_blank"),
          },
        });
        setConnectingWallet(null);
        return;
      }

      if (type === 'phantom' && !isPhantomInstalled()) {
        toast.error("Phantom wallet is not installed", {
          description: "Please install Phantom wallet to continue",
          action: {
            label: "Install",
            onClick: () => window.open("https://phantom.app/download", "_blank"),
          },
        });
        setConnectingWallet(null);
        return;
      }

      if (type === 'trustwallet' && !isTrustWalletInstalled()) {
        toast.error("Trust Wallet is not installed", {
          description: "Please install Trust Wallet to continue",
          action: {
            label: "Install",
            onClick: () => window.open("https://trustwallet.com/download", "_blank"),
          },
        });
        setConnectingWallet(null);
        return;
      }

      const success = await connectWallet(type);
      if (success) {
        onClose();
        toast.success(`Connected to ${type}`);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black/80 backdrop-blur-sm border border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Connect Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            onClick={() => handleConnect('metamask')}
            className="flex justify-between items-center w-full bg-gray-800 border-purple-500/30 hover:bg-gray-700"
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <div className="bg-orange-500 p-2 rounded-full mr-3">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">MetaMask</p>
                <p className="text-xs text-gray-400">Connect to Ethereum</p>
              </div>
            </div>
            {connectingWallet === 'metamask' && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleConnect('phantom')}
            className="flex justify-between items-center w-full bg-gray-800 border-purple-500/30 hover:bg-gray-700"
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <div className="bg-purple-500 p-2 rounded-full mr-3">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Phantom</p>
                <p className="text-xs text-gray-400">Connect to Solana</p>
              </div>
            </div>
            {connectingWallet === 'phantom' && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleConnect('trustwallet')}
            className="flex justify-between items-center w-full bg-gray-800 border-purple-500/30 hover:bg-gray-700"
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <div className="bg-blue-500 p-2 rounded-full mr-3">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Trust Wallet</p>
                <p className="text-xs text-gray-400">Multi-chain support</p>
              </div>
            </div>
            {connectingWallet === 'trustwallet' && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
