import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Medal, Trophy, Zap } from 'lucide-react';

interface Row {
  miner_alias: string; total_blocks: number; total_reward: number;
  avg_quantum_boost: number; avg_hash_rate: number; best_quantum_boost: number;
}

export default function MiningLeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (supabase.from('mining_leaderboard' as never).select('*') as any)
      .then(({ data }: any) => { setRows(data ?? []); setLoading(false); });
  }, []);

  const icon = (i: number) =>
    i === 0 ? <Crown className="h-5 w-5 text-amber-400" /> :
    i === 1 ? <Medal className="h-5 w-5 text-gray-400" /> :
    i === 2 ? <Medal className="h-5 w-5 text-amber-600" /> :
    <span className="w-5 text-center text-xs text-muted-foreground">{i + 1}</span>;

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">Mining Leaderboard</h1>
          <Badge variant="outline" className="ml-2">Public · anonymized</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Aggregated, public-safe view. No user identities are exposed — miners are identified by an anonymized alias only.
        </p>
        <Card>
          <CardHeader><CardTitle>Top 50 miners</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div>Loading…</div> : rows.length === 0 ? (
              <div className="text-muted-foreground text-sm py-6 text-center">No mining activity yet.</div>
            ) : (
              <div className="space-y-2">
                {rows.map((r, i) => (
                  <div key={r.miner_alias} className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                    {icon(i)}
                    <div className="flex-1">
                      <div className="font-mono text-xs">miner-{r.miner_alias}</div>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span>{r.total_blocks} blocks</span>
                        <span><Zap className="h-3 w-3 inline" /> {Number(r.avg_quantum_boost).toFixed(2)}x avg</span>
                        <span>{(Number(r.avg_hash_rate) / 1e6).toFixed(1)} MH/s</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-500">{Number(r.total_reward).toFixed(2)}</div>
                      <div className="text-[10px] text-muted-foreground">QCoin</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
