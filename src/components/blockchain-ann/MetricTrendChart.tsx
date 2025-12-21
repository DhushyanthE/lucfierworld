import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp, Trash2, Eye, EyeOff } from 'lucide-react';

interface MetricTrendChartProps {
  chartData: Array<{
    name: string;
    index: number;
    systemHealth: number;
    quantumFidelity: number;
    agiScore: number;
    agenticAccuracy: number;
    anomalyRisk: number;
    bigDataThroughput: number;
    genomicAccuracy: number;
  }>;
  dataPointCount: number;
  onClear: () => void;
}

const METRIC_CONFIG = [
  { key: 'systemHealth', name: 'System Health', color: '#22c55e' },
  { key: 'quantumFidelity', name: 'Quantum Fidelity', color: '#3b82f6' },
  { key: 'agiScore', name: 'AGI Score', color: '#a855f7' },
  { key: 'agenticAccuracy', name: 'Agentic Accuracy', color: '#f97316' },
  { key: 'anomalyRisk', name: 'Anomaly Risk', color: '#ef4444' },
  { key: 'genomicAccuracy', name: 'Genomic Accuracy', color: '#10b981' },
];

export function MetricTrendChart({ chartData, dataPointCount, onClear }: MetricTrendChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(
    new Set(['systemHealth', 'quantumFidelity', 'agiScore'])
  );

  const toggleMetric = (key: string) => {
    setVisibleMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Live Metric Trends
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {dataPointCount} data points
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear}
              className="h-7 px-2"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metric toggles */}
        <div className="flex flex-wrap gap-1">
          {METRIC_CONFIG.map(metric => (
            <Button
              key={metric.key}
              variant={visibleMetrics.has(metric.key) ? 'default' : 'outline'}
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => toggleMetric(metric.key)}
              style={{
                backgroundColor: visibleMetrics.has(metric.key) ? metric.color : undefined,
                borderColor: metric.color,
                color: visibleMetrics.has(metric.key) ? 'white' : metric.color,
              }}
            >
              {visibleMetrics.has(metric.key) ? (
                <Eye className="h-3 w-3 mr-1" />
              ) : (
                <EyeOff className="h-3 w-3 mr-1" />
              )}
              {metric.name}
            </Button>
          ))}
        </div>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data yet</p>
              <p className="text-xs">Enable polling to start collecting trend data</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value, index) => {
                    // Show fewer labels for readability
                    if (chartData.length <= 10) return value;
                    return index % 5 === 0 ? value : '';
                  }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px' }}
                  formatter={(value) => {
                    const config = METRIC_CONFIG.find(m => m.key === value);
                    return config?.name || value;
                  }}
                />
                {METRIC_CONFIG.map(metric => (
                  visibleMetrics.has(metric.key) && (
                    <Line
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      stroke={metric.color}
                      strokeWidth={2}
                      dot={chartData.length < 20}
                      activeDot={{ r: 4 }}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
