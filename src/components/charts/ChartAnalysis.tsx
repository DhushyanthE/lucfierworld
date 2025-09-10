import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown, Loader2, Clock, TrendingUp, BarChart3, Activity } from "lucide-react";
import { TokenPrice } from "@/services/exchangeService";

interface ChartAnalysisProps {
  tokenSymbol: string;
  prices: TokenPrice[];
}

// Sample price history data - in a real app, this would come from an API
const generatePriceHistory = (basePrice: number, days: number) => {
  const data = [];
  const volatility = basePrice * 0.05; // 5% volatility

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Generate price with some random movement but with a trend
    const randomChange = (Math.random() - 0.48) * volatility;
    const trendFactor = 1 + (days - i) * 0.005; // Slight upward trend
    
    const price = i === days 
      ? basePrice 
      : data[data.length - 1].price + randomChange;
    
    data.push({
      date: dateString,
      price: price * trendFactor,
      volume: Math.round(price * (1000 + Math.random() * 5000)),
    });
  }
  
  return data;
};

// Generate volume data
const generateVolumeData = (priceData: any[]) => {
  return priceData.map(day => ({
    date: day.date,
    volume: day.volume
  }));
};

export function ChartAnalysis({ tokenSymbol, prices }: ChartAnalysisProps) {
  const [timeframe, setTimeframe] = useState("7d");
  const [chartType, setChartType] = useState("line");
  const [isLoading, setIsLoading] = useState(true);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  
  const currentPrice = prices.find(p => p.symbol === tokenSymbol)?.price || 0;
  const priceChange = prices.find(p => p.symbol === tokenSymbol)?.change24h || 0;
  
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      let days;
      switch (timeframe) {
        case "24h": days = 1; break;
        case "7d": days = 7; break;
        case "30d": days = 30; break;
        case "90d": days = 90; break;
        default: days = 7;
      }
      
      const data = generatePriceHistory(currentPrice, days);
      setPriceData(data);
      setVolumeData(generateVolumeData(data));
      setIsLoading(false);
    }, 1000);
  }, [timeframe, tokenSymbol, currentPrice]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    // Fix: Check if dateStr is valid before creating a Date object
    if (!dateStr || typeof dateStr !== 'string') {
      return '';
    }
    
    try {
      const date = new Date(dateStr);
      
      // Verify that the date is valid
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

  // Custom tooltip for charts
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

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{tokenSymbol} Price Chart</span>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">{formatCurrency(currentPrice)}</span>
            <span className={`flex items-center ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              {Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>
        </CardTitle>
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
                  tickFormatter={(value) => (value / 1000).toFixed(0) + 'k'} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
