
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Network } from 'lucide-react';

interface IoTNetworkMetricsProps {
  iotNetwork: {
    deviceEfficiency: number;
    powerConsumption: number;
    dataTransmissionRate: number;
    networkLatency: number;
  };
  isLoading: boolean;
  optimizeIoTNetwork: () => Promise<void>;
}

export function IoTNetworkMetrics({
  iotNetwork,
  isLoading,
  optimizeIoTNetwork
}: IoTNetworkMetricsProps) {
  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <Network className="h-4 w-4 mr-2 text-purple-400" />
          IoT Network Performance
        </h3>
        <Button
          onClick={optimizeIoTNetwork}
          size="sm"
          variant="outline"
          className="h-7 text-xs border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30"
          disabled={isLoading}
        >
          {isLoading ? 'Optimizing...' : 'Optimize'}
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Device Efficiency</span>
            <span className="text-xs text-purple-300">{Math.round(iotNetwork.deviceEfficiency * 100)}%</span>
          </div>
          <Progress value={iotNetwork.deviceEfficiency * 100} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Power Consumption</span>
            <span className="text-xs text-purple-300">{Math.round((1 - iotNetwork.powerConsumption) * 100)}% saved</span>
          </div>
          <Progress value={(1 - iotNetwork.powerConsumption) * 100} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Data Transmission Rate</span>
            <span className="text-xs text-purple-300">{Math.round(iotNetwork.dataTransmissionRate * 100)}%</span>
          </div>
          <Progress value={iotNetwork.dataTransmissionRate * 100} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Network Latency</span>
            <span className="text-xs text-purple-300">{Math.round((1 - iotNetwork.networkLatency) * 100)}% reduced</span>
          </div>
          <Progress value={(1 - iotNetwork.networkLatency) * 100} className="h-1" />
        </div>
      </div>
    </div>
  );
}
