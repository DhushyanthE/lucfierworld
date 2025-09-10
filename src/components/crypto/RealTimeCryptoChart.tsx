
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowUp, ArrowDown, Loader2, Clock, TrendingUp, BarChart3, Activity, Zap, RefreshCw } from "lucide-react";
import { MarketData } from "@/types/market";
import cryptoApiService from "@/services/cryptoApiService";
import { AdvancedAIPredictor } from "@/ai/AdvancedAIPredictor";

interface RealTimeCryptoChartProps {
  tokenSymbol: string;
  showPrediction?: boolean;
  className?: string;
}

export function RealTimeCryptoChart({ tokenSymbol, showPrediction = false, className }: RealTimeCryptoChartProps) {
  const [timeframe, setTimeframe] = useState("7d");
  const [chartType, setChartType] = useState("line");
  const [isLoading, setIsLoading] = useState(true);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [aiPrediction, setAiPrediction] = useState<{ direction: 'up' | 'down', magnitude: number, confidence: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    loadChartData();
    
    // Refresh data every 60 seconds
    const intervalId = setInterval(() => {
      loadChartData(false);
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [tokenSymbol, timeframe]);

  const loadChartData = async (showLoadingState: boolean = true) => {
    if (showLoadingState) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      // Determine days based on timeframe
      let days;
      switch (timeframe) {
        case "24h": days = 1; break;
        case "7d": days = 7; break;
        case "30d": days = 30; break;
        case "90d": days = 90; break;
        default: days = 7;
      }
      
      // Fetch historical data
      const histData = await cryptoApiService.getHistoricalData(tokenSymbol, days);
      setPriceData(formatChartData(histData));
      setVolumeData(formatVolumeData(histData));
      
      // Fetch current price
      const prices = await cryptoApiService.getPrices([tokenSymbol]);
      if (prices.length > 0) {
        const currentTokenData = prices[0];
        setCurrentPrice(currentTokenData.price);
        setPriceChange(currentTokenData.change24h);
        
        // Generate AI prediction if needed
        if (showPrediction) {
          await generateAIPrediction(cryptoApiService.toMarketData(currentTokenData));
        }
      }
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatChartData = (data: MarketData[]): any[] => {
    return data.map(item => ({
      date: new Date(item.timestamp).toISOString().split('T')[0],
      price: item.price,
      volume: item.volume
    }));
  };

  const formatVolumeData = (data: MarketData[]): any[] => {
    return data.map(item => ({
      date: new Date(item.timestamp).toISOString().split('T')[0],
      volume: item.volume
    }));
  };

  const generateAIPrediction = async (marketData: MarketData) => {
    try {
      const aiPredictor = new AdvancedAIPredictor();
      const prediction = await aiPredictor.generatePrediction(marketData);
      setAiPrediction({
        direction: prediction.direction,
        magnitude: prediction.magnitude,
        confidence: prediction.confidence
      });
    } catch (error) {
      console.error("Error generating prediction:", error);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      }).format(value);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') {
      return '';
    }
    
    try {
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, dateStr);
      return '';
    }
  };

  const handleRefresh = () => {
    loadChartData();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-md shadow-lg">
          <p className="text-gray-300">{formatDate(label)}</p>
          <p className="text-white font-medium">
            {formatCurrency(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-gray-300 text-sm">
              Volume: {new Intl.NumberFormat('en-US').format(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getPredictionText = () => {
    if (!aiPrediction) return null;

    const percentChange = (aiPrediction.magnitude * 100).toFixed(2);
    const timeframe = "24h";
    
    return (
      <div className={`flex items-center gap-2 text-sm ${
        aiPrediction.direction === 'up' ? 'text-green-500' : 'text-red-500'
      }`}>
        {aiPrediction.direction === 'up' ? 
          <ArrowUp className="h-4 w-4" /> : 
          <ArrowDown className="h-4 w-4" />
        }
        <span>
          Predicted {aiPrediction.direction === 'up' ? '+' : '-'}{percentChange}% in {timeframe}
          <span className="text-gray-400 text-xs ml-2">({(aiPrediction.confidence * 100).toFixed(0)}% confidence)</span>
        </span>
      </div>
    );
  };

  return (
    <Card className={`bg-black/70 border-purple-500/20 shadow-lg ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <span>{tokenSymbol} Price Chart</span>
            {isRefreshing && <Loader2 className="h-4 w-4 ml-2 animate-spin text-gray-400" />}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh} 
              className="p-1.5 rounded-full hover:bg-gray-800 transition-colors"
              disabled={isLoading || isRefreshing}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <span className="text-lg font-bold">{currentPrice ? formatCurrency(currentPrice) : '--'}</span>
            {priceChange !== 0 && (
              <span className={`flex items-center ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                {Math.abs(priceChange).toFixed(2)}%
              </span>
            )}
          </div>
        </CardTitle>
        {showPrediction && getPredictionText()}
        <div className="flex justify-between items-center">
          <Tabs defaultValue="7d" value={timeframe} onValueChange={setTimeframe} className="w-full">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="24h" className="data-[state=active]:bg-purple-600">
                <Clock className="h-3 w-3 mr-1" />
                24H
              </TabsTrigger>
              <TabsTrigger value="7d" className="data-[state=active]:bg-purple-600">
                <Clock className="h-3 w-3 mr-1" />
                7D
              </TabsTrigger>
              <TabsTrigger value="30d" className="data-[state=active]:bg-purple-600">
                <Clock className="h-3 w-3 mr-1" />
                30D
              </TabsTrigger>
              <TabsTrigger value="90d" className="data-[state=active]:bg-purple-600">
                <Clock className="h-3 w-3 mr-1" />
                90D
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex bg-gray-800 rounded-md p-1">
            <button 
              onClick={() => setChartType("line")} 
              className={`p-1 rounded ${chartType === "line" ? "bg-purple-600" : ""}`}
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setChartType("area")} 
              className={`p-1 rounded ${chartType === "area" ? "bg-purple-600" : ""}`}
            >
              <Activity className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setChartType("bar")} 
              className={`p-1 rounded ${chartType === "bar" ? "bg-purple-600" : ""}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart
                  data={priceData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#d1d5db' }}
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    tick={{ fill: '#d1d5db' }} 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => formatCurrency(value).replace('$', '')} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 8, fill: '#a78bfa' }} 
                  />
                </LineChart>
              ) : chartType === "area" ? (
                <AreaChart
                  data={priceData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#d1d5db' }}
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    tick={{ fill: '#d1d5db' }} 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => formatCurrency(value).replace('$', '')} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={priceData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#d1d5db' }}
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    tick={{ fill: '#d1d5db' }} 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => formatCurrency(value).replace('$', '')} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="price" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Volume (24h)</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#d1d5db' }}
                  tickFormatter={formatDate}
                />
                <YAxis 
                  tick={{ fill: '#d1d5db' }}
                  tickFormatter={(value) => (value / 1000000).toFixed(0) + 'M'} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {showPrediction && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">AI-Powered Market Analysis</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Analysis uses quantum-resistant neural networks to predict price movements based on market factors, 
              volume trends, and pattern recognition across diverse market signals.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
