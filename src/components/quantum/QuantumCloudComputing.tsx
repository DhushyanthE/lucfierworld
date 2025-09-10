
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cloud, Server, Cpu, Activity, RefreshCw, Database, Network } from 'lucide-react';

interface CloudNode {
  id: string;
  type: 'quantum' | 'classical' | 'hybrid';
  status: 'active' | 'idle' | 'maintenance';
  load: number;
  qubits?: number;
  processes: number;
  region: string;
}

export function QuantumCloudComputing() {
  const [activeTab, setActiveTab] = useState('overview');
  const [nodes, setNodes] = useState<CloudNode[]>([]);
  const [totalQubits, setTotalQubits] = useState(0);
  const [utilizationRate, setUtilizationRate] = useState(0);
  const [processingJobs, setProcessingJobs] = useState(0);
  const [uptime, setUptime] = useState(0);
  
  // Generate cloud node data
  useEffect(() => {
    const regions = ['US-East', 'Europe', 'Asia-Pacific', 'US-West'];
    const generateNodes = () => {
      const newNodes: CloudNode[] = [];
      // Generate quantum nodes
      for (let i = 0; i < 8; i++) {
        newNodes.push({
          id: `quantum-${i.toString().padStart(3, '0')}`,
          type: 'quantum',
          status: Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'idle' : 'maintenance',
          load: Math.floor(Math.random() * 100),
          qubits: Math.floor(Math.random() * 128) + 64,
          processes: Math.floor(Math.random() * 50) + 10,
          region: regions[Math.floor(Math.random() * regions.length)]
        });
      }
      
      // Generate classical nodes
      for (let i = 0; i < 6; i++) {
        newNodes.push({
          id: `classical-${i.toString().padStart(3, '0')}`,
          type: 'classical',
          status: Math.random() > 0.05 ? 'active' : Math.random() > 0.7 ? 'idle' : 'maintenance',
          load: Math.floor(Math.random() * 100),
          processes: Math.floor(Math.random() * 200) + 50,
          region: regions[Math.floor(Math.random() * regions.length)]
        });
      }
      
      // Generate hybrid nodes
      for (let i = 0; i < 4; i++) {
        newNodes.push({
          id: `hybrid-${i.toString().padStart(3, '0')}`,
          type: 'hybrid',
          status: Math.random() > 0.15 ? 'active' : Math.random() > 0.6 ? 'idle' : 'maintenance',
          load: Math.floor(Math.random() * 100),
          qubits: Math.floor(Math.random() * 32) + 32,
          processes: Math.floor(Math.random() * 100) + 30,
          region: regions[Math.floor(Math.random() * regions.length)]
        });
      }
      
      return newNodes;
    };
    
    const newNodes = generateNodes();
    setNodes(newNodes);
    
    // Calculate metrics
    const totalQ = newNodes.reduce((sum, node) => sum + (node.qubits || 0), 0);
    setTotalQubits(totalQ);
    
    const activeNodes = newNodes.filter(n => n.status === 'active');
    setUtilizationRate(activeNodes.length / newNodes.length * 100);
    
    const totalProc = newNodes.reduce((sum, node) => sum + node.processes, 0);
    setProcessingJobs(totalProc);
    
    setUptime(99.985);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        load: Math.min(100, Math.max(0, node.load + (Math.random() * 20 - 10))),
        processes: Math.max(0, node.processes + Math.floor(Math.random() * 10) - 4),
        status: Math.random() > 0.98 
          ? (node.status === 'active' ? 'idle' : node.status === 'idle' ? 'active' : 'maintenance')
          : node.status
      })));
      
      setUtilizationRate(prev => Math.min(100, Math.max(70, prev + (Math.random() * 4 - 2))));
      setProcessingJobs(prev => Math.max(0, prev + Math.floor(Math.random() * 50) - 25));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quantum': return 'text-purple-400';
      case 'classical': return 'text-blue-400';
      case 'hybrid': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quantum': return <Cpu className="h-4 w-4" />;
      case 'classical': return <Server className="h-4 w-4" />;
      case 'hybrid': return <RefreshCw className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Cloud className="h-5 w-5 text-purple-400" />
            Quantum Cloud Computing
            <Badge className="ml-2 bg-purple-700 text-purple-200">Enterprise</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="nodes" className="flex items-center gap-1">
              <Server className="h-4 w-4" />
              <span>Nodes</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-black to-purple-950/20 p-3 rounded-lg border border-purple-500/20">
                <div className="text-sm text-gray-300 mb-2 flex items-center">
                  <Cpu className="h-4 w-4 mr-1.5 text-purple-400" />
                  Total Quantum Processing
                </div>
                <div className="text-3xl font-semibold text-white">{totalQubits.toLocaleString()} <span className="text-lg text-purple-400">qubits</span></div>
                <div className="text-xs text-gray-500 mt-1">Across {nodes.filter(n => n.type === 'quantum' || n.type === 'hybrid').length} quantum-enabled nodes</div>
              </div>
              
              <div className="bg-gradient-to-br from-black to-blue-950/20 p-3 rounded-lg border border-blue-500/20">
                <div className="text-sm text-gray-300 mb-2 flex items-center">
                  <Activity className="h-4 w-4 mr-1.5 text-blue-400" />
                  System Status
                </div>
                <div className="flex items-center mb-1">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-lg font-medium text-white">Operational</div>
                </div>
                <div className="text-xs text-gray-400">System Uptime: {uptime}%</div>
                <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${uptime}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div className="text-xs text-gray-400 mb-1">Utilization Rate</div>
                <div className="text-2xl font-semibold text-white">{utilizationRate.toFixed(1)}%</div>
                <Progress value={utilizationRate} className="h-1 mt-1" />
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div className="text-xs text-gray-400 mb-1">Processing Jobs</div>
                <div className="text-2xl font-semibold text-white">{processingJobs.toLocaleString()}</div>
                <div className="text-xs text-green-400 mt-1">+128 in queue</div>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div className="text-xs text-gray-400 mb-1">Node Types</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge className="bg-purple-900/60 text-purple-300 text-xs">
                    {nodes.filter(n => n.type === 'quantum').length} Quantum
                  </Badge>
                  <Badge className="bg-blue-900/60 text-blue-300 text-xs">
                    {nodes.filter(n => n.type === 'classical').length} Classical
                  </Badge>
                  <Badge className="bg-green-900/60 text-green-300 text-xs">
                    {nodes.filter(n => n.type === 'hybrid').length} Hybrid
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <div className="text-sm text-gray-300 mb-3">Regional Distribution</div>
              <div className="grid grid-cols-4 gap-3">
                {Array.from(new Set(nodes.map(n => n.region))).map((region) => (
                  <div key={region} className="bg-black/40 p-2 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">{region}</div>
                    <div className="text-lg font-medium text-white">
                      {nodes.filter(n => n.region === region).length}
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      {nodes.filter(n => n.region === region && n.status === 'active').length} active
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="nodes" className="space-y-4">
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-900/70 p-2 text-xs text-gray-400 grid grid-cols-7 gap-2">
                <div>Node ID</div>
                <div>Type</div>
                <div>Region</div>
                <div>Status</div>
                <div>Load</div>
                <div>Qubits</div>
                <div>Processes</div>
              </div>
              <div className="text-xs max-h-64 overflow-y-auto">
                {nodes.map((node, i) => (
                  <div 
                    key={node.id}
                    className={`grid grid-cols-7 gap-2 p-2 text-gray-300 ${i % 2 === 0 ? 'bg-black/20' : 'bg-black/40'}`}
                  >
                    <div className="font-mono">{node.id}</div>
                    <div className={`flex items-center ${getTypeColor(node.type)}`}>
                      {getTypeIcon(node.type)}
                      <span className="ml-1">{node.type.charAt(0).toUpperCase() + node.type.slice(1)}</span>
                    </div>
                    <div>{node.region}</div>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(node.status)} mr-1.5`}></div>
                      {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="h-1.5 bg-gray-700 rounded-full w-16 mr-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              node.load > 80 ? 'bg-red-500' : 
                              node.load > 50 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${node.load}%` }}
                          ></div>
                        </div>
                        <span>{node.load}%</span>
                      </div>
                    </div>
                    <div>{node.qubits || '-'}</div>
                    <div>{node.processes}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
              <div className="text-xs text-white flex items-center mb-2">
                <Network className="h-3 w-3 mr-1 text-purple-400" />
                NODE INTERCONNECTION NETWORK
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Bandwidth</div>
                  <div className="text-sm text-white">1.2 TB/s</div>
                  <div className="text-xs text-gray-500">Quantum entangled</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Latency</div>
                  <div className="text-sm text-white">0.8 ms</div>
                  <div className="text-xs text-green-400">-75% vs classical</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Topology</div>
                  <div className="text-sm text-white">Quantum Mesh</div>
                  <div className="text-xs text-purple-400">Entangled links</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-300 mb-3 flex items-center">
                  <Cpu className="h-4 w-4 mr-1.5 text-purple-400" />
                  Quantum Resources
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Quantum Processing Units</span>
                      <span className="text-white">18/24</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{width: "75%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Qubit Availability</span>
                      <span className="text-white">1,024/1,536</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{width: "66.7%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Quantum Memory</span>
                      <span className="text-white">128 TB/192 TB</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{width: "66.7%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Entanglement Channels</span>
                      <span className="text-white">64/96</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{width: "66.7%"}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-300 mb-3 flex items-center">
                  <Server className="h-4 w-4 mr-1.5 text-blue-400" />
                  Classical Resources
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">CPU Cores</span>
                      <span className="text-white">8,192/12,288</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{width: "66.7%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">GPU Units</span>
                      <span className="text-white">1,024/1,536</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{width: "66.7%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Memory</span>
                      <span className="text-white">128 TB/192 TB</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{width: "66.7%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Storage</span>
                      <span className="text-white">8 PB/16 PB</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{width: "50%"}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <div className="text-sm text-gray-300 mb-3">Resource Allocations by Service</div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-purple-500 rounded-sm mr-2"></div>
                    <span className="text-xs text-gray-300">Quantum AI</span>
                  </div>
                  <span className="text-xs text-gray-400">42%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-sm mr-2"></div>
                    <span className="text-xs text-gray-300">Quantum Cryptography</span>
                  </div>
                  <span className="text-xs text-gray-400">28%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-sm mr-2"></div>
                    <span className="text-xs text-gray-300">Quantum Simulation</span>
                  </div>
                  <span className="text-xs text-gray-400">18%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-yellow-500 rounded-sm mr-2"></div>
                    <span className="text-xs text-gray-300">Quantum Optimization</span>
                  </div>
                  <span className="text-xs text-gray-400">8%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-red-500 rounded-sm mr-2"></div>
                    <span className="text-xs text-gray-300">Other Services</span>
                  </div>
                  <span className="text-xs text-gray-400">4%</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
