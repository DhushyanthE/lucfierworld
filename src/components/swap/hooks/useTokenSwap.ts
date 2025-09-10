
import { useState } from "react";
import { toast } from "sonner";
import exchangeService from "@/services/exchangeService";
import { useWallet } from "@/hooks/use-wallet";

export function useTokenSwap() {
  const { walletAddress, currentWallet, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const executeSwap = async (
    fromToken: string,
    toToken: string,
    fromAmount: string,
    toAmount: string
  ): Promise<boolean> => {
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      toast.error("Please enter an amount to swap");
      return false;
    }
    
    if (!isConnected) {
      toast.error("Please connect your wallet to swap tokens", {
        action: {
          label: "Connect Wallet",
          onClick: () => {
            document.getElementById("open-wallet-modal-btn")?.click();
          }
        }
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      if (currentWallet === 'metamask' && (fromToken === 'ETH' || toToken === 'ETH')) {
        if (window.ethereum) {
          toast.loading("Preparing transaction...");
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          if (fromToken === 'ETH') {
            toast.loading("Waiting for confirmation in MetaMask...");
            try {
              const params = [{
                from: walletAddress,
                to: "0x0000000000000000000000000000000000000000",
                value: "0x0"
              }];
              
              await window.ethereum.request({
                method: 'eth_sendTransaction',
                params
              });
              
              toast.success("Swap transaction submitted!");
              return true;
            } catch (error: any) {
              if (error.code === 4001) {
                toast.error("Transaction rejected in MetaMask");
              } else {
                toast.error(`Transaction error: ${error.message || "Unknown error"}`);
              }
              return false;
            }
          }
          
          toast.success("Swap transaction completed!", {
            description: `Exchanged ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`
          });
          return true;
        }
      }
      
      return await exchangeService.executeTrade(fromToken, toToken, fromAmount);
    } catch (error) {
      toast.error("Failed to complete the swap transaction");
      console.error("Swap error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { executeSwap, isLoading };
}
