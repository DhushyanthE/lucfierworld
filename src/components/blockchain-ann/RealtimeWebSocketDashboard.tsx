/**
 * Real-Time WebSocket Metrics Dashboard
 * Live streaming metrics visualization with animated charts
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, WifiOff, RefreshCw, Activity, Cpu, 
  Database, Shield, Brain, Zap, Clock
} from 'lucide-react';
import { useRealtimeMetricsWebSocket, RealtimeMetrics } from '@/hooks/useRealtimeMetricsWebSocket';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

interface MetricGaugeProps {
  label: string;
  value: number;
  maxValue?: number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
}

function MetricGauge({ label, value, maxValue = 100, unit = '%', icon, color = 'primary' }: MetricGaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="p-4 rounded-lg bg-card border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-${color}/10`}>
            {icon}
          </div>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <span className="text-lg font-bold">
          {typeof value === 'number' ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

export function RealtimeWebSocketDashboard() {
  const {
    isConnected,
    isConnecting,
    metrics,
    metricsHistory,
    lastUpdate,
    updateCount,
    error,
    connect,
    disconnect,
    requestRefresh,
    clearHistory
  } = useRealtimeMetricsWebSocket();

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (metrics) {
      setChartData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          quantum: metrics.quantum.coherence * 100,
          agi: metrics.agi.confidence * 100,
          neural: metrics.neural.rnnAccuracy * 100,
          security: metrics.security.securityScore * 100,
          system: 100 - metrics.system.cpuUsage
        };
        return [...prev.slice(-29), newPoint];
      });
    }
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Connection Status Header */}
      <Card className={`border-2 ${isConnected ? 'border-green-500/50' : 'border-red-500/50'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {isConnected ? (
                  <Wifi className="h-6 w-6 text-green-500 animate-pulse" />
                ) : (
                  <WifiOff className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Real-Time WebSocket Metrics
                  <Badge variant={isConnected ? 'default' : 'destructive'}>
                    {isConnected ? 'LIVE' : 'DISCONNECTED'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {isConnected 
                    ? `Streaming live • ${updateCount} updates received`
                    : error || 'Click Connect to start live streaming'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              {isConnected ? (
                <>
                  <Button variant="outline" size="sm" onClick={requestRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={disconnect}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button onClick={connect} disabled={isConnecting}>
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {metrics ? (
        <>
          {/* Live Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 animate-pulse text-green-500" />
                  Live System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="quantum" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Quantum" />
                    <Area type="monotone" dataKey="agi" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} name="AGI" />
                    <Area type="monotone" dataKey="neural" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Neural" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cpu className="h-5 w-5 animate-pulse text-blue-500" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="system" stroke="#f59e0b" strokeWidth={2} dot={false} name="Available CPU" />
                    <Line type="monotone" dataKey="security" stroke="#ef4444" strokeWidth={2} dot={false} name="Security" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Metric Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricGauge 
              label="Quantum Coherence" 
              value={metrics.quantum.coherence * 100} 
              icon={<Zap className="h-4 w-4 text-purple-500" />} 
            />
            <MetricGauge 
              label="AGI Confidence" 
              value={metrics.agi.confidence * 100} 
              icon={<Brain className="h-4 w-4 text-cyan-500" />} 
            />
            <MetricGauge 
              label="RNN Accuracy" 
              value={metrics.neural.rnnAccuracy * 100} 
              icon={<Activity className="h-4 w-4 text-green-500" />} 
            />
            <MetricGauge 
              label="Security Score" 
              value={metrics.security.securityScore * 100} 
              icon={<Shield className="h-4 w-4 text-red-500" />} 
            />
            <MetricGauge 
              label="CPU Usage" 
              value={metrics.system.cpuUsage} 
              icon={<Cpu className="h-4 w-4 text-orange-500" />} 
            />
            <MetricGauge 
              label="Memory Usage" 
              value={metrics.system.memoryUsage} 
              icon={<Database className="h-4 w-4 text-blue-500" />} 
            />
          </div>

          {/* Detailed Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quantum Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Qubits</span><span>{metrics.quantum.qubitCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Circuit Depth</span><span>{metrics.quantum.circuitDepth}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gate Error</span><span>{(metrics.quantum.gateErrorRate * 100).toFixed(3)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Entanglement</span><span>{(metrics.quantum.entanglementFidelity * 100).toFixed(1)}%</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">AGI Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Active Models</span><span>{metrics.agi.activeModels}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Processing</span><span>{metrics.agi.processingPower.toFixed(2)} TFLOPS</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Latency</span><span>{metrics.agi.inferenceLatency.toFixed(1)}ms</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Optimization</span><span>{(metrics.agi.optimizationScore * 100).toFixed(1)}%</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Blockchain Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Block Height</span><span>{metrics.blockchain.blockHeight.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">TPS</span><span>{metrics.blockchain.transactionsPerSecond.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Nodes</span><span>{metrics.blockchain.nodeCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gas Price</span><span>{metrics.blockchain.gasPrice.toFixed(1)} gwei</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Security Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Active Patterns</span><span>{metrics.security.activePatterns}/20</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Threat Level</span>
                  <Badge variant={metrics.security.threatLevel === 'low' ? 'default' : 'destructive'} className="text-xs">
                    {metrics.security.threatLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Anomalies</span><span>{metrics.anomaly.detected}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Risk Score</span><span>{(metrics.anomaly.riskScore * 100).toFixed(1)}%</span></div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Wifi className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Live Data</h3>
            <p className="text-muted-foreground mb-4">
              Connect to the WebSocket to start receiving real-time metrics
            </p>
            <Button onClick={connect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect to Live Stream'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
