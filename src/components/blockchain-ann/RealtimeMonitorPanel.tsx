import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Cpu, Zap, Network, TrendingUp } from 'lucide-react';

export function RealtimeMonitorPanel() {
  const [metrics, setMetrics] = useState({
    throughput: 0,
    latency: 0,
    activeNodes: 0,
    consensusScore: 0,
    quantumEntanglement: 0,
    neuralAccuracy: 0
  });

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics({
        throughput: 1000 + Math.random() * 500,
        latency: 10 + Math.random() * 20,
        activeNodes: Math.floor(8 + Math.random() * 4),
        consensusScore: 0.90 + Math.random() * 0.09,
        quantumEntanglement: 0.70 + Math.random() * 0.29,
        neuralAccuracy: 0.85 + Math.random() * 0.14
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          Real-Time System Monitor
        </CardTitle>
        <CardDescription>
          Live metrics from blockchain-ANN network
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-background/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Throughput</span>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold font-mono">
                  {metrics.throughput.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">transactions/sec</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold font-mono">
                  {metrics.latency.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">milliseconds</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Nodes</span>
                  <Network className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold font-mono">
                  {metrics.activeNodes}
                </p>
                <p className="text-xs text-muted-foreground">validator nodes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Consensus</span>
                  <Badge variant="outline" className="text-xs">
                    {(metrics.consensusScore * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${metrics.consensusScore * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">blockchain agreement</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quantum</span>
                  <Badge variant="outline" className="text-xs">
                    {(metrics.quantumEntanglement * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${metrics.quantumEntanglement * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">entanglement score</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Neural Accuracy</span>
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold font-mono">
                  {(metrics.neuralAccuracy * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">prediction accuracy</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold">System Status: Operational</span>
              <Badge variant="outline" className="ml-auto">
                All Systems Nominal
              </Badge>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
