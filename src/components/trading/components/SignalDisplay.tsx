
import React from 'react';
import { TradeSignal } from '@/types/trade';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SignalDisplayProps {
  signal: TradeSignal;
  isOfflineMode: boolean;
}

export function SignalDisplay({ signal, isOfflineMode }: SignalDisplayProps) {
  return (
    <div className="mt-4 p-4 bg-white rounded-md border border-gray-200 shadow-sm">
      <h3 className="text-gray-800 font-medium mb-2 flex items-center">
        {signal.type === 'BUY' ? (
          <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
        ) : (
          <TrendingDown className="mr-2 h-5 w-5 text-red-500" />
        )}
        Trading Signal {isOfflineMode && <span className="text-xs ml-2 text-gray-500">(Offline Generated)</span>}
      </h3>
      <div className="space-y-2">
        <p className="flex justify-between">
          <span className="text-gray-600">Action:</span> 
          <Badge className={signal.type === 'BUY' ? "bg-green-500" : "bg-red-500"}>
            {signal.type}
          </Badge>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-600">Symbol:</span> 
          <span className="text-gray-800 font-medium">{signal.symbol}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-600">Price:</span> 
          <span className="text-gray-800 font-medium">${signal.price.toFixed(2)}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-600">Confidence:</span> 
          <span className="text-gray-800 font-medium">{(signal.confidence * 100).toFixed(1)}%</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-600">Timestamp:</span> 
          <span className="text-gray-800 font-medium">{new Date(signal.timestamp).toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
