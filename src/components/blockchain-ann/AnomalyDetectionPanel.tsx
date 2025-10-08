import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Activity, Zap, TrendingUp } from 'lucide-react';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';

export function AnomalyDetectionPanel() {
  const { isDetecting, anomalies, statistics, detectAnomalies } = useAnomalyDetection();
  const [threshold, setThreshold] = useState(0.85);

  const handleDetect = () => {
    // Generate sample data points
    const dataPoints = Array.from({ length: 100 }, (_, i) => ({
      timestamp: Date.now() - i * 60000,
      value: Math.random() * 100 + (i % 10 === 0 ? Math.random() * 200 : 0),
      metadata: { index: i }
    }));

    detectAnomalies(dataPoints, threshold, true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-400" />
              Quantum-Enhanced Anomaly Detection
            </CardTitle>
            <CardDescription>
              AI-powered anomaly detection with quantum optimization
            </CardDescription>
          </div>
          <Button 
            onClick={handleDetect} 
            disabled={isDetecting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Activity className="mr-2 h-4 w-4" />
            {isDetecting ? 'Detecting...' : 'Run Detection'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {statistics && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Anomalies</p>
                    <p className="text-2xl font-bold">{statistics.totalAnomalies}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    <p className="text-2xl font-bold">
                      {((statistics.averageConfidence || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantum Factor</p>
                    <p className="text-2xl font-bold">
                      {((statistics.quantumEnhancementFactor || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isDetecting && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Analyzing data points...</p>
            <Progress value={66} className="h-2" />
          </div>
        )}

        {anomalies.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Detected Anomalies</h3>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {anomalies.map((anomaly, index) => (
                <Card key={index} className="bg-background/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(anomaly.severity)}>
                            {anomaly.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-mono">Index: {anomaly.index}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{anomaly.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Confidence: {(anomaly.confidence * 100).toFixed(1)}%</span>
                          <span>Quantum Score: {anomaly.quantumScore.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
