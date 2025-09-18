import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Cpu, 
  Activity, 
  TrendingUp, 
  Lightbulb, 
  Target,
  Zap,
  BarChart3,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { 
  enhancedAGIWorkflowService, 
  AGIWorkflowState, 
  AGIWorkflowTask 
} from '@/services/agi/EnhancedAGIWorkflowService';

export function EnhancedAGIDashboard() {
  const [workflowState, setWorkflowState] = useState<AGIWorkflowState | null>(null);
  const [activeWorkflows, setActiveWorkflows] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = enhancedAGIWorkflowService.subscribe(setWorkflowState);
    
    // Initialize with current state
    setWorkflowState(enhancedAGIWorkflowService.getWorkflowState());
    
    return unsubscribe;
  }, []);

  const handleStartReasoning = async () => {
    const workflowId = await enhancedAGIWorkflowService.startReasoningWorkflow(
      "Analyze complex quantum-AI integration patterns for optimization"
    );
    setActiveWorkflows(prev => [...prev, workflowId]);
  };

  const handleOptimizeLearning = async () => {
    await enhancedAGIWorkflowService.optimizeLearning('quantum_computing', {
      algorithms: ['quantum_annealing', 'variational_quantum_eigensolver'],
      optimization_target: 'coherence_time'
    });
  };

  const handlePredictiveAnalysis = async () => {
    await enhancedAGIWorkflowService.performPrediction({
      domain: 'quantum_ai_convergence',
      variables: ['entanglement_fidelity', 'decoherence_rate', 'computational_advantage']
    }, 10);
  };

  if (!workflowState) {
    return (
      <Card className="bg-black/70 border-purple-500/20">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-6 w-6 text-purple-400" />
            Enhanced AGI Dashboard
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={workflowState.isActive ? "default" : "secondary"}>
              {workflowState.isActive ? "Active" : "Idle"}
            </Badge>
            <Badge variant="outline" className="text-purple-300 border-purple-400">
              {workflowState.totalTasks} Tasks
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-purple-900/20 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Tasks</p>
                      <p className="text-2xl font-bold text-white">{workflowState.totalTasks}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-900/20 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-white">{workflowState.completedTasks}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Avg Time</p>
                      <p className="text-2xl font-bold text-white">
                        {Math.round(workflowState.averageProcessingTime / 1000)}s
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Global Metrics */}
            <Card className="bg-black/40 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  Global AGI Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(workflowState.globalMetrics).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-white">{Math.round(value * 100)}%</span>
                    </div>
                    <Progress value={value * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            {/* Workflow Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={handleStartReasoning}
                className="bg-purple-600 hover:bg-purple-700 h-auto p-4 flex flex-col items-center gap-2"
              >
                <Brain className="h-6 w-6" />
                <span>Advanced Reasoning</span>
                <span className="text-xs opacity-75">Causal Analysis</span>
              </Button>

              <Button 
                onClick={handleOptimizeLearning}
                className="bg-blue-600 hover:bg-blue-700 h-auto p-4 flex flex-col items-center gap-2"
              >
                <Lightbulb className="h-6 w-6" />
                <span>Learning Optimization</span>
                <span className="text-xs opacity-75">Meta-Learning</span>
              </Button>

              <Button 
                onClick={handlePredictiveAnalysis}
                className="bg-green-600 hover:bg-green-700 h-auto p-4 flex flex-col items-center gap-2"
              >
                <TrendingUp className="h-6 w-6" />
                <span>Predictive Analysis</span>
                <span className="text-xs opacity-75">Multi-Modal</span>
              </Button>
            </div>

            {/* Active Workflows Status */}
            {activeWorkflows.length > 0 && (
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Active Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeWorkflows.map((id, index) => (
                      <div key={id} className="flex items-center justify-between p-2 bg-purple-900/20 rounded">
                        <span className="text-gray-300">Workflow {index + 1}</span>
                        <Badge variant="default">Processing</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {/* Detailed Metrics Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Cognitive Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Reasoning Accuracy</span>
                      <span className="text-white">
                        {Math.round(workflowState.globalMetrics.reasoningAccuracy * 100)}%
                      </span>
                    </div>
                    <Progress value={workflowState.globalMetrics.reasoningAccuracy * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Learning Rate</span>
                      <span className="text-white">
                        {Math.round(workflowState.globalMetrics.learningRate * 100)}%
                      </span>
                    </div>
                    <Progress value={workflowState.globalMetrics.learningRate * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Innovation Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Synthesis Quality</span>
                      <span className="text-white">
                        {Math.round(workflowState.globalMetrics.synthesisQuality * 100)}%
                      </span>
                    </div>
                    <Progress value={workflowState.globalMetrics.synthesisQuality * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Innovation Index</span>
                      <span className="text-white">
                        {Math.round(workflowState.globalMetrics.innovationIndex * 100)}%
                      </span>
                    </div>
                    <Progress value={workflowState.globalMetrics.innovationIndex * 100} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card className="bg-black/40 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflowState.recentTasks.slice(0, 5).map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                  {workflowState.recentTasks.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No tasks yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TaskItem({ task }: { task: AGIWorkflowTask }) {
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'reasoning': return <Brain className="h-4 w-4" />;
      case 'learning': return <Lightbulb className="h-4 w-4" />;
      case 'synthesis': return <Zap className="h-4 w-4" />;
      case 'optimization': return <Settings className="h-4 w-4" />;
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'failed': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-purple-900/10 rounded border border-purple-500/20">
      <div className="flex items-center gap-3">
        <div className="text-purple-400">
          {getTaskIcon(task.type)}
        </div>
        <div>
          <p className="text-white text-sm font-medium capitalize">{task.type}</p>
          <p className="text-gray-400 text-xs">
            {new Date(task.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
          {task.status}
        </Badge>
        <Badge variant="outline" className="text-xs text-purple-300 border-purple-400">
          {task.priority}
        </Badge>
      </div>
    </div>
  );
}