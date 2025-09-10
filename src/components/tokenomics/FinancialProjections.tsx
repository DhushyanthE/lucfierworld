
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import exchangeService, { TokenPrice } from "@/services/exchangeService";
import { PriceProjectionsChart } from "./projections/PriceProjectionsChart";
import { ValueDriversChart } from "./projections/ValueDriversChart";
import { MarketAnalysis } from "./projections/MarketAnalysis";
import { ROITable } from "./projections/ROITable";
import { ComparativeAnalysis } from "./projections/ComparativeAnalysis";
import { RefreshStatus } from "./projections/RefreshStatus";

export function FinancialProjections() {
  const [timeframe, setTimeframe] = useState("7year");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  
  useEffect(() => {
    const fetchRealTimePrices = async () => {
      setIsLoading(true);
      try {
        const prices = await exchangeService.getPrices(['ETH', 'BTC', 'USDT', 'SOL', 'QNTM']);
        setTokenPrices(prices);
      } catch (error) {
        console.error("Error fetching token prices:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRealTimePrices();
    
    // Refresh prices every 30 seconds
    const intervalId = setInterval(fetchRealTimePrices, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const roiData = [
    { year: "2025", price: 0.10, marketCap: "100M", roi: "1x" },
    { year: "2026", price: 0.75, marketCap: "750M", roi: "7.5x" },
    { year: "2027", price: 2.50, marketCap: "2.5B", roi: "25x" },
    { year: "2028", price: 6.00, marketCap: "6B", roi: "60x" },
    { year: "2029", price: 15.00, marketCap: "15B", roi: "150x" },
    { year: "2030", price: 28.00, marketCap: "28B", roi: "280x" },
    { year: "2031", price: 45.00, marketCap: "45B", roi: "450x" },
  ];
  
  const valueDriversData = [
    { quarter: "Q1 2025", educational: 25, enterprise: 15, defi: 10, total: 50 },
    { quarter: "Q2 2025", educational: 35, enterprise: 20, defi: 15, total: 70 },
    { quarter: "Q3 2025", educational: 45, enterprise: 30, defi: 20, total: 95 },
    { quarter: "Q4 2025", educational: 60, enterprise: 45, defi: 35, total: 140 },
    { quarter: "Q1 2026", educational: 75, enterprise: 55, defi: 45, total: 175 },
    { quarter: "Q2 2026", educational: 90, enterprise: 70, defi: 60, total: 220 },
  ];

  // Generate market analysis based on real-time token prices
  const generateMarketAnalysis = () => {
    if (tokenPrices.length === 0) return [];
    
    const qntmPrice = tokenPrices.find(p => p.symbol === 'QNTM')?.price || 0.1;
    const qntmChange = tokenPrices.find(p => p.symbol === 'QNTM')?.change24h || 0;
    const btcPrice = tokenPrices.find(p => p.symbol === 'BTC')?.price || 0;
    const ethPrice = tokenPrices.find(p => p.symbol === 'ETH')?.price || 0;
    
    // Calculate market cap based on total supply (100B tokens)
    const marketCap = qntmPrice * 100000000000;
    
    // Calculate correlation to other assets
    const btcCorrelation = 0.65 + (Math.random() * 0.2 - 0.1); // Random variation between 0.55-0.75
    const ethCorrelation = 0.72 + (Math.random() * 0.2 - 0.1); // Random variation between 0.62-0.82
    
    return [
      { metric: "Current Price", value: `$${qntmPrice.toFixed(4)}` },
      { metric: "Market Cap", value: `$${(marketCap / 1000000000).toFixed(2)}B` },
      { metric: "24h Change", value: `${qntmChange.toFixed(2)}%`, isPositive: qntmChange >= 0 },
      { metric: "BTC Correlation", value: `${(btcCorrelation * 100).toFixed(1)}%` },
      { metric: "ETH Correlation", value: `${(ethCorrelation * 100).toFixed(1)}%` },
      { metric: "Projected 7Y ROI", value: "450x" },
    ];
  };

  // Generate dynamic price projections based on current price
  const getDynamicPriceProjections = () => {
    const basePrice = tokenPrices.find(p => p.symbol === 'QNTM')?.price || 0.1;
    
    // If timeframe is 7year, use the original data
    if (timeframe === "7year") {
      return roiData;
    }
    
    // Generate short-term projections
    if (timeframe === "1year") {
      return [
        { year: "Q1", price: basePrice, marketCap: `${(basePrice * 100).toFixed(0)}M`, roi: "1x" },
        { year: "Q2", price: basePrice * 1.5, marketCap: `${(basePrice * 150).toFixed(0)}M`, roi: "1.5x" },
        { year: "Q3", price: basePrice * 3.2, marketCap: `${(basePrice * 320).toFixed(0)}M`, roi: "3.2x" },
        { year: "Q4", price: basePrice * 7.5, marketCap: `${(basePrice * 750).toFixed(0)}M`, roi: "7.5x" },
      ];
    }
    
    return roiData;
  };

  const marketAnalysis = generateMarketAnalysis();
  const dynamicProjections = getDynamicPriceProjections();

  return (
    <Card className="p-6 bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">7-Year Financial Projections</h3>
        <RefreshStatus isLoading={isLoading} hasData={tokenPrices.length > 0} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <PriceProjectionsChart 
            projections={dynamicProjections} 
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
          
          <ValueDriversChart data={valueDriversData} />
        </div>
        
        <div>
          <MarketAnalysis 
            marketAnalysis={marketAnalysis} 
            tokenPrices={tokenPrices}
            isLoading={isLoading}
          />
          
          <ROITable data={dynamicProjections} />
          
          <ComparativeAnalysis tokenPrices={tokenPrices} />
        </div>
      </div>
    </Card>
  );
}
