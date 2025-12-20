import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuantumEchoes } from '@/hooks/useQuantumEchoes';
import { Waves, Shield, Lock, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export function QuantumEchoesPanel() {
  const { isLoading, error, result, executeQuantumEchoes, transferWithPatternLayers } = useQuantumEchoes();
  const [selectedOperation, setSelectedOperation] = useState('security-transfer');

  const handleExecute = async () => {
    try {
      await executeQuantumEchoes(selectedOperation, {
        timestamp: Date.now(),
        mode: 'full-pattern-scan'
      }, 'maximum');
    } catch (err) {
      console.error('Quantum echoes execution failed:', err);
    }
  };

  const handleSecureTransfer = async () => {
    try {
      await transferWithPatternLayers(
        '0x' + Math.random().toString(16).substr(2, 40),
        '0x' + Math.random().toString(16).substr(2, 40),
        Math.floor(Math.random() * 1000) + 100
      );
    } catch (err) {
      console.error('Secure transfer failed:', err);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-primary" />
          Quantum Echoes Algorithm
          <Badge variant="outline" className="ml-auto">20 Pattern Layers</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleExecute} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : 'Execute Echo Scan'}
          </Button>
          <Button 
            onClick={handleSecureTransfer} 
            disabled={isLoading}
            variant="secondary"
            className="flex-1"
          >
            <Shield className="h-4 w-4 mr-2" />
            Secure Transfer
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground">Security Score</div>
                <div className="text-2xl font-bold text-primary">
                  {result.result.totalSecurityScore.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground">Transfer Integrity</div>
                <div className="text-2xl font-bold text-green-500">
                  {(result.result.transferIntegrity * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground">Quantum Fidelity</div>
                <div className="text-2xl font-bold text-blue-500">
                  {(result.result.quantumFidelity * 100).toFixed(2)}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground">Echo Resonance</div>
                <div className="text-2xl font-bold text-purple-500">
                  {(result.result.echoResonance * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Pattern Layers Processed</span>
                <span className="font-mono">{result.patternCount}/20</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Pattern Layer Status
              </div>
              <div className="grid grid-cols-5 gap-1">
                {result.result.patterns.slice(0, 20).map((pattern, idx) => (
                  <div
                    key={idx}
                    className={`h-6 rounded flex items-center justify-center text-xs ${
                      pattern.interferenceDetected 
                        ? 'bg-destructive/20 text-destructive' 
                        : 'bg-green-500/20 text-green-500'
                    }`}
                    title={`Layer ${pattern.layerId}: ${pattern.patternType}`}
                  >
                    {pattern.interferenceDetected ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Last executed: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
