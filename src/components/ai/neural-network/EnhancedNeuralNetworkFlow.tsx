import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  Network, 
  Play,
  Pause,
  RotateCcw,
  Settings,
  Activity,
  TrendingUp,
  Target,
  Cpu,
  MonitorPlay,
  BarChart3,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { neuralNetworkWorkflowService, TrainingSession, WorkflowTask } from '@/services/workflow/NeuralNetworkWorkflowService';

interface NetworkVisualizationProps {
  isTraining: boolean;
  currentEpoch: number;
  totalEpochs: number;
  accuracy: number;
  loss: number;
}

function NetworkVisualization({ isTraining, currentEpoch, totalEpochs, accuracy, loss }: NetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw neural network
    const layers = [4, 6, 4, 2]; // Input, Hidden, Hidden, Output
    const layerSpacing = canvas.width / (layers.length + 1);
    const nodes: Array<{ x: number; y: number; activation: number; type: string }> = [];

    // Create nodes
    layers.forEach((nodeCount, layerIndex) => {
      const layerX = layerSpacing * (layerIndex + 1);
      const nodeSpacing = canvas.height / (nodeCount + 1);
      
      for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
        const y = nodeSpacing * (nodeIndex + 1);
        const activation = isTraining ? Math.random() * accuracy : 0.5;
        const type = layerIndex === 0 ? 'input' : 
                    layerIndex === layers.length - 1 ? 'output' : 'hidden';
        
        nodes.push({ x: layerX, y, activation, type });
      }
    });

    // Draw connections
    let nodeIndex = 0;
    for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
      const currentLayerStart = nodeIndex;
      const currentLayerEnd = nodeIndex + layers[layerIndex];
      nodeIndex += layers[layerIndex];
      const nextLayerStart = nodeIndex;
      const nextLayerEnd = nodeIndex + layers[layerIndex + 1];

      for (let i = currentLayerStart; i < currentLayerEnd; i++) {
        for (let j = nextLayerStart; j < nextLayerEnd; j++) {
          const strength = Math.random() * 0.8 + 0.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `hsl(240, 70%, ${30 + strength * 40}%)`;
          ctx.lineWidth = strength * 2;
          ctx.globalAlpha = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    ctx.globalAlpha = 1;
    nodes.forEach((node, index) => {
      const radius = 8 + node.activation * 6;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      
      if (node.type === 'input') {
        ctx.fillStyle = `hsl(120, 70%, ${40 + node.activation * 40}%)`;
      } else if (node.type === 'output') {
        ctx.fillStyle = `hsl(30, 80%, ${45 + node.activation * 40}%)`;
      } else {
        ctx.fillStyle = `hsl(270, 80%, ${40 + node.activation * 40}%)`;
      }
      
      ctx.fill();

      // Add glow effect for active nodes
      if (isTraining && node.activation > 0.7) {
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

  }, [isTraining, currentEpoch, accuracy, loss]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-80 bg-gradient-to-br from-gray-900/50 to-black/50 border border-purple-500/20 rounded-lg"
      />
      
      {isTraining && (
        <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3 space-y-2">
          <div className="text-xs text-green-400">
            Training Active
          </div>
          <div className="text-xs text-gray-300">
            Epoch: {currentEpoch}/{totalEpochs}
          </div>
          <div className="text-xs text-blue-400">
            Accuracy: {(accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-red-400">
            Loss: {loss.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}

interface WorkflowTaskListProps {
  tasks: WorkflowTask[];
}

function WorkflowTaskList({ tasks }: WorkflowTaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <Card key={task.id} className="bg-gray-900/40 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  task.status === 'running' ? 'bg-blue-500 animate-pulse' :
                  task.status === 'completed' ? 'bg-green-500' :
                  task.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <span className="text-sm font-medium text-white">{task.type.charAt(0).toUpperCase() + task.type.slice(1)}</span>
                <Badge variant="outline" className={`text-xs ${
                  task.status === 'running' ? 'bg-blue-900/20 text-blue-300 border-blue-500/30' :
                  task.status === 'completed' ? 'bg-green-900/20 text-green-300 border-green-500/30' :
                  task.status === 'failed' ? 'bg-red-900/20 text-red-300 border-red-500/30' :
                  'bg-gray-800 text-gray-400 border-gray-700'
                }`}>
                  {task.status}
                </Badge>
              </div>
              <span className="text-xs text-gray-400">{task.progress}%</span>
            </div>
            
            {task.status === 'running' && (
              <Progress value={task.progress} className="h-1 mb-2" />
            )}
            
            {task.result && (
              <div className="text-xs text-gray-400 mt-2">
                {Object.entries(task.result).slice(0, 2).map(([key, value]) => (
                  <div key={key}>
                    {key}: {typeof value === 'number' ? value.toFixed(3) : String(value)}
                  </div>
                ))}
              </div>
            )}
            
            {task.error && (
              <div className="text-xs text-red-400 mt-2">
                Error: {task.error}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EnhancedNeuralNetworkFlow() {
  const [isTraining, setIsTraining] = useState(false);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [networkConfig, setNetworkConfig] = useState({
    name: 'Quantum Enhanced Network',
    inputSize: 10,
    hiddenLayers: [
      { neurons: 16, activation: 'relu' },
      { neurons: 8, activation: 'tanh' }
    ],
    outputSize: 2,
    quantumEnhanced: true
  });

  // Create sample dataset
  const generateDataset = useCallback(() => {
    const size = 1000;
    const inputs = Array(size).fill(0).map(() => 
      Array(networkConfig.inputSize).fill(0).map(() => Math.random())
    );
    const targets = Array(size).fill(0).map(() => 
      Array(networkConfig.outputSize).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
    );
    return { inputs, targets };
  }, [networkConfig]);

  // Start training workflow
  const startTraining = useCallback(async () => {
    if (isTraining) return;

    try {
      setIsTraining(true);
      
      // Create network
      const network = await neuralNetworkWorkflowService.createNetwork(networkConfig);
      
      // Generate dataset
      const dataset = generateDataset();
      
      // Start training workflow
      const sessionId = await neuralNetworkWorkflowService.startTrainingWorkflow(
        network.id,
        dataset,
        {
          epochs: 50,
          validationSplit: 0.2,
          quantumEnhanced: networkConfig.quantumEnhanced,
          realTimeUpdates: true
        }
      );

      toast.success('Training workflow started', {
        description: 'Neural network training has begun with quantum enhancement'
      });

      // Start monitoring
      monitorTraining(sessionId, `workflow_session_${sessionId}`);

    } catch (error) {
      console.error('Failed to start training:', error);
      toast.error('Failed to start training');
      setIsTraining(false);
    }
  }, [isTraining, networkConfig, generateDataset]);

  // Monitor training progress
  const monitorTraining = useCallback((sessionId: string, workflowId: string) => {
    const interval = setInterval(() => {
      const session = neuralNetworkWorkflowService.getTrainingSession(sessionId);
      const tasks = neuralNetworkWorkflowService.getWorkflowTasks(workflowId);

      if (session) {
        setCurrentSession(session);
        
        if (session.status === 'completed' || session.status === 'failed') {
          setIsTraining(false);
          clearInterval(interval);
          
          if (session.status === 'completed') {
            toast.success('Training completed!', {
              description: `Final accuracy: ${(session.accuracy * 100).toFixed(1)}%`
            });
          } else {
            toast.error('Training failed');
          }
        }
      }

      setWorkflowTasks(tasks);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Reset training
  const resetTraining = useCallback(() => {
    if (isTraining) return;
    
    setCurrentSession(null);
    setWorkflowTasks([]);
    toast.info('Training reset');
  }, [isTraining]);

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            Enhanced Neural Network Flow
            <Badge variant="outline" className="ml-2 bg-purple-900/40 text-purple-300 border-purple-500/30">
              <Cpu className="h-3 w-3 mr-1" />
              {isTraining ? 'Training' : 'Ready'}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startTraining}
              disabled={isTraining}
              className="bg-green-900/30 border-green-500/30 text-green-300 hover:bg-green-900/50"
            >
              {isTraining ? <MonitorPlay className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isTraining ? 'Training...' : 'Start Training'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetTraining}
              disabled={isTraining}
              className="bg-gray-900/30 border-gray-700 text-gray-400 hover:bg-gray-800/50"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {currentSession && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">
                Epoch {currentSession.currentEpoch} / {currentSession.totalEpochs}
              </span>
              <span className="text-gray-400">
                Accuracy: {(currentSession.accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={(currentSession.currentEpoch / currentSession.totalEpochs) * 100} 
              className="h-2"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="network">
              <Network className="h-4 w-4 mr-1" />
              Network
            </TabsTrigger>
            <TabsTrigger value="workflow">
              <Layers className="h-4 w-4 mr-1" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChart3 className="h-4 w-4 mr-1" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <NetworkVisualization
              isTraining={isTraining}
              currentEpoch={currentSession?.currentEpoch || 0}
              totalEpochs={currentSession?.totalEpochs || 100}
              accuracy={currentSession?.accuracy || 0}
              loss={currentSession?.loss || 1}
            />
            
            {currentSession && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-900/40 border-gray-700/50">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {(currentSession.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">Accuracy</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/40 border-gray-700/50">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {currentSession.loss.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-400">Loss</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/40 border-gray-700/50">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {currentSession.currentEpoch}
                    </div>
                    <div className="text-xs text-gray-400">Epoch</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/40 border-gray-700/50">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {(currentSession.validationAccuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">Val Acc</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="network" className="space-y-4 mt-6">
            <Card className="bg-gray-900/40 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-sm text-white">Network Architecture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Input Size:</span>
                    <span className="text-white ml-2">{networkConfig.inputSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Output Size:</span>
                    <span className="text-white ml-2">{networkConfig.outputSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Hidden Layers:</span>
                    <span className="text-white ml-2">{networkConfig.hiddenLayers.length}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400">Quantum Enhanced:</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {networkConfig.quantumEnhanced ? (
                        <><Zap className="h-3 w-3 mr-1" />Yes</>
                      ) : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-200">Workflow Tasks</span>
            </div>
            
            {workflowTasks.length > 0 ? (
              <WorkflowTaskList tasks={workflowTasks} />
            ) : (
              <Card className="bg-gray-900/40 border-gray-700/50">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-400">No active workflow</div>
                  <div className="text-xs text-gray-500 mt-1">Start training to see workflow tasks</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4 mt-6">
            {currentSession?.metrics && (
              <div className="space-y-4">
                <Card className="bg-gray-900/40 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">Learning Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentSession.metrics.learningCurve.slice(-5).map((point, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-400">Epoch {point.epoch}:</span>
                          <span className="text-green-400">
                            Acc: {(point.accuracy * 100).toFixed(1)}%
                          </span>
                          <span className="text-red-400">
                            Loss: {point.loss.toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {networkConfig.quantumEnhanced && currentSession.metrics.quantumCoherence && (
                  <Card className="bg-gray-900/40 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-400" />
                        Quantum Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Coherence:</span>
                          <span className="text-purple-400">
                            {(currentSession.metrics.quantumCoherence[currentSession.metrics.quantumCoherence.length - 1] * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Convergence Rate:</span>
                          <span className="text-blue-400">
                            {(currentSession.metrics.convergenceRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}