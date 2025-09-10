
import { useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { usePriceUpdates } from "./usePriceUpdates";
import { useTokenSwap } from "./useTokenSwap";
import { useSwapCalculations } from "./useSwapCalculations";

export function getTokenData(isConnected: boolean, balance: string, currentWallet: string | null) {
  return {
    "ETH": { 
      balance: isConnected && currentWallet === 'metamask' ? balance : "0.0000", 
      logo: "ethereum.svg", 
      rate: 10000 
    },
    "BTC": { 
      balance: isConnected ? "0.0821" : "0.0000", 
      logo: "bitcoin.svg", 
      rate: 5000 
    },
    "USDT": { 
      balance: isConnected ? "5000.00" : "0.00", 
      logo: "tether.svg", 
      rate: 100000 
    },
    "SOL": { 
      balance: isConnected && currentWallet === 'phantom' ? "45.678" : "0.000", 
      logo: "solana.svg", 
      rate: 25000 
    },
    "QNTM": { 
      balance: isConnected ? "25000.00" : "0.00", 
      logo: "sietk.svg", 
      rate: 1 
    },
  };
}

export function useSwapLogic() {
  const { isConnected, balance, currentWallet } = useWallet();
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  
  const { prices, isLoadingPrices } = usePriceUpdates();
  const { executeSwap, isLoading } = useTokenSwap();
  const {
    fromAmount,
    setFromAmount,
    toAmount,
    setToAmount,
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    handleFlipTokens
  } = useSwapCalculations(prices);

  const handleSwap = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    return await executeSwap(fromToken, toToken, fromAmount, toAmount);
  };

  const tokenData = getTokenData(isConnected, balance, currentWallet);

  return {
    fromAmount,
    setFromAmount,
    toAmount,
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    slippage,
    setSlippage,
    showSettings,
    setShowSettings,
    isLoading,
    prices,
    isLoadingPrices,
    handleFlipTokens,
    handleSwap,
    isConnected,
    tokenData
  };
}
