
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { OptimizationMetrics } from './useRealTimeWorkflowOptimizer';

interface WorkflowMetricsProps {
  metrics: OptimizationMetrics;
}

export function WorkflowMetrics({ metrics }: WorkflowMetricsProps) {
  const metricItems = [
    {
      label: 'Throughput',
      value: `${metrics.throughput.toFixed(1)}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      color: metrics.throughput > 70 ? 'text-green-400' : metrics.throughput > 40 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      label: 'Latency',
      value: `${metrics.latency.toFixed(0)}ms`,
      icon: <Clock className="h-4 w-4" />,
      color: metrics.latency < 20 ? 'text-green-400' : metrics.latency < 50 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      label: 'Error Rate',
      value: `${metrics.errorRate.toFixed(2)}%`,
      icon: <AlertCircle className="h-4 w-4" />,
      color: metrics.errorRate < 5 ? 'text-green-400' : metrics.errorRate < 15 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      label: 'Resource Usage',
      value: `${metrics.resourceUtilization.toFixed(0)}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      color: metrics.resourceUtilization < 80 ? 'text-green-400' : metrics.resourceUtilization < 90 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      label: 'Cost Efficiency',
      value: `${metrics.costEfficiency.toFixed(1)}%`,
      icon: <DollarSign className="h-4 w-4" />,
      color: metrics.costEfficiency > 70 ? 'text-green-400' : metrics.costEfficiency > 40 ? 'text-yellow-400' : 'text-red-400'
    }
  ];

  return (
    <div>
      <div className="text-sm font-medium text-gray-200 mb-3">Performance Metrics</div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {metricItems.map((metric) => (
          <Card key={metric.label} className="bg-gray-900/40 border-gray-700/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <div className={`${metric.color}`}>
                  {metric.icon}
                </div>
                <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-600">
                  {metric.value}
                </Badge>
              </div>
              <div className="text-xs text-gray-400">{metric.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
