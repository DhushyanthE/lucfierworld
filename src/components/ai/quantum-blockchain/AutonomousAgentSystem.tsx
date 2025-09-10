import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Cpu, 
  Network, 
  Zap, 
  Activity,
  Settings,
  TrendingUp,
  Shield,
  Eye,
  Target
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: 'executor' | 'optimizer' | 'validator' | 'monitor' | 'security';
  status: 'idle' | 'active' | 'processing' | 'optimizing';
  efficiency: number;
  tasksCompleted: number;
  quantumEnhanced: boolean;
  autonomyLevel: number;
}

interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  systemEfficiency: number;
  autonomyScore: number;
  decisionAccuracy: number;
  resourceOptimization: number;
}

export function AutonomousAgentSystem() {
  const [isActive, setIsActive] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([
    { id: '1', name: 'Transaction Executor', type: 'executor', status: 'idle', efficiency: 0, tasksCompleted: 0, quantumEnhanced: true, autonomyLevel: 0 },
    { id: '2', name: 'Gas Optimizer', type: 'optimizer', status: 'idle', efficiency: 0, tasksCompleted: 0, quantumEnhanced: true, autonomyLevel: 0 },
    { id: '3', name: 'Security Validator', type: 'validator', status: 'idle', efficiency: 0, tasksCompleted: 0, quantumEnhanced: true, autonomyLevel: 0 },
    { id: '4', name: 'Network Monitor', type: 'monitor', status: 'idle', efficiency: 0, tasksCompleted: 0, quantumEnhanced: false, autonomyLevel: 0 },
    { id: '5', name: 'Threat Detector', type: 'security', status: 'idle', efficiency: 0, tasksCompleted: 0, quantumEnhanced: true, autonomyLevel: 0 },
    { id: '6', name: 'Performance Optimizer', type: 'optimizer', status: 'idle', efficiency: 0, tasksCompleted: 0, quantumEnhanced: true, autonomyLevel: 0 },
    { id: '7', name: 'Smart Contract Executor', type: 'executor', status: 'idle', efficiency: 0, tasksCompleted: 0, quantumEnhanced: false, autonomyLevel: 0 },
    { id: '8', name: 'Liquidity Monitor', type: 'monitor', status: 'idle', efficiency: 0, tasksCompleted: 0, quantumEnhanced: false, autonomyLevel: 0 }
  ]);

  const [metrics, setMetrics] = useState<AgentMetrics>({
    totalAgents: 8,
    activeAgents: 0,
    systemEfficiency: 0,
    autonomyScore: 0,
    decisionAccuracy: 0,
    resourceOptimization: 0
  });

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setAgents(prev => 
        prev.map(agent => {
          const statusChange = Math.random() < 0.3;
          const statuses: Agent['status'][] = ['active', 'processing', 'optimizing'];
          const newStatus = statusChange ? statuses[Math.floor(Math.random() * statuses.length)] : agent.status;
          
          return {
            ...agent,
            status: newStatus,
            efficiency: Math.min(100, agent.efficiency + Math.random() * (agent.quantumEnhanced ? 3 : 2)),
            tasksCompleted: newStatus === 'processing' ? agent.tasksCompleted + 1 : agent.tasksCompleted,
            autonomyLevel: Math.min(100, agent.autonomyLevel + Math.random() * 1.5)
          };
        })
      );

      setMetrics(prev => ({
        totalAgents: 8,
        activeAgents: Math.floor(Math.random() * 6) + 3,
        systemEfficiency: Math.min(100, prev.systemEfficiency + Math.random() * 2),
        autonomyScore: Math.min(100, prev.autonomyScore + Math.random() * 1.8),
        decisionAccuracy: Math.min(100, prev.decisionAccuracy + Math.random() * 1.2),
        resourceOptimization: Math.min(100, prev.resourceOptimization + Math.random() * 2.2)
      }));
    }, 200);

    return () => clearInterval(interval);
  }, [isActive]);

  const getAgentIcon = (type: Agent['type']) => {
    switch (type) {
      case 'executor': return <Zap className="h-4 w-4" />;
      case 'optimizer': return <TrendingUp className="h-4 w-4" />;
      case 'validator': return <Shield className="h-4 w-4" />;
      case 'monitor': return <Eye className="h-4 w-4" />;
      case 'security': return <Target className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getAgentColor = (type: Agent['type']) => {
    switch (type) {
      case 'executor': return 'text-yellow-400';
      case 'optimizer': return 'text-green-400';
      case 'validator': return 'text-blue-400';
      case 'monitor': return 'text-purple-400';
      case 'security': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-900/40 text-green-300 border-green-500/30';
      case 'processing': return 'bg-blue-900/40 text-blue-300 border-blue-500/30';
      case 'optimizing': return 'bg-purple-900/40 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-900/40 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-black/70 border-green-500/20 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Bot className="h-5 w-5 text-green-400" />
            N8N Autonomous Agent System
            <Badge variant="outline" className="ml-2 bg-green-900/40 text-green-300 border-green-500/30">
              {isActive ? `${metrics.activeAgents} Active` : 'Standby'}
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setIsActive(!isActive)}
            className={`${
              isActive 
                ? 'bg-red-900/30 border-red-500 text-red-300 hover:bg-red-900/50' 
                : 'bg-green-900/30 border-green-500 text-green-300 hover:bg-green-900/50'
            }`}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isActive ? 'Deactivate System' : 'Activate System'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/40 border-gray-700/50">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{metrics.systemEfficiency.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">System Efficiency</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/40 border-gray-700/50">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{metrics.autonomyScore.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Autonomy Score</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/40 border-gray-700/50">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{metrics.decisionAccuracy.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Decision Accuracy</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/40 border-gray-700/50">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{metrics.resourceOptimization.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Resource Optimization</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Autonomous Agent Fleet</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className={`${
                  agent.quantumEnhanced
                    ? 'bg-purple-900/20 border-purple-500/30'
                    : 'bg-gray-900/40 border-gray-700/50'
                } transition-all duration-200`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={getAgentColor(agent.type)}>
                      {getAgentIcon(agent.type)}
                    </div>
                    <span className="text-sm font-medium text-white truncate">{agent.name}</span>
                    {agent.quantumEnhanced && <Zap className="h-3 w-3 text-purple-400" />}
                  </div>
                  
                  <div className="space-y-3">
                    <Badge variant="outline" className={`w-full justify-center ${getStatusColor(agent.status)}`}>
                      {agent.status.toUpperCase()}
                    </Badge>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Efficiency</span>
                        <span className="text-xs text-white">{agent.efficiency.toFixed(1)}%</span>
                      </div>
                      <Progress value={agent.efficiency} className="h-1" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Autonomy</span>
                        <span className="text-xs text-white">{agent.autonomyLevel.toFixed(1)}%</span>
                      </div>
                      <Progress value={agent.autonomyLevel} className="h-1" />
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Tasks: {agent.tasksCompleted}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quantum Reinforcement Learning */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Cpu className="h-5 w-5 text-purple-400" />
              Quantum Reinforcement Learning Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Learning Rate</span>
                  <span className="text-sm font-medium text-white">0.003</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Exploration Factor</span>
                  <span className="text-sm font-medium text-white">15.7%</span>
                </div>
                <Progress value={15.7} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Reward Optimization</span>
                  <span className="text-sm font-medium text-white">{metrics.resourceOptimization.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.resourceOptimization} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="pt-4 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
            <div>
              <span className="text-gray-300">Total Agents:</span> {metrics.totalAgents}
            </div>
            <div>
              <span className="text-gray-300">Quantum Enhanced:</span> {agents.filter(a => a.quantumEnhanced).length}
            </div>
            <div>
              <span className="text-gray-300">Tasks Completed:</span> {agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0)}
            </div>
            <div>
              <span className="text-gray-300">System Status:</span> {isActive ? 'Operational' : 'Standby'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}