
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, Gem, Zap, ShieldCheck, ChevronDown, 
  ChevronUp, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';

// Mock visualization data
interface CoinData {
  timestamp: string;
  price: number;
  volume: number;
  quantumScore: number;
  fidelity: number;
  resistance: number;
}

interface QuantumCoinVisualizationProps {
  coinSymbol?: string;
}

export function QuantumCoinVisualization({ coinSymbol = "QNTM" }: QuantumCoinVisualizationProps) {
  const [activeTab, setActiveTab] = useState('price');
  const [isLoading, setIsLoading] = useState(false);
  const [coinData, setCoinData] = useState<CoinData[]>([]);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [predictedChange, setPredictedChange] = useState<number>(0);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  // Generate mock quantum enhanced coin data
  const generateCoinData = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    try {
      const now = new Date();
      const data: CoinData[] = [];
      
      // Generate last 7 days of data
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        // Create realistic price movement
        const basePrice = 120 + (Math.random() * 50);
        const noise = Math.sin(i * 0.7) * 15 + (Math.random() * 20 - 10);
        
        data.push({
          timestamp: date.toISOString().split('T')[0],
          price: basePrice + noise,
          volume: 1000000 + Math.random() * 2000000,
          quantumScore: 0.7 + Math.random() * 0.29,
          fidelity: 0.8 + Math.random() * 0.19,
          resistance: 0.75 + Math.random() * 0.24
        });
      }
      
      setCoinData(data);
      
      // Generate prediction
      const lastPrice = data[data.length - 1].price;
      const predictedPriceValue = lastPrice * (1 + (Math.random() * 0.1 - 0.02));
      setPredictedPrice(predictedPriceValue);
      setPredictedChange(((predictedPriceValue - lastPrice) / lastPrice) * 100);
      
      toast.success("Quantum analysis complete", {
        description: `${coinSymbol} data analyzed with quantum fidelity metrics`
      });
    } catch (error) {
      console.error("Error generating quantum coin data:", error);
      toast.error("Failed to analyze quantum coin data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    generateCoinData();
  }, []);
  
  // Get current price and change
  const currentPrice = coinData.length > 0 ? coinData[coinData.length - 1].price : 0;
  const previousPrice = coinData.length > 1 ? coinData[coinData.length - 2].price : 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-black/0 pointer-events-none"></div>
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-purple-400" />
            <span>Quantum Coin Analysis</span>
          </CardTitle>
          
          <Button 
            size="sm"
            variant="outline"
            className="bg-purple-900/20 hover:bg-purple-900/30 text-purple-300"
            onClick={generateCoinData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyzing' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Current Price</div>
            <div className="text-2xl font-semibold text-white">${currentPrice.toFixed(2)}</div>
            <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </div>
          </div>
          
          {predictedPrice !== null && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Quantum Prediction</div>
              <div className="text-2xl font-semibold text-white">${predictedPrice.toFixed(2)}</div>
              <div className={`text-sm ${predictedChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {predictedChange >= 0 ? '+' : ''}{predictedChange.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="price" className="data-[state=active]:bg-purple-900/30">
              Price Analysis
            </TabsTrigger>
            <TabsTrigger value="quantum" className="data-[state=active]:bg-purple-900/30">
              Quantum Metrics
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-900/30">
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="price" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              {/* Price Chart Visualization */}
              <div className="h-48 bg-black/40 rounded-lg border border-purple-500/20 relative overflow-hidden">
                {coinData.length > 0 ? (
                  <div className="absolute inset-0 flex items-end">
                    {coinData.map((day, index) => {
                      const min = Math.min(...coinData.map(d => d.price));
                      const max = Math.max(...coinData.map(d => d.price));
                      const range = max - min;
                      const height = range ? (day.price - min) / range * 100 : 50;
                      
                      return (
                        <div 
                          key={index}
                          className="flex-1 flex items-end justify-center px-1"
                        >
                          <div 
                            className={`w-full rounded-t-sm ${
                              day.price > (index > 0 ? coinData[index-1].price : day.price)
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                            style={{ height: `${height}%` }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No price data available
                  </div>
                )}
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-2 text-xs text-gray-400">
                  {coinData.map((day, index) => (
                    <div key={index}>
                      {new Date(day.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-purple-900/20 rounded-md p-3 border border-purple-500/20 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <span className="font-medium text-purple-300">Quantum Enhanced Analysis</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className="bg-purple-900/30 text-purple-300 border-purple-500/50"
                  >
                    {coinData.length > 0 ? 
                      `${(coinData[coinData.length-1].quantumScore * 100).toFixed(1)}% confidence` : 
                      'No data'
                    }
                  </Badge>
                </div>
                <p className="mt-2 text-purple-200/80 text-xs">
                  The quantum enhanced analysis leverages quantum computing to detect patterns
                  in market data that classical algorithms miss. Trading signals derived from
                  quantum entanglement metrics provide superior forecasting accuracy.
                </p>
              </div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-gray-400">7-Day Volume</div>
                  <div className="text-white font-medium">
                    {coinData.reduce((sum, day) => sum + day.volume, 0).toLocaleString()} {coinSymbol}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Avg. Quantum Score</div>
                  <div className="text-white font-medium">
                    {(coinData.reduce((sum, day) => sum + day.quantumScore, 0) / Math.max(1, coinData.length) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Volatility</div>
                  <div className="text-white font-medium">
                    {(Math.random() * 5 + 2).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="quantum" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              {/* Quantum Metrics Visualization */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3">
                  <div className="text-sm text-gray-300 mb-1">Quantum Fidelity</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-medium text-white">
                      {coinData.length > 0 ? 
                        `${(coinData[coinData.length-1].fidelity * 100).toFixed(1)}%` : 
                        'N/A'
                      }
                    </div>
                    <div className={`text-sm ${
                      coinData.length > 1 && 
                      coinData[coinData.length-1].fidelity > coinData[coinData.length-2].fidelity ? 
                      'text-green-400' : 'text-amber-400'
                    }`}>
                      {coinData.length > 1 ? 
                        (((coinData[coinData.length-1].fidelity - coinData[coinData.length-2].fidelity) / 
                        coinData[coinData.length-2].fidelity) * 100).toFixed(2) + '%' : 
                        '0.00%'
                      }
                    </div>
                  </div>
                  <div className="bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${coinData.length > 0 ? coinData[coinData.length-1].fidelity * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3">
                  <div className="text-sm text-gray-300 mb-1">Quantum Resistance</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-medium text-white">
                      {coinData.length > 0 ? 
                        `${(coinData[coinData.length-1].resistance * 100).toFixed(1)}%` : 
                        'N/A'
                      }
                    </div>
                    <div className={`text-sm ${
                      coinData.length > 1 && 
                      coinData[coinData.length-1].resistance > coinData[coinData.length-2].resistance ? 
                      'text-green-400' : 'text-amber-400'
                    }`}>
                      {coinData.length > 1 ? 
                        (((coinData[coinData.length-1].resistance - coinData[coinData.length-2].resistance) / 
                        coinData[coinData.length-2].resistance) * 100).toFixed(2) + '%' : 
                        '0.00%'
                      }
                    </div>
                  </div>
                  <div className="bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${coinData.length > 0 ? coinData[coinData.length-1].resistance * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <span>Quantum Neural Analysis</span>
                  </div>
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                
                {showDetails && (
                  <div className="mt-3 space-y-3 text-sm text-gray-300">
                    <p>
                      The quantum neural network has analyzed {coinData.length} days of price data using quantum
                      entanglement to detect hidden patterns and correlations. The model demonstrates {coinData.length > 0 ? 
                      (coinData[coinData.length-1].quantumScore * 100).toFixed(1) : '0'}% prediction confidence.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-800/50 p-2 rounded">
                        <div className="text-gray-400">Neural Layers</div>
                        <div className="font-medium">Quantum-Enhanced (4)</div>
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded">
                        <div className="text-gray-400">Training Data</div>
                        <div className="font-medium">12M Transactions</div>
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded">
                        <div className="text-gray-400">Quantum Bits</div>
                        <div className="font-medium">64 Qubits</div>
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded">
                        <div className="text-gray-400">Coherence Time</div>
                        <div className="font-medium">1,200 ms</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-black/40 border border-purple-500/20 rounded-lg py-3 px-2">
                  <div className="text-xs text-gray-400">Quantum States</div>
                  <div className="text-lg font-semibold text-white">64</div>
                </div>
                <div className="bg-black/40 border border-purple-500/20 rounded-lg py-3 px-2">
                  <div className="text-xs text-gray-400">Gate Depth</div>
                  <div className="text-lg font-semibold text-white">18</div>
                </div>
                <div className="bg-black/40 border border-purple-500/20 rounded-lg py-3 px-2">
                  <div className="text-xs text-gray-400">Entanglement</div>
                  <div className="text-lg font-semibold text-white">92.4%</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              {/* Security Visualization */}
              <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-gray-300">Post-Quantum Security</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className="bg-green-900/30 text-green-300 border-green-500/50"
                  >
                    Protected
                  </Badge>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400">Algorithm</div>
                    <div className="text-sm text-white">Dilithium (CRYSTALS)</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Key Size</div>
                    <div className="text-sm text-white">3072-bit</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Estimated Qubits to Break</div>
                    <div className="text-sm text-white">8,192+</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Security Margin</div>
                    <div className="text-sm text-white">128-bit</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3 md:col-span-2">
                  <div className="text-sm font-medium text-gray-300 mb-2">Security Timeline</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="text-xs text-gray-300">Current</div>
                      <div className="flex-1 h-1 bg-gray-800 rounded-full">
                        <div className="h-full w-[95%] rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs text-gray-400">95%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="text-xs text-gray-300">5 Years</div>
                      <div className="flex-1 h-1 bg-gray-800 rounded-full">
                        <div className="h-full w-[87%] rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs text-gray-400">87%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="text-xs text-gray-300">10 Years</div>
                      <div className="flex-1 h-1 bg-gray-800 rounded-full">
                        <div className="h-full w-[75%] rounded-full bg-yellow-500"></div>
                      </div>
                      <div className="text-xs text-gray-400">75%</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-300 mb-2">Enhanced Encryption</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      <span>Lattice-based cryptography</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      <span>Quantum hashing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      <span>Multivariate polynomial</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-900/20 rounded-md p-3 border border-green-500/20 text-xs text-green-300">
                <div className="font-medium mb-1">Quantum Security Assessment</div>
                <p>
                  Your QuantumCoin is protected with post-quantum cryptography that is resistant to attacks from
                  both classical and quantum computers. Current estimates suggest quantum computers would need 
                  at least 8,192 error-corrected qubits to pose a meaningful threat to these algorithms, which
                  is well beyond current capabilities.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
