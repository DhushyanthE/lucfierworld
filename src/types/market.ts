
// Update the existing market.ts file to include AI prediction types

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export interface AIPrediction {
  symbol: string;
  direction: 'up' | 'down';
  magnitude: number;  // percentage as decimal, e.g. 0.05 for 5%
  confidence: number; // 0-1 range
  timestamp: number;
  timeframe: string;  // e.g. "1h", "4h", "1d"
}

export interface AIAnalysisResult {
  prediction: AIPrediction;
  supportingFactors: string[];
  riskScore: number; // 0-100
  volatilityMeasure: number; // 0-1
  technicalIndicators: {
    name: string;
    value: number;
    signal: 'buy' | 'sell' | 'neutral';
  }[];
}

export interface MarketTrend {
  direction: 'bullish' | 'bearish' | 'sideways';
  strength: number; // 0-1
  duration: string;
  description: string;
}

export interface QuantumAIMetric {
  name: string;
  value: number;
  change: number;
  unit: string;
  timestamp: number;
}
