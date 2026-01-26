import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, RefreshCw, ChartLine } from 'lucide-react';
import { usePortfolioSnapshots, PortfolioSnapshot } from '@/hooks/usePortfolioSnapshots';
import { usePortfolio, PortfolioSummary } from '@/hooks/usePortfolio';
import { formatCurrency } from '@/lib/utils';
import { CryptoPrice } from '@/services/cryptoApiService';

interface HistoricalPerformanceChartProps {
  currentPrices?: CryptoPrice[];
  portfolioSummary?: PortfolioSummary;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export function HistoricalPerformanceChart({ currentPrices = [], portfolioSummary }: HistoricalPerformanceChartProps) {
  const { snapshots, loading, saveSnapshot, refetch } = usePortfolioSnapshots();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save today's snapshot when portfolio data is available
  useEffect(() => {
    if (portfolioSummary && portfolioSummary.totalValue > 0) {
      const saveToday = async () => {
        setIsSaving(true);
        await saveSnapshot({
          total_value: portfolioSummary.totalValue,
          total_cost: portfolioSummary.totalCost,
          total_profit_loss: portfolioSummary.totalProfitLoss,
          holdings_data: portfolioSummary.holdings.map(h => ({
            symbol: h.symbol,
            amount: h.amount,
            currentValue: h.currentValue,
            profitLoss: h.profitLoss,
          })),
        });
        setIsSaving(false);
      };
      
      // Debounce to avoid excessive saves
      const timer = setTimeout(saveToday, 2000);
      return () => clearTimeout(timer);
    }
  }, [portfolioSummary?.totalValue, portfolioSummary?.totalCost]);

  const getFilteredSnapshots = () => {
    if (snapshots.length === 0) return [];
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'all':
      default:
        cutoffDate = new Date(0);
    }

    return snapshots.filter(s => new Date(s.snapshot_date) >= cutoffDate);
  };

  const filteredSnapshots = getFilteredSnapshots();

  const chartData = filteredSnapshots.map(snapshot => ({
    date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: snapshot.snapshot_date,
    value: Number(snapshot.total_value),
    cost: Number(snapshot.total_cost),
    profitLoss: Number(snapshot.total_profit_loss),
  }));

  // Calculate performance metrics
  const firstSnapshot = filteredSnapshots[0];
  const lastSnapshot = filteredSnapshots[filteredSnapshots.length - 1];
  const periodChange = firstSnapshot && lastSnapshot 
    ? Number(lastSnapshot.total_value) - Number(firstSnapshot.total_value)
    : 0;
  const periodChangePercent = firstSnapshot && Number(firstSnapshot.total_value) > 0
    ? (periodChange / Number(firstSnapshot.total_value)) * 100
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Value:</span>
              <span className="text-sm font-semibold text-primary">{formatCurrency(payload[0]?.value || 0)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Cost:</span>
              <span className="text-sm text-foreground">{formatCurrency(payload[1]?.value || 0)}</span>
            </div>
            {payload[2] && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">P/L:</span>
                <span className={`text-sm font-medium ${payload[2].value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {payload[2].value >= 0 ? '+' : ''}{formatCurrency(payload[2].value)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <ChartLine className="h-5 w-5 text-primary" />
            </div>
            Historical Performance
            {isSaving && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-xs">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Saving
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted/30 rounded-lg p-1">
              {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 px-3 text-xs ${
                    timeRange === range 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range === 'all' ? 'All' : range.toUpperCase()}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-7 gap-1"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted/30 mb-4">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">No Historical Data</p>
            <p className="text-muted-foreground text-sm max-w-xs">
              Historical snapshots will be saved automatically as you track your portfolio
            </p>
          </div>
        ) : (
          <>
            {/* Period Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/20 rounded-xl">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Period Start</p>
                <p className="text-lg font-semibold text-foreground">
                  {firstSnapshot ? formatCurrency(Number(firstSnapshot.total_value)) : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Value</p>
                <p className="text-lg font-semibold text-foreground">
                  {lastSnapshot ? formatCurrency(Number(lastSnapshot.total_value)) : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Period Change</p>
                <p className={`text-lg font-semibold flex items-center gap-1 ${periodChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {periodChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {periodChange >= 0 ? '+' : ''}{formatCurrency(periodChange)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Period Return</p>
                <p className={`text-lg font-semibold ${periodChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {periodChangePercent >= 0 ? '+' : ''}{periodChangePercent.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Portfolio Value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#valueGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    name="Cost Basis"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    fill="url(#costGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Showing {chartData.length} data point{chartData.length !== 1 ? 's' : ''} • Snapshots saved daily
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
