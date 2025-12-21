import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuantumBlockchainIntegration, OperationType } from '@/hooks/useQuantumBlockchainIntegration';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Zap, Shield, Brain, Coins, Waves, Network, Activity, 
  Play, Pause, RefreshCw, CheckCircle, XCircle, Clock,
  Layers, GitBranch, Cpu, Database
} from 'lucide-react';

export function QuantumBlockchainIntegrationPanel() {
  const {
    isLoading,
    error,
    result,
    history,
    isRealtimeActive,
    realtimeMetrics,
    computedMetrics,
    executeFullIntegration,
    executeSecurityCheck,
    executeQuantumEchoes,
    executeNeuralTraining,
    executeAGIWorkflow,
    startRealtimePolling,
    stopRealtimePolling,
  } = useQuantumBlockchainIntegration();

  const [selectedOperation, setSelectedOperation] = useState<OperationType>('full-integration');
  const [pollInterval, setPollInterval] = useState<number>(5000);
  const [testInput, setTestInput] = useState({ data: 'quantum-test', value: Math.random() });

  const handleExecute = async () => {
    const input = { ...testInput, timestamp: Date.now() };
    switch (selectedOperation) {
      case 'full-integration':
        await executeFullIntegration(input);
        break;
      case 'security-only':
        await executeSecurityCheck(input);
        break;
      case 'quantum-only':
        await executeQuantumEchoes(input);
        break;
      case 'neural-training':
        await executeNeuralTraining(100);
        break;
      case 'agi-workflow':
        await executeAGIWorkflow(input);
        break;
    }
  };

  const handleRealtimeToggle = (enabled: boolean) => {
    if (enabled) {
      startRealtimePolling(selectedOperation, testInput, pollInterval);
    } else {
      stopRealtimePolling();
    }
  };

  // Prepare chart data
  const historyChartData = history.map((h, i) => ({
    index: i + 1,
    security: h.security?.securityScore || 0,
    quantum: (h.quantum?.quantumFidelity || 0) * 100,
    ann: (h.agentic?.metrics.annAccuracy || 0) * 100,
    agi: (h.agi?.superintelligenceScore || 0) * 100,
    overall: h.integration?.overallScore || 0,
  }));

  const radarData = [
    { metric: 'Security', value: computedMetrics.securityScore, fullMark: 100 },
    { metric: 'Quantum', value: computedMetrics.quantumFidelity, fullMark: 100 },
    { metric: 'ANN', value: computedMetrics.annAccuracy, fullMark: 100 },
    { metric: 'AGI', value: computedMetrics.superintelligenceScore, fullMark: 100 },
    { metric: 'Overall', value: computedMetrics.overallScore, fullMark: 100 },
  ];

  const patternLayerData = result?.security?.layerResults?.map(l => ({
    layer: `L${l.layer}`,
    score: l.score * 100,
    passed: l.passed,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Quantum-Blockchain-ANN Integration
          </h2>
          <p className="text-muted-foreground">
            Unified backend control with RNN/CNN layers and 20-pattern security
          </p>
        </div>
        <div className="flex items-center gap-2">
          {realtimeMetrics.lastUpdate && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {realtimeMetrics.lastUpdate.toLocaleTimeString()}
            </Badge>
          )}
          <Badge variant="secondary">
            Updates: {realtimeMetrics.updateCount}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Operation:</Label>
              <Select value={selectedOperation} onValueChange={(v) => setSelectedOperation(v as OperationType)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-integration">Full Integration</SelectItem>
                  <SelectItem value="security-only">Security Only</SelectItem>
                  <SelectItem value="quantum-only">Quantum Only</SelectItem>
                  <SelectItem value="neural-training">Neural Training</SelectItem>
                  <SelectItem value="agi-workflow">AGI Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExecute} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Execute
            </Button>

            <div className="flex items-center gap-2 border-l pl-4">
              <Label className="text-sm">Real-time:</Label>
              <Switch
                checked={isRealtimeActive}
                onCheckedChange={handleRealtimeToggle}
              />
              <Select value={pollInterval.toString()} onValueChange={(v) => setPollInterval(parseInt(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3000">3s</SelectItem>
                  <SelectItem value="5000">5s</SelectItem>
                  <SelectItem value="10000">10s</SelectItem>
                  <SelectItem value="30000">30s</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isRealtimeActive && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          icon={<Shield className="h-5 w-5 text-blue-500" />}
          title="Security Score"
          value={computedMetrics.securityScore}
          suffix="%"
          subtitle={`${computedMetrics.patternLayersPassed}/${computedMetrics.totalPatternLayers} layers passed`}
          color="blue"
        />
        <MetricCard
          icon={<Waves className="h-5 w-5 text-cyan-500" />}
          title="Quantum Fidelity"
          value={computedMetrics.quantumFidelity}
          suffix="%"
          subtitle="Echo resonance"
          color="cyan"
        />
        <MetricCard
          icon={<Brain className="h-5 w-5 text-orange-500" />}
          title="ANN Accuracy"
          value={computedMetrics.annAccuracy}
          suffix="%"
          subtitle="RNN/CNN layers"
          color="orange"
        />
        <MetricCard
          icon={<Coins className="h-5 w-5 text-purple-500" />}
          title="AGI Score"
          value={computedMetrics.superintelligenceScore}
          suffix="%"
          subtitle="Superintelligence"
          color="purple"
        />
        <MetricCard
          icon={<Zap className="h-5 w-5 text-green-500" />}
          title="Overall Score"
          value={computedMetrics.overallScore}
          suffix="%"
          subtitle="Integrated"
          color="green"
        />
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            20-Layer Security
          </TabsTrigger>
          <TabsTrigger value="neural" className="flex items-center gap-1">
            <Cpu className="h-4 w-4" />
            RNN/CNN
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            AGI Workflow
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">System Metrics Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Radar
                        name="Metrics"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Trend Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {historyChartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Execute operations to see trends</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="security" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="quantum" stroke="#06b6d4" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="ann" stroke="#f97316" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="agi" stroke="#a855f7" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="overall" stroke="#22c55e" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-2 gap-6">
            {/* Pattern Layer Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  20-Pattern Layer Security Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patternLayerData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Run security check to see layer results</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={patternLayerData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="layer" tick={{ fontSize: 8 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar 
                          dataKey="score" 
                          fill="hsl(var(--primary))"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Layer Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Layer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {patternLayerData.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No security data available
                      </p>
                    ) : (
                      patternLayerData.map((layer, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-2 rounded text-sm ${
                            layer.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {layer.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-mono">{layer.layer}</span>
                          </div>
                          <span className="font-bold">{layer.score.toFixed(1)}%</span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="neural">
          <div className="grid grid-cols-2 gap-6">
            {/* Neural Network Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  RNN/CNN Layer Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">Total Reward</div>
                    <div className="text-2xl font-bold text-orange-500">
                      {result?.agentic?.metrics.totalReward?.toFixed(2) || '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">Learning Progress</div>
                    <div className="text-2xl font-bold text-blue-500">
                      {result?.agentic?.metrics.learningProgress 
                        ? `${(result.agentic.metrics.learningProgress * 100).toFixed(1)}%` 
                        : '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">ANN Accuracy</div>
                    <div className="text-2xl font-bold text-green-500">
                      {result?.agentic?.metrics.annAccuracy 
                        ? `${(result.agentic.metrics.annAccuracy * 100).toFixed(1)}%` 
                        : '—'}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">Exploration Rate</div>
                    <div className="text-2xl font-bold text-purple-500">
                      {result?.agentic?.metrics.explorationRate 
                        ? `${(result.agentic.metrics.explorationRate * 100).toFixed(1)}%` 
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Architecture</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-blue-500/10 text-blue-500">
                      <div className="font-medium">RNN Layer</div>
                      <div>LSTM • 16→32 hidden units</div>
                    </div>
                    <div className="p-2 rounded bg-orange-500/10 text-orange-500">
                      <div className="font-medium">CNN Layer</div>
                      <div>3×3 filters • 8 channels</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decisions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Q-Learning Decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {!result?.agentic?.decisions?.length ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Run neural training to see decisions
                      </p>
                    ) : (
                      result.agentic.decisions.map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono truncate max-w-[100px]">{d.state}...</span>
                            <Badge variant="outline">Action: {d.action}</Badge>
                          </div>
                          <span className={d.reward > 5 ? 'text-green-500' : 'text-yellow-500'}>
                            +{d.reward.toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                AGI Workflow Stages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result?.agi?.workflowResults?.length ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">Run AGI workflow to see stage results</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {result.agi.workflowResults.map((stage, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg text-center ${
                        stage.status === 'completed' 
                          ? 'bg-green-500/10 border border-green-500/30' 
                          : 'bg-yellow-500/10 border border-yellow-500/30'
                      }`}
                    >
                      <div className="mb-2">
                        {stage.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 mx-auto text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 mx-auto text-yellow-500" />
                        )}
                      </div>
                      <div className="text-xs font-medium truncate">
                        {stage.stage.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stage.metrics?.processingTime}ms
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result?.agi?.agiOptimization && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <div className="text-xs text-muted-foreground">Gas Savings</div>
                    <div className="text-xl font-bold text-purple-500">
                      {result.agi.agiOptimization.savingsPercent}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-cyan-500/10">
                    <div className="text-xs text-muted-foreground">Quantum Enhancement</div>
                    <div className="text-xl font-bold text-cyan-500">
                      {(result.agi.agiOptimization.quantumEnhancement * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                Operation History ({history.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No operations recorded yet
                    </p>
                  ) : (
                    history.slice().reverse().map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded bg-muted">
                        <div className="flex items-center gap-3">
                          {h.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <div className="text-sm font-medium">
                              {h.integration?.status || 'Operation'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(h.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {h.security && (
                            <Badge variant="outline" className="text-xs">
                              Sec: {h.security.securityScore.toFixed(0)}%
                            </Badge>
                          )}
                          {h.integration && (
                            <Badge className="text-xs">
                              Overall: {h.integration.overallScore.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ 
  icon, 
  title, 
  value, 
  suffix, 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode;
  title: string;
  value: number;
  suffix: string;
  subtitle: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-500',
    cyan: 'text-cyan-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        <div className={`text-2xl font-bold ${colorClasses[color]}`}>
          {value > 0 ? value.toFixed(1) : '—'}{value > 0 ? suffix : ''}
        </div>
        <Progress value={value} className="h-1 mt-2" />
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      </CardContent>
    </Card>
  );
}
