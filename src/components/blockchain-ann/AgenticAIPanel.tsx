import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAgenticAI } from '@/hooks/useAgenticAI';
import { Bot, Brain, Zap, Target, TrendingUp, Activity } from 'lucide-react';

export function AgenticAIPanel() {
  const { 
    isLoading, 
    error, 
    result, 
    agentHistory,
    trainBlockchainAgent, 
    runAnomalyDetectionAgent,
    optimizeConsensusAgent 
  } = useAgenticAI();

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Agentic AI with ANN
          <Badge variant="outline" className="ml-auto">Q-Learning</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button 
            onClick={() => trainBlockchainAgent(100)} 
            disabled={isLoading}
            size="sm"
            className="flex-col h-auto py-3"
          >
            <Brain className="h-4 w-4 mb-1" />
            <span className="text-xs">Train Agent</span>
          </Button>
          <Button 
            onClick={runAnomalyDetectionAgent} 
            disabled={isLoading}
            size="sm"
            variant="secondary"
            className="flex-col h-auto py-3"
          >
            <Target className="h-4 w-4 mb-1" />
            <span className="text-xs">Anomaly Detection</span>
          </Button>
          <Button 
            onClick={optimizeConsensusAgent} 
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex-col h-auto py-3"
          >
            <Zap className="h-4 w-4 mb-1" />
            <span className="text-xs">Optimize</span>
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Activity className="h-6 w-6 animate-pulse text-primary" />
            <span className="ml-2 text-sm">Agent executing workflow...</span>
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
                <div className="text-xs text-muted-foreground">Total Reward</div>
                <div className="text-2xl font-bold text-primary">
                  {result.result.metrics.totalReward.toFixed(3)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground">ANN Accuracy</div>
                <div className="text-2xl font-bold text-green-500">
                  {(result.result.metrics.annAccuracy * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Learning Progress</span>
                <span className="font-mono">{(result.result.metrics.learningProgress * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.result.metrics.learningProgress * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Q-Learning Parameters</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-muted text-center">
                  <div className="text-muted-foreground">α (Learning)</div>
                  <div className="font-mono">{result.qLearningParams.learningRate}</div>
                </div>
                <div className="p-2 rounded bg-muted text-center">
                  <div className="text-muted-foreground">γ (Discount)</div>
                  <div className="font-mono">{result.qLearningParams.discountFactor}</div>
                </div>
                <div className="p-2 rounded bg-muted text-center">
                  <div className="text-muted-foreground">ε (Explore)</div>
                  <div className="font-mono">{result.qLearningParams.explorationRate}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">ANN Architecture</div>
              <div className="flex gap-1 overflow-x-auto py-1">
                {result.result.annLayers.map((layer, idx) => (
                  <div 
                    key={idx}
                    className="flex-shrink-0 px-2 py-1 rounded text-xs bg-primary/10 text-primary"
                  >
                    {layer.type}: {layer.neurons}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recent Decisions
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {result.result.decisions.slice(-5).map((decision, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-muted">
                    <span className="font-mono">{decision.action}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {(decision.confidence * 100).toFixed(0)}%
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        +{decision.reward.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Agent ID: {result.result.agentId}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
