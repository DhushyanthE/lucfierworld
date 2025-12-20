import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuantumCoinAGI } from '@/hooks/useQuantumCoinAGI';
import { Coins, Brain, Sparkles, ArrowRightLeft, TrendingUp, Cpu, Zap } from 'lucide-react';

export function QuantumCoinAGIPanel() {
  const { 
    isLoading, 
    error, 
    result, 
    transactionHistory,
    transferWithAGI, 
    stakeWithAGI,
    mintWithAGI,
    getSuperintelligenceInsights 
  } = useQuantumCoinAGI();

  const handleTransfer = async () => {
    const from = '0x' + Math.random().toString(16).substr(2, 40);
    const to = '0x' + Math.random().toString(16).substr(2, 40);
    const amount = Math.floor(Math.random() * 1000) + 100;
    await transferWithAGI(from, to, amount);
  };

  const handleStake = async () => {
    const address = '0x' + Math.random().toString(16).substr(2, 40);
    const amount = Math.floor(Math.random() * 5000) + 500;
    await stakeWithAGI(address, amount);
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Quantum Coin + AGI Workflow
          <Badge variant="outline" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Superintelligence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={handleTransfer} 
            disabled={isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            AGI Transfer
          </Button>
          <Button 
            onClick={handleStake} 
            disabled={isLoading}
            size="sm"
            variant="secondary"
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            AGI Stake
          </Button>
          <Button 
            onClick={() => mintWithAGI('0x' + Math.random().toString(16).substr(2, 40), 1000)} 
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Coins className="h-4 w-4" />
            AGI Mint
          </Button>
          <Button 
            onClick={getSuperintelligenceInsights} 
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            SI Insights
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Cpu className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm">AGI processing...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground">SI Score</div>
                <div className="text-2xl font-bold text-primary">
                  {(result.result.superintelligenceScore * 100).toFixed(2)}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground">Gas Savings</div>
                <div className="text-2xl font-bold text-green-500">
                  {result.result.agiOptimization.savingsPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Quantum Metrics</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded bg-muted text-center">
                  <div className="text-xs text-muted-foreground">Entanglement</div>
                  <div className="text-sm font-mono">{(result.result.quantumMetrics.entanglement * 100).toFixed(1)}%</div>
                </div>
                <div className="p-2 rounded bg-muted text-center">
                  <div className="text-xs text-muted-foreground">Coherence</div>
                  <div className="text-sm font-mono">{(result.result.quantumMetrics.coherence * 100).toFixed(1)}%</div>
                </div>
                <div className="p-2 rounded bg-muted text-center">
                  <div className="text-xs text-muted-foreground">Fidelity</div>
                  <div className="text-sm font-mono">{(result.result.quantumMetrics.fidelity * 100).toFixed(1)}%</div>
                </div>
                <div className="p-2 rounded bg-muted text-center">
                  <div className="text-xs text-muted-foreground">States</div>
                  <div className="text-sm font-mono">{result.result.quantumMetrics.superpositionStates}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Workflow Progress
              </div>
              <div className="space-y-1">
                {result.result.workflowSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-muted">
                    <span className="font-mono">{step.step}</span>
                    <div className="flex gap-2 items-center">
                      <span className="text-muted-foreground">{step.duration.toFixed(0)}ms</span>
                      <Badge variant="secondary" className="text-xs">
                        {step.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">AGI Optimization Routes</div>
              <div className="flex flex-wrap gap-1">
                {result.result.agiOptimization.routeOptimization.map((route, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {route}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-muted">
                <span className="text-muted-foreground">Original Gas: </span>
                <span className="font-mono">{result.result.agiOptimization.originalGasCost}</span>
              </div>
              <div className="p-2 rounded bg-muted">
                <span className="text-muted-foreground">Optimized: </span>
                <span className="font-mono text-green-500">{result.result.agiOptimization.optimizedGasCost}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Transaction: {result.result.transactionId}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
