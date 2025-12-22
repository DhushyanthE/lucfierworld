/**
 * Comprehensive Unified Dashboard
 * Combines all quantum, AGI, and blockchain-ANN metrics into a single view
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, Atom, Brain, Database, Dna, 
  Network, RefreshCw, Shield, AlertTriangle,
  TrendingUp, Bot
} from 'lucide-react';
import { useUnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { useQuantumBlockchainIntegration } from '@/hooks/useQuantumBlockchainIntegration';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  status?: 'healthy' | 'warning' | 'critical';
}

const MetricCard = ({ title, value, icon, status = 'healthy' }: MetricCardProps) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        <Badge variant={status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
          {status}
        </Badge>
      </div>
      <div className="mt-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export function ComprehensiveUnifiedDashboard() {
  const { metrics, isLoading, refreshAllMetrics, lastUpdated } = useUnifiedMetrics();
  const { result, isRealtimeActive, startRealtimePolling, stopRealtimePolling, computedMetrics } = useQuantumBlockchainIntegration();
  const [activeView, setActiveView] = useState('overview');
  const [trendData, setTrendData] = useState<any[]>([]);

  const radarData = [
    { subject: 'Quantum', A: metrics.quantum.coherence * 100, fullMark: 100 },
    { subject: 'AGI', A: metrics.agi.superintelligenceScore * 100, fullMark: 100 },
    { subject: 'Agentic', A: metrics.agentic.annAccuracy * 100, fullMark: 100 },
    { subject: 'Anomaly', A: (1 - metrics.anomaly.riskLevel) * 100, fullMark: 100 },
    { subject: 'Big Data', A: metrics.bigData.verificationRate * 100, fullMark: 100 },
    { subject: 'Genomic', A: metrics.genomic.accuracy * 100, fullMark: 100 },
  ];

  useEffect(() => {
    if (metrics.overall.systemHealth > 0) {
      setTrendData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          health: metrics.overall.systemHealth,
          quantum: metrics.quantum.coherence * 100,
          agi: metrics.agi.superintelligenceScore * 100,
        };
        return [...prev.slice(-19), newPoint];
      });
    }
  }, [metrics]);

  const getOverallStatus = () => {
    const health = metrics.overall.systemHealth;
    if (health >= 80) return 'healthy';
    if (health >= 50) return 'warning';
    return 'critical';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive System Dashboard</h2>
          <p className="text-muted-foreground">Unified view of all quantum, AGI, and blockchain-ANN metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => isRealtimeActive ? stopRealtimePolling() : startRealtimePolling('full-integration', {})}>
            {isRealtimeActive ? 'Stop Live' : 'Start Live'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refreshAllMetrics()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">System Health</h3>
                <p className="text-muted-foreground">Overall system performance score</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{metrics.overall.systemHealth.toFixed(1)}%</p>
              <Badge variant={getOverallStatus() === 'healthy' ? 'default' : 'destructive'}>
                {getOverallStatus().toUpperCase()}
              </Badge>
            </div>
          </div>
          <Progress value={metrics.overall.systemHealth} className="h-3" />
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{metrics.overall.activeProcesses}</p>
              <p className="text-xs text-muted-foreground">Active Processes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{metrics.anomaly.detectionsCount}</p>
              <p className="text-xs text-muted-foreground">Detections</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-500">{computedMetrics.patternLayersPassed}</p>
              <p className="text-xs text-muted-foreground">Security Patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quantum">Quantum & AGI</TabsTrigger>
          <TabsTrigger value="neural">Neural Networks</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard title="Quantum Coherence" value={`${(metrics.quantum.coherence * 100).toFixed(1)}%`} icon={<Atom className="h-5 w-5 text-primary" />} status={metrics.quantum.coherence > 0.8 ? 'healthy' : 'warning'} />
            <MetricCard title="AGI Score" value={`${(metrics.agi.superintelligenceScore * 100).toFixed(1)}%`} icon={<Brain className="h-5 w-5 text-purple-500" />} status={metrics.agi.superintelligenceScore > 0.7 ? 'healthy' : 'warning'} />
            <MetricCard title="ANN Accuracy" value={`${(metrics.agentic.annAccuracy * 100).toFixed(1)}%`} icon={<Bot className="h-5 w-5 text-blue-500" />} status={metrics.agentic.annAccuracy > 0.75 ? 'healthy' : 'warning'} />
            <MetricCard title="Risk Level" value={`${(metrics.anomaly.riskLevel * 100).toFixed(1)}%`} icon={<AlertTriangle className="h-5 w-5 text-orange-500" />} status={metrics.anomaly.riskLevel < 0.3 ? 'healthy' : 'critical'} />
            <MetricCard title="Throughput" value={`${metrics.bigData.throughput.toFixed(0)}/s`} icon={<Database className="h-5 w-5 text-green-500" />} status="healthy" />
            <MetricCard title="Genomic Accuracy" value={`${(metrics.genomic.accuracy * 100).toFixed(1)}%`} icon={<Dna className="h-5 w-5 text-pink-500" />} status={metrics.genomic.accuracy > 0.9 ? 'healthy' : 'warning'} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="health" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Health" />
                    <Area type="monotone" dataKey="quantum" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Quantum" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quantum" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Atom className="h-5 w-5" />Quantum Metrics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>Coherence</span><span className="font-mono">{(metrics.quantum.coherence * 100).toFixed(2)}%</span></div>
                <Progress value={metrics.quantum.coherence * 100} />
                <div className="flex justify-between"><span>Entanglement</span><span className="font-mono">{(metrics.quantum.entanglement * 100).toFixed(2)}%</span></div>
                <Progress value={metrics.quantum.entanglement * 100} />
                <div className="flex justify-between"><span>Security Score</span><span className="font-mono">{(metrics.quantum.securityScore * 100).toFixed(2)}%</span></div>
                <Progress value={metrics.quantum.securityScore * 100} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AGI Metrics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>Superintelligence Score</span><span className="font-mono">{(metrics.agi.superintelligenceScore * 100).toFixed(2)}%</span></div>
                <Progress value={metrics.agi.superintelligenceScore * 100} />
                <div className="flex justify-between"><span>Optimization Gain</span><span className="font-mono">{(metrics.agi.optimizationGain * 100).toFixed(2)}%</span></div>
                <Progress value={metrics.agi.optimizationGain * 100} />
                <div className="flex justify-between"><span>Workflow Completion</span><span className="font-mono">{(metrics.agi.workflowCompletion * 100).toFixed(2)}%</span></div>
                <Progress value={metrics.agi.workflowCompletion * 100} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="neural" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />Agentic AI Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Decisions</p><p className="text-xl font-bold">{metrics.agentic.decisionsCount}</p></div>
                <div className="p-3 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Reward</p><p className="text-xl font-bold">{metrics.agentic.totalReward.toFixed(2)}</p></div>
                <div className="p-3 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">ANN Accuracy</p><p className="text-xl font-bold">{(metrics.agentic.annAccuracy * 100).toFixed(1)}%</p></div>
                <div className="p-3 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Learning</p><p className="text-xl font-bold">{(metrics.agentic.learningProgress * 100).toFixed(1)}%</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security Patterns</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between"><span>Active Patterns</span><Badge>{computedMetrics.patternLayersPassed} / 20</Badge></div>
                  <Progress value={computedMetrics.patternLayersPassed / 20 * 100} />
                  <div className="flex justify-between"><span>Security Score</span><span className="font-mono">{computedMetrics.securityScore.toFixed(2)}%</span></div>
                  <Progress value={computedMetrics.securityScore} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Anomaly Detection</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Detected</p><p className="text-xl font-bold">{metrics.anomaly.detectionsCount}</p></div>
                  <div className="p-3 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Accuracy</p><p className="text-xl font-bold">{(metrics.anomaly.accuracy * 100).toFixed(1)}%</p></div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span>Risk Level</span>
                  <Badge variant={metrics.anomaly.riskLevel < 0.3 ? 'default' : 'destructive'}>
                    {metrics.anomaly.riskLevel < 0.3 ? 'Low' : metrics.anomaly.riskLevel < 0.6 ? 'Medium' : 'High'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
