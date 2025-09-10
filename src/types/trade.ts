
export interface TradeSignal {
  type: 'BUY' | 'SELL';
  symbol: string;
  price: number;
  confidence: number;
  timestamp: number;
  error?: string; // Add optional error field to handle API errors
}

// Add a new interface for fallback/offline trading data
export interface TradeAnalysis {
  marketTrend: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}
