
import React from 'react';
import { Card } from '@/components/ui/card';
import { Brain, Shield, Network, Activity, CircleCheck, CircleAlert } from 'lucide-react';

interface FidelityMetricProps {
  metric: {
    name: string;
    value: number;
    threshold: number;
    description: string;
  };
  index: number;
}

export function FidelityMetricCard({ metric, index }: FidelityMetricProps) {
  return (
    <Card className={`relative overflow-hidden bg-black/50 border-${metric.value >= metric.threshold ? 'green' : 'amber'}-500/20`}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-black/0 pointer-events-none"></div>
      <div className="p-4 relative z-10">
        <div className="text-sm text-gray-400 flex items-center gap-2">
          {index === 0 ? <Brain className="h-4 w-4 text-purple-400" /> : 
           index === 1 ? <Shield className="h-4 w-4 text-purple-400" /> :
           index === 2 ? <Network className="h-4 w-4 text-purple-400" /> :
           <Activity className="h-4 w-4 text-purple-400" />}
          {metric.name}
        </div>
        <div className="flex items-end gap-1.5 mt-1">
          <div className="text-2xl font-bold transition-all duration-700">{metric.value.toFixed(1)}%</div>
          {metric.value >= metric.threshold ? (
            <CircleCheck className="h-4 w-4 text-green-500 mb-1" />
          ) : (
            <CircleAlert className="h-4 w-4 text-amber-500 mb-1" />
          )}
        </div>
        <div className="mt-2 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              metric.value >= 90 ? 'bg-gradient-to-r from-green-600 to-emerald-400' :
              metric.value >= 80 ? 'bg-gradient-to-r from-blue-600 to-cyan-400' :
              metric.value >= 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
              'bg-gradient-to-r from-red-600 to-orange-500'
            }`}
            style={{ 
              width: `${Math.min(100, metric.value)}%`,
              boxShadow: metric.value >= metric.threshold ? '0 0 8px rgba(74, 222, 128, 0.5)' : 'none'
            }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">{metric.description}</div>
      </div>
    </Card>
  );
}
