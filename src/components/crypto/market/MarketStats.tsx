
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MarketStats as MarketStatsType } from "@/services/cryptoApiService";
import { formatCurrencyWithSuffix, formatPercentage } from "@/lib/formatters";

interface MarketStatsProps {
  marketStats: MarketStatsType | null;
}

export function MarketStats({ marketStats }: MarketStatsProps) {
  return (
    <Card className="bg-gray-900/50 border-purple-500/20">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-white mb-4">Market Overview</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/80 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Total Market Cap</div>
              <div className="text-xl font-bold text-white">{formatCurrencyWithSuffix(marketStats?.totalMarketCap)}</div>
            </div>
            <div className="bg-gray-800/80 p-4 rounded-lg">
              <div className="text-sm text-gray-400">24h Volume</div>
              <div className="text-xl font-bold text-white">{formatCurrencyWithSuffix(marketStats?.totalVolume24h)}</div>
            </div>
            <div className="bg-gray-800/80 p-4 rounded-lg">
              <div className="text-sm text-gray-400">BTC Dominance</div>
              <div className="text-xl font-bold text-white">{formatPercentage(marketStats?.btcDominance || 0)}</div>
            </div>
            <div className="bg-gray-800/80 p-4 rounded-lg">
              <div className="text-sm text-gray-400">ETH Dominance</div>
              <div className="text-xl font-bold text-white">{formatPercentage(marketStats?.ethDominance || 0)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

