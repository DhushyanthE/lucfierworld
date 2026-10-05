import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RealTimeCryptoChart } from "./RealTimeCryptoChart";
import { QuantumAnalysisDashboard } from "./QuantumAnalysisDashboard";
import { MarketOverview } from "./MarketOverview";
import { EnhancedPriceAlerts } from "./EnhancedPriceAlerts";
import { EnhancedPortfolioTracker } from "./EnhancedPortfolioTracker";
import { HistoricalPerformanceChart } from "./HistoricalPerformanceChart";
import { Watchlist } from "./Watchlist";
import { DharmicConsensusPanel } from "./DharmicConsensusPanel";
import cryptoApiService, { CryptoPrice } from "@/services/cryptoApiService";
import { useCryptoWebSocket } from "@/hooks/useCryptoWebSocket";
import { usePortfolio } from "@/hooks/usePortfolio";
import { SERVICE_URLS } from "@/config/env";
import { Loader2, Wifi, WifiOff, RefreshCw, TrendingUp, TrendingDown, Zap, Bell, Briefcase, ChartLine, Star } from "lucide-react";

type LvthMarket = {
  configured: boolean;
  contract?: string;
  network?: string;
  price_eth_per_lvth?: string;
  reserve_lvth?: string;
  reserve_eth?: string;
  cumulative_volume_lvth?: string;
  cumulative_volume_eth?: string;
  explorer_url?: string | null;
};

interface MarketDashboardProps {
  onConnectWallet?: () => void;
}

export function MarketDashboard({ onConnectWallet }: MarketDashboardProps) {
  const [activeTab, setActiveTab] = useState("charts");
  const [selectedToken, setSelectedToken] = useState("QNTM");
  const [fallbackTokens, setFallbackTokens] = useState<CryptoPrice[]>([]);
  const [isLoadingFallback, setIsLoadingFallback] = useState(true);
  const [lvthMarket, setLvthMarket] = useState<LvthMarket | null>(null);

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

  // Portfolio data for snapshots
  const { portfolioSummary } = usePortfolio(tokens);

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

  // LVTH market is read directly from the deployed LeviathanCoin AMM.
  useEffect(() => {
    if (!SERVICE_URLS.FUNCTIONS_BASE) return;
    let cancelled = false;
    const loadLvth = async () => {
      try {
        const response = await fetch(`${SERVICE_URLS.FUNCTIONS_BASE}/leviathan-chain/market`, { cache: "no-store" });
        const data = await response.json();
        if (!cancelled && response.ok) setLvthMarket(data as LvthMarket);
      } catch {
        if (!cancelled) setLvthMarket(null);
      }
    };
    void loadLvth();
    const id = window.setInterval(() => void loadLvth(), 15_000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

        {lvthMarket?.configured && (
          <div className="grid gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-sm sm:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">LVTH / ETH</div>
              <div className="font-semibold text-white">{lvthMarket.price_eth_per_lvth ?? "0"} ETH</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">LVTH reserve</div>
              <div className="font-semibold text-white">{lvthMarket.reserve_lvth ?? "0"} LVTH</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Cumulative volume</div>
              <div className="font-semibold text-white">{lvthMarket.cumulative_volume_lvth ?? "0"} LVTH</div>
              <div className="text-xs text-muted-foreground">{lvthMarket.cumulative_volume_eth ?? "0"} ETH</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{lvthMarket.network ?? "chain"}</div>
              {lvthMarket.explorer_url ? (
                <a href={lvthMarket.explorer_url} target="_blank" rel="noreferrer" className="text-purple-300 underline">
                  Contract explorer
                </a>
              ) : <span className="text-muted-foreground">Explorer unavailable</span>}
            </div>
          </div>
        )}

        <div className="w-full">
          <TabsList className="bg-gray-800 w-full justify-start flex-wrap">
            <TabsTrigger value="charts" className="data-[state=active]:bg-purple-600">
              Charts
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-purple-600">
              Market Overview
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-purple-600">
              <Briefcase className="h-4 w-4 mr-1" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-600">
              <Bell className="h-4 w-4 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
              <ChartLine className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-purple-600">
              <Star className="h-4 w-4 mr-1" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="dharmic" className="data-[state=active]:bg-purple-600">
              Dharmic Rounds
            </TabsTrigger>
            <TabsTrigger value="quantum" className="data-[state=active]:bg-purple-600">
              Quantum Analysis
            </TabsTrigger>
          </TabsList>
        </div>
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
            
            <TabsContent value="portfolio" className="mt-0">
              <EnhancedPortfolioTracker 
                currentPrices={tokens} 
                availableSymbols={tokens.map(t => t.symbol)} 
              />
            </TabsContent>
            
            <TabsContent value="alerts" className="mt-0">
              <EnhancedPriceAlerts 
                currentPrices={tokens} 
                availableSymbols={tokens.map(t => t.symbol)} 
              />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <HistoricalPerformanceChart 
                currentPrices={tokens}
                portfolioSummary={portfolioSummary}
              />
            </TabsContent>
            
            <TabsContent value="watchlist" className="mt-0">
              <Watchlist 
                currentPrices={tokens}
                availableSymbols={tokens.map(t => t.symbol)}
                onSelectToken={setSelectedToken}
              />
            </TabsContent>

            <TabsContent value="dharmic" className="mt-0">
              <DharmicConsensusPanel />
            </TabsContent>

            <TabsContent value="quantum" className="mt-0">
              <QuantumAnalysisDashboard selectedToken={selectedToken} tokens={tokens} />
            </TabsContent>
          </>
        )}
      </CardContent>
    </Card>
    </Tabs>
  );
}
