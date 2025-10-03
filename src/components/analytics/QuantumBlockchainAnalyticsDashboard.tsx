/**
 * Quantum Blockchain ANN Analytics Dashboard
 * Comprehensive visualization of combined technologies
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuantumBlockchainAnalytics } from '@/hooks/useQuantumBlockchainAnalytics';
import { 
  Activity, Brain, Database, Download, RefreshCw, 
  TrendingUp, Zap, Shield, Gauge, Network,
  Cpu, BarChart3, LineChart
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';

export function QuantumBlockchainAnalyticsDashboard() {
  const { 
    analytics, 
    history, 
    isLoading, 
    predictions,
    generateAnalytics, 
    generatePredictions,
    exportReport 
  } = useQuantumBlockchainAnalytics(false);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const radarData = [
    { metric: 'Blockchain', value: analytics.blockchain.consensusEfficiency * 10 },
    { metric: 'Quantum', value: analytics.quantum.quantumFidelity * 10 },
    { metric: 'ANN', value: analytics.ann.modelAccuracy * 10 },
    { metric: 'Security', value: analytics.performance.securityScore * 10 },
    { metric: 'Efficiency', value: analytics.performance.energyEfficiency * 10 }
  ];

  const synergyData = [
    { name: 'Blockchain-Quantum', score: analytics.synergy.blockchainQuantumSynergy * 100 },
    { name: 'Quantum-ANN', score: analytics.synergy.quantumANNSynergy * 100 },
    { name: 'Blockchain-ANN', score: analytics.synergy.blockchainANNSynergy * 100 },
    { name: 'Triple Integration', score: analytics.synergy.tripleIntegrationScore * 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Quantum Blockchain Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Combined analysis of Blockchain, Quantum Computing & ANN
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={generateAnalytics} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => exportReport('json')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall System Score</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {(analytics.synergy.overallScore * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-right space-y-2">
              <Badge variant="outline" className="text-green-500 border-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                Optimal Performance
              </Badge>
              <div className="flex gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <Brain className="h-5 w-5 text-purple-500" />
                <Cpu className="h-5 w-5 text-pink-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="quantum">Quantum</TabsTrigger>
          <TabsTrigger value="ann">ANN</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-blue-500" />
                  Throughput
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.performance.throughput.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">ops/sec</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.performance.latency.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">seconds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Energy Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{(analytics.performance.energyEfficiency * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">efficiency score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{(analytics.performance.securityScore * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">security rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart - Technology Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Performance Radar</CardTitle>
              <CardDescription>Comprehensive comparison across all metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" stroke="hsl(var(--foreground))" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
                  <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Synergy Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Synergy Scores</CardTitle>
              <CardDescription>Integration efficiency between technologies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={synergyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Tab */}
        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.blockchain.totalBlocks.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.blockchain.totalTransactions.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Network Hash Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(analytics.blockchain.networkHashRate / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">hashes/sec</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Nodes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.blockchain.activeNodes}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consensus Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(analytics.blockchain.consensusEfficiency * 100).toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quantum Enhancement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(analytics.blockchain.quantumEnhancementLevel * 100).toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Historical Blockchain Data */}
          {history.blockchain.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLineChart data={history.blockchain}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="hsl(var(--foreground))"
                      tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                    />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(ts) => new Date(ts).toLocaleString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" name="Consensus Efficiency" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Quantum Tab */}
        <TabsContent value="quantum" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Qubits Utilized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.quantum.qubitsUtilized}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quantum Fidelity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(analytics.quantum.quantumFidelity * 100).toFixed(2)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Entanglement Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(analytics.quantum.entanglementStrength * 100).toFixed(2)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Decoherence Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.quantum.decoherenceTime.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">microseconds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quantum Speedup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.quantum.quantumSpeedup.toFixed(2)}x</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Error Correction Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(analytics.quantum.errorCorrectionRate * 100).toFixed(2)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Historical Quantum Data */}
          {history.quantum.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quantum Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLineChart data={history.quantum}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="hsl(var(--foreground))"
                      tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                    />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(ts) => new Date(ts).toLocaleString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" name="Quantum Fidelity" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ANN Tab */}
        <TabsContent value="ann" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(analytics.ann.modelAccuracy * 100).toFixed(2)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Training Epochs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.ann.trainingEpochs}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Prediction Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(analytics.ann.predictionConfidence * 100).toFixed(2)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Neural Layers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.ann.neuralLayers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Activation Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.ann.activationPatterns.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(analytics.ann.anomalyDetectionRate * 100).toFixed(2)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Historical ANN Data */}
          {history.ann.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>ANN Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLineChart data={history.ann}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="hsl(var(--foreground))"
                      tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                    />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(ts) => new Date(ts).toLocaleString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-3))" name="Model Accuracy" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Generate Predictions Button */}
          <Card>
            <CardHeader>
              <CardTitle>AI Predictions & Insights</CardTitle>
              <CardDescription>Generate future trends and optimization recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generatePredictions} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Predictions
              </Button>

              {predictions && (
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold mb-2">Blockchain Trends</h4>
                    <div className="space-y-2">
                      {predictions.blockchainTrends.map((trend: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{trend.metric}</span>
                          <div className="flex gap-2 items-center">
                            <Badge variant={trend.prediction > 0 ? "default" : "secondary"}>
                              {(trend.prediction * 100).toFixed(1)}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {(trend.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Quantum Optimizations</h4>
                    <div className="space-y-2">
                      {predictions.quantumOptimizations.map((opt: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{opt.area}</span>
                          <Badge variant="outline">+{(opt.improvement * 100).toFixed(0)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">ANN Insights</h4>
                    <div className="space-y-2">
                      {predictions.annInsights.map((insight: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{insight.pattern}</span>
                          <Badge variant="outline">{(insight.significance * 100).toFixed(0)}% significant</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
