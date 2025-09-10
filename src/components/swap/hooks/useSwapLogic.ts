
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { usePriceUpdates } from "./usePriceUpdates";
import { useTokenSwap } from "./useTokenSwap";
import { useSwapCalculations } from "./useSwapCalculations";

export const tokenData = {
  "ETH": { balance: "1.2345", logo: "ethereum.svg", rate: 10000 },
  "BTC": { balance: "0.0821", logo: "bitcoin.svg", rate: 5000 },
  "USDT": { balance: "5000.00", logo: "tether.svg", rate: 100000 },
  "SOL": { balance: "45.678", logo: "solana.svg", rate: 25000 },
  "QNTM": { balance: "25000.00", logo: "sietk.svg", rate: 1 },
};

export function useSwapLogic() {
  const { isConnected } = useWallet();
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
    isConnected
  };
}
