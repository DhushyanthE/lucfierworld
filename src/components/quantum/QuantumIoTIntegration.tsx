import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cpu, Network, Shield, Activity, Zap, Layers, Globe, Wifi } from 'lucide-react';

export function QuantumIoTIntegration() {
  const [activeTab, setActiveTab] = useState('network');
  
  // Sample IoT device data
  const deviceTypes = [
    { name: "Smart Sensors", count: 14280, quantum: true },
    { name: "Edge Devices", count: 8750, quantum: true },
    { name: "Gateway Nodes", count: 1240, quantum: true },
    { name: "Standard Sensors", count: 28450, quantum: false },
    { name: "Legacy Devices", count: 6320, quantum: false },
  ];
  
  // Sample quantum security stats
  const securityStats = {
    quantumEntanglementRate: 92.5,
    quantumKeyDistribution: 99.8,
    postQuantumCrypto: 100,
    quantumRandomness: 100,
    vulnerabilities: 0
  };
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Wifi className="h-5 w-5 text-purple-400" />
            Quantum IoT Integration
            <Badge className="ml-2 bg-purple-700 text-purple-200">Beta</Badge>
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
            <TabsTrigger value="devices" className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              <span>Devices</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="network">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-black to-purple-950/20 p-3 rounded-lg border border-purple-500/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Connected Devices</div>
                    <div className="text-2xl font-semibold text-white">58,940</div>
                    <div className="text-xs text-green-400 mt-1">+1,280 in last 24h</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Data Transfer</div>
                    <div className="text-2xl font-semibold text-white">8.4 TB/day</div>
                    <div className="text-xs text-purple-400 mt-1">Quantum encrypted</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Network Status</div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-lg font-medium text-white">Operational</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">99.998% uptime</div>
                  </div>
                </div>
              </div>
              
              <div className="relative h-48 bg-black/40 rounded-lg border border-purple-500/20 overflow-hidden">
                <div className="absolute inset-0 p-3">
                  <div className="text-xs text-gray-300 mb-2 flex items-center">
                    <Globe className="h-3 w-3 mr-1 text-purple-400" />
                    Global IoT Network
                  </div>
                  
                  {/* Simplified network visualization */}
                  <div className="relative h-full">
                    {/* Hub points */}
                    <div className="absolute top-1/4 left-1/4 h-3 w-3 rounded-full bg-purple-500 animate-pulse"></div>
                    <div className="absolute top-2/3 left-1/3 h-3 w-3 rounded-full bg-purple-500 animate-pulse"></div>
                    <div className="absolute top-1/2 left-2/3 h-3 w-3 rounded-full bg-purple-500 animate-pulse"></div>
                    <div className="absolute top-1/4 left-3/4 h-3 w-3 rounded-full bg-purple-500 animate-pulse"></div>
                    <div className="absolute top-3/4 left-3/4 h-3 w-3 rounded-full bg-purple-500 animate-pulse"></div>
                    
                    {/* Node points */}
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div 
                        key={i}
                        className="absolute h-1.5 w-1.5 rounded-full bg-blue-400"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          opacity: 0.7
                        }}
                      ></div>
                    ))}
                    
                    {/* Connection lines - would be better with SVG or Canvas, but keeping it simple */}
                    <div className="absolute top-1/4 left-1/4 w-24 h-1 bg-purple-500/20 rotate-45 origin-left"></div>
                    <div className="absolute top-1/4 left-1/4 w-36 h-1 bg-purple-500/20 rotate-[75deg] origin-left"></div>
                    <div className="absolute top-2/3 left-1/3 w-36 h-1 bg-purple-500/20 rotate-[15deg] origin-left"></div>
                    <div className="absolute top-1/2 left-2/3 w-20 h-1 bg-purple-500/20 rotate-[60deg] origin-left"></div>
                    <div className="absolute top-3/4 left-3/4 w-16 h-1 bg-purple-500/20 rotate-[200deg] origin-left"></div>
                  </div>
                </div>
                
                {/* Activity indicator */}
                <div className="absolute bottom-2 right-2 flex items-center text-xs text-green-400">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Network Activity
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 mb-1">Edge Nodes</div>
                  <div className="text-lg font-semibold text-white">12,840</div>
                  <div className="flex items-center text-xs text-green-400 mt-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                    99.2% online
                  </div>
                </div>
                
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 mb-1">Quantum Links</div>
                  <div className="text-lg font-semibold text-white">5,280</div>
                  <div className="flex items-center text-xs text-purple-400 mt-1">
                    <Zap className="h-3 w-3 mr-1" />
                    Entangled
                  </div>
                </div>
                
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 mb-1">Network Load</div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-lg font-medium text-white">42%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="devices">
            <div className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-300 mb-3 flex items-center">
                  <Cpu className="h-4 w-4 mr-1.5 text-purple-400" />
                  Connected IoT Devices
                </div>
                
                <div className="space-y-3">
                  {deviceTypes.map((type, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <div className="flex items-center">
                          <span className="text-gray-300">{type.name}</span>
                          {type.quantum && (
                            <Badge className="ml-2 bg-purple-900/60 text-purple-300 text-xs">Quantum</Badge>
                          )}
                        </div>
                        <span className="text-white">{type.count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${type.quantum ? 'bg-purple-600' : 'bg-blue-600'} rounded-full`} 
                          style={{width: `${(type.count / 30000) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 mb-2">Device Types Distribution</div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-300">Quantum-enabled</span>
                      </div>
                      <span className="text-xs text-gray-400">41%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-300">Classical</span>
                      </div>
                      <span className="text-xs text-gray-400">59%</span>
                    </div>
                  </div>
                  
                  <div className="h-4 bg-gray-800 mt-3 rounded-full overflow-hidden flex">
                    <div className="h-full bg-purple-600 rounded-l-full" style={{width: "41%"}}></div>
                    <div className="h-full bg-blue-600 rounded-r-full" style={{width: "59%"}}></div>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 mb-1">Device Activity</div>
                  <div className="text-xl font-semibold text-white">3.2M</div>
                  <div className="text-xs text-gray-500">events / minute</div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Processing Rate</span>
                      <span className="text-green-400">98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-1.5" />
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
                <div className="text-xs text-purple-300 flex items-center mb-2">
                  <Zap className="h-3 w-3 mr-1" />
                  QUANTUM DEVICE FEATURES
                </div>
                <ul className="grid grid-cols-2 gap-y-1 gap-x-4">
                  <li className="text-xs text-gray-300 flex items-center">
                    <span className="text-purple-500 mr-1.5">•</span>
                    Quantum-resistant encryption
                  </li>
                  <li className="text-xs text-gray-300 flex items-center">
                    <span className="text-purple-500 mr-1.5">•</span>
                    Quantum key distribution
                  </li>
                  <li className="text-xs text-gray-300 flex items-center">
                    <span className="text-purple-500 mr-1.5">•</span>
                    Entanglement-based authentication
                  </li>
                  <li className="text-xs text-gray-300 flex items-center">
                    <span className="text-purple-500 mr-1.5">•</span>
                    Sub-millisecond quantum sync
                  </li>
                  <li className="text-xs text-gray-300 flex items-center">
                    <span className="text-purple-500 mr-1.5">•</span>
                    Quantum random number generation
                  </li>
                  <li className="text-xs text-gray-300 flex items-center">
                    <span className="text-purple-500 mr-1.5">•</span>
                    Edge quantum processing
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-black to-purple-950/20 p-3 rounded-lg border border-purple-500/20">
                <div className="text-sm text-gray-300 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-1.5 text-purple-400" />
                  Quantum IoT Security Matrix
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Quantum Entanglement Rate</span>
                      <span className="text-white">{securityStats.quantumEntanglementRate}%</span>
                    </div>
                    <Progress value={securityStats.quantumEntanglementRate} className="h-1.5" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Quantum Key Distribution</span>
                      <span className="text-white">{securityStats.quantumKeyDistribution}%</span>
                    </div>
                    <Progress value={securityStats.quantumKeyDistribution} className="h-1.5" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Post-Quantum Cryptography</span>
                      <span className="text-white">{securityStats.postQuantumCrypto}%</span>
                    </div>
                    <Progress value={securityStats.postQuantumCrypto} className="h-1.5" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Quantum Randomness</span>
                      <span className="text-white">{securityStats.quantumRandomness}%</span>
                    </div>
                    <Progress value={securityStats.quantumRandomness} className="h-1.5" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 mb-1">Security Status</div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-lg font-medium text-white">Protected</span>
                  </div>
                  <div className="text-xs text-green-400 mt-1">
                    No quantum vulnerabilities detected
                  </div>
                </div>
                
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 mb-1">Threat Detection</div>
                  <div className="text-lg font-semibold text-white">
                    {securityStats.vulnerabilities} <span className="text-sm">threats</span>
                  </div>
                  <div className="flex items-center text-xs text-green-400 mt-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Quantum-secure perimeter
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
                <div className="text-sm text-gray-300 mb-2">Security Protocols</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-gray-900/30 p-2 rounded border border-gray-800">
                    <div className="text-xs text-purple-300 font-medium">Quantum Key Distribution (QKD)</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Secure key exchange using quantum principles, immune to eavesdropping
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/30 p-2 rounded border border-gray-800">
                    <div className="text-xs text-purple-300 font-medium">Lattice-Based Cryptography</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Post-quantum secure encryption based on hard lattice problems
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/30 p-2 rounded border border-gray-800">
                    <div className="text-xs text-purple-300 font-medium">Quantum Random Number Generator</div>
                    <div className="text-xs text-gray-400 mt-1">
                      True randomness from quantum processes for unpredictable keys
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/30 p-2 rounded border border-gray-800">
                    <div className="text-xs text-purple-300 font-medium">Quantum Entanglement Authentication</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Device authentication using quantum-entangled particles
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
