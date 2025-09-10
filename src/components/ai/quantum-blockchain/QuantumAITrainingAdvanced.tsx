import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Activity,
  Cpu,
  Network,
  Database,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface TrainingMetrics {
  accuracy: number;
  loss: number;
  epoch: number;
  learningRate: number;
  quantumFeatureMapping: number;
  patternRecognitionRate: number;
  confidenceScore: number;
  quantumKernelEfficiency: number;
}

interface PatternData {
  id: string;
  name: string;
  confidence: number;
  quantumEnhanced: boolean;
  processingTime: number;
}

export function QuantumAITrainingAdvanced() {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingPhase, setTrainingPhase] = useState<'initialization' | 'quantum-mapping' | 'deep-learning' | 'optimization' | 'validation'>('initialization');
  const [metrics, setMetrics] = useState<TrainingMetrics>({
    accuracy: 0,
    loss: 1.0,
    epoch: 0,
    learningRate: 0.001,
    quantumFeatureMapping: 0,
    patternRecognitionRate: 0,
    confidenceScore: 0,
    quantumKernelEfficiency: 0
  });

  const [patterns] = useState<PatternData[]>([
    { id: '1', name: 'Transaction Pattern Alpha', confidence: 0, quantumEnhanced: true, processingTime: 0 },
    { id: '2', name: 'Security Threat Beta', confidence: 0, quantumEnhanced: true, processingTime: 0 },
    { id: '3', name: 'Market Behavior Gamma', confidence: 0, quantumEnhanced: false, processingTime: 0 },
    { id: '4', name: 'Network Anomaly Delta', confidence: 0, quantumEnhanced: true, processingTime: 0 },
    { id: '5', name: 'User Behavior Epsilon', confidence: 0, quantumEnhanced: false, processingTime: 0 },
    { id: '6', name: 'Quantum State Zeta', confidence: 0, quantumEnhanced: true, processingTime: 0 },
    { id: '7', name: 'Smart Contract Eta', confidence: 0, quantumEnhanced: false, processingTime: 0 },
    { id: '8', name: 'Consensus Pattern Theta', confidence: 0, quantumEnhanced: true, processingTime: 0 },
    { id: '9', name: 'Liquidity Flow Iota', confidence: 0, quantumEnhanced: false, processingTime: 0 },
    { id: '10', name: 'Governance Signal Kappa', confidence: 0, quantumEnhanced: true, processingTime: 0 },
    { id: '11', name: 'Cross-Chain Lambda', confidence: 0, quantumEnhanced: true, processingTime: 0 },
    { id: '12', name: 'DeFi Protocol Mu', confidence: 0, quantumEnhanced: false, processingTime: 0 },
    { id: '13', name: 'MEV Detection Nu', confidence: 0, quantumEnhanced: true, processingTime: 0 },
    { id: '14', name: 'Oracle Data Xi', confidence: 0, quantumEnhanced: false, processingTime: 0 },
    { id: '15', name: 'Quantum Advantage Omicron', confidence: 0, quantumEnhanced: true, processingTime: 0 }
  ]);

  const [updatedPatterns, setUpdatedPatterns] = useState<PatternData[]>(patterns);

  useEffect(() => {
    if (!isTraining) return;

    const interval = setInterval(() => {
      // Update training metrics based on phase
      setMetrics(prev => {
        const targetAccuracy = 99.11;
        const accuracyIncrement = Math.random() * 0.8;
        const newAccuracy = Math.min(targetAccuracy, prev.accuracy + accuracyIncrement);
        
        return {
          accuracy: newAccuracy,
          loss: Math.max(0.01, prev.loss - Math.random() * 0.02),
          epoch: prev.epoch + 1,
          learningRate: 0.001 * Math.exp(-prev.epoch / 1000),
          quantumFeatureMapping: Math.min(100, prev.quantumFeatureMapping + Math.random() * 2),
          patternRecognitionRate: Math.min(100, prev.patternRecognitionRate + Math.random() * 1.5),
          confidenceScore: Math.min(100, prev.confidenceScore + Math.random() * 1.8),
          quantumKernelEfficiency: Math.min(100, prev.quantumKernelEfficiency + Math.random() * 1.2)
        };
      });

      // Update pattern recognition
      setUpdatedPatterns(prev => 
        prev.map(pattern => ({
          ...pattern,
          confidence: Math.min(100, pattern.confidence + Math.random() * (pattern.quantumEnhanced ? 3 : 2)),
          processingTime: Math.max(1, 50 - (pattern.confidence / 2) + Math.random() * 10)
        }))
      );

      // Update training phase
      setTrainingPhase(prev => {
        const phases: Array<typeof prev> = ['initialization', 'quantum-mapping', 'deep-learning', 'optimization', 'validation'];
        const currentIndex = phases.indexOf(prev);
        if (Math.random() < 0.1) { // 10% chance to advance phase
          return phases[(currentIndex + 1) % phases.length];
        }
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isTraining]);

  const handleStartTraining = () => {
    setIsTraining(!isTraining);
  };

  const handleResetTraining = () => {
    setIsTraining(false);
    setTrainingPhase('initialization');
    setMetrics({
      accuracy: 0,
      loss: 1.0,
      epoch: 0,
      learningRate: 0.001,
      quantumFeatureMapping: 0,
      patternRecognitionRate: 0,
      confidenceScore: 0,
      quantumKernelEfficiency: 0
    });
    setUpdatedPatterns(patterns);
  };

  const getPhaseColor = (phase: typeof trainingPhase) => {
    switch (phase) {
      case 'initialization': return 'text-blue-400';
      case 'quantum-mapping': return 'text-purple-400';
      case 'deep-learning': return 'text-green-400';
      case 'optimization': return 'text-yellow-400';
      case 'validation': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Training Control Header */}
      <Card className="bg-black/70 border-blue-500/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-blue-400" />
              Quantum-Enhanced AI Training System
              <Badge variant="outline" className={`ml-2 bg-blue-900/40 border-blue-500/30 ${getPhaseColor(trainingPhase)}`}>
                {trainingPhase.replace('-', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartTraining}
                className={`${
                  isTraining 
                    ? 'bg-red-900/30 border-red-500 text-red-300 hover:bg-red-900/50' 
                    : 'bg-green-900/30 border-green-500 text-green-300 hover:bg-green-900/50'
                }`}
              >
                {isTraining ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isTraining ? 'Stop Training' : 'Start Training'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetTraining}
                className="bg-gray-900/30 border-gray-700 text-gray-400 hover:bg-gray-800/50"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isTraining && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{metrics.epoch}</div>
                <div className="text-xs text-gray-400">Training Epochs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{metrics.accuracy.toFixed(2)}%</div>
                <div className="text-xs text-gray-400">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{metrics.quantumFeatureMapping.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Quantum Mapping</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{metrics.confidenceScore.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Confidence Score</div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Training Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/70 border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5 text-green-400" />
              Neural Network Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Model Accuracy</span>
                <span className="text-sm font-medium text-white">{metrics.accuracy.toFixed(2)}%</span>
              </div>
              <Progress value={metrics.accuracy} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Training Loss</span>
                <span className="text-sm font-medium text-white">{metrics.loss.toFixed(4)}</span>
              </div>
              <Progress value={(1 - metrics.loss) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Learning Rate</span>
                <span className="text-sm font-medium text-white">{metrics.learningRate.toFixed(6)}</span>
              </div>
              <Progress value={metrics.learningRate * 1000} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Pattern Recognition</span>
                <span className="text-sm font-medium text-white">{metrics.patternRecognitionRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.patternRecognitionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/70 border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-purple-400" />
              Quantum Enhancement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Quantum Feature Mapping</span>
                <span className="text-sm font-medium text-white">{metrics.quantumFeatureMapping.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.quantumFeatureMapping} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Quantum Kernel Efficiency</span>
                <span className="text-sm font-medium text-white">{metrics.quantumKernelEfficiency.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.quantumKernelEfficiency} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Confidence Score</span>
                <span className="text-sm font-medium text-white">{metrics.confidenceScore.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.confidenceScore} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Grover Algorithm Efficiency</span>
                <span className="text-sm font-medium text-white">8x Speedup</span>
              </div>
              <Progress value={87.5} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Recognition Matrix */}
      <Card className="bg-black/70 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-5 w-5 text-yellow-400" />
            15-Pattern Recognition Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {updatedPatterns.map((pattern) => (
              <Card
                key={pattern.id}
                className={`${
                  pattern.quantumEnhanced
                    ? 'bg-purple-900/20 border-purple-500/30'
                    : 'bg-gray-900/40 border-gray-700/50'
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-1 mb-2">
                    {pattern.quantumEnhanced && <Zap className="h-3 w-3 text-purple-400" />}
                    <span className="text-xs font-medium text-white truncate">{pattern.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Confidence</span>
                        <span className="text-xs text-white">{pattern.confidence.toFixed(1)}%</span>
                      </div>
                      <Progress value={pattern.confidence} className="h-1" />
                    </div>
                    <div className="text-xs text-gray-400">
                      Processing: {pattern.processingTime.toFixed(1)}ms
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}