import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, RefreshCw } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  reward: number;
  cumulative: number;
  hashRate: number;
  quantumBoost: number;
}

export function MiningHistoryChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('mining_history')
        .select('reward, hash_rate, quantum_boost, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(200);

      if (error) throw error;
      if (!data || data.length === 0) { setChartData([]); setLoading(false); return; }

      let cumulative = 0;
      const points: ChartDataPoint[] = data.map((row) => {
        cumulative += Number(row.reward);
        const d = new Date(row.created_at);
        return {
          time: `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`,
          reward: Number(row.reward),
          cumulative: Math.round(cumulative * 100) / 100,
          hashRate: Math.round(Number(row.hash_rate) / 1e6 * 100) / 100,
          quantumBoost: Math.round(Number(row.quantum_boost) * 100) / 100,
        };
      });
      setChartData(points);
    } catch (err) {
      console.error('Mining history fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const chartConfig = {
    cumulative: { label: 'Total QCoin', color: 'hsl(var(--primary))' },
    reward: { label: 'Block Reward', color: 'hsl(45, 93%, 47%)' },
    quantumBoost: { label: 'Quantum Boost', color: 'hsl(221, 83%, 53%)' },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Mining History
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={fetchHistory} disabled={loading}>
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-12">
            No mining history yet. Mine some blocks to see your chart!
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradReward" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" fill="url(#gradCumulative)" strokeWidth={2} />
              <Area type="monotone" dataKey="reward" stroke="hsl(45, 93%, 47%)" fill="url(#gradReward)" strokeWidth={1.5} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
