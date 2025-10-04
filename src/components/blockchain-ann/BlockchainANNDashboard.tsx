/**
 * Blockchain-ANN Integrated Dashboard
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlockchainANN } from '@/hooks/useBlockchainANN';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { Activity, Database, Brain, Network, Zap, Play, RefreshCw } from 'lucide-react';

export function BlockchainANNDashboard() {
  const { architecture, deployedModels, metrics, isLoading, initializeArchitecture, refreshMetrics } = useBlockchainANN();
  const { workflows, currentWorkflow, isExecuting, executeWorkflow } = useWorkflowExecution();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initializeArchitecture({
        name: 'Production Blockchain-ANN',
        consensusType: 'proof-of-neural-work',
        quantumEnabled: true,
        blockchainNodes: 10,
        annLayers: [
          { type: 'input', neurons: 128, activationFunction: 'relu' },
          { type: 'hidden', neurons: 256, activationFunction: 'relu', dropout: 0.3 },
          { type: 'hidden', neurons: 128, activationFunction: 'relu', dropout: 0.2 },
          { type: 'output', neurons: 10, activationFunction: 'softmax' }
        ]
      });
      setInitialized(true);
    }
  }, [initialized, initializeArchitecture]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Blockchain-ANN Architecture</h2>
          <p className="text-muted-foreground">Combined blockchain and neural network system</p>
        </div>
        <Button onClick={refreshMetrics} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Architecture Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Layers</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{architecture?.blockchainLayers.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active layers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ANN Layers</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{architecture?.annLayers.length || 0}</div>
            <p className="text-xs text-muted-foreground">Neural layers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed Models</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deployedModels.length}</div>
            <p className="text-xs text-muted-foreground">On-chain models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '-'}</div>
            <p className="text-xs text-muted-foreground">Model performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Real-time system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium">Throughput</p>
                <p className="text-2xl font-bold">{metrics.throughput.toFixed(0)} <span className="text-sm text-muted-foreground">tx/s</span></p>
              </div>
              <div>
                <p className="text-sm font-medium">Latency</p>
                <p className="text-2xl font-bold">{metrics.latency.toFixed(1)} <span className="text-sm text-muted-foreground">ms</span></p>
              </div>
              <div>
                <p className="text-sm font-medium">F1 Score</p>
                <p className="text-2xl font-bold">{(metrics.f1Score * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployed Models */}
      {deployedModels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deployed Models</CardTitle>
            <CardDescription>Models on blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deployedModels.map(model => (
                <div key={model.modelId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{model.contractAddress.substring(0, 20)}...</p>
                    <p className="text-sm text-muted-foreground">Accuracy: {(model.accuracy * 100).toFixed(2)}%</p>
                  </div>
                  <Badge>{model.blockchainNetwork}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
