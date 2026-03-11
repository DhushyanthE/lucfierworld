import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MiningLeaderboard } from './MiningLeaderboard';
import { Pickaxe, Cpu, Zap, TrendingUp, Users, Battery, RefreshCw } from 'lucide-react';

interface MiningResult {
  blockHash: string;
  nonce: number;
  difficulty: number;
  reward: number;
  miningTime: number;
  hashRate: number;
  energyUsed: number;
  quantumBoost: number;
}

interface PoolStats {
  totalBlocks: number;
  totalReward: number;
  avgHashRate: number;
  avgMiningTime: number;
  totalEnergy: number;
  avgQuantumBoost: number;
  blocks: MiningResult[];
}

export function CryptoMiningPanel() {
  const { toast } = useToast();
  const [isMining, setIsMining] = useState(false);
  const [lastBlock, setLastBlock] = useState<MiningResult | null>(null);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [quantumEnabled, setQuantumEnabled] = useState(true);
  const [totalMined, setTotalMined] = useState(0);

  const mineBlock = async () => {
    setIsMining(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-mining-engine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ operation: 'mine', difficulty: 4, quantumEnabled }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setLastBlock(data.result);
        setTotalMined(prev => prev + data.result.reward);
        // Persist to DB
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('mining_history').insert({
            user_id: user.id, block_hash: data.result.blockHash, nonce: data.result.nonce,
            difficulty: data.result.difficulty, reward: data.result.reward,
            mining_time: data.result.miningTime, hash_rate: data.result.hashRate,
            energy_used: data.result.energyUsed, quantum_boost: data.result.quantumBoost, pool_size: 1,
          });
        }
        toast({ title: 'Block Mined! ⛏️', description: `Reward: ${data.result.reward.toFixed(4)} QCoin | Hash Rate: ${(data.result.hashRate / 1e6).toFixed(2)} MH/s` });
      }
    } catch (error) {
      toast({ title: 'Mining Error', description: 'Failed to mine block', variant: 'destructive' });
    } finally {
      setIsMining(false);
    }
  };

  const poolMine = async () => {
    setIsMining(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-mining-engine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ operation: 'pool-mine', difficulty: 4, quantumEnabled, poolSize: 5 }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setPoolStats(data.poolStats);
        setTotalMined(prev => prev + data.poolStats.totalReward);
        // Persist pool mining results to DB
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const inserts = data.poolStats.blocks.map((block: MiningResult) => ({
            user_id: user.id, block_hash: block.blockHash, nonce: block.nonce,
            difficulty: block.difficulty, reward: block.reward,
            mining_time: block.miningTime, hash_rate: block.hashRate,
            energy_used: block.energyUsed, quantum_boost: block.quantumBoost, pool_size: 5,
          }));
          await supabase.from('mining_history').insert(inserts);
        }
        toast({ title: 'Pool Mining Complete', description: `${data.poolStats.totalBlocks} blocks mined, ${data.poolStats.totalReward.toFixed(2)} QCoin total` });
      }
    } catch (error) {
      toast({ title: 'Pool Mining Error', description: 'Failed to pool mine', variant: 'destructive' });
    } finally {
      setIsMining(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-amber-600/5 to-orange-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pickaxe className="h-6 w-6 text-amber-500" />
                Quantum Crypto Mining Engine
              </CardTitle>
              <CardDescription>Mine QCoin blocks with quantum-enhanced hash computation</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant={quantumEnabled ? 'default' : 'outline'} size="sm" onClick={() => setQuantumEnabled(!quantumEnabled)}>
                <Zap className="h-4 w-4 mr-1" />
                {quantumEnabled ? 'Quantum ON' : 'Quantum OFF'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-amber-500">{totalMined.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">QCoin Mined</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-green-500">{lastBlock ? (lastBlock.hashRate / 1e6).toFixed(1) : '0'}</div>
              <div className="text-xs text-muted-foreground">MH/s</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-blue-500">{lastBlock?.quantumBoost?.toFixed(1) || '0'}x</div>
              <div className="text-xs text-muted-foreground">Quantum Boost</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-purple-500">{lastBlock?.difficulty || 4}</div>
              <div className="text-xs text-muted-foreground">Difficulty</div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={mineBlock} disabled={isMining} className="flex-1">
              {isMining ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Pickaxe className="h-4 w-4 mr-2" />}
              Mine Solo Block
            </Button>
            <Button onClick={poolMine} disabled={isMining} variant="secondary" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Pool Mining (5 nodes)
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastBlock && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Last Mined Block
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 font-mono text-xs break-all">
              {lastBlock.blockHash}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-2 rounded bg-muted text-center">
                <div className="text-xs text-muted-foreground">Nonce</div>
                <div className="font-mono text-sm">{lastBlock.nonce.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded bg-muted text-center">
                <div className="text-xs text-muted-foreground">Reward</div>
                <div className="font-mono text-sm text-green-500">{lastBlock.reward.toFixed(4)} QCoin</div>
              </div>
              <div className="p-2 rounded bg-muted text-center">
                <div className="text-xs text-muted-foreground">Mining Time</div>
                <div className="font-mono text-sm">{lastBlock.miningTime}ms</div>
              </div>
              <div className="p-2 rounded bg-muted text-center">
                <div className="text-xs text-muted-foreground">Energy</div>
                <div className="font-mono text-sm">{lastBlock.energyUsed} kWh</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {poolStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pool Mining Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold text-primary">{poolStats.totalBlocks}</div>
                <div className="text-xs text-muted-foreground">Blocks</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold text-green-500">{poolStats.totalReward.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Total QCoin</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold text-blue-500">{poolStats.avgQuantumBoost.toFixed(1)}x</div>
                <div className="text-xs text-muted-foreground">Avg Boost</div>
              </div>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {poolStats.blocks.map((block, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                  <span className="font-mono truncate max-w-[200px]">{block.blockHash.slice(0, 20)}...</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">{block.reward.toFixed(4)} QCoin</span>
                    <Badge variant="outline" className="text-[10px]">{block.quantumBoost.toFixed(1)}x</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
