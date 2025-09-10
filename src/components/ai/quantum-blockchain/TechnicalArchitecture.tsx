import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Database, 
  Network, 
  Shield, 
  Cpu, 
  Code,
  Layers,
  GitBranch,
  Zap,
  Lock,
  Activity
} from 'lucide-react';

interface TechStack {
  category: string;
  technologies: {
    name: string;
    version: string;
    status: 'deployed' | 'testing' | 'development' | 'planned';
    quantumEnhanced: boolean;
    performance: number;
  }[];
}

export function TechnicalArchitecture() {
  const [selectedLayer, setSelectedLayer] = useState<string>('frontend');

  const techStack: TechStack[] = [
    {
      category: 'Frontend Layer',
      technologies: [
        { name: 'React 18', version: '18.3.1', status: 'deployed', quantumEnhanced: false, performance: 95 },
        { name: 'TypeScript', version: '5.2.0', status: 'deployed', quantumEnhanced: false, performance: 98 },
        { name: 'Tailwind CSS', version: '3.4.0', status: 'deployed', quantumEnhanced: false, performance: 92 },
        { name: 'MetaMask Integration', version: '11.0', status: 'deployed', quantumEnhanced: true, performance: 88 },
        { name: 'Quantum UI Components', version: '1.0', status: 'testing', quantumEnhanced: true, performance: 75 }
      ]
    },
    {
      category: 'Backend Infrastructure',
      technologies: [
        { name: 'Node.js', version: '20.0', status: 'deployed', quantumEnhanced: false, performance: 94 },
        { name: 'Express.js', version: '4.18', status: 'deployed', quantumEnhanced: false, performance: 91 },
        { name: 'Web3.js', version: '4.0', status: 'deployed', quantumEnhanced: true, performance: 87 },
        { name: 'Socket.io', version: '4.7', status: 'deployed', quantumEnhanced: false, performance: 89 },
        { name: 'Quantum API Gateway', version: '2.1', status: 'development', quantumEnhanced: true, performance: 65 }
      ]
    },
    {
      category: 'Blockchain Layer',
      technologies: [
        { name: 'Ethereum Mainnet', version: 'Ethereum 2.0', status: 'deployed', quantumEnhanced: false, performance: 85 },
        { name: 'Solidity Contracts', version: '0.8.24', status: 'deployed', quantumEnhanced: true, performance: 92 },
        { name: 'Chainlink Oracles', version: '2.5', status: 'deployed', quantumEnhanced: false, performance: 88 },
        { name: 'Quantum-Resistant Crypto', version: '1.0', status: 'testing', quantumEnhanced: true, performance: 78 },
        { name: 'Post-Quantum Algorithms', version: '0.5', status: 'development', quantumEnhanced: true, performance: 45 }
      ]
    },
    {
      category: 'AI & Quantum Computing',
      technologies: [
        { name: 'TensorFlow Quantum', version: '0.7.3', status: 'deployed', quantumEnhanced: true, performance: 82 },
        { name: 'Qiskit Runtime', version: '0.9', status: 'testing', quantumEnhanced: true, performance: 71 },
        { name: '150-Qubit Simulator', version: '1.0', status: 'development', quantumEnhanced: true, performance: 58 },
        { name: 'Quantum ML Kernels', version: '2.0', status: 'testing', quantumEnhanced: true, performance: 74 },
        { name: 'Variational Quantum Eigensolver', version: '1.2', status: 'deployed', quantumEnhanced: true, performance: 79 }
      ]
    },
    {
      category: 'Autonomous Systems',
      technologies: [
        { name: 'N8N Workflow Engine', version: '1.5', status: 'deployed', quantumEnhanced: false, performance: 86 },
        { name: 'Agent Decision Trees', version: '3.1', status: 'deployed', quantumEnhanced: true, performance: 83 },
        { name: 'Quantum Reinforcement Learning', version: '1.0', status: 'testing', quantumEnhanced: true, performance: 69 },
        { name: 'Autonomous Smart Contracts', version: '2.0', status: 'development', quantumEnhanced: true, performance: 52 },
        { name: 'Genetic Algorithm Optimizer', version: '1.3', status: 'deployed', quantumEnhanced: false, performance: 88 }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-900/40 text-green-300 border-green-500/30';
      case 'testing': return 'bg-yellow-900/40 text-yellow-300 border-yellow-500/30';
      case 'development': return 'bg-blue-900/40 text-blue-300 border-blue-500/30';
      case 'planned': return 'bg-gray-900/40 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-900/40 text-gray-300 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Frontend')) return <Code className="h-5 w-5 text-blue-400" />;
    if (category.includes('Backend')) return <Server className="h-5 w-5 text-green-400" />;
    if (category.includes('Blockchain')) return <Network className="h-5 w-5 text-purple-400" />;
    if (category.includes('AI')) return <Cpu className="h-5 w-5 text-yellow-400" />;
    if (category.includes('Autonomous')) return <Activity className="h-5 w-5 text-red-400" />;
    return <Layers className="h-5 w-5 text-gray-400" />;
  };

  const algorithms = [
    { name: 'Grover\'s Search Algorithm', complexity: 'O(√N)', reduction: '8x faster', quantumAdvantage: 87 },
    { name: 'Quantum Feature Mapping', complexity: 'O(log N)', reduction: '99.11% accuracy', quantumAdvantage: 94 },
    { name: 'Dynamic Programming QKD', complexity: 'O(N log N)', reduction: '40% gas reduction', quantumAdvantage: 76 },
    { name: 'Variational Quantum Eigensolver', complexity: 'O(N²)', reduction: 'Pattern optimization', quantumAdvantage: 82 },
    { name: 'Genetic Algorithm Evolution', complexity: 'O(N * G)', reduction: 'Agent strategy optimization', quantumAdvantage: 68 }
  ];

  return (
    <Card className="bg-black/70 border-gray-700/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <GitBranch className="h-5 w-5 text-purple-400" />
          Technical Architecture & Implementation
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedLayer} onValueChange={setSelectedLayer}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="frontend">Technology Stack</TabsTrigger>
            <TabsTrigger value="algorithms">Algorithm Portfolio</TabsTrigger>
            <TabsTrigger value="security">Security Framework</TabsTrigger>
          </TabsList>

          <TabsContent value="frontend" className="space-y-6">
            {/* Technology Stack */}
            <div className="space-y-6">
              {techStack.map((stack, index) => (
                <Card key={index} className="bg-gray-900/40 border-gray-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      {getCategoryIcon(stack.category)}
                      {stack.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stack.technologies.map((tech, techIndex) => (
                        <Card
                          key={techIndex}
                          className={`${
                            tech.quantumEnhanced
                              ? 'bg-purple-900/20 border-purple-500/30'
                              : 'bg-black/40 border-gray-600/50'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-medium text-white">{tech.name}</span>
                              {tech.quantumEnhanced && <Zap className="h-3 w-3 text-purple-400" />}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Version</span>
                                <span className="text-xs text-white">{tech.version}</span>
                              </div>
                              
                              <Badge variant="outline" className={`w-full justify-center ${getStatusColor(tech.status)}`}>
                                {tech.status.toUpperCase()}
                              </Badge>
                              
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-400">Performance</span>
                                  <span className="text-xs text-white">{tech.performance}%</span>
                                </div>
                                <Progress value={tech.performance} className="h-1" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="algorithms" className="space-y-6">
            {/* Algorithm Portfolio */}
            <Card className="bg-gray-900/40 border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Cpu className="h-5 w-5 text-yellow-400" />
                  Advanced Algorithm Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {algorithms.map((algo, index) => (
                    <Card key={index} className="bg-black/40 border-purple-500/30">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-purple-400" />
                            <span className="font-medium text-white">{algo.name}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-gray-400">Complexity:</span>
                              <div className="text-white font-mono">{algo.complexity}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Advantage:</span>
                              <div className="text-green-300">{algo.reduction}</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">Quantum Advantage</span>
                              <span className="text-xs text-white">{algo.quantumAdvantage}%</span>
                            </div>
                            <Progress value={algo.quantumAdvantage} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Framework */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/40 border-red-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-red-400" />
                    Quantum Security Layers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">150-Qubit QKD</span>
                      <Badge className="bg-green-900/40 text-green-300">Active</Badge>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Post-Quantum Cryptography</span>
                      <Badge className="bg-yellow-900/40 text-yellow-300">Testing</Badge>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Quantum Error Correction</span>
                      <Badge className="bg-blue-900/40 text-blue-300">Development</Badge>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Threat Detection AI</span>
                      <Badge className="bg-green-900/40 text-green-300">Active</Badge>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/40 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Lock className="h-5 w-5 text-blue-400" />
                    Blockchain Security Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">99.97%</div>
                    <div className="text-xs text-gray-400">Transaction Security</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">256-bit</div>
                    <div className="text-xs text-gray-400">Quantum Encryption</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">8.2s</div>
                    <div className="text-xs text-gray-400">Avg. Attack Detection</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">0.003%</div>
                    <div className="text-xs text-gray-400">False Positive Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}