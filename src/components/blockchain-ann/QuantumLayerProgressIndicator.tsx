import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Shield, Zap, AlertTriangle, Loader2 } from 'lucide-react';

interface LayerResult {
  layerId: number;
  name: string;
  type: string;
  amplitude: number;
  coherence: number;
  securityScore: number;
  interferenceDetected: boolean;
}

interface QuantumLayerProgressIndicatorProps {
  layerResults?: LayerResult[];
  isProcessing?: boolean;
  currentLayer?: number;
  echoResonance?: number;
  quantumFidelity?: number;
}

const QUANTUM_ECHO_LAYERS = [
  { id: 1, name: 'Entanglement-Init', icon: '🔗' },
  { id: 2, name: 'Superposition-Gate', icon: '⚛️' },
  { id: 3, name: 'Phase-Encoding', icon: '📡' },
  { id: 4, name: 'Echo-Propagation', icon: '🌊' },
  { id: 5, name: 'Interference-Check', icon: '🔍' },
  { id: 6, name: 'Decoherence-Guard', icon: '🛡️' },
  { id: 7, name: 'Key-Distribution', icon: '🔑' },
  { id: 8, name: 'Bell-State-Verify', icon: '🔔' },
  { id: 9, name: 'Quantum-Signature', icon: '✍️' },
  { id: 10, name: 'Error-Correction', icon: '🔧' },
  { id: 11, name: 'Tomography-Scan', icon: '📊' },
  { id: 12, name: 'Fidelity-Assessment', icon: '📈' },
  { id: 13, name: 'Noise-Mitigation', icon: '🔇' },
  { id: 14, name: 'Coherence-Extension', icon: '⏳' },
  { id: 15, name: 'Multi-Party-Sync', icon: '🤝' },
  { id: 16, name: 'Blockchain-Anchor', icon: '⚓' },
  { id: 17, name: 'Neural-Validation', icon: '🧠' },
  { id: 18, name: 'Consensus-Gate', icon: '✅' },
  { id: 19, name: 'Echo-Finalization', icon: '🏁' },
  { id: 20, name: 'Transfer-Complete', icon: '🚀' },
];

export function QuantumLayerProgressIndicator({
  layerResults = [],
  isProcessing = false,
  currentLayer = 0,
  echoResonance = 0,
  quantumFidelity = 0,
}: QuantumLayerProgressIndicatorProps) {
  const [animatedLayer, setAnimatedLayer] = useState(0);

  useEffect(() => {
    if (isProcessing && currentLayer > 0) {
      const interval = setInterval(() => {
        setAnimatedLayer((prev) => (prev < currentLayer ? prev + 1 : prev));
      }, 150);
      return () => clearInterval(interval);
    } else if (!isProcessing && layerResults.length > 0) {
      setAnimatedLayer(20);
    }
  }, [isProcessing, currentLayer, layerResults.length]);

  const getLayerStatus = (layerId: number) => {
    const result = layerResults.find((r) => r.layerId === layerId);
    if (!result) {
      if (isProcessing && layerId <= animatedLayer) return 'processing';
      if (layerId > animatedLayer) return 'pending';
      return 'pending';
    }
    if (result.interferenceDetected) return 'warning';
    if (result.securityScore >= 80) return 'success';
    if (result.securityScore >= 60) return 'warning';
    return 'failed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'processing': return 'bg-blue-500 animate-pulse';
      default: return 'bg-muted';
    }
  };

  const passedLayers = layerResults.filter(
    (r) => !r.interferenceDetected && r.securityScore >= 70
  ).length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-600/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            20-Layer Quantum Echoes Security
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <Badge variant="secondary" className="animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing
              </Badge>
            )}
            <Badge variant={passedLayers >= 18 ? 'default' : 'destructive'}>
              {passedLayers}/20 Passed
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Layer Progress</span>
            <span className="font-mono">{Math.round((animatedLayer / 20) * 100)}%</span>
          </div>
          <Progress value={(animatedLayer / 20) * 100} className="h-2" />
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-lg font-bold text-primary">
              {(echoResonance * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Echo Resonance</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-lg font-bold text-purple-500">
              {(quantumFidelity * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Quantum Fidelity</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="text-lg font-bold text-green-500">
              {passedLayers}
            </div>
            <div className="text-xs text-muted-foreground">Layers Passed</div>
          </div>
        </div>

        {/* Layer Grid */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {QUANTUM_ECHO_LAYERS.map((layer) => {
            const status = getLayerStatus(layer.id);
            const result = layerResults.find((r) => r.layerId === layer.id);

            return (
              <div
                key={layer.id}
                className={`relative p-2 rounded-lg border transition-all duration-300 ${
                  status === 'processing'
                    ? 'border-blue-500 bg-blue-500/10 scale-105'
                    : status === 'success'
                    ? 'border-green-500/50 bg-green-500/10'
                    : status === 'warning'
                    ? 'border-yellow-500/50 bg-yellow-500/10'
                    : status === 'failed'
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-muted bg-muted/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{layer.icon}</span>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                </div>
                <div className="text-[10px] font-medium truncate">{layer.name}</div>
                {result && (
                  <div className="text-[9px] text-muted-foreground mt-1">
                    {result.securityScore.toFixed(0)}%
                  </div>
                )}
                {status === 'processing' && (
                  <Loader2 className="absolute top-1 right-1 h-3 w-3 animate-spin text-blue-500" />
                )}
                {status === 'success' && (
                  <CheckCircle className="absolute top-1 right-1 h-3 w-3 text-green-500" />
                )}
                {status === 'warning' && (
                  <AlertTriangle className="absolute top-1 right-1 h-3 w-3 text-yellow-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Layer Details */}
        {layerResults.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 max-h-32 overflow-y-auto">
            <div className="text-xs font-medium mb-2">Layer Details</div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {layerResults.slice(-6).map((result) => (
                <div key={result.layerId} className="flex justify-between">
                  <span className="text-muted-foreground truncate">
                    L{result.layerId}: {result.name}
                  </span>
                  <span
                    className={
                      result.securityScore >= 80
                        ? 'text-green-500'
                        : result.securityScore >= 60
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }
                  >
                    {result.securityScore.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
