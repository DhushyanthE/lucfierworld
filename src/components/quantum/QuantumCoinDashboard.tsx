
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Coins, Wallet, ArrowRightLeft, Cpu, Zap, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { quantumCoinService, QuantumCoin } from '@/lib/quantum/coin/QuantumCoinService';
import { superAIModule } from '@/lib/quantum/SuperAIModule';
import { agiModule } from '@/lib/quantum/AGIModule';

export function QuantumCoinDashboard() {
  const [coins, setCoins] = useState<QuantumCoin[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>('system');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedTab, setSelectedTab] = useState('coins');
  const [superintelligenceScore, setSuperintelligenceScore] = useState(0);
  const [quantumMetrics, setQuantumMetrics] = useState({
    entanglementFactor: 0,
    coherenceLevel: 0
  });
  
  // Initialize quantum coin service
  useEffect(() => {
    const init = async () => {
      if (!isInitialized) {
        await quantumCoinService.initialize();
        setIsInitialized(true);
        loadWalletData();
        
        // Get superintelligence metrics
        const metrics = superAIModule.getMetrics();
        setSuperintelligenceScore(metrics.superintelligenceFactor);
        
        // Get quantum metrics
        setQuantumMetrics({
          entanglementFactor: metrics.quantumEntanglementFactor,
          coherenceLevel: metrics.quantumCoherenceLevel
        });
      }
    };
    
    init();
  }, [isInitialized]);
  
  // Load wallet data
  const loadWalletData = () => {
    const wallet = quantumCoinService.getWalletBalance(walletAddress);
    if (wallet) {
      setCoins(wallet.coins);
      setWalletBalance(wallet.balance);
    } else {
      setCoins([]);
      setWalletBalance(0);
    }
  };
  
  // Generate new quantum coin
  const generateCoin = async () => {
    if (!isInitialized) {
      toast.error('Quantum service not initialized');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Use AGI to enhance the purpose
      const purposeResponse = await agiModule.processInput({
        operation: 'purpose_generation',
        complexity: 'low'
      });
      
      const purpose = `Quantum analysis: ${new Date().toLocaleDateString()}`;
      
      await quantumCoinService.generateQuantumCoin(
        walletAddress,
        purpose,
        'Enhanced-QRNG'
      );
      
      toast.success('Quantum coin generated successfully');
      loadWalletData();
    } catch (error) {
      console.error('Error generating quantum coin:', error);
      toast.error('Failed to generate quantum coin');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Validate a quantum coin
  const validateCoin = async (coinId: string) => {
    try {
      const result = await quantumCoinService.validateCoin(coinId);
      
      if (result) {
        toast.success('Coin validated successfully');
      } else {
        toast.error('Coin validation failed');
      }
      
      loadWalletData();
    } catch (error) {
      console.error('Error validating coin:', error);
      toast.error('Validation error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Coins className="h-6 w-6 mr-2 text-yellow-400" />
          Quantum Coin System
        </h2>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-500/50">
            <Brain className="h-4 w-4 mr-1" />
            AGI Enhanced
          </Badge>
          
          <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-500/50">
            <Zap className="h-4 w-4 mr-1" />
            SI Score: {superintelligenceScore.toFixed(1)}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/50 border-yellow-500/20 col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-yellow-400" />
              Quantum Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Address</p>
                <p className="font-mono text-sm bg-black/50 p-2 rounded border border-gray-800">
                  {walletAddress}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Balance</p>
                <p className="text-3xl font-bold text-yellow-400">{walletBalance} QC</p>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={generateCoin}
                  disabled={isGenerating}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {isGenerating ? 
                    'Generating...' : 
                    'Generate Quantum Coin'
                  }
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/50 border-yellow-500/20 col-span-1 md:col-span-3">
          <CardHeader className="pb-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="coins">
                  <Coins className="h-4 w-4 mr-2" />
                  My Coins
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="metrics">
                  <Cpu className="h-4 w-4 mr-2" />
                  Quantum Metrics
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="coins" className="pt-4">
              {coins.length === 0 ? (
                <div className="text-center py-8 bg-black/30 rounded-lg border border-gray-800">
                  <Coins className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">No quantum coins in wallet</p>
                  <Button 
                    onClick={generateCoin} 
                    variant="outline" 
                    className="mt-4 border-yellow-500/30 text-yellow-400"
                  >
                    Generate Your First Coin
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {coins.map((coin) => (
                    <div 
                      key={coin.id}
                      className="bg-black/40 border border-yellow-500/20 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium flex items-center">
                            <Coins className="h-4 w-4 mr-1 text-yellow-400" />
                            Quantum Coin
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">ID: {coin.id}</p>
                        </div>
                        <Badge 
                          className={coin.validatedAt ? "bg-green-900/40 text-green-300 border-green-500/50" : "bg-blue-900/40 text-blue-300 border-blue-500/50"}
                        >
                          {coin.validatedAt ? 'Validated' : 'Unvalidated'}
                        </Badge>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Created:</span>
                          <span>{new Date(coin.createdAt).toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Entanglement:</span>
                          <span>{(coin.entanglementFactor * 100).toFixed(2)}%</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Coherence:</span>
                          <span>{(coin.coherenceScore * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                      
                      {!coin.validatedAt && (
                        <Button
                          onClick={() => validateCoin(coin.id)}
                          size="sm"
                          className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                        >
                          <Cpu className="h-4 w-4 mr-2" />
                          Validate
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="transactions" className="pt-4">
              <div className="text-center py-8 bg-black/30 rounded-lg border border-gray-800">
                <ArrowRightLeft className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400">Transaction history will appear here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="pt-4">
              <div className="space-y-6">
                <div className="bg-black/40 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-4">
                    <Cpu className="h-5 w-5 mr-2 text-blue-400" />
                    Quantum System Metrics
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Quantum Entanglement Factor</span>
                        <span>{(quantumMetrics.entanglementFactor * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${quantumMetrics.entanglementFactor * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Quantum Coherence Level</span>
                        <span>{(quantumMetrics.coherenceLevel * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${quantumMetrics.coherenceLevel * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-4">
                    <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                    Superintelligence Integration
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Superintelligence Factor</span>
                        <span>{superintelligenceScore.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(superintelligenceScore / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
