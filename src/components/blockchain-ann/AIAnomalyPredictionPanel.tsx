/**
 * AI Anomaly Prediction Panel
 * Uses Lovable AI to predict anomalies in system metrics
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, Brain, RefreshCw, Lightbulb, 
  Shield, TrendingUp, Clock, Zap
} from 'lucide-react';
import { useAIAnomalyPrediction, AnomalyPrediction } from '@/hooks/useAIAnomalyPrediction';
import { useUnifiedMetrics } from '@/hooks/useUnifiedMetrics';

const severityColors = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20'
};

const severityIcons = {
  low: <Shield className="h-4 w-4" />,
  medium: <AlertTriangle className="h-4 w-4" />,
  high: <AlertTriangle className="h-4 w-4" />,
  critical: <Zap className="h-4 w-4" />
};

function PredictionCard({ prediction }: { prediction: AnomalyPrediction }) {
  return (
    <div className={`p-4 rounded-lg border ${severityColors[prediction.severity]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {severityIcons[prediction.severity]}
          <span className="font-medium">{prediction.type}</span>
        </div>
        <Badge variant="outline" className={severityColors[prediction.severity]}>
          {(prediction.probability * 100).toFixed(0)}% likely
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{prediction.description}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Timeframe: {prediction.timeframe}</span>
      </div>
      <Progress 
        value={prediction.probability * 100} 
        className="mt-2 h-1"
      />
    </div>
  );
}

export function AIAnomalyPredictionPanel() {
  const { metrics } = useUnifiedMetrics();
  const { isLoading, result, error, lastPrediction, predictAnomalies } = useAIAnomalyPrediction();
  const [hasRunOnce, setHasRunOnce] = useState(false);

  const handleAnalyze = async () => {
    await predictAnomalies(metrics);
    setHasRunOnce(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI Anomaly Prediction</CardTitle>
                <CardDescription>
                  Powered by Lovable AI • Gemini 2.5 Flash
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastPrediction && (
                <span className="text-xs text-muted-foreground">
                  Last: {lastPrediction.toLocaleTimeString()}
                </span>
              )}
              <Button onClick={handleAnalyze} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Analyzing...' : 'Run AI Analysis'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Initial State */}
      {!hasRunOnce && !result && (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Click "Run AI Analysis" to have our AI examine your current system metrics 
              and predict potential anomalies before they occur.
            </p>
            <Button onClick={handleAnalyze} size="lg">
              <Brain className="h-4 w-4 mr-2" />
              Start AI Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Risk Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Overall Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {(result.riskScore * 100).toFixed(0)}%
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    result.riskScore < 0.3 ? 'bg-green-500/10 text-green-500' :
                    result.riskScore < 0.6 ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }
                >
                  {result.riskScore < 0.3 ? 'Low Risk' :
                   result.riskScore < 0.6 ? 'Medium Risk' : 'High Risk'}
                </Badge>
              </div>
              <Progress 
                value={result.riskScore * 100} 
                className="mt-4"
              />
            </CardContent>
          </Card>

          {/* Predictions Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Predictions Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-2xl font-bold">{result.predictions.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {result.predictions.filter(p => p.severity === 'critical' || p.severity === 'high').length}
                  </div>
                  <div className="text-xs text-muted-foreground">High Risk</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {result.predictions.filter(p => p.severity === 'medium').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Medium</div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {result.predictions.filter(p => p.severity === 'low').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Model Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span>Lovable AI</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <span>Gemini 2.5 Flash</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Analysis Type</span>
                <span>Predictive</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metrics Analyzed</span>
                <span>All Systems</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictions List */}
      {result && result.predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Predicted Anomalies
            </CardTitle>
            <CardDescription>
              AI-detected potential issues ranked by probability and severity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {result.predictions
                  .sort((a, b) => b.probability - a.probability)
                  .map((prediction, idx) => (
                    <PredictionCard key={idx} prediction={prediction} />
                  ))
                }
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recommendations & Insights */}
      {result && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                      <Shield className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-yellow-500/20 mt-0.5">
                      <Lightbulb className="h-3 w-3 text-yellow-500" />
                    </div>
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
