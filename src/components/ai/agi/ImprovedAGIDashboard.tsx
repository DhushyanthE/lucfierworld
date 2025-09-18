import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Pause,
  Square,
  RefreshCw,
  Clock,
  Users,
  Database,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Workflow,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { useAGIWorkflow } from '@/hooks/useAGIWorkflow';
import { AGIWorkflowTask } from '@/services/agi/ImprovedAGIWorkflowService';

export function ImprovedAGIDashboard() {
  const {
    workflowState,
    isLoading,
    submitTask,
    executeWorkflowPattern,
    startAdvancedReasoning,
    optimizeMultiModalLearning,
    performCreativeSynthesis,
    performAdvancedPrediction,
    pauseWorkflow,
    resumeWorkflow,
    cancelTask,
    getTaskAnalytics,
    refreshWorkflow
  } = useAGIWorkflow();

  const [activeWorkflows, setActiveWorkflows] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [customInput, setCustomInput] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState<AGIWorkflowTask['type']>('reasoning');
  const [selectedPriority, setSelectedPriority] = useState<AGIWorkflowTask['priority']>('medium');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (workflowState) {
      const newAnalytics = getTaskAnalytics();
      setAnalytics(newAnalytics);
    }
  }, [workflowState, getTaskAnalytics]);

  const handleStartAdvancedReasoning = async () => {
    const workflowIds = await startAdvancedReasoning(
      "Analyze quantum-AI integration patterns for optimization with advanced multi-step verification",
      'complex'
    );
    setActiveWorkflows(prev => [...prev, ...workflowIds]);
  };

  const handleOptimizeMultiModalLearning = async () => {
    const workflowId = await optimizeMultiModalLearning(
      ['quantum_computing', 'neural_networks', 'natural_language_processing'], 
      {
        algorithms: ['quantum_annealing', 'variational_quantum_eigensolver', 'transformer_attention'],
        optimization_target: 'cross_modal_coherence',
        data_sources: ['scientific_papers', 'experimental_results', 'simulation_data']
      },
      true
    );
    setActiveWorkflows(prev => [...prev, workflowId]);
  };

  const handleCreativeSynthesis = async () => {
    const workflowId = await performCreativeSynthesis([
      { type: 'research_findings', domain: 'quantum_ai' },
      { type: 'experimental_data', domain: 'machine_learning' },
      { type: 'theoretical_models', domain: 'cognitive_science' }
    ], 0.85);
    setActiveWorkflows(prev => [...prev, workflowId]);
  };

  const handlePredictiveAnalysis = async () => {
    const workflowId = await performAdvancedPrediction({
      domain: 'quantum_ai_convergence',
      variables: ['entanglement_fidelity', 'decoherence_rate', 'computational_advantage', 'learning_efficiency'],
      context: 'breakthrough_technology_forecasting'
    }, 15, 0.98);
    setActiveWorkflows(prev => [...prev, workflowId]);
  };

  const handleCustomTaskSubmit = async () => {
    if (!customInput.trim()) return;
    
    const workflowId = await submitTask(selectedTaskType, {
      prompt: customInput,
      priority: selectedPriority,
      advanced_processing: true
    }, {
      priority: selectedPriority,
      estimatedDuration: 3000
    });
    setActiveWorkflows(prev => [...prev, workflowId]);
    setCustomInput('');
  };

  const handleExecutePattern = async (patternId: string) => {
    const context = {
      domain: 'advanced_agi',
      complexity: 'high',
      requirements: ['real_time_processing', 'high_accuracy', 'multi_modal_output']
    };
    const workflowIds = await executeWorkflowPattern(patternId, context);
    setActiveWorkflows(prev => [...prev, ...workflowIds]);
  };

  const getFilteredTasks = () => {
    if (!workflowState) return [];
    
    let tasks = workflowState.recentTasks;
    
    if (filterStatus !== 'all') {
      tasks = tasks.filter(task => task.status === filterStatus);
    }
    
    if (searchTerm) {
      tasks = tasks.filter(task => 
        task.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return tasks;
  };

  if (isLoading || !workflowState) {
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
            Improved AGI Dashboard
            <Badge variant="outline" className="text-purple-300 border-purple-400 ml-2">
              v2.0
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={refreshWorkflow}
              variant="outline"
              size="sm"
              className="border-purple-500/30"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {workflowState.isActive ? (
              <Button
                onClick={pauseWorkflow}
                variant="outline"
                size="sm"
                className="border-yellow-500/30 text-yellow-300"
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={resumeWorkflow}
                variant="outline"
                size="sm"
                className="border-green-500/30 text-green-300"
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
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
          <TabsList className="grid w-full grid-cols-5 bg-black/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced System Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Tasks"
                value={workflowState.totalTasks}
                icon={<Activity className="h-6 w-6 text-purple-400" />}
                trend={workflowState.totalTasks > 0 ? 'up' : 'stable'}
              />
              <MetricCard
                title="Success Rate"
                value={`${workflowState.successRate.toFixed(1)}%`}
                icon={<Target className="h-6 w-6 text-green-400" />}
                trend={workflowState.successRate > 80 ? 'up' : 'down'}
              />
              <MetricCard
                title="Throughput"
                value={`${workflowState.throughputPerMinute.toFixed(1)}/min`}
                icon={<TrendingUp className="h-6 w-6 text-blue-400" />}
                trend="up"
              />
              <MetricCard
                title="System Load"
                value={`${(workflowState.systemLoad * 100).toFixed(0)}%`}
                icon={<Cpu className="h-6 w-6 text-orange-400" />}
                trend={workflowState.systemLoad < 0.7 ? 'stable' : 'up'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Real-time Status */}
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-400" />
                    Real-time Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatusItem
                    label="Processing Tasks"
                    value={workflowState.processingTasks}
                    color="blue"
                  />
                  <StatusItem
                    label="Queued Tasks"
                    value={workflowState.queuedTasks}
                    color="yellow"
                  />
                  <StatusItem
                    label="Active Workers"
                    value={workflowState.activeWorkers}
                    color="green"
                  />
                  <StatusItem
                    label="Queue Depth"
                    value={workflowState.queueDepth}
                    color="purple"
                  />
                  <StatusItem
                    label="Memory Usage"
                    value={`${(workflowState.memoryUsage * 100).toFixed(0)}%`}
                    color="orange"
                  />
                </CardContent>
              </Card>

              {/* Enhanced Global Metrics */}
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    Enhanced AGI Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(workflowState.globalMetrics).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-white">{Math.round(value * 100)}%</span>
                      </div>
                      <Progress 
                        value={value * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            {/* Enhanced Workflow Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <WorkflowButton
                onClick={handleStartAdvancedReasoning}
                icon={<Brain className="h-6 w-6" />}
                title="Advanced Reasoning"
                description="Multi-step causal analysis"
                color="purple"
              />
              <WorkflowButton
                onClick={handleOptimizeMultiModalLearning}
                icon={<Lightbulb className="h-6 w-6" />}
                title="Multi-Modal Learning"
                description="Cross-domain optimization"
                color="blue"
              />
              <WorkflowButton
                onClick={handleCreativeSynthesis}
                icon={<Sparkles className="h-6 w-6" />}
                title="Creative Synthesis"
                description="Novel insight generation"
                color="pink"
              />
              <WorkflowButton
                onClick={handlePredictiveAnalysis}
                icon={<TrendingUp className="h-6 w-6" />}
                title="Predictive Analysis"
                description="Advanced forecasting"
                color="green"
              />
            </div>

            {/* Workflow Pattern Execution */}
            <Card className="bg-black/40 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-purple-400" />
                  Workflow Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleExecutePattern('reasoning_simple')}
                    variant="outline"
                    className="h-auto p-4 text-left border-purple-500/30"
                  >
                    <div>
                      <p className="font-medium text-white">Simple Reasoning</p>
                      <p className="text-xs text-gray-400">Quick analysis pattern</p>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleExecutePattern('reasoning_complex')}
                    variant="outline"
                    className="h-auto p-4 text-left border-purple-500/30"
                  >
                    <div>
                      <p className="font-medium text-white">Complex Reasoning</p>
                      <p className="text-xs text-gray-400">Multi-step validation</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Workflows Status */}
            {activeWorkflows.length > 0 && (
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Active Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeWorkflows.slice(-5).map((id, index) => (
                      <div key={id} className="flex items-center justify-between p-3 bg-purple-900/20 rounded border border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <div className="animate-pulse h-2 w-2 bg-purple-400 rounded-full"></div>
                          <span className="text-gray-300">Workflow {activeWorkflows.length - index}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="default" className="text-xs">Processing</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelTask(id)}
                            className="h-6 w-6 p-0 border-red-500/30 text-red-300"
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-black/40 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Task Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analytics.tasksByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">{type}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Processing Time</span>
                      <span className="text-white">{Math.round(analytics.averageProcessingTime)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Failure Rate</span>
                      <span className="text-white">{(analytics.failureRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Retry Rate</span>
                      <span className="text-white">{analytics.retryRate.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            {/* Task Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 bg-black/50 border-purple-500/30"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 bg-black/50 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Enhanced Task List */}
            <Card className="bg-black/40 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getFilteredTasks().slice(0, 10).map((task) => (
                    <EnhancedTaskItem 
                      key={task.id} 
                      task={task} 
                      onCancel={() => cancelTask(task.id)}
                    />
                  ))}
                  {getFilteredTasks().length === 0 && (
                    <p className="text-gray-400 text-center py-8">No tasks match the current filters</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card className="bg-black/40 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Custom Task Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Task Type</label>
                    <Select value={selectedTaskType} onValueChange={(value: any) => setSelectedTaskType(value)}>
                      <SelectTrigger className="bg-black/50 border-purple-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reasoning">Reasoning</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="synthesis">Synthesis</SelectItem>
                        <SelectItem value="optimization">Optimization</SelectItem>
                        <SelectItem value="prediction">Prediction</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="creativity">Creativity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Priority</label>
                    <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                      <SelectTrigger className="bg-black/50 border-purple-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Task Input</label>
                  <Textarea
                    placeholder="Enter your task description or input data..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="bg-black/50 border-purple-500/30 min-h-20"
                  />
                </div>
                <Button
                  onClick={handleCustomTaskSubmit}
                  disabled={!customInput.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Submit Custom Task
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper Components
function MetricCard({ title, value, icon, trend }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
}) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';
  
  return (
    <Card className="bg-purple-900/20 border-purple-500/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
          </div>
          <div className={trendColor}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusItem({ label, value, color }: {
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400'
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-300 text-sm">{label}</span>
      <span className={`font-medium ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </span>
    </div>
  );
}

function WorkflowButton({ onClick, icon, title, description, color }: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    purple: 'bg-purple-600 hover:bg-purple-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    pink: 'bg-pink-600 hover:bg-pink-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <Button
      onClick={onClick}
      className={`${colorClasses[color as keyof typeof colorClasses]} h-auto p-4 flex flex-col items-center gap-2`}
    >
      {icon}
      <span className="font-medium">{title}</span>
      <span className="text-xs opacity-75">{description}</span>
    </Button>
  );
}

function EnhancedTaskItem({ task, onCancel }: { 
  task: AGIWorkflowTask; 
  onCancel: () => void;
}) {
  const getTaskIcon = (type: string) => {
    const icons = {
      reasoning: <Brain className="h-4 w-4" />,
      learning: <Lightbulb className="h-4 w-4" />,
      synthesis: <Zap className="h-4 w-4" />,
      optimization: <Settings className="h-4 w-4" />,
      prediction: <TrendingUp className="h-4 w-4" />,
      research: <Search className="h-4 w-4" />,
      creativity: <Sparkles className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <Cpu className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'processing': return <Timer className="h-4 w-4 text-blue-400 animate-pulse" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'failed': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'critical': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'high': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'low': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-purple-900/10 rounded border border-purple-500/20">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-purple-400">
          {getTaskIcon(task.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-medium capitalize">{task.type}</p>
            {getStatusIcon(task.status)}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>ID: {task.id.slice(-8)}</span>
            <span>•</span>
            <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
            {task.actualDuration && (
              <>
                <span>•</span>
                <span>{Math.round(task.actualDuration / 1000)}s</span>
              </>
            )}
            {task.retryCount > 0 && (
              <>
                <span>•</span>
                <span className="text-yellow-400">Retries: {task.retryCount}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
          {task.status}
        </Badge>
        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </Badge>
        {['pending', 'queued', 'paused'].includes(task.status) && (
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="h-6 w-6 p-0 border-red-500/30 text-red-300"
          >
            <Square className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}