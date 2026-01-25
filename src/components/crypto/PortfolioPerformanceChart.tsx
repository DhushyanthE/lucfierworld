import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { HoldingWithPL } from '@/hooks/usePortfolio';
import { formatCurrency } from '@/lib/utils';

interface PortfolioPerformanceChartProps {
  holdings: HoldingWithPL[];
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}

interface ChartDataPoint {
  name: string;
  value: number;
  cost: number;
  profitLoss: number;
  symbol: string;
}

export function PortfolioPerformanceChart({
  holdings,
  totalValue,
  totalCost,
  totalProfitLoss,
  totalProfitLossPercent,
}: PortfolioPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (holdings.length === 0) return [];

    // Sort holdings by value for better visualization
    const sortedHoldings = [...holdings].sort((a, b) => b.currentValue - a.currentValue);

    return sortedHoldings.map((holding): ChartDataPoint => ({
      name: holding.symbol,
      value: holding.currentValue,
      cost: holding.amount * holding.purchase_price,
      profitLoss: holding.profitLoss,
      symbol: holding.symbol,
    }));
  }, [holdings]);

  const allocationData = useMemo(() => {
    if (holdings.length === 0) return [];

    return holdings.map((holding) => ({
      name: holding.symbol,
      value: holding.currentValue,
      percentage: totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0,
      profitLossPercent: holding.profitLossPercent,
    }));
  }, [holdings, totalValue]);

  if (holdings.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Portfolio Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">Add holdings to see performance charts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur border border-border rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-foreground mb-2">{data.symbol}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Value:</span>
              <span className="font-medium text-foreground">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Cost:</span>
              <span className="font-medium text-foreground">{formatCurrency(data.cost)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">P/L:</span>
              <span className={`font-medium ${data.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.profitLoss >= 0 ? '+' : ''}{formatCurrency(data.profitLoss)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Portfolio Performance
          </CardTitle>
          <div className="flex items-center gap-2">
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-lg font-semibold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Value vs Cost Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Value vs Cost Basis</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Current Value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#valueGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  name="Cost Basis"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#costGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Asset Allocation</h4>
          <div className="space-y-3">
            {allocationData.map((asset, index) => {
              const colors = [
                'bg-primary',
                'bg-blue-500',
                'bg-green-500',
                'bg-yellow-500',
                'bg-purple-500',
                'bg-pink-500',
                'bg-orange-500',
                'bg-cyan-500',
              ];
              const color = colors[index % colors.length];

              return (
                <div key={asset.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="font-medium text-foreground">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{formatCurrency(asset.value)}</span>
                      <span className={`font-medium ${asset.profitLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.profitLossPercent >= 0 ? '+' : ''}{asset.profitLossPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(asset.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {asset.percentage.toFixed(1)}% of portfolio
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalCost)}</div>
            <div className="text-xs text-muted-foreground">Cost Basis</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
            </div>
            <div className="text-xs text-muted-foreground">Total P/L</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
