import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Activity,
  TrendingUp,
  Cpu,
  Network,
  BarChart3
} from 'lucide-react';

interface QNNMetrics {
  layerCount: number;
  totalNeurons: number;
  avgEntanglement: number;
  trainingAccuracy: number;
  inferenceLatency: number;
  adaptationRate: number;
}

interface ThreatClassification {
  threatType: string;
  confidence: number;
  subspaceVector: number[];
  recommendedAction: string;
}

interface QuantumNeuralDefensePanelProps {
  metrics?: QNNMetrics;
  classifications?: ThreatClassification[];
  isActive?: boolean;
}

export function QuantumNeuralDefensePanel({ 
  metrics,
  classifications = [],
  isActive = false 
}: QuantumNeuralDefensePanelProps) {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  const defaultMetrics: QNNMetrics = {
    layerCount: 5,
    totalNeurons: 608,
    avgEntanglement: 6.4,
    trainingAccuracy: 0.94,
    inferenceLatency: 2.3,
    adaptationRate: 0.87,
  };

  const displayMetrics = metrics || defaultMetrics;

  const layers = [
    { name: 'Input Layer', neurons: 64, type: 'quantum-relu', gates: ['H', 'CNOT', 'RZ'] },
    { name: 'Hidden 1', neurons: 128, type: 'quantum-sigmoid', gates: ['H', 'CNOT', 'CZ', 'SWAP'] },
    { name: 'Hidden 2', neurons: 256, type: 'quantum-relu', gates: ['H', 'TOFFOLI', 'RY'] },
    { name: 'Classifier', neurons: 128, type: 'subspace-softmax', gates: ['MEASURE', 'RZ'] },
    { name: 'Output', neurons: 32, type: 'subspace-softmax', gates: ['MEASURE'] },
  ];

  const defaultClassifications: ThreatClassification[] = [
    { threatType: 'Malware', confidence: 0.92, subspaceVector: [0.1, 0.8, 0.3], recommendedAction: 'Quarantine' },
    { threatType: 'DDoS', confidence: 0.87, subspaceVector: [0.7, 0.2, 0.5], recommendedAction: 'Rate Limit' },
    { threatType: 'APT', confidence: 0.78, subspaceVector: [0.4, 0.6, 0.9], recommendedAction: 'Deep Analysis' },
    { threatType: 'Phishing', confidence: 0.95, subspaceVector: [0.2, 0.9, 0.1], recommendedAction: 'Block' },
  ];

  const displayClassifications = classifications.length > 0 ? classifications : defaultClassifications;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className={`h-5 w-5 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            Quantum Neural Network Defense
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Learning' : 'Standby'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Architecture Visualization */}
        <div className="relative">
          <div className="flex items-center justify-between gap-2 py-4">
            {layers.map((layer, idx) => (
              <div 
                key={idx}
                className={`flex-1 cursor-pointer transition-all ${
                  selectedLayer === idx ? 'scale-110' : 'hover:scale-105'
                }`}
                onClick={() => setSelectedLayer(selectedLayer === idx ? null : idx)}
              >
                <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
                  selectedLayer === idx 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {layer.neurons}
                </div>
                <div className="text-center text-xs mt-1 text-muted-foreground truncate">
                  {layer.name}
                </div>
                {/* Connection Lines */}
                {idx < layers.length - 1 && (
                  <div className="absolute top-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" 
                    style={{ left: `${(idx + 0.5) / layers.length * 100}%`, width: `${100 / layers.length}%` }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Selected Layer Details */}
          {selectedLayer !== null && (
            <div className="mt-4 p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{layers[selectedLayer].name}</span>
                <Badge variant="outline">{layers[selectedLayer].type}</Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                {layers[selectedLayer].gates.map((gate, i) => (
                  <Badge key={i} className="bg-primary/20 text-primary border-0">
                    {gate}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted text-center">
            <Cpu className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{displayMetrics.totalNeurons}</div>
            <div className="text-xs text-muted-foreground">Total Neurons</div>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <Network className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{displayMetrics.avgEntanglement.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Avg Entanglement</div>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <Zap className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{displayMetrics.inferenceLatency}ms</div>
            <div className="text-xs text-muted-foreground">Latency</div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Training Accuracy</span>
              <span className="font-mono">{(displayMetrics.trainingAccuracy * 100).toFixed(1)}%</span>
            </div>
            <Progress value={displayMetrics.trainingAccuracy * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Adaptation Rate</span>
              <span className="font-mono">{(displayMetrics.adaptationRate * 100).toFixed(1)}%</span>
            </div>
            <Progress value={displayMetrics.adaptationRate * 100} className="h-2" />
          </div>
        </div>

        {/* Threat Classifications */}
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Threat Classification Results
          </div>
          <div className="space-y-2">
            {displayClassifications.map((classification, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    classification.confidence > 0.9 ? 'bg-red-500' :
                    classification.confidence > 0.8 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm font-medium">{classification.threatType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {(classification.confidence * 100).toFixed(0)}%
                  </Badge>
                  <Badge className="text-xs bg-primary/20 text-primary border-0">
                    {classification.recommendedAction}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subspace Learning Indicator */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Subspace Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${isActive ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">
                {isActive ? 'Adapting to new patterns...' : 'Ready for training'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
