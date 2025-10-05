/**
 * Metrics Panel Component
 * 
 * Real-time performance metrics and analytics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PerformanceMetrics } from '@/types/blockchain-ann.types';
import { 
  Activity, 
  Clock, 
  Target, 
  Zap, 
  Database,
  TrendingUp,
  Cpu,
  DollarSign 
} from 'lucide-react';

interface MetricsPanelProps {
  metrics: PerformanceMetrics;
  className?: string;
}

export function MetricsPanel({ metrics, className }: MetricsPanelProps) {
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const getPerformanceColor = (value: number, threshold: number = 0.8): string => {
    if (value >= threshold) return 'text-green-500';
    if (value >= threshold * 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const metricCards = [
    {
      title: 'Throughput',
      value: `${formatNumber(metrics.throughput)} tx/s`,
      icon: Activity,
      description: 'Transactions per second',
      color: 'text-blue-500',
      progress: Math.min((metrics.throughput / 1000) * 100, 100)
    },
    {
      title: 'Latency',
      value: `${formatNumber(metrics.latency)} ms`,
      icon: Clock,
      description: 'Average response time',
      color: 'text-purple-500',
      progress: Math.max(100 - (metrics.latency / 100) * 100, 0)
    },
    {
      title: 'Model Accuracy',
      value: formatPercentage(metrics.accuracy),
      icon: Target,
      description: 'Prediction accuracy',
      color: getPerformanceColor(metrics.accuracy),
      progress: metrics.accuracy * 100
    },
    {
      title: 'Precision',
      value: formatPercentage(metrics.precision),
      icon: Zap,
      description: 'True positive rate',
      color: getPerformanceColor(metrics.precision),
      progress: metrics.precision * 100
    },
    {
      title: 'Recall',
      value: formatPercentage(metrics.recall),
      icon: Database,
      description: 'Sensitivity',
      color: getPerformanceColor(metrics.recall),
      progress: metrics.recall * 100
    },
    {
      title: 'F1 Score',
      value: formatPercentage(metrics.f1Score),
      icon: TrendingUp,
      description: 'Harmonic mean',
      color: getPerformanceColor(metrics.f1Score),
      progress: metrics.f1Score * 100
    },
    {
      title: 'Energy Efficiency',
      value: `${formatNumber(metrics.energyEfficiency)} J/tx`,
      icon: Cpu,
      description: 'Energy per transaction',
      color: 'text-green-500',
      progress: Math.max(100 - (metrics.energyEfficiency / 10) * 100, 0)
    },
    {
      title: 'Blockchain Cost',
      value: `$${formatNumber(metrics.blockchainCost, 4)}`,
      icon: DollarSign,
      description: 'Cost per transaction',
      color: 'text-orange-500',
      progress: Math.max(100 - (metrics.blockchainCost / 0.1) * 100, 0)
    }
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </div>
                  <Progress value={metric.progress} className="h-1" />
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Training Performance</CardTitle>
            <CardDescription>Model training metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Training Time</span>
              <Badge variant="outline">{formatNumber(metrics.trainingTime / 1000)} sec</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Consensus Time</span>
              <Badge variant="outline">{formatNumber(metrics.consensusTime / 1000)} sec</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Time</span>
              <Badge>{formatNumber((metrics.trainingTime + metrics.consensusTime) / 1000)} sec</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>System resource metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Energy Efficiency</span>
                <span className="font-semibold">{formatNumber(metrics.energyEfficiency)} J/tx</span>
              </div>
              <Progress 
                value={Math.max(100 - (metrics.energyEfficiency / 10) * 100, 0)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cost Efficiency</span>
                <span className="font-semibold">${formatNumber(metrics.blockchainCost, 4)}/tx</span>
              </div>
              <Progress 
                value={Math.max(100 - (metrics.blockchainCost / 0.1) * 100, 0)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
          <CardDescription>Combined system health score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Model Quality</span>
                  <span className="font-semibold">{formatPercentage(metrics.f1Score)}</span>
                </div>
                <Progress value={metrics.f1Score * 100} className="h-3" />
              </div>
              <Badge 
                variant={metrics.f1Score >= 0.9 ? "default" : metrics.f1Score >= 0.7 ? "secondary" : "destructive"}
              >
                {metrics.f1Score >= 0.9 ? 'Excellent' : metrics.f1Score >= 0.7 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {formatPercentage(metrics.accuracy)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {formatNumber(metrics.throughput)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Throughput</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {formatNumber(metrics.latency)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Latency (ms)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
