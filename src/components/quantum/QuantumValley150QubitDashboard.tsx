/**
 * Quantum Valley 150-Qubit Dashboard
 * 
 * Comprehensive frontend interface for the 150-qubit quantum processing system,
 * featuring pattern visualization, algorithm selection, and real-time metrics.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Zap, 
  Brain, 
  Shield, 
  TrendingUp, 
  Activity, 
  Cpu, 
  Database,
  Network,
  Bot,
  Target,
  Gauge
} from 'lucide-react';
import { 
  quantumValleyBackendService,
  type AlgorithmMethod,
  type TransactionAnalysisRequest,
  type TransactionAnalysisResult 
} from '@/services/backend/QuantumValleyBackendService';
import { type QuantumValley150QubitMetrics, type QuantumPattern } from '@/lib/quantum/valley/QuantumValley150QubitService';

interface DashboardState {
  isInitialized: boolean;
  isProcessing: boolean;
  metrics: QuantumValley150QubitMetrics | null;
  patterns: QuantumPattern[];
  algorithmMethods: AlgorithmMethod[];
  selectedMethod: AlgorithmMethod['type'] | null;
  txId: string;
  txData: string;
  results: TransactionAnalysisResult | null;
}

export function QuantumValley150QubitDashboard() {
  const [state, setState] = useState<DashboardState>({
    isInitialized: false,
    isProcessing: false,
    metrics: null,
    patterns: [],
    algorithmMethods: [],
    selectedMethod: null,
    txId: '',
    txData: '100,1640995200000', // Default: amount,timestamp
    results: null
  });

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await quantumValleyBackendService.initialize();
        const [metrics, algorithmMethods] = await Promise.all([
          quantumValleyBackendService.getMetrics(),
          quantumValleyBackendService.getAlgorithmMethods()
        ]);
        
        setState(prev => ({
          ...prev,
          isInitialized: true,
          metrics,
          algorithmMethods,
          selectedMethod: algorithmMethods[0]?.type || null
        }));

        toast.success('Quantum Valley 150-Qubit Dashboard Initialized', {
          description: `Total accuracy: ${(metrics.totalAccuracy * 100).toFixed(2)}%`,
          icon: <Zap className="h-5 w-5" />,
        });
      } catch (error) {
        toast.error('Dashboard initialization failed', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    initializeDashboard();
  }, []);

  // Execute transaction analysis
  const executeAnalysis = async () => {
    if (!state.selectedMethod || !state.txId || !state.txData) {
      toast.error('Missing required fields');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, results: null }));

    try {
      const txDataArray = state.txData.split(',').map(Number);
      if (txDataArray.some(isNaN)) {
        throw new Error('Invalid transaction data format');
      }

      const request: TransactionAnalysisRequest = {
        txId: state.txId,
        method: state.selectedMethod,
        txData: txDataArray,
        threshold: 50
      };

      const results = await quantumValleyBackendService.analyzeTransaction(request);
      
      setState(prev => ({ ...prev, results, isProcessing: false }));

      toast.success('Analysis completed successfully', {
        description: `Pattern ${results.pattern} detected with ${results.confidence.toFixed(1)}% confidence`,
        icon: <Target className="h-5 w-5" />,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Render quantum patterns
  const renderQuantumPatterns = () => (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
      {Array.from({ length: 15 }, (_, i) => (
        <Card key={i} className="relative">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-mono font-bold text-primary">
              |{i.toString(2).padStart(4, '0')}⟩
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Pattern {i}
            </div>
            <div className="text-xs text-muted-foreground">
              15x Scale
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render metrics overview
  const renderMetricsOverview = () => {
    if (!state.metrics) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {(state.metrics.totalAccuracy * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Total Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {state.metrics.quantumAdvantage.toFixed(2)}x
                </div>
                <div className="text-sm text-muted-foreground">Quantum Advantage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {state.metrics.n8nAgentMetrics.score.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">N8N Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {state.metrics.processingTime}ms
                </div>
                <div className="text-sm text-muted-foreground">Processing Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render analysis interface
  const renderAnalysisInterface = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Quantum Transaction Analysis</span>
        </CardTitle>
        <CardDescription>
          Analyze transactions using advanced quantum algorithms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Transaction ID</label>
            <Input
              placeholder="Enter transaction ID"
              value={state.txId}
              onChange={(e) => setState(prev => ({ ...prev, txId: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Algorithm Method</label>
            <Select 
              value={state.selectedMethod || ''} 
              onValueChange={(value) => setState(prev => ({ 
                ...prev, 
                selectedMethod: value as AlgorithmMethod['type']
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                {state.algorithmMethods.map((method) => (
                  <SelectItem key={method.type} value={method.type}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Transaction Data</label>
            <Input
              placeholder="amount,timestamp"
              value={state.txData}
              onChange={(e) => setState(prev => ({ ...prev, txData: e.target.value }))}
            />
          </div>
        </div>

        <Button 
          onClick={executeAnalysis}
          disabled={!state.isInitialized || state.isProcessing}
          className="w-full"
        >
          {state.isProcessing ? (
            <>
              <Activity className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Execute Analysis
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  // Render results
  const renderResults = () => {
    if (!state.results) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="h-5 w-5" />
            <span>Analysis Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Pattern</div>
              <div className="text-lg font-bold">#{state.results.pattern}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Confidence</div>
              <div className="text-lg font-bold">{state.results.confidence.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">N8N Score</div>
              <div className="text-lg font-bold">{state.results.n8nScore.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Processing Time</div>
              <div className="text-lg font-bold">{state.results.processingTime}ms</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Method:</span>
              <Badge variant="secondary">{state.results.method}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Success:</span>
              <Badge variant={state.results.success ? "default" : "destructive"}>
                {state.results.success ? "Success" : "Failed"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reward:</span>
              <span className="font-mono">{state.results.reward.toFixed(4)} QV</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!state.isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <div className="text-lg font-medium">Initializing Quantum Valley 150-Qubit System...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Quantum Valley 150-Qubit Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Advanced quantum computing interface for pattern recognition, blockchain analysis, 
          and N8N Agentic Agent optimization with 15 scaled quantum states.
        </p>
      </div>

      {/* Metrics Overview */}
      {renderMetricsOverview()}

      {/* Main Content */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          {renderAnalysisInterface()}
          {renderResults()}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Patterns (15 Scaled States)</CardTitle>
              <CardDescription>
                150-qubit quantum states scaled to 15 manageable patterns for blockchain analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderQuantumPatterns()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="algorithms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {state.algorithmMethods.map((method) => (
              <Card key={method.type}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cpu className="h-5 w-5" />
                    <span>{method.name}</span>
                  </CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Complexity:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{method.complexity}</code>
                    </div>
                    <Badge variant="outline">{method.type}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {state.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quantum Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>QSVM Accuracy:</span>
                      <span>{(state.metrics.qsvmAccuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={state.metrics.qsvmAccuracy * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>QAOA Optimization:</span>
                      <span>{(state.metrics.qaoaOptimization * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={state.metrics.qaoaOptimization * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Fraud Detection:</span>
                      <span>{(state.metrics.fraudDetectionScore * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={state.metrics.fraudDetectionScore * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>N8N Agentic Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Agent Score:</span>
                      <span>{state.metrics.n8nAgentMetrics.score.toFixed(0)}</span>
                    </div>
                    <Progress value={state.metrics.n8nAgentMetrics.score} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span>{(state.metrics.n8nAgentMetrics.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={state.metrics.n8nAgentMetrics.confidence * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <span>{(state.metrics.n8nAgentMetrics.efficiency * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={state.metrics.n8nAgentMetrics.efficiency * 100} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}