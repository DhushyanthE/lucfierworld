import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RealTimeCryptoChart } from "./RealTimeCryptoChart";
import { QuantumAnalysisDashboard } from "./QuantumAnalysisDashboard";
import { MarketOverview } from "./MarketOverview";
import cryptoApiService, { CryptoPrice } from "@/services/cryptoApiService";
import { useCryptoWebSocket } from "@/hooks/useCryptoWebSocket";
import { Loader2, Wifi, WifiOff, RefreshCw, TrendingUp, TrendingDown, Zap } from "lucide-react";

interface MarketDashboardProps {
  onConnectWallet?: () => void;
}

export function MarketDashboard({ onConnectWallet }: MarketDashboardProps) {
  const [activeTab, setActiveTab] = useState("charts");
  const [selectedToken, setSelectedToken] = useState("QNTM");
  const [fallbackTokens, setFallbackTokens] = useState<CryptoPrice[]>([]);
  const [isLoadingFallback, setIsLoadingFallback] = useState(true);

  // Real-time WebSocket connection
  const {
    isConnected,
    isConnecting,
    prices: wsPrices,
    priceHistory,
    lastUpdate,
    updateCount,
    source,
    error,
    connect,
    disconnect,
    requestRefresh
  } = useCryptoWebSocket();

  // Convert WebSocket prices to CryptoPrice format
  const tokens: CryptoPrice[] = useMemo(() => {
    if (wsPrices.length > 0) {
      return wsPrices.map(p => ({
        symbol: p.symbol,
        price: p.price,
        change24h: p.percentChange24h,
        volume24h: p.volume24h,
        marketCap: p.marketCap,
        lastUpdated: lastUpdate?.toISOString() || new Date().toISOString()
      }));
    }
    return fallbackTokens;
  }, [wsPrices, fallbackTokens, lastUpdate]);

  // Fallback data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingFallback(true);
      try {
        const prices = await cryptoApiService.getPrices(['BTC', 'ETH', 'SOL', 'QNTM']);
        setFallbackTokens(prices);
      } catch (error) {
        console.error("Error fetching token data:", error);
      } finally {
        setIsLoadingFallback(false);
      }
    };

    fetchData();
    // Only use interval as fallback when not connected
    const intervalId = setInterval(() => {
      if (!isConnected) {
        fetchData();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [isConnected]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  const isLoading = isLoadingFallback && !isConnected && tokens.length === 0;

  // Get price change indicator for a token
  const getPriceChange = (symbol: string) => {
    const history = priceHistory.get(symbol);
    if (!history || history.length < 2) return null;
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    return ((current - previous) / previous) * 100;
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              Crypto Market Analysis
              {isConnected && (
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                  <Zap className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-400">
                    Real-time • {updateCount} updates • {source === 'live' ? 'Live API' : source === 'cache' ? 'Cached' : 'Simulated'}
                  </span>
                </>
              ) : isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                  <span className="text-yellow-400">Connecting to real-time feed...</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-400">
                    {error || 'Using polling updates (60s interval)'}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestRefresh}
                  className="border-purple-500/50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                >
                  <WifiOff className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={connect}
                disabled={isConnecting}
                className="border-green-500/50 text-green-400 hover:bg-green-500/20"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Wifi className="h-4 w-4 mr-1" />
                )}
                Connect Live
              </Button>
            )}
          </div>
        </div>

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
                {tokens.slice(0, 8).map(token => {
                  const priceChange = getPriceChange(token.symbol);
                  return (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token.symbol)}
                      className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
                        selectedToken === token.symbol 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>{token.symbol}</span>
                      {priceChange !== null && (
                        <span className={`text-xs flex items-center ${
                          priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {priceChange >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
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
