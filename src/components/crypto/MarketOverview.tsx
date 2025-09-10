
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoPrice, MarketStats as MarketStatsType } from "@/services/cryptoApiService";
import cryptoApiService from "@/services/cryptoApiService";
import { MarketStats } from "./market/MarketStats";
import { MarketCapDistribution } from "./market/MarketCapDistribution";
import { PerformanceChart } from "./market/PerformanceChart";
import { TokenTable } from "./market/TokenTable";

interface MarketOverviewProps {
  tokens: CryptoPrice[];
}

export function MarketOverview({ tokens }: MarketOverviewProps) {
  const [marketStats, setMarketStats] = useState<MarketStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchMarketStats = async () => {
      setIsLoading(true);
      try {
        const stats = await cryptoApiService.getMarketStats();
        setMarketStats(stats);
      } catch (error) {
        console.error("Error fetching market stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Fixed the Tabs component to ensure proper context is established
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Market Overview</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        {marketStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MarketStats marketStats={marketStats} />
            <MarketCapDistribution marketStats={marketStats} />
            <PerformanceChart tokens={tokens} />
            <TokenTable tokens={tokens} />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
