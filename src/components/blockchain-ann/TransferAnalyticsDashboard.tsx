/**
 * Transfer Analytics Dashboard
 * Charts showing transfer volume, success rates, and security scores over time
 */

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, TrendingUp, Shield, Activity, 
  CheckCircle, XCircle, Clock, Zap
} from 'lucide-react';
import { useQuantumTransferHistory, QuantumTransfer } from '@/hooks/useQuantumTransferHistory';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4'
};

const PIE_COLORS = [CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.info, CHART_COLORS.danger];

export function TransferAnalyticsDashboard() {
  const { transfers, isLoading } = useQuantumTransferHistory();

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (transfers.length === 0) {
      return {
        volumeOverTime: [],
        statusDistribution: [],
        securityScoreDistribution: [],
        dailyStats: [],
        summaryStats: {
          totalVolume: 0,
          avgSecurityScore: 0,
          successRate: 0,
          avgFidelity: 0,
          avgLayersPassed: 0,
          totalTransfers: 0
        }
      };
    }

    // Last 7 days for time-based charts
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    // Volume over time (last 7 days)
    const volumeOverTime = last7Days.map(day => {
      const dayStart = startOfDay(day);
      const dayTransfers = transfers.filter(t => {
        const tDate = startOfDay(new Date(t.created_at));
        return tDate.getTime() === dayStart.getTime();
      });
      
      return {
        date: format(day, 'MMM dd'),
        fullDate: format(day, 'yyyy-MM-dd'),
        volume: dayTransfers.reduce((sum, t) => sum + Number(t.amount), 0),
        count: dayTransfers.length,
        completed: dayTransfers.filter(t => t.transfer_status === 'completed').length,
        failed: dayTransfers.filter(t => t.transfer_status === 'failed').length
      };
    });

    // Status distribution
    const statusCounts = {
      completed: transfers.filter(t => t.transfer_status === 'completed').length,
      pending: transfers.filter(t => t.transfer_status === 'pending').length,
      in_progress: transfers.filter(t => t.transfer_status === 'in_progress').length,
      failed: transfers.filter(t => t.transfer_status === 'failed').length
    };

    const statusDistribution = [
      { name: 'Completed', value: statusCounts.completed, color: CHART_COLORS.success },
      { name: 'Pending', value: statusCounts.pending, color: CHART_COLORS.warning },
      { name: 'In Progress', value: statusCounts.in_progress, color: CHART_COLORS.info },
      { name: 'Failed', value: statusCounts.failed, color: CHART_COLORS.danger }
    ].filter(item => item.value > 0);

    // Security score distribution (ranges)
    const completedTransfers = transfers.filter(t => t.transfer_status === 'completed' && t.security_score !== null);
    const securityRanges = [
      { range: '0-60%', min: 0, max: 60 },
      { range: '60-75%', min: 60, max: 75 },
      { range: '75-90%', min: 75, max: 90 },
      { range: '90-100%', min: 90, max: 100 }
    ];

    const securityScoreDistribution = securityRanges.map(({ range, min, max }) => ({
      range,
      count: completedTransfers.filter(t => 
        (t.security_score || 0) >= min && (t.security_score || 0) < max
      ).length
    }));

    // Daily stats with success rate and avg security
    const dailyStats = last7Days.map(day => {
      const dayStart = startOfDay(day);
      const dayTransfers = transfers.filter(t => {
        const tDate = startOfDay(new Date(t.created_at));
        return tDate.getTime() === dayStart.getTime();
      });
      
      const completed = dayTransfers.filter(t => t.transfer_status === 'completed');
      const finishedTransfers = dayTransfers.filter(t => 
        t.transfer_status === 'completed' || t.transfer_status === 'failed'
      );
      
      const successRate = finishedTransfers.length > 0 
        ? (completed.length / finishedTransfers.length) * 100 
        : 0;
      
      const avgScore = completed.length > 0
        ? completed.reduce((sum, t) => sum + (t.security_score || 0), 0) / completed.length
        : 0;

      return {
        date: format(day, 'MMM dd'),
        successRate: Math.round(successRate),
        avgSecurityScore: Math.round(avgScore * 10) / 10,
        transfers: dayTransfers.length
      };
    });

    // Summary stats
    const finishedTransfers = transfers.filter(t => 
      t.transfer_status === 'completed' || t.transfer_status === 'failed'
    );
    const successfulTransfers = transfers.filter(t => t.transfer_status === 'completed');

    const summaryStats = {
      totalVolume: transfers.reduce((sum, t) => sum + Number(t.amount), 0),
      avgSecurityScore: successfulTransfers.length > 0
        ? successfulTransfers.reduce((sum, t) => sum + (t.security_score || 0), 0) / successfulTransfers.length
        : 0,
      successRate: finishedTransfers.length > 0
        ? (successfulTransfers.length / finishedTransfers.length) * 100
        : 0,
      avgFidelity: successfulTransfers.length > 0
        ? successfulTransfers.reduce((sum, t) => sum + (Number(t.quantum_fidelity) || 0), 0) / successfulTransfers.length * 100
        : 0,
      avgLayersPassed: successfulTransfers.length > 0
        ? successfulTransfers.reduce((sum, t) => sum + (t.layers_passed || 0), 0) / successfulTransfers.length
        : 0,
      totalTransfers: transfers.length
    };

    return {
      volumeOverTime,
      statusDistribution,
      securityScoreDistribution,
      dailyStats,
      summaryStats
    };
  }, [transfers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Transfer Analytics Dashboard</CardTitle>
              <CardDescription>
                Real-time insights into quantum transfer performance and security metrics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{analytics.summaryStats.totalTransfers}</p>
            <p className="text-xs text-muted-foreground">Total Transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold">{analytics.summaryStats.totalVolume.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Volume (QU)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{analytics.summaryStats.successRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{analytics.summaryStats.avgSecurityScore.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Avg Security Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{analytics.summaryStats.avgFidelity.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">Avg Fidelity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">{analytics.summaryStats.avgLayersPassed.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Avg Layers Passed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transfer Volume (Last 7 Days)</CardTitle>
            <CardDescription>Daily transfer volume in quantum units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.volumeOverTime}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value.toLocaleString() + ' QU', 'Volume']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke={CHART_COLORS.cyan} 
                    fill="url(#volumeGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Count Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Transfer Count</CardTitle>
            <CardDescription>Completed vs Failed transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.volumeOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" name="Failed" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
            <CardDescription>Current transfer status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {analytics.statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Success Rate Trend</CardTitle>
            <CardDescription>Daily success rate percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value + '%', 'Success Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke={CHART_COLORS.success} 
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.success, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Security Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security Score Distribution</CardTitle>
            <CardDescription>Completed transfers by security range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.securityScoreDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="range" type="category" className="text-xs" width={60} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS.purple} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Avg Security Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Average Security Score Trend</CardTitle>
          <CardDescription>Daily average security scores for completed transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyStats}>
                <defs>
                  <linearGradient id="securityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [value.toFixed(1) + '%', 'Avg Security Score']}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgSecurityScore" 
                  stroke={CHART_COLORS.purple} 
                  fill="url(#securityGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
