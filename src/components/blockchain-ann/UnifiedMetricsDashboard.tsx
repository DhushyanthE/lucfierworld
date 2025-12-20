import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { 
  Activity, RefreshCw, Waves, Bot, Coins, Brain, Database, Dna, 
  Shield, Zap, TrendingUp, Clock, CheckCircle, AlertTriangle, BarChart3
} from 'lucide-react';

export function UnifiedMetricsDashboard() {
  const { metrics, isLoading, lastUpdated, operationHistory, refreshAllMetrics } = useUnifiedMetrics();

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-500';
    if (health >= 70) return 'text-yellow-500';
    if (health >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthBg = (health: number) => {
    if (health >= 90) return 'bg-green-500/20';
    if (health >= 70) return 'bg-yellow-500/20';
    if (health >= 50) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Unified Metrics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time aggregated metrics across all systems
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <Button onClick={refreshAllMetrics} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Overall System Health */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-2 flex items-center gap-6">
              <div className={`w-32 h-32 rounded-full ${getHealthBg(metrics.overall.systemHealth)} flex items-center justify-center`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getHealthColor(metrics.overall.systemHealth)}`}>
                    {metrics.overall.systemHealth.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">System Health</div>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Performance</span>
                  <Badge variant={metrics.overall.systemHealth >= 80 ? 'default' : 'secondary'}>
                    {metrics.overall.systemHealth >= 80 ? 'Optimal' : 'Degraded'}
                  </Badge>
                </div>
                <Progress value={metrics.overall.systemHealth} className="h-3" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-xs text-muted-foreground">Active Processes</div>
              <div className="text-3xl font-bold text-primary">{metrics.overall.activeProcesses}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-xs text-muted-foreground">System Uptime</div>
              <div className="text-3xl font-bold text-green-500">{metrics.overall.uptime.toFixed(2)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quantum Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Waves className="h-4 w-4 text-blue-500" />
              Quantum Echoes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricItem label="Echo Resonance" value={metrics.quantum.echoResonance} suffix="%" color="blue" />
              <MetricItem label="Fidelity" value={metrics.quantum.fidelity} suffix="%" color="blue" />
              <MetricItem label="Coherence" value={metrics.quantum.coherence} suffix="%" color="blue" />
              <MetricItem label="Entanglement" value={metrics.quantum.entanglement} suffix="%" color="blue" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Security Score
                </span>
                <span className="font-bold text-blue-500">{metrics.quantum.securityScore.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.quantum.securityScore} className="h-1 mt-1" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Pattern Layers: {metrics.quantum.patternLayers}</span>
              <span>Integrity: {metrics.quantum.transferIntegrity.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Coins className="h-4 w-4 text-purple-500" />
              Quantum Coin AGI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricItem label="SI Score" value={metrics.agi.superintelligenceScore} suffix="%" color="purple" />
              <MetricItem label="Gas Savings" value={metrics.agi.gasSavings} suffix="%" color="green" />
              <MetricItem label="Optimization" value={metrics.agi.optimizationGain} suffix="%" color="purple" />
              <MetricItem label="Workflow" value={metrics.agi.workflowCompletion} suffix="%" color="purple" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  AGI Efficiency
                </span>
                <Badge variant="outline" className="text-xs">
                  {metrics.agi.superintelligenceScore > 90 ? 'Superintelligent' : 'Learning'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4 text-orange-500" />
              Agentic AI (Q-Learning)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricItem label="Total Reward" value={metrics.agentic.totalReward} suffix="" color="orange" decimals={3} />
              <MetricItem label="Learning" value={metrics.agentic.learningProgress} suffix="%" color="orange" />
              <MetricItem label="ANN Accuracy" value={metrics.agentic.annAccuracy} suffix="%" color="orange" />
              <MetricItem label="Exploration" value={metrics.agentic.explorationRate} suffix="%" color="orange" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Decisions Made
                </span>
                <span className="font-mono">{metrics.agentic.decisionsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Anomaly Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <MetricItem label="Detections" value={metrics.anomaly.detectionsCount} suffix="" color="red" />
              <MetricItem label="Risk Level" value={metrics.anomaly.riskLevel} suffix="%" color="red" />
              <MetricItem label="Accuracy" value={metrics.anomaly.accuracy} suffix="%" color="red" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-500" />
              Big Data Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <MetricItem label="Records" value={metrics.bigData.recordsProcessed} suffix="" color="cyan" />
              <MetricItem label="Throughput" value={metrics.bigData.throughput} suffix="/s" color="cyan" />
              <MetricItem label="Verified" value={metrics.bigData.verificationRate} suffix="%" color="cyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Dna className="h-4 w-4 text-green-500" />
              Genomic Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <MetricItem label="Sequences" value={metrics.genomic.sequencesAnalyzed} suffix="" color="green" />
              <MetricItem label="Mutations" value={metrics.genomic.mutationsDetected} suffix="" color="green" />
              <MetricItem label="Accuracy" value={metrics.genomic.accuracy} suffix="%" color="green" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operation History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {operationHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No operations recorded yet</p>
              <p className="text-xs">Click "Refresh All" to start collecting metrics</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {operationHistory.slice(-10).reverse().map((op, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted text-xs">
                  <div className="flex items-center gap-2">
                    {op.success ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="font-mono">{op.type}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {op.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricItem({ 
  label, 
  value, 
  suffix, 
  color, 
  decimals = 1 
}: { 
  label: string; 
  value: number; 
  suffix: string; 
  color: string;
  decimals?: number;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    green: 'text-green-500',
    red: 'text-red-500',
    cyan: 'text-cyan-500',
  };

  return (
    <div className="p-2 rounded bg-muted/50">
      <div className="text-xs text-muted-foreground truncate">{label}</div>
      <div className={`text-lg font-bold ${colorClasses[color] || 'text-primary'}`}>
        {value > 0 ? value.toFixed(decimals) : '—'}{value > 0 ? suffix : ''}
      </div>
    </div>
  );
}
