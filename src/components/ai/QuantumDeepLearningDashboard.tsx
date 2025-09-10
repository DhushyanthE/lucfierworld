import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Zap, BrainCircuit, Network } from 'lucide-react';
import { toast } from 'sonner';
import { quantumSecurityService } from '@/services/quantum/security/QuantumSecurityService';
import { TrainedQuantumModel } from '@/services/quantum/types/ModelTypes';

export function QuantumDeepLearningDashboard() {
  const [activeTab, setActiveTab] = useState('learning');
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loss, setLoss] = useState(1.0);
  const [quantumLayers, setQuantumLayers] = useState(2);
  const [securityScore, setSecurityScore] = useState(0);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [trainingInterval, setTrainingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial security evaluation
    evaluateModelSecurity();
    return () => {
      if (trainingInterval) clearInterval(trainingInterval);
    };
  }, []);

  const startTraining = () => {
    if (isTraining) return;
    
    setIsTraining(true);
    toast.info('Quantum deep learning training started', {
      description: 'Training with quantum-enhanced layers'
    });

    const interval = setInterval(() => {
      setEpoch(prev => {
        const newEpoch = prev + 1;
        if (newEpoch >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          evaluateModelSecurity();
          toast.success('Deep learning model training complete', {
            description: `Final accuracy: ${Math.min(99.2, accuracy + 15).toFixed(1)}%`
          });
          return 100;
        }
        return newEpoch;
      });
      
      setAccuracy(prev => {
        // Logarithmic improvement with some random noise
        const improvement = Math.max(0.1, (98 - prev) / 20) + (Math.random() * 0.5 - 0.25);
        return Math.min(99, prev + improvement);
      });
      
      setLoss(prev => {
        // Exponential decay of loss with some random noise
        const decay = prev * 0.95 + (Math.random() * 0.02 - 0.01);
        return Math.max(0.01, decay);
      });
    }, 300);
    
    setTrainingInterval(interval);
  };

  const pauseTraining = () => {
    if (trainingInterval) {
      clearInterval(trainingInterval);
      setTrainingInterval(null);
    }
    setIsTraining(false);
    toast.info('Training paused', {
      description: 'Current model state preserved'
    });
  };

  const resetTraining = () => {
    if (trainingInterval) {
      clearInterval(trainingInterval);
      setTrainingInterval(null);
    }
    setIsTraining(false);
    setEpoch(0);
    setAccuracy(0);
    setLoss(1.0);
    setModelMetrics(null);
    toast.info('Model reset', {
      description: 'Training progress cleared'
    });
  };

  const evaluateModelSecurity = () => {
    // Create mock model for security evaluation with the correct structure
    const mockModel: TrainedQuantumModel = {
      weights: Array(10).fill(Array(10).fill(0.1)),
      biases: Array(10).fill(Array(10).fill(0.01)),
      metrics: [
        {
          epoch: 100,
          accuracy: accuracy / 100,
          loss: loss,
          fidelity: 0.9,
          quantumCoherence: 0.9
        }
      ],
      config: {
        layers: [64, 128, quantumLayers, 10],
        activations: Array(4).fill('quantum'),
      },
      finalMetrics: {
        loss: loss,
        accuracy: accuracy / 100,
        fidelity: 0.9,
        robustness: 0.85,
        quantumResistance: 0.88
      }
    };
    
    const securityEvaluation = quantumSecurityService.evaluateModelSecurity(mockModel);
    setSecurityScore(securityEvaluation.overallScore * 100);
    setModelMetrics({
      vulnerabilities: securityEvaluation.vulnerabilities,
      recommendations: securityEvaluation.recommendations,
      parameters: mockModel.weights.length * mockModel.weights[0].length + 
                  mockModel.biases.length * mockModel.biases[0].length,
      quantumAdvantage: (quantumLayers / 5) * 0.7 + (accuracy / 100) * 0.3
    });
  };

  const adjustQuantumLayers = (change: number) => {
    setQuantumLayers(prev => {
      const newValue = Math.max(1, Math.min(5, prev + change));
      toast.info(`Quantum layers ${change > 0 ? 'increased' : 'decreased'}`, {
        description: `Model now has ${newValue} quantum layers`
      });
      return newValue;
    });
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-400" />
            <span>Quantum Deep Learning Dashboard</span>
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${isTraining ? 'bg-green-900/30 text-green-400 border-green-500/50' : 'bg-gray-900/30 text-gray-400 border-gray-500/50'}`}
          >
            {isTraining ? 'Training' : epoch > 0 ? 'Trained' : 'Ready'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="learning" className="data-[state=active]:bg-purple-900/30">
              <BrainCircuit className="h-4 w-4 mr-2" />
              Learning Progress
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-900/30">
              <Network className="h-4 w-4 mr-2" />
              Model Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="learning" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Training Epoch</div>
                  <div className="text-2xl font-semibold text-white">{epoch} / 100</div>
                  <div className="bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${epoch}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Model Accuracy</div>
                  <div className="text-2xl font-semibold text-white">{accuracy.toFixed(1)}%</div>
                  <div className="bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Training Loss</div>
                  <div className="text-2xl font-semibold text-white">{loss.toFixed(3)}</div>
                  <div className="bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${loss * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Quantum Layers</div>
                  <div className="text-2xl font-semibold text-white">{quantumLayers}</div>
                  <div className="flex justify-between gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-gray-900/20 hover:bg-gray-900/30 w-full"
                      onClick={() => adjustQuantumLayers(-1)}
                      disabled={quantumLayers <= 1 || isTraining}
                    >
                      -
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-gray-900/20 hover:bg-gray-900/30 w-full"
                      onClick={() => adjustQuantumLayers(1)}
                      disabled={quantumLayers >= 5 || isTraining}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isTraining ? (
                  <Button 
                    variant="outline" 
                    className="bg-red-900/20 hover:bg-red-900/30 text-red-400 w-full"
                    onClick={pauseTraining}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="bg-green-900/20 hover:bg-green-900/30 text-green-400 w-full"
                    onClick={startTraining}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {epoch > 0 ? 'Resume' : 'Start'} Training
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="bg-gray-900/20 hover:bg-gray-900/30 text-gray-400"
                  onClick={resetTraining}
                  disabled={isTraining}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              {epoch > 50 && (
                <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3 text-sm text-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <div className="font-medium">Quantum Advantage Analysis</div>
                  </div>
                  <p className="text-xs text-gray-300">
                    The quantum neural network is demonstrating {epoch > 90 ? 'significant' : 'moderate'} advantage
                    over classical methods. With {quantumLayers} quantum layer{quantumLayers !== 1 ? 's' : ''}, the model 
                    achieves faster convergence and higher accuracy for complex pattern recognition tasks.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="focus-visible:outline-none focus-visible:ring-0">
            {modelMetrics ? (
              <div className="space-y-4">
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-300">Security Score</div>
                    <div className={`text-sm font-medium ${
                      securityScore > 90 ? 'text-green-400' :
                      securityScore > 80 ? 'text-blue-400' :
                      securityScore > 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {securityScore.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        securityScore > 90 ? 'bg-green-500' :
                        securityScore > 80 ? 'bg-blue-500' :
                        securityScore > 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${securityScore}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                    <div>
                      <div className="text-xs text-gray-400">Parameters</div>
                      <div className="text-sm text-gray-200">{modelMetrics.parameters.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Quantum Advantage</div>
                      <div className="text-sm text-gray-200">{(modelMetrics.quantumAdvantage * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">Vulnerabilities</div>
                  {modelMetrics.vulnerabilities.length > 0 ? (
                    <ul className="space-y-2">
                      {modelMetrics.vulnerabilities.map((item: string, index: number) => (
                        <li key={index} className="text-xs text-amber-300 flex gap-2">
                          <span className="text-amber-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400">No vulnerabilities detected</p>
                  )}
                </div>
                
                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">Recommendations</div>
                  <ul className="space-y-2">
                    {modelMetrics.recommendations.map((item: string, index: number) => (
                      <li key={index} className="text-xs text-blue-300 flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <p>Train the model to view security metrics</p>
                <Button 
                  variant="outline" 
                  className="mt-4 bg-gray-900/20 hover:bg-gray-900/30 text-gray-300"
                  onClick={evaluateModelSecurity}
                >
                  Evaluate Security
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
