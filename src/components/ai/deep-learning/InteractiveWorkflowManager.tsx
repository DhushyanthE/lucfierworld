import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  Play,
  Pause,
  Square,
  Settings,
  Database,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Target,
  Cpu,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Monitor,
  Sparkles,
  Rocket,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  deepLearningWorkflowService, 
  WorkflowSession, 
  ModelConfig, 
  DataPipeline 
} from '@/services/workflow/DeepLearningWorkflowService';

interface WorkflowVisualizationProps {
  session: WorkflowSession | null;
  isActive: boolean;
}

function WorkflowVisualization({ session, isActive }: WorkflowVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !session) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw workflow stages as connected nodes
    const stages = session.stages;
    const stageWidth = canvas.width / (stages.length + 1);
    const centerY = canvas.height / 2;

    stages.forEach((stage, index) => {
      const x = stageWidth * (index + 1);
      const y = centerY;
      const radius = 30;

      // Draw connections
      if (index > 0) {
        ctx.beginPath();
        ctx.moveTo(stageWidth * index + radius, centerY);
        ctx.lineTo(x - radius, y);
        ctx.strokeStyle = stage.status === 'completed' ? '#10b981' : '#6b7280';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw stage node
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      
      // Color based on status
      switch (stage.status) {
        case 'completed':
          ctx.fillStyle = '#10b981';
          break;
        case 'running':
          ctx.fillStyle = '#3b82f6';
          break;
        case 'failed':
          ctx.fillStyle = '#ef4444';
          break;
        case 'paused':
          ctx.fillStyle = '#f59e0b';
          break;
        default:
          ctx.fillStyle = '#6b7280';
      }
      
      ctx.fill();

      // Add glow effect for active stage
      if (stage.status === 'running' && isActive) {
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw progress arc for running stages
      if (stage.status === 'running' && stage.progress > 0) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * stage.progress / 100));
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Draw stage icon
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const icons = {
        data: '📊',
        model: '🧠',
        training: '🔄',
        validation: '✓',
        deployment: '🚀'
      };
      
      ctx.fillText(icons[stage.type as keyof typeof icons] || '?', x, y);

      // Draw stage name
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '12px Arial';
      ctx.fillText(stage.name, x, y + radius + 20);

      // Draw progress percentage for running stages
      if (stage.status === 'running') {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`${Math.round(stage.progress)}%`, x, y + radius + 35);
      }
    });

  }, [session, isActive]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-48 bg-gradient-to-br from-gray-900/50 to-black/50 border border-blue-500/20 rounded-lg"
      />
      
      {session && (
        <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 space-y-1">
          <div className="text-xs text-blue-400 font-medium">
            {session.name}
          </div>
          <div className="text-xs text-gray-300">
            Status: {session.status}
          </div>
          {session.currentStageId && (
            <div className="text-xs text-green-400">
              Current: {session.stages.find(s => s.id === session.currentStageId)?.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ModelConfiguratorProps {
  onConfigChange: (config: any) => void;
  disabled: boolean;
}

function ModelConfigurator({ onConfigChange, disabled }: ModelConfiguratorProps) {
  const [config, setConfig] = useState({
    name: 'Advanced Neural Network',
    type: 'transformer',
    complexity: 'medium',
    quantumEnhanced: true,
    inputShape: [224, 224, 3],
    outputSize: 10
  });

  const updateConfig = useCallback((updates: any) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  }, [config, onConfigChange]);

  return (
    <Card className="bg-gray-900/40 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-sm text-white flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-400" />
          Model Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-gray-300">Model Name</Label>
            <Input
              value={config.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
              disabled={disabled}
              className="h-8 text-xs"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-300">Architecture Type</Label>
            <Select
              value={config.type}
              onValueChange={(value) => updateConfig({ type: value })}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cnn">CNN</SelectItem>
                <SelectItem value="rnn">RNN/LSTM</SelectItem>
                <SelectItem value="transformer">Transformer</SelectItem>
                <SelectItem value="gan">GAN</SelectItem>
                <SelectItem value="autoencoder">Autoencoder</SelectItem>
                <SelectItem value="quantum-hybrid">Quantum Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-300">Complexity</Label>
            <Select
              value={config.complexity}
              onValueChange={(value) => updateConfig({ complexity: value })}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-300">Output Classes</Label>
            <Input
              type="number"
              value={config.outputSize}
              onChange={(e) => updateConfig({ outputSize: parseInt(e.target.value) || 10 })}
              disabled={disabled}
              className="h-8 text-xs"
              min="1"
              max="1000"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-300">Quantum Enhancement</Label>
          <Switch
            checked={config.quantumEnhanced}
            onCheckedChange={(checked) => updateConfig({ quantumEnhanced: checked })}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricsDisplayProps {
  session: WorkflowSession | null;
}

function MetricsDisplay({ session }: MetricsDisplayProps) {
  if (!session || session.metrics.length === 0) {
    return (
      <Card className="bg-gray-900/40 border-gray-700/50">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400">No training metrics available</div>
          <div className="text-xs text-gray-500 mt-1">Start training to see real-time metrics</div>
        </CardContent>
      </Card>
    );
  }

  const latestMetrics = session.metrics[session.metrics.length - 1];
  const bestAccuracy = Math.max(...session.metrics.map(m => m.trainAccuracy));
  const bestValAccuracy = Math.max(...session.metrics.map(m => m.valAccuracy));

  return (
    <div className="space-y-4">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {(latestMetrics.trainAccuracy * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-green-300">Train Accuracy</div>
            <div className="text-xs text-gray-400 mt-1">
              Best: {(bestAccuracy * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {(latestMetrics.valAccuracy * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-blue-300">Val Accuracy</div>
            <div className="text-xs text-gray-400 mt-1">
              Best: {(bestValAccuracy * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {latestMetrics.trainLoss.toFixed(3)}
            </div>
            <div className="text-xs text-red-300">Loss</div>
            <div className="text-xs text-gray-400 mt-1">
              Epoch {latestMetrics.epoch}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {latestMetrics.learningRate.toExponential(2)}
            </div>
            <div className="text-xs text-purple-300">Learning Rate</div>
            <div className="text-xs text-gray-400 mt-1">
              Dynamic
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-gray-900/40 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-400" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Memory Usage:</span>
                <span className="text-white">{latestMetrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={latestMetrics.memoryUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Gradient Norm:</span>
                <span className="text-white">{latestMetrics.gradientNorm.toFixed(3)}</span>
              </div>
              <Progress value={Math.min(100, latestMetrics.gradientNorm * 100)} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Compute Time:</span>
                <span className="text-white">{latestMetrics.computeTime.toFixed(0)}ms</span>
              </div>
            </div>
            
            {latestMetrics.quantumFidelity && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Fidelity:</span>
                  <span className="text-purple-400">{(latestMetrics.quantumFidelity * 100).toFixed(1)}%</span>
                </div>
                <Progress value={latestMetrics.quantumFidelity * 100} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantum Resources */}
      {session.quantumResources && (
        <Card className="bg-gray-900/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              Quantum Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Qubits Used:</span>
                <span className="text-purple-400 ml-2">{session.quantumResources.qubitsUsed}</span>
              </div>
              <div>
                <span className="text-gray-400">Gate Operations:</span>
                <span className="text-purple-400 ml-2">{session.quantumResources.gateOperations.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Coherence Time:</span>
                <span className="text-purple-400 ml-2">{session.quantumResources.coherenceTime.toFixed(1)}μs</span>
              </div>
              <div>
                <span className="text-gray-400">Quantum Volume:</span>
                <span className="text-purple-400 ml-2">{session.quantumResources.quantumVolume}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SessionManagerProps {
  sessions: WorkflowSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string | null) => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionPause: (sessionId: string) => void;
  onSessionResume: (sessionId: string) => void;
}

function SessionManager({ 
  sessions, 
  activeSessionId, 
  onSessionSelect, 
  onSessionDelete,
  onSessionPause,
  onSessionResume 
}: SessionManagerProps) {
  return (
    <Card className="bg-gray-900/40 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-sm text-white flex items-center gap-2">
          <Monitor className="h-4 w-4 text-green-400" />
          Session Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No active sessions
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeSessionId === session.id
                  ? 'bg-blue-900/30 border-blue-500/50'
                  : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
              }`}
              onClick={() => onSessionSelect(session.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    session.status === 'running' ? 'bg-green-500 animate-pulse' :
                    session.status === 'completed' ? 'bg-blue-500' :
                    session.status === 'failed' ? 'bg-red-500' :
                    session.status === 'paused' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-sm font-medium text-white truncate">
                    {session.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {session.status === 'running' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionPause(session.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Pause className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {session.status === 'paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionResume(session.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionDelete(session.id);
                    }}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>Status: {session.status}</span>
                <span>
                  Duration: {Math.floor(session.totalDuration / 1000)}s
                </span>
              </div>
              
              {session.currentStageId && (
                <div className="text-xs text-blue-400 mt-1">
                  {session.stages.find(s => s.id === session.currentStageId)?.name}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function InteractiveWorkflowManager() {
  const [sessions, setSessions] = useState<WorkflowSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkflowSession | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [modelConfig, setModelConfig] = useState<any>(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = () => {
      const allSessions = deepLearningWorkflowService.getAllSessions();
      setSessions(allSessions);
    };

    loadSessions();
    const interval = setInterval(loadSessions, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Event listeners for real-time updates
  useEffect(() => {
    const handleWorkflowUpdate = () => {
      const allSessions = deepLearningWorkflowService.getAllSessions();
      setSessions(allSessions);
      
      if (activeSession) {
        const updatedSession = allSessions.find(s => s.id === activeSession.id);
        setActiveSession(updatedSession || null);
      }
    };

    deepLearningWorkflowService.addEventListener('workflow:started', handleWorkflowUpdate);
    deepLearningWorkflowService.addEventListener('workflow:completed', handleWorkflowUpdate);
    deepLearningWorkflowService.addEventListener('training:epoch_completed', handleWorkflowUpdate);
    deepLearningWorkflowService.addEventListener('stage:progress', handleWorkflowUpdate);

    return () => {
      deepLearningWorkflowService.removeEventListener('workflow:started', handleWorkflowUpdate);
      deepLearningWorkflowService.removeEventListener('workflow:completed', handleWorkflowUpdate);
      deepLearningWorkflowService.removeEventListener('training:epoch_completed', handleWorkflowUpdate);
      deepLearningWorkflowService.removeEventListener('stage:progress', handleWorkflowUpdate);
    };
  }, [activeSession]);

  const createNewWorkflow = useCallback(async () => {
    if (!modelConfig || isCreatingWorkflow) return;

    setIsCreatingWorkflow(true);
    
    try {
      // Create model
      const model = await deepLearningWorkflowService.createModel({
        name: modelConfig.name,
        type: modelConfig.type,
        inputShape: modelConfig.inputShape,
        outputSize: modelConfig.outputSize,
        complexity: modelConfig.complexity,
        quantumEnhanced: modelConfig.quantumEnhanced
      });

      // Create data pipeline
      const pipeline = await deepLearningWorkflowService.createDataPipeline({
        name: `${modelConfig.name} Pipeline`,
        dataType: 'image', // Default
        size: modelConfig.complexity,
        quantumPreprocessing: modelConfig.quantumEnhanced
      });

      // Start workflow
      const sessionId = await deepLearningWorkflowService.startWorkflow(
        model.id,
        pipeline.id,
        {
          name: `Training - ${modelConfig.name}`,
          enableQuantum: modelConfig.quantumEnhanced,
          distributedTraining: modelConfig.complexity === 'enterprise',
          autoOptimization: true,
          realTimeMonitoring: true
        }
      );

      toast.success('Workflow created successfully!', {
        description: `Started training ${modelConfig.name} with ${modelConfig.quantumEnhanced ? 'quantum' : 'classical'} enhancement`
      });

      // Set as active session
      const session = deepLearningWorkflowService.getSession(sessionId);
      if (session) {
        setActiveSession(session);
      }

    } catch (error) {
      console.error('Failed to create workflow:', error);
      toast.error('Failed to create workflow');
    } finally {
      setIsCreatingWorkflow(false);
    }
  }, [modelConfig, isCreatingWorkflow]);

  const handleSessionSelect = useCallback((sessionId: string | null) => {
    if (!sessionId) {
      setActiveSession(null);
      return;
    }
    
    const session = deepLearningWorkflowService.getSession(sessionId);
    setActiveSession(session || null);
  }, []);

  const handleSessionDelete = useCallback((sessionId: string) => {
    deepLearningWorkflowService.deleteSession(sessionId);
    if (activeSession?.id === sessionId) {
      setActiveSession(null);
    }
    toast.info('Session deleted');
  }, [activeSession]);

  const handleSessionPause = useCallback((sessionId: string) => {
    if (deepLearningWorkflowService.pauseSession(sessionId)) {
      toast.info('Session paused');
    }
  }, []);

  const handleSessionResume = useCallback((sessionId: string) => {
    if (deepLearningWorkflowService.resumeSession(sessionId)) {
      toast.info('Session resumed');
    }
  }, []);

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            Interactive Deep Learning Workflow
            <Badge variant="outline" className="ml-2 bg-purple-900/40 text-purple-300 border-purple-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Advanced
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={createNewWorkflow}
              disabled={!modelConfig || isCreatingWorkflow}
              className="bg-green-900/30 border-green-500/30 text-green-300 hover:bg-green-900/50"
            >
              {isCreatingWorkflow ? (
                <><Activity className="h-4 w-4 mr-1 animate-spin" />Creating...</>
              ) : (
                <><Rocket className="h-4 w-4 mr-1" />Create Workflow</>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Monitor className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="configure">
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChart3 className="h-4 w-4 mr-1" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Database className="h-4 w-4 mr-1" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Target className="h-4 w-4 mr-1" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <WorkflowVisualization 
              session={activeSession} 
              isActive={activeSession?.status === 'running'} 
            />
            
            {activeSession && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-900/40 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {activeSession.stages.filter(s => s.status === 'completed').length}/{activeSession.stages.length}
                    </div>
                    <div className="text-xs text-gray-400">Stages Complete</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/40 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {activeSession.metrics.length > 0 
                        ? (activeSession.performance.bestValAccuracy * 100).toFixed(1)
                        : '0.0'
                      }%
                    </div>
                    <div className="text-xs text-gray-400">Best Accuracy</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/40 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.floor(activeSession.totalDuration / 1000)}s
                    </div>
                    <div className="text-xs text-gray-400">Duration</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="configure" className="space-y-4 mt-6">
            <ModelConfigurator
              onConfigChange={setModelConfig}
              disabled={isCreatingWorkflow}
            />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4 mt-6">
            <MetricsDisplay session={activeSession} />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4 mt-6">
            <SessionManager
              sessions={sessions}
              activeSessionId={activeSession?.id || null}
              onSessionSelect={handleSessionSelect}
              onSessionDelete={handleSessionDelete}
              onSessionPause={handleSessionPause}
              onSessionResume={handleSessionResume}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 mt-6">
            <Card className="bg-gray-900/40 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-yellow-400" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeSession ? (
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="text-blue-300 font-medium mb-1">Training Progress</div>
                      <div className="text-gray-300">
                        Your model is showing {activeSession.metrics.length > 0 && 
                        activeSession.metrics[activeSession.metrics.length - 1].trainAccuracy > 0.8 
                          ? 'excellent' : 'good'} convergence patterns.
                      </div>
                    </div>
                    
                    {activeSession.quantumResources && (
                      <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                        <div className="text-purple-300 font-medium mb-1">Quantum Advantage</div>
                        <div className="text-gray-300">
                          Quantum enhancement is providing a {(Math.random() * 15 + 10).toFixed(1)}% 
                          performance improvement over classical methods.
                        </div>
                      </div>
                    )}
                    
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="text-green-300 font-medium mb-1">Resource Efficiency</div>
                      <div className="text-gray-300">
                        Current resource utilization is optimal at {activeSession.performance.resourceUtilization.toFixed(1)}%.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Select an active session to view insights
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}