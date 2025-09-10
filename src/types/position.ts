
export interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  size: number;
  timestamp: number;
  pnl: number;
  pnlPercentage: number;
  unrealizedPnL?: number;
}
