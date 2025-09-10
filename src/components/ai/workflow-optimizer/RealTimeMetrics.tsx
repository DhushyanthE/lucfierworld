
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Users, ListTodo, BarChart3, Cpu } from 'lucide-react';
import { RealTimeMetrics as RealTimeMetricsType } from './useRealTimeWorkflowOptimizer';

interface RealTimeMetricsProps {
  metrics: RealTimeMetricsType;
}

export function RealTimeMetrics({ metrics }: RealTimeMetricsProps) {
  const metricsItems = [
    {
      label: 'Current Throughput',
      value: `${metrics.currentThroughput.toFixed(1)}/s`,
      icon: <Activity className="h-4 w-4" />,
      color: metrics.currentThroughput > 70 ? 'text-green-400' : metrics.currentThroughput > 40 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      label: 'Avg Response Time',
      value: `${metrics.averageResponseTime.toFixed(0)}ms`,
      icon: <Clock className="h-4 w-4" />,
      color: metrics.averageResponseTime < 100 ? 'text-green-400' : metrics.averageResponseTime < 200 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      label: 'Active Connections',
      value: metrics.activeConnections.toString(),
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-400'
    },
    {
      label: 'Processed Tasks',
      value: metrics.processedTasks.toString(),
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'text-purple-400'
    },
    {
      label: 'Queued Tasks',
      value: metrics.queuedTasks.toString(),
      icon: <ListTodo className="h-4 w-4" />,
      color: metrics.queuedTasks > 5 ? 'text-red-400' : 'text-green-400'
    },
    {
      label: 'System Load',
      value: `${metrics.systemLoad.toFixed(1)}%`,
      icon: <Cpu className="h-4 w-4" />,
      color: metrics.systemLoad < 70 ? 'text-green-400' : metrics.systemLoad < 85 ? 'text-yellow-400' : 'text-red-400'
    }
  ];

  return (
    <div>
      <div className="text-sm font-medium text-gray-200 mb-3">Real-Time Metrics</div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metricsItems.map((metric) => (
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
