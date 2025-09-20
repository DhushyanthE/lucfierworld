import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  Square, 
  Zap, 
  Cpu, 
  Activity, 
  TrendingUp, 
  Shield,
  Blocks,
  Hash,
  Clock,
  CheckCircle,
  AlertTriangle,
  Network,
  BarChart3,
  Database
} from 'lucide-react';
import { useQuantumMining } from '@/hooks/useQuantumMining';
import { QuantumMiningConfig } from '@/services/quantum-mining/QuantumMiningService';
import { toast } from 'sonner';

export function QuantumMiningDashboard() {
  const {
    activeSessions,
    blockchainStats,
    isLoading,
    startMining,
    stopMining,
    mineBlock,
    addTransaction,
    refreshStats
  } = useQuantumMining();

  const [miningConfig, setMiningConfig] = useState<QuantumMiningConfig>({
    difficulty: 5,
    algorithm: 'grover',
    quantumNodes: 8,
    consensusProtocol: 'quantum_proof_of_work',
    energyEfficiency: 0.85,
    quantumSupremacy: true
  });

  const [quickMineConfig, setQuickMineConfig] = useState({
    difficulty: 3,
    algorithm: 'grover' as const,
    reward: 50
  });

  const handleStartMining = async () => {
    try {
      const sessionId = await startMining(miningConfig);
      toast.success(`Mining session started (${sessionId})`);
    } catch (error) {
      toast.error('Failed to start mining session');
    }
  };

  const handleStopMining = async (sessionId: string) => {
    try {
      await stopMining(sessionId);
      toast.success('Mining session stopped');
    } catch (error) {
      toast.error('Failed to stop mining session');
    }
  };

  const handleQuickMine = async () => {
    try {
      const config: QuantumMiningConfig = {
        ...miningConfig,
        difficulty: quickMineConfig.difficulty,
        algorithm: quickMineConfig.algorithm
      };
      
      const block = await mineBlock(config);
      toast.success(`Block mined successfully! Hash: ${block.blockHash.substring(0, 8)}...`);
      refreshStats();
    } catch (error) {
      toast.error('Failed to mine block');
    }
  };

  const handleAddTransaction = async () => {
    try {
      const txId = await addTransaction({
        from: '0x1234567890abcdef',
        to: '0xfedcba0987654321',
        value: 100,
        gasPrice: 20,
        gasLimit: 21000,
        data: { type: 'quantum_transfer' },
        quantumSignature: 'qsig_sample'
      });
      toast.success(`Transaction added to mempool (${txId.substring(0, 8)}...)`);
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mining Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-500">
                  {activeSessions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Blocks</p>
                <p className="text-2xl font-bold text-green-500">
                  {blockchainStats.totalBlocks || 0}
                </p>
              </div>
              <Blocks className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hash Rate</p>
                <p className="text-2xl font-bold text-purple-500">
                  {(blockchainStats.networkHashRate || 0).toFixed(2)} QH/s
                </p>
              </div>
              <Hash className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <p className="text-2xl font-bold text-orange-500">
                  {(blockchainStats.difficulty || 0).toFixed(1)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mining Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Mining Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mining Algorithm</Label>
              <Select 
                value={miningConfig.algorithm} 
                onValueChange={(value: any) => setMiningConfig(prev => ({ ...prev, algorithm: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grover">Grover's Algorithm</SelectItem>
                  <SelectItem value="shor">Shor's Algorithm</SelectItem>
                  <SelectItem value="quantum_annealing">Quantum Annealing</SelectItem>
                  <SelectItem value="variational_quantum">Variational Quantum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level: {miningConfig.difficulty}</Label>
              <Slider
                value={[miningConfig.difficulty]}
                onValueChange={(values) => setMiningConfig(prev => ({ ...prev, difficulty: values[0] }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Quantum Nodes: {miningConfig.quantumNodes}</Label>
              <Slider
                value={[miningConfig.quantumNodes]}
                onValueChange={(values) => setMiningConfig(prev => ({ ...prev, quantumNodes: values[0] }))}
                min={1}
                max={64}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Consensus Protocol</Label>
              <Select 
                value={miningConfig.consensusProtocol} 
                onValueChange={(value: any) => setMiningConfig(prev => ({ ...prev, consensusProtocol: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantum_proof_of_work">Quantum Proof of Work</SelectItem>
                  <SelectItem value="quantum_proof_of_stake">Quantum Proof of Stake</SelectItem>
                  <SelectItem value="quantum_byzantine">Quantum Byzantine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="quantum-supremacy">Quantum Supremacy</Label>
              <Switch
                id="quantum-supremacy"
                checked={miningConfig.quantumSupremacy}
                onCheckedChange={(checked) => setMiningConfig(prev => ({ ...prev, quantumSupremacy: checked }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleStartMining} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Mining
              </Button>
              <Button variant="outline" onClick={handleQuickMine} className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Quick Mine
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Blockchain Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Transactions</p>
                <p className="text-lg font-semibold">{blockchainStats.totalTransactions || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Block Time</p>
                <p className="text-lg font-semibold">
                  {blockchainStats.avgBlockTime ? (blockchainStats.avgBlockTime / 1000).toFixed(1) : 0}s
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Mempool Size</p>
                <p className="text-lg font-semibold">{blockchainStats.mempoolSize || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Block</p>
                <p className="text-lg font-semibold">
                  {blockchainStats.lastBlockTime ? 
                    new Date(blockchainStats.lastBlockTime).toLocaleTimeString() : 
                    'None'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Network Health</span>
                <span>98.5%</span>
              </div>
              <Progress value={98.5} className="h-2" />
            </div>

            <Button variant="outline" onClick={handleAddTransaction} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Add Test Transaction
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Mining Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Active Mining Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active mining sessions. Start mining to see session details.
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Session {session.id.substring(8, 16)}</h3>
                      <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {session.config.algorithm}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStopMining(session.id)}
                        disabled={session.status !== 'active'}
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Blocks Found</p>
                      <p className="font-semibold">{session.stats.blocksFound}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hash Rate</p>
                      <p className="font-semibold">{session.stats.hashRate.toFixed(2)} QH/s</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Reward</p>
                      <p className="font-semibold">{session.stats.totalReward.toFixed(2)} QNTM</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Efficiency</p>
                      <p className="font-semibold">{session.stats.efficiency.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{session.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={session.progress} className="h-2" />
                  </div>

                  {session.stats.quantumAdvantage > 1 && (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <Shield className="h-4 w-4" />
                      <span>Quantum Advantage: {session.stats.quantumAdvantage}x</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}