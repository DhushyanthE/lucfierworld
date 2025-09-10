
import { AlertCircle } from "lucide-react";

interface SwapFooterProps {
  slippage: string;
}

export function SwapFooter({ slippage }: SwapFooterProps) {
  return (
    <div className="mt-4 flex items-start gap-2 text-sm text-gray-400">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p>
        Trades are executed at the best possible price. Slippage tolerance of {slippage}% ensures 
        your trade will go through with minimal price impact. Network fee: $0.0001 per transaction.
      </p>
    </div>
  );
}
