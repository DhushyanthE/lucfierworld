
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RealTimeCryptoChart } from "./RealTimeCryptoChart";
import { QuantumAnalysisDashboard } from "./QuantumAnalysisDashboard";
import { MarketOverview } from "./MarketOverview";
import cryptoApiService, { CryptoPrice } from "@/services/cryptoApiService";
import { Loader2 } from "lucide-react";

interface MarketDashboardProps {
  onConnectWallet?: () => void;
}

export function MarketDashboard({ onConnectWallet }: MarketDashboardProps) {
  const [activeTab, setActiveTab] = useState("charts");
  const [selectedToken, setSelectedToken] = useState("QNTM");
  const [tokens, setTokens] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const prices = await cryptoApiService.getPrices(['BTC', 'ETH', 'SOL', 'QNTM']);
        setTokens(prices);
      } catch (error) {
        console.error("Error fetching token data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Crypto Market Analysis</CardTitle>
        <Tabs defaultValue="charts" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800 w-full justify-start">
            <TabsTrigger value="charts" className="data-[state=active]:bg-purple-600">
              Charts
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-purple-600">
              Market Overview
            </TabsTrigger>
            <TabsTrigger value="quantum" className="data-[state=active]:bg-purple-600">
              Quantum Analysis
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            <TabsContent value="charts" className="mt-0">
              <div className="mb-4 flex flex-wrap gap-2">
                {tokens.map(token => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol)}
                    className={`px-3 py-1.5 rounded-md ${
                      selectedToken === token.symbol 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {token.symbol}
                  </button>
                ))}
              </div>
              <RealTimeCryptoChart tokenSymbol={selectedToken} showPrediction={true} />
            </TabsContent>
            
            <TabsContent value="market" className="mt-0">
              <MarketOverview tokens={tokens} />
            </TabsContent>
            
            <TabsContent value="quantum" className="mt-0">
              <QuantumAnalysisDashboard selectedToken={selectedToken} tokens={tokens} />
            </TabsContent>
          </>
        )}
      </CardContent>
    </Card>
  );
}
