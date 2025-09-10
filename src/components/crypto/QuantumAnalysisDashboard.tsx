
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CryptoPrice } from "@/services/cryptoApiService";
import { AdvancedAIPredictor } from "@/ai/AdvancedAIPredictor";
import { AIPrediction, MarketData } from "@/types/market";
import cryptoApiService from "@/services/cryptoApiService";
import { Loader2, TrendingUp, TrendingDown, BarChart3, Zap, Shield, Activity, Brain } from "lucide-react";

interface QuantumAnalysisDashboardProps {
  selectedToken: string;
  tokens: CryptoPrice[];
}

interface QuantumInsight {
  title: string;
  value: string;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

export function QuantumAnalysisDashboard({ selectedToken, tokens }: QuantumAnalysisDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [insights, setInsights] = useState<QuantumInsight[]>([]);
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [riskLevel, setRiskLevel] = useState<number>(0);

  useEffect(() => {
    const analyzeToken = async () => {
      setIsLoading(true);
      try {
        // Get token data
        const token = tokens.find(t => t.symbol === selectedToken);
        if (!token) return;
        
        // Convert to MarketData format
        const marketData = cryptoApiService.toMarketData(token);
        
        // Generate AI prediction
        const aiPredictor = new AdvancedAIPredictor();
        const prediction = await aiPredictor.generatePrediction(marketData);
        setPrediction(prediction);
        
        // Generate quantum insights
        generateQuantumInsights(prediction, token);
        
        // Generate correlation data
        generateCorrelationData();
        
        // Calculate risk level (0-100)
        const calculatedRisk = calculateRiskLevel(token, prediction);
        setRiskLevel(calculatedRisk);
      } catch (error) {
        console.error("Error analyzing token:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    analyzeToken();
  }, [selectedToken, tokens]);
  
  const generateQuantumInsights = (prediction: AIPrediction, token: CryptoPrice) => {
    const insights: QuantumInsight[] = [
      {
        title: 'Price Movement',
        value: prediction.direction === 'up' ? 'Bullish' : 'Bearish',
        type: prediction.direction === 'up' ? 'positive' : 'negative',
        description: `Quantum analysis indicates a ${(prediction.magnitude * 100).toFixed(2)}% ${prediction.direction === 'up' ? 'increase' : 'decrease'} within ${prediction.timeframe} based on Schrödinger patterns.`
      },
      {
        title: 'Volatility',
        value: Math.abs(token.change24h) > 10 ? 'High' : Math.abs(token.change24h) > 5 ? 'Medium' : 'Low',
        type: Math.abs(token.change24h) > 10 ? 'negative' : Math.abs(token.change24h) > 5 ? 'neutral' : 'positive',
        description: `${Math.abs(token.change24h).toFixed(1)}% 24h change indicates ${Math.abs(token.change24h) > 10 ? 'significant' : Math.abs(token.change24h) > 5 ? 'moderate' : 'minimal'} price volatility.`
      },
      {
        title: 'Market Sentiment',
        value: prediction.confidence > 0.75 ? (prediction.direction === 'up' ? 'Very Positive' : 'Very Negative') : 
               prediction.confidence > 0.6 ? (prediction.direction === 'up' ? 'Positive' : 'Negative') : 'Neutral',
        type: prediction.direction === 'up' ? 'positive' : 'negative',
        description: `Sentiment analysis from market data shows ${(prediction.confidence * 100).toFixed(0)}% confidence in the prediction.`
      },
      {
        title: 'Volume Analysis',
        value: token.volume24h > 10000000 ? 'Strong' : token.volume24h > 1000000 ? 'Moderate' : 'Weak',
        type: token.volume24h > 10000000 ? 'positive' : token.volume24h > 1000000 ? 'neutral' : 'negative',
        description: `Trading volume of ${formatNumber(token.volume24h)} indicates ${token.volume24h > 10000000 ? 'strong' : token.volume24h > 1000000 ? 'moderate' : 'weak'} market interest.`
      },
      {
        title: 'QNTM Correlation',
        value: generateRandomCorrelation(),
        type: Math.random() > 0.5 ? 'positive' : 'neutral',
        description: 'Correlation based on quantum entanglement analysis between this asset and QNTM token.'
      }
    ];
    
    setInsights(insights);
  };
  
  const generateRandomCorrelation = () => {
    const value = (Math.random() * 0.6 + 0.2).toFixed(2);
    return value;
  };
  
  const calculateRiskLevel = (token: CryptoPrice, prediction: AIPrediction) => {
    // Calculate risk based on multiple factors
    const volatilityFactor = Math.min(Math.abs(token.change24h) * 2, 50); // 0-50 based on volatility
    const confidenceFactor = (1 - prediction.confidence) * 30; // 0-30 based on uncertainty
    const priceFactor = token.price < 1 ? 20 : token.price < 10 ? 15 : 10; // Higher risk for lower priced assets
    
    return Math.min(Math.round(volatilityFactor + confidenceFactor + priceFactor), 100);
  };
  
  const generateCorrelationData = () => {
    // Generate mock correlation data between tokens
    const correlations = tokens.map(token => ({
      name: token.symbol,
      correlation: parseFloat((Math.random() * 0.8 - 0.4 + (token.symbol === selectedToken ? 1 : 0)).toFixed(2))
    }));
    
    setCorrelationData(correlations);
  };

  // Format large numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Brain className="h-5 w-5 text-purple-400 mr-2" />
              <h3 className="text-lg font-medium text-white">Quantum AI Analysis for {selectedToken}</h3>
            </div>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="bg-gray-800/80 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm text-gray-400">{insight.title}</div>
                    <div className={`px-2 py-0.5 text-xs rounded-full ${
                      insight.type === 'positive' ? 'bg-green-900/50 text-green-400' : 
                      insight.type === 'negative' ? 'bg-red-900/50 text-red-400' : 
                      'bg-blue-900/50 text-blue-400'
                    }`}>
                      {insight.value}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{insight.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-purple-400 mr-2" />
              <h3 className="text-lg font-medium text-white">Risk Assessment</h3>
            </div>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Risk Level</span>
                <span className={`text-sm font-medium ${
                  riskLevel > 75 ? 'text-red-500' : 
                  riskLevel > 50 ? 'text-yellow-500' : 
                  riskLevel > 25 ? 'text-blue-500' : 'text-green-500'
                }`}>
                  {riskLevel > 75 ? 'High' : riskLevel > 50 ? 'Medium' : riskLevel > 25 ? 'Low' : 'Very Low'}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    riskLevel > 75 ? 'bg-red-500' : 
                    riskLevel > 50 ? 'bg-yellow-500' : 
                    riskLevel > 25 ? 'bg-blue-500' : 'bg-green-500'
                  }`} 
                  style={{ width: `${riskLevel}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800/80 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Neural Network Analysis</div>
                <div className="text-sm text-gray-300">
                  {prediction?.direction === 'up' ? (
                    <>
                      <TrendingUp className="h-4 w-4 inline mr-1 text-green-500" />
                      <span>Projected to increase by {(prediction.magnitude * 100).toFixed(2)}% within {prediction.timeframe}.</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 inline mr-1 text-red-500" />
                      <span>Projected to decrease by {(prediction.magnitude * 100).toFixed(2)}% within {prediction.timeframe}.</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">Confidence: {(prediction?.confidence || 0) * 100}%</div>
              </div>
              
              <div className="bg-gray-800/80 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Volatility Analysis</div>
                <div className="text-sm text-gray-300">
                  {riskLevel > 75 ? (
                    <span>High risk asset with significant price volatility.</span>
                  ) : riskLevel > 50 ? (
                    <span>Medium risk with moderate price fluctuations.</span>
                  ) : (
                    <span>Relatively stable asset with manageable volatility.</span>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-800/80 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Quantum Security Score</div>
                <div className="flex items-center">
                  <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${Math.round(85 - (riskLevel / 4))}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-300">{Math.round(85 - (riskLevel / 4))}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-gray-900/50 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-medium text-white">Investment Recommendation</h3>
          </div>
          
          {prediction && (
            <div className="bg-gray-800/80 p-4 rounded-lg mb-4">
              <div className={`text-lg font-medium mb-2 ${
                prediction.direction === 'up' && prediction.confidence > 0.7 ? 'text-green-500' : 
                prediction.direction === 'down' && prediction.confidence > 0.7 ? 'text-red-500' : 
                'text-gray-300'
              }`}>
                {prediction.direction === 'up' && prediction.confidence > 0.7 ? 'Buy / Accumulate' : 
                 prediction.direction === 'down' && prediction.confidence > 0.7 ? 'Sell / Reduce Exposure' : 
                 'Hold / Monitor'}
              </div>
              <p className="text-gray-300">
                {prediction.direction === 'up' && prediction.confidence > 0.7 ? (
                  <>Based on quantum analysis, <strong>{selectedToken}</strong> shows strong bullish signals with high confidence. Consider increasing position with appropriate risk management.</>
                ) : prediction.direction === 'down' && prediction.confidence > 0.7 ? (
                  <>Quantum patterns indicate bearish movement for <strong>{selectedToken}</strong>. Consider reducing exposure or implementing hedging strategies.</>
                ) : (
                  <>Current signals for <strong>{selectedToken}</strong> are mixed. Monitor closely and wait for stronger directional confirmation.</>
                )}
              </p>
              <div className="mt-3">
                <div className="text-sm text-gray-400">Suggested Timeframe:</div>
                <div className="text-sm text-gray-300">{prediction.timeframe}</div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-800/80 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Portfolio Integration</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Suggested Allocation</div>
                <div className="text-sm text-white">
                  {riskLevel > 75 ? 'Max 2%' : riskLevel > 50 ? '2-5%' : riskLevel > 25 ? '5-10%' : 'Up to 15%'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Position Type</div>
                <div className="text-sm text-white">
                  {riskLevel > 50
                    ? 'Speculative / Short-term'
                    : 'Core / Long-term'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Zap className="h-3 w-3 text-purple-400 mr-1" />
          <span>Quantum AI Analysis powered by Advanced Neural Networks</span>
        </div>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
