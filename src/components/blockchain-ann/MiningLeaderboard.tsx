import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Crown, RefreshCw, Zap, TrendingUp } from 'lucide-react';

interface MinerRank {
  user_id: string;
  total_reward: number;
  total_blocks: number;
  avg_quantum_boost: number;
  avg_hash_rate: number;
  best_quantum_boost: number;
  efficiency_score: number;
}

export function MiningLeaderboard() {
  const [miners, setMiners] = useState<MinerRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'reward' | 'efficiency'>('reward');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Fetch all mining history (public leaderboard data)
      const { data, error } = await supabase
        .from('mining_history')
        .select('user_id, reward, quantum_boost, hash_rate, block_hash')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      if (!data || data.length === 0) {
        setMiners([]);
        setLoading(false);
        return;
      }

      // Aggregate by user
      const userMap = new Map<string, { rewards: number[]; boosts: number[]; hashRates: number[]; blocks: number }>();
      for (const row of data) {
        const existing = userMap.get(row.user_id) || { rewards: [], boosts: [], hashRates: [], blocks: 0 };
        existing.rewards.push(Number(row.reward));
        existing.boosts.push(Number(row.quantum_boost));
        existing.hashRates.push(Number(row.hash_rate));
        existing.blocks++;
        userMap.set(row.user_id, existing);
      }

      const ranked: MinerRank[] = Array.from(userMap.entries()).map(([userId, d]) => {
        const totalReward = d.rewards.reduce((a, b) => a + b, 0);
        const avgBoost = d.boosts.reduce((a, b) => a + b, 0) / d.boosts.length;
        const avgHash = d.hashRates.reduce((a, b) => a + b, 0) / d.hashRates.length;
        const bestBoost = Math.max(...d.boosts);
        const efficiency = (avgBoost * totalReward) / Math.max(d.blocks, 1);
        return {
          user_id: userId,
          total_reward: totalReward,
          total_blocks: d.blocks,
          avg_quantum_boost: avgBoost,
          avg_hash_rate: avgHash,
          best_quantum_boost: bestBoost,
          efficiency_score: efficiency,
        };
      });

      ranked.sort((a, b) => sortBy === 'reward' ? b.total_reward - a.total_reward : b.efficiency_score - a.efficiency_score);
      setMiners(ranked.slice(0, 20));
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, [sortBy]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-amber-400" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-mono text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Mining Leaderboard
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={sortBy === 'reward' ? 'default' : 'outline'}
              onClick={() => setSortBy('reward')}
            >
              <TrendingUp className="h-3 w-3 mr-1" /> QCoin
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'efficiency' ? 'default' : 'outline'}
              onClick={() => setSortBy('efficiency')}
            >
              <Zap className="h-3 w-3 mr-1" /> Efficiency
            </Button>
            <Button size="sm" variant="ghost" onClick={fetchLeaderboard}>
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {miners.length === 0 && !loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No mining data yet. Start mining to appear on the leaderboard!
          </div>
        ) : (
          <div className="space-y-2">
            {miners.map((miner, i) => (
              <div
                key={miner.user_id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  miner.user_id === currentUserId
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex-shrink-0">{getRankIcon(i)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs truncate max-w-[120px]">
                      {miner.user_id === currentUserId ? '🧑‍💻 You' : `Miner ${miner.user_id.slice(0, 8)}...`}
                    </span>
                    {i === 0 && <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30">Top Miner</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{miner.total_blocks} blocks</span>
                    <span>{miner.avg_quantum_boost.toFixed(1)}x avg boost</span>
                    <span>{(miner.avg_hash_rate / 1e6).toFixed(1)} MH/s</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-amber-500">{miner.total_reward.toFixed(2)}</div>
                  <div className="text-[10px] text-muted-foreground">QCoin</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
