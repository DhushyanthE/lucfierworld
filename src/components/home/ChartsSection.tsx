
import React from "react";
import { ChartAnalysis } from "@/components/charts/ChartAnalysis";
import { TokenPrice } from "@/services/exchangeService";

interface ChartsSectionProps {
  prices: TokenPrice[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ prices }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {prices.length > 0 && (
        <>
          <ChartAnalysis tokenSymbol="QNTM" prices={prices} />
          <ChartAnalysis tokenSymbol="ETH" prices={prices} />
          <ChartAnalysis tokenSymbol="BTC" prices={prices} />
          <ChartAnalysis tokenSymbol="SOL" prices={prices} />
        </>
      )}
    </div>
  );
};
