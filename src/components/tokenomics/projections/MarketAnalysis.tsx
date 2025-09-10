
import React from "react";
import { DollarSign } from "lucide-react";
import { TokenPrice } from "@/services/exchangeService";

interface MarketMetric {
  metric: string;
  value: string;
  isPositive?: boolean;
}

interface MarketAnalysisProps {
  marketAnalysis: MarketMetric[];
  tokenPrices: TokenPrice[];
  isLoading: boolean;
}

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ 
  marketAnalysis, 
  tokenPrices,
  isLoading
}) => {
  return (
    <div>
      <h4 className="text-lg font-medium text-purple-400 mb-4 flex items-center">
        <DollarSign className="mr-2 h-5 w-5" />
        Quantum Coin Real-Time Market Analysis
      </h4>
      
      {tokenPrices.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {marketAnalysis.map((item, index) => (
            <div key={index} className="bg-gray-800/50 p-3 rounded-lg border border-purple-500/10">
              <div className="text-gray-400 text-sm">{item.metric}</div>
              <div className={`text-xl font-bold ${
                item.hasOwnProperty('isPositive') 
                  ? (item.isPositive ? 'text-green-400' : 'text-red-400')
                  : 'text-white'
              }`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 p-4 rounded-lg mb-6 text-gray-400">
          Loading market data...
        </div>
      )}
    </div>
  );
};
