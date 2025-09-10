
import React from "react";
import { TokenPrice } from "@/services/exchangeService";

interface ComparativeAnalysisProps {
  tokenPrices: TokenPrice[];
}

export const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({ tokenPrices }) => {
  return (
    <div>
      <h4 className="text-lg font-medium text-purple-400 mt-6 mb-3">Comparative Analysis</h4>
      {tokenPrices.length > 0 ? (
        <div className="space-y-3">
          {['BTC', 'ETH', 'SOL'].map((symbol) => {
            const tokenData = tokenPrices.find(p => p.symbol === symbol);
            return tokenData ? (
              <div key={symbol} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center">
                  <div className="text-white font-medium">{symbol}</div>
                  <div className="text-gray-400 ml-2 text-sm">${tokenData.price.toFixed(2)}</div>
                </div>
                <div className={`flex items-center ${
                  tokenData.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tokenData.change24h.toFixed(2)}%
                </div>
              </div>
            ) : null;
          })}
        </div>
      ) : (
        <div className="bg-gray-800/50 p-4 rounded-lg text-gray-400">
          Loading comparison data...
        </div>
      )}
    </div>
  );
};
