import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Coins, 
  Activity, 
  TrendingUp, 
  Zap, 
  Shield, 
  Network, 
  BarChart3, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Atom
} from 'lucide-react';
import { useQuantumCoinWorkflow } from '@/hooks/useQuantumCoinWorkflow';
import { toast } from 'sonner';

export function EnhancedQuantumCoinDashboard() {
  const {
    workflowState,
    balance,
    marketData,
    isLoading,
    submitQuantumTask,
    executeTransaction,
    startQuantumMining,
    performMarketAnalysis,
    executeTradingStrategy,
    refreshData
  } = useQuantumCoinWorkflow();

  const [activeTab, setActiveTab] = useState('overview');
  const [miningSettings, setMiningSettings] = useState({
    difficulty: 5,
    reward: 10
  });
  const [tradingStrategy, setTradingStrategy] = useState({
    type: 'quantum_momentum',
    riskLevel: 'medium',
    amount: 1000
  });

  const handleStartMining = async () => {
    try {
      const taskId = await startQuantumMining(miningSettings.difficulty, miningSettings.reward);
      toast.success(`Quantum mining started (Task: ${taskId})`);
    } catch (error) {
      toast.error('Failed to start quantum mining');
    }
  };

  const handleMarketAnalysis = async () => {
    try {
      const taskId = await performMarketAnalysis('1h', ['RSI', 'MACD', 'quantum_oscillator']);
      toast.success(`Market analysis initiated (Task: ${taskId})`);
    } catch (error) {
      toast.error('Failed to start market analysis');
    }
  };

  const handleTradingStrategy = async () => {
    try {
      const taskId = await executeTradingStrategy(tradingStrategy);
      toast.success(`Trading strategy executed (Task: ${taskId})`);
    } catch (error) {
      toast.error('Failed to execute trading strategy');
    }
  };

  const handleTransaction = async (type: string) => {
    try {
      const txId = await executeTransaction(
        type as any,
        '0x1234567890abcdef',
        '0xfedcba0987654321',
        100
      );
      toast.success(`Transaction initiated (${txId})`);
    } catch (error) {
      toast.error('Transaction failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">QNTM Balance</p>
                <p className="text-2xl font-bold text-primary">
                  {balance?.balance?.toLocaleString() || '0'}
                </p>
              </div>
              <Coins className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Price</p>
                <p className="text-2xl font-bold text-green-500">
                  ${marketData?.price?.toFixed(4) || '0.0000'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold text-orange-500">
                  {workflowState?.totalTasks - workflowState?.completedTasks - workflowState?.failedTasks || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quantum Power</p>
                <p className="text-2xl font-bold text-cyan-500">
                  {((balance?.quantumPower || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <Atom className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quantum Coin Workflow Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={workflowState?.isActive ? 'default' : 'secondary'}>
                {workflowState?.isActive ? 'Active' : 'Idle'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {workflowState?.networkStatus}
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mining">Mining</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantum Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quantum Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workflowState?.globalMetrics && Object.entries(workflowState.globalMetrics).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span>{(value * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={value * 100} className="h-1" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {workflowState?.recentTasks?.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-2">
                            {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {task.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                            {task.status === 'processing' && <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />}
                            {task.status === 'pending' && <Clock className="h-4 w-4 text-gray-500" />}
                            <span className="text-sm capitalize">{task.type.replace(/_/g, ' ')}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">No recent tasks</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="mining" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quantum Mining Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Mining Difficulty</Label>
                      <Input
                        id="difficulty"
                        type="number"
                        value={miningSettings.difficulty}
                        onChange={(e) => setMiningSettings(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reward">Expected Reward</Label>
                      <Input
                        id="reward"
                        type="number"
                        value={miningSettings.reward}
                        onChange={(e) => setMiningSettings(prev => ({ ...prev, reward: parseFloat(e.target.value) }))}
                        min="1"
                        step="0.1"
                      />
                    </div>
                    <Button onClick={handleStartMining} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Quantum Mining
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Mining Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Hash Rate</p>
                        <p className="font-semibold">750.2 QH/s</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Blocks Found</p>
                        <p className="font-semibold">23</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Efficiency</p>
                        <p className="font-semibold">94.5%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Uptime</p>
                        <p className="font-semibold">99.8%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trading" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Trading Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="strategy-type">Strategy Type</Label>
                      <Select value={tradingStrategy.type} onValueChange={(value) => setTradingStrategy(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quantum_momentum">Quantum Momentum</SelectItem>
                          <SelectItem value="quantum_arbitrage">Quantum Arbitrage</SelectItem>
                          <SelectItem value="quantum_grid">Quantum Grid</SelectItem>
                          <SelectItem value="quantum_scalping">Quantum Scalping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk-level">Risk Level</Label>
                      <Select value={tradingStrategy.riskLevel} onValueChange={(value) => setTradingStrategy(prev => ({ ...prev, riskLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Trading Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={tradingStrategy.amount}
                        onChange={(e) => setTradingStrategy(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                        min="1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleTradingStrategy}>
                        <Play className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                      <Button variant="outline" onClick={handleMarketAnalysis}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Market Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">24h Volume</p>
                        <p className="font-semibold">${marketData?.volume24h?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Market Cap</p>
                        <p className="font-semibold">${marketData?.marketCap?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">24h Change</p>
                        <p className={`font-semibold flex items-center gap-1 ${(marketData?.change24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(marketData?.change24h || 0) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {(marketData?.change24h || 0).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Network Health</p>
                        <p className="font-semibold">{((marketData?.networkHealth || 0) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Workflow Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Completed Tasks</span>
                        <span className="font-semibold">{workflowState?.completedTasks || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate</span>
                        <span className="font-semibold">
                          {workflowState ? ((workflowState.completedTasks / Math.max(1, workflowState.totalTasks)) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Processing Time</span>
                        <span className="font-semibold">
                          {workflowState ? (workflowState.averageProcessingTime / 1000).toFixed(1) : 0}s
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quantum Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Efficiency</span>
                        <span>{((workflowState?.quantumEfficiency || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(workflowState?.quantumEfficiency || 0) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Network Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      <span className="text-sm capitalize">{workflowState?.networkStatus}</span>
                      <Badge variant={workflowState?.networkStatus === 'online' ? 'default' : 'secondary'}>
                        {workflowState?.networkStatus === 'online' ? 'Healthy' : 'Syncing'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Transactions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => handleTransaction('transfer')}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Transfer QNTM
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => handleTransaction('stake')}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Stake QNTM
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => handleTransaction('swap')}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Swap QNTM
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {workflowState?.recentTransactions?.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-2">
                            {tx.status === 'confirmed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {tx.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                            {tx.status === 'pending' && <Clock className="h-4 w-4 text-orange-500" />}
                            <div>
                              <p className="text-sm font-medium capitalize">{tx.type}</p>
                              <p className="text-xs text-muted-foreground">{tx.amount} QNTM</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {tx.status}
                          </Badge>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">No recent transactions</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}