
import { TokenPrice } from "@/services/exchangeService";

interface SwapDetailsProps {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  tokenData: Record<string, { balance: string; logo: string; rate: number }>;
  prices: TokenPrice[];
}

export function SwapDetails({ fromToken, toToken, fromAmount, tokenData, prices }: SwapDetailsProps) {
  // Calculate price impact 
  const getPriceImpact = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return "<0.01%";
    
    const amount = parseFloat(fromAmount);
    let impact;
    
    // For larger amounts, calculate a more realistic price impact
    if (amount > 1000) {
      impact = 0.05 + (Math.log10(amount) - 3) * 0.03;
      return `${impact.toFixed(2)}%`;
    } else if (amount > 100) {
      return "0.05%";
    } else {
      return "<0.01%";
    }
  };
  
  const priceImpact = getPriceImpact();
  const priceImpactColor = parseFloat(fromAmount) > 1000 ? "text-yellow-400" : "text-green-400";

  // Get the current exchange rate display
  const getCurrentRate = () => {
    const fromP = prices.find(p => p.symbol === fromToken)?.price;
    const toP = prices.find(p => p.symbol === toToken)?.price;
    
    if (fromP && toP) {
      return `1 ${fromToken} = ${(fromP / toP).toFixed(6)} ${toToken}`;
    }
    
    // Fallback to tokenData if prices not loaded yet
    return `1 ${fromToken} = ${(tokenData[fromToken].rate / tokenData[toToken].rate).toFixed(6)} ${toToken}`;
  };

  return (
    <div className="bg-purple-900/20 p-4 rounded-lg space-y-2 border border-purple-500/20">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Rate</span>
        <span className="text-white">{getCurrentRate()}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Network Fee</span>
        <span className="text-white">~$0.0001</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Price Impact</span>
        <span className={priceImpactColor}>{priceImpact}</span>
      </div>
      {prices.length > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">24h Change</span>
          <span className={
            (prices.find(p => p.symbol === toToken)?.change24h || 0) >= 0 
              ? "text-green-400" 
              : "text-red-400"
          }>
            {(prices.find(p => p.symbol === toToken)?.change24h || 0).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
