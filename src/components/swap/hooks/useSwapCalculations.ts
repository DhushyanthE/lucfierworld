
import { useState, useEffect } from "react";
import { TokenPrice } from "@/services/exchangeService";

export function useSwapCalculations(prices: TokenPrice[]) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("QNTM");

  useEffect(() => {
    if (fromAmount && fromAmount !== "0" && prices.length > 0) {
      const fromPrice = prices.find(p => p.symbol === fromToken)?.price;
      const toPrice = prices.find(p => p.symbol === toToken)?.price;
      
      if (fromPrice && toPrice) {
        const conversionRate = fromPrice / toPrice;
        const calculatedAmount = (parseFloat(fromAmount) * conversionRate).toFixed(6);
        setToAmount(calculatedAmount);
      }
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken, prices]);

  const handleFlipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return {
    fromAmount,
    setFromAmount,
    toAmount,
    setToAmount,
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    handleFlipTokens
  };
}
