
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Activity, Users, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NetworkMetric {
  name: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

export function NetworkStatistics() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetric[]>([]);
  const [nodeStatistics, setNodeStatistics] = useState({
    totalNodes: 0,
    activeNodes: 0,
    quantumNodesPercentage: 0,
    averageBlockTime: 0,
    transactionsPerSecond: 0,
  });
  
  // Fetch network statistics
  const fetchNetworkStats = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Simulate fetched data
      setNetworkMetrics([
        {
          name: 'Network Hash Rate',
          value: '342.5 PH/s',
          change: 5.3,
          icon: <Activity className="h-5 w-5 text-blue-400" />
        },
        {
          name: 'Active Validators',
          value: '3,842',
          change: 2.1,
          icon: <Users className="h-5 w-5 text-green-400" />
        },
        {
          name: 'Quantum Nodes',
          value: '1,256',
          change: 12.8,
          icon: <Network className="h-5 w-5 text-purple-400" />
        },
        {
          name: 'Block Height',
          value: '8,745,322',
          change: 0.1,
          icon: <Database className="h-5 w-5 text-orange-400" />
        }
      ]);
      
      setNodeStatistics({
        totalNodes: 5214,
        activeNodes: 4927,
        quantumNodesPercentage: 24.1,
        averageBlockTime: 6.2,
        transactionsPerSecond: 2845,
      });
      
      setLastUpdated(new Date());
      toast.success('Network statistics updated');
    } catch (error) {
      console.error('Error fetching network stats:', error);
      toast.error('Failed to update network statistics');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchNetworkStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Network className="h-5 w-5 text-purple-400 mr-2" />
          Network Statistics
        </h3>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          
          <Button 
            onClick={fetchNetworkStats} 
            disabled={isLoading}
            variant="outline" 
            className="h-8 px-3 py-1 text-xs border-purple-500/30"
          >
            {isLoading ? 'Updating...' : 'Refresh Stats'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {networkMetrics.map((metric, index) => (
          <Card key={index} className="bg-black/40 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-gray-800 p-2 rounded-lg">
                  {metric.icon}
                </div>
                <Badge className={metric.change > 0 ? 'bg-green-600/40 text-green-400' : 'bg-red-600/40 text-red-400'}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-400">{metric.name}</div>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Node Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Nodes</span>
                <span className="text-lg font-medium text-white">{nodeStatistics.totalNodes.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Active Nodes</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600/40 text-green-400">
                    {((nodeStatistics.activeNodes / nodeStatistics.totalNodes) * 100).toFixed(1)}%
                  </Badge>
                  <span className="text-lg font-medium text-white">{nodeStatistics.activeNodes.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Quantum Nodes</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600/40 text-purple-400">
                    {nodeStatistics.quantumNodesPercentage.toFixed(1)}%
                  </Badge>
                  <span className="text-lg font-medium text-white">
                    {Math.round(nodeStatistics.totalNodes * (nodeStatistics.quantumNodesPercentage / 100)).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-300">
                  Quantum nodes provide enhanced security through post-quantum cryptographic algorithms and entanglement verification protocols, ensuring transaction integrity against quantum computing attacks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Average Block Time</span>
                <span className="text-lg font-medium text-white">{nodeStatistics.averageBlockTime.toFixed(1)} seconds</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Transactions Per Second</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600/40 text-blue-400">
                    High Capacity
                  </Badge>
                  <span className="text-lg font-medium text-white">{nodeStatistics.transactionsPerSecond.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Network Latency</span>
                <span className="text-lg font-medium text-white">127 ms</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Finality Time</span>
                <span className="text-lg font-medium text-white">12.4 seconds</span>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-300">
                  The network maintains high throughput with quantum-secure consensus mechanisms, providing fast transaction finality while preserving cryptographic integrity even against quantum computing attacks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
