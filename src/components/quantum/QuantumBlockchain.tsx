
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Layers, Network, Shield, Activity, Cpu, Lock } from 'lucide-react';

interface BlockchainNode {
  id: string;
  type: 'validator' | 'storage' | 'compute';
  status: 'active' | 'syncing' | 'offline';
  connections: number;
  lastBlock: number;
  quantumEntanglement: number;
}

interface NetworkStats {
  totalNodes: number;
  activeValidators: number;
  tps: number;
  finalizedBlocks: number;
  quantumSecurityLevel: number;
  networkUptime: number;
}

export function QuantumBlockchain() {
  const [activeTab, setActiveTab] = useState('network');
  const [nodes, setNodes] = useState<BlockchainNode[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    totalNodes: 0,
    activeValidators: 0,
    tps: 0,
    finalizedBlocks: 0,
    quantumSecurityLevel: 0,
    networkUptime: 0
  });

  // Generate simulated blockchain network data
  useEffect(() => {
    // Generate nodes
    const nodeTypes: Array<'validator' | 'storage' | 'compute'> = ['validator', 'storage', 'compute'];
    const nodeStatuses: Array<'active' | 'syncing' | 'offline'> = ['active', 'syncing', 'offline'];
    
    const generatedNodes: BlockchainNode[] = Array(12).fill(null).map((_, index) => ({
      id: `node-${index.toString().padStart(3, '0')}`,
      type: nodeTypes[Math.floor(Math.random() * 3)],
      status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'syncing' : 'offline') : 'active',
      connections: Math.floor(Math.random() * 100) + 10,
      lastBlock: 1428790 + Math.floor(Math.random() * 10),
      quantumEntanglement: Math.random() * 0.2 + 0.8
    }));
    
    setNodes(generatedNodes);
    
    // Calculate stats
    const activeValidatorCount = generatedNodes.filter(n => n.type === 'validator' && n.status === 'active').length;
    
    setStats({
      totalNodes: generatedNodes.length,
      activeValidators: activeValidatorCount,
      tps: Math.floor(Math.random() * 5000) + 8000,
      finalizedBlocks: 1428800,
      quantumSecurityLevel: Math.random() * 0.1 + 0.9,
      networkUptime: 99.997
    });
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        connections: Math.max(10, node.connections + Math.floor(Math.random() * 5) - 2),
        lastBlock: Math.random() > 0.3 ? node.lastBlock + 1 : node.lastBlock,
        quantumEntanglement: Math.min(1, Math.max(0.8, node.quantumEntanglement + (Math.random() * 0.02 - 0.01)))
      })));
      
      setStats(prev => ({
        ...prev,
        tps: Math.floor(Math.random() * 1000) + 8000,
        finalizedBlocks: prev.finalizedBlocks + Math.floor(Math.random() * 3) + 1,
        quantumSecurityLevel: Math.min(0.999, Math.max(0.9, prev.quantumSecurityLevel + (Math.random() * 0.01 - 0.005)))
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'syncing': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" />
            Quantum-Enhanced Blockchain Network
            <Badge className="ml-2 bg-purple-700 text-purple-300 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Quantum Secure
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="network" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="network" className="flex items-center gap-1">
              <Network className="h-4 w-4" />
              <span>Network</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="quantum" className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              <span>Quantum Layer</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="network">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Total Nodes</div>
                  <div className="text-xl font-semibold text-white">{stats.totalNodes}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">TPS</div>
                  <div className="text-xl font-semibold text-white">{stats.tps.toLocaleString()}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Blocks</div>
                  <div className="text-xl font-semibold text-white">{stats.finalizedBlocks.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gray-900/70 p-2 text-xs text-gray-400 grid grid-cols-6 gap-2">
                  <div>Node ID</div>
                  <div>Type</div>
                  <div>Status</div>
                  <div>Connections</div>
                  <div>Last Block</div>
                  <div>Q-Entanglement</div>
                </div>
                <div className="text-xs max-h-56 overflow-y-auto">
                  {nodes.map((node, i) => (
                    <div 
                      key={node.id}
                      className="grid grid-cols-6 gap-2 p-2 text-gray-300 border-t border-gray-800/50"
                    >
                      <div className="font-mono">{node.id}</div>
                      <div>{node.type.charAt(0).toUpperCase() + node.type.slice(1)}</div>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(node.status)} mr-2`}></div>
                        {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                      </div>
                      <div>{node.connections}</div>
                      <div>{node.lastBlock.toLocaleString()}</div>
                      <div>{(node.quantumEntanglement * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-gray-400 flex justify-between">
                <div>Network Uptime: {stats.networkUptime}%</div>
                <div className="flex items-center">
                  <Activity className="h-3 w-3 mr-1 text-green-500" />
                  Live data, auto-updating
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-black to-purple-950/30 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-300">Quantum Security Level</div>
                  <Badge className="bg-purple-900 text-purple-300">Level 5</Badge>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-1">
                  <div 
                    className="h-full bg-purple-600 rounded-full"
                    style={{width: `${stats.quantumSecurityLevel * 100}%`}}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 flex justify-between">
                  <span>Security Rating</span>
                  <span className="text-purple-400 font-medium">{(stats.quantumSecurityLevel * 100).toFixed(2)}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="text-xs text-gray-400 mb-1 flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-purple-400" />
                    Quantum Resistance
                  </div>
                  <div className="text-base font-semibold text-white">Post-Quantum</div>
                  <div className="text-xs text-gray-500 mt-1">Lattice-based cryptography</div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="text-xs text-gray-400 mb-1 flex items-center">
                    <Lock className="h-3 w-3 mr-1 text-purple-400" />
                    Key Algorithm
                  </div>
                  <div className="text-base font-semibold text-white">Quantum ECDSA</div>
                  <div className="text-xs text-gray-500 mt-1">Entanglement verification</div>
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
                <div className="text-sm text-white mb-2">Security Features</div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-1">•</span>
                    Quantum-resistant cryptographic signatures
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-1">•</span>
                    Post-quantum secure blockchain communication protocol
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-1">•</span>
                    Quantum random number generation for unpredictable block validation
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-1">•</span>
                    Quantum entanglement verification for transaction validation
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-1">•</span>
                    Lattice-based encryption for long-term security against quantum attacks
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="quantum">
            <div className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-500/20">
                <div className="text-sm text-gray-300 flex items-center mb-3">
                  <Cpu className="h-4 w-4 mr-1.5 text-blue-400" />
                  Quantum Layer Architecture
                </div>
                
                <div className="relative h-40 bg-black/60 rounded-lg overflow-hidden">
                  {/* Simulated quantum layer diagram */}
                  <div className="absolute inset-0">
                    {/* Classical Layer */}
                    <div className="absolute top-2 left-0 right-0 h-8 flex items-center justify-center">
                      <div className="bg-gray-800 rounded w-2/3 h-full flex items-center justify-center text-xs text-gray-400">
                        Classical Layer
                      </div>
                    </div>
                    
                    {/* Connection Lines */}
                    <div className="absolute top-10 left-1/4 w-1 h-6 bg-blue-500/30"></div>
                    <div className="absolute top-10 right-1/4 w-1 h-6 bg-blue-500/30"></div>
                    
                    {/* Quantum Layer */}
                    <div className="absolute top-16 left-0 right-0 h-10 flex items-center justify-center">
                      <div className="bg-blue-900/40 border border-blue-500/30 rounded w-2/3 h-full flex items-center justify-center text-xs text-blue-300">
                        Quantum Processing Layer
                      </div>
                    </div>
                    
                    {/* Connection Lines */}
                    <div className="absolute top-26 left-1/3 w-1 h-6 bg-purple-500/30"></div>
                    <div className="absolute top-26 right-1/3 w-1 h-6 bg-purple-500/30"></div>
                    
                    {/* Entanglement Layer */}
                    <div className="absolute bottom-2 left-0 right-0 h-10 flex items-center justify-center">
                      <div className="bg-purple-900/40 border border-purple-500/30 rounded w-2/3 h-full flex items-center justify-center text-xs text-purple-300">
                        Quantum Entanglement Layer
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-gray-400 mb-1">Qubits Utilized</div>
                  <div className="text-xl font-semibold text-white">128</div>
                  <div className="text-xs text-gray-500 mt-1">Error-corrected</div>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-gray-400 mb-1">Quantum Gates</div>
                  <div className="text-xl font-semibold text-white">1.2M</div>
                  <div className="text-xs text-gray-500 mt-1">Per transaction</div>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-gray-400 mb-1">Coherence Time</div>
                  <div className="text-xl font-semibold text-white">2.5s</div>
                  <div className="text-xs text-gray-500 mt-1">Extended</div>
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
                <div className="text-xs text-white flex items-center mb-2">
                  <Activity className="h-3 w-3 mr-1 text-purple-400" />
                  Quantum Processing Tasks
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li className="flex items-center justify-between">
                    <span>Quantum signature verification</span>
                    <Badge className="bg-green-900/60 text-green-300 text-xs">Active</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Entanglement-based random number generation</span>
                    <Badge className="bg-green-900/60 text-green-300 text-xs">Active</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Quantum hash calculation</span>
                    <Badge className="bg-green-900/60 text-green-300 text-xs">Active</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Quantum neural network optimization</span>
                    <Badge className="bg-yellow-900/60 text-yellow-300 text-xs">Processing</Badge>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
