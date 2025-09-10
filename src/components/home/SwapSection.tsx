
import React from "react";
import { SwapCard } from "@/components/swap/SwapCard";
import { ChartAnalysis } from "@/components/charts/ChartAnalysis";
import { TokenPrice } from "@/services/exchangeService";

interface SwapSectionProps {
  prices: TokenPrice[];
  selectedToken: string;
}

export const SwapSection: React.FC<SwapSectionProps> = ({ prices, selectedToken }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center">
      <SwapCard />
      {prices.length > 0 && (
        <div className="w-full max-w-md">
          <ChartAnalysis tokenSymbol={selectedToken} prices={prices} />
        </div>
      )}
    </div>
  );
};
