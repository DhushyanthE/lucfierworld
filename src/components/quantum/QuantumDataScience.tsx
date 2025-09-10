
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart4, Database, LineChart, PieChart, BrainCircuit, BarChart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart as ReBarChart, Bar } from 'recharts';

// Sample data for visualization
const timeSeriesData = [
  { time: '00:00', classical: 45, quantum: 82 },
  { time: '04:00', classical: 52, quantum: 91 },
  { time: '08:00', classical: 48, quantum: 89 },
  { time: '12:00', classical: 70, quantum: 96 },
  { time: '16:00', classical: 58, quantum: 93 },
  { time: '20:00', classical: 40, quantum: 88 },
  { time: '24:00', classical: 43, quantum: 84 },
];

const modelComparisonData = [
  { name: 'Classification', classical: 78, quantum: 98 },
  { name: 'Regression', classical: 82, quantum: 96 },
  { name: 'Clustering', classical: 65, quantum: 94 },
  { name: 'Dimensionality', classical: 58, quantum: 97 },
  { name: 'Anomaly', classical: 75, quantum: 99 },
];

export function QuantumDataScience() {
  const [activeTab, setActiveTab] = useState('models');
  const [selectedDataset, setSelectedDataset] = useState('financial');
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart4 className="h-5 w-5 text-purple-400" />
            Quantum Data Science Integration
            <Badge className="ml-2 bg-blue-800 text-blue-300">Enhanced</Badge>
          </CardTitle>
          <Select
            value={selectedDataset}
            onValueChange={setSelectedDataset}
          >
            <SelectTrigger className="w-40 h-8 text-xs bg-gray-900 border-gray-700">
              <SelectValue placeholder="Select Dataset" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="financial">Financial Data</SelectItem>
              <SelectItem value="genomics">Genomic Sequences</SelectItem>
              <SelectItem value="climate">Climate Patterns</SelectItem>
              <SelectItem value="particle">Particle Physics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="models" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="models" className="flex items-center gap-1">
              <BrainCircuit className="h-4 w-4" />
              <span>Models</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="datasets" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>Datasets</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="models" className="space-y-4">
            <div className="bg-gradient-to-r from-black to-purple-950/30 rounded-lg p-4 border border-purple-500/20">
              <div className="text-sm text-gray-200 mb-3 flex items-center">
                <BrainCircuit className="h-4 w-4 mr-1.5 text-purple-400" />
                Quantum Machine Learning Models
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={modelComparisonData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} />
                    <YAxis stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                      labelStyle={{ color: '#ddd' }}
                    />
                    <Bar dataKey="classical" name="Classical ML" fill="#60a5fa" />
                    <Bar dataKey="quantum" name="Quantum ML" fill="#a78bfa" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Model accuracy comparison between classical and quantum machine learning approaches
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-500/20">
                <div className="text-xs text-gray-400 mb-1 flex items-center">
                  <PieChart className="h-3 w-3 mr-1 text-purple-400" />
                  Classification
                </div>
                <div className="text-base font-semibold text-white">Quantum SVM</div>
                <div className="text-xs text-purple-400 mt-1">98% accuracy</div>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-500/20">
                <div className="text-xs text-gray-400 mb-1 flex items-center">
                  <LineChart className="h-3 w-3 mr-1 text-purple-400" />
                  Regression
                </div>
                <div className="text-base font-semibold text-white">Q-Neural Net</div>
                <div className="text-xs text-purple-400 mt-1">96% accuracy</div>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-500/20">
                <div className="text-xs text-gray-400 mb-1 flex items-center">
                  <BarChart className="h-3 w-3 mr-1 text-purple-400" />
                  Clustering
                </div>
                <div className="text-base font-semibold text-white">Q-K-Means</div>
                <div className="text-xs text-purple-400 mt-1">94% accuracy</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="bg-gradient-to-r from-black to-blue-950/30 rounded-lg p-4 border border-blue-500/20">
              <div className="text-sm text-gray-200 mb-3 flex items-center">
                <LineChart className="h-4 w-4 mr-1.5 text-blue-400" />
                Performance Comparison
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeSeriesData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="time" stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} />
                    <YAxis stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                      labelStyle={{ color: '#ddd' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="classical" 
                      stackId="1"
                      name="Classical"
                      stroke="#60a5fa" 
                      fill="#60a5fa33" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="quantum" 
                      stackId="2"
                      name="Quantum"
                      stroke="#a78bfa" 
                      fill="#a78bfa33" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Performance metrics over time comparing quantum vs classical processing
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-blue-500/20">
                <div className="text-xs text-gray-400 mb-1">Processing Time</div>
                <div className="flex items-end">
                  <span className="text-2xl font-semibold text-white">450x</span>
                  <span className="text-xs text-blue-400 ml-1 mb-1">faster</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">With quantum optimization</div>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg border border-blue-500/20">
                <div className="text-xs text-gray-400 mb-1">Learning Rate</div>
                <div className="flex items-end">
                  <span className="text-2xl font-semibold text-white">85x</span>
                  <span className="text-xs text-blue-400 ml-1 mb-1">better</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Convergence improvement</div>
              </div>
            </div>
            
            <div className="bg-black/40 p-3 rounded-lg border border-blue-500/20">
              <div className="text-sm text-gray-300 mb-2">Quantum Advantage Metrics</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Dimensionality Handling</span>
                    <span className="text-blue-400">Exponential Advantage</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{width: "97%"}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Optimization Problems</span>
                    <span className="text-blue-400">Quadratic Speedup</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{width: "89%"}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Search Algorithms</span>
                    <span className="text-blue-400">Square Root Speedup</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{width: "95%"}}></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="datasets" className="space-y-4">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-200 flex items-center">
                  <Database className="h-4 w-4 mr-1.5 text-purple-400" />
                  {selectedDataset === 'financial' && 'Financial Market Dataset'}
                  {selectedDataset === 'genomics' && 'Genomic Sequences Dataset'}
                  {selectedDataset === 'climate' && 'Climate Patterns Dataset'}
                  {selectedDataset === 'particle' && 'Particle Physics Dataset'}
                </div>
                <Badge className="bg-purple-900 text-purple-300">
                  {selectedDataset === 'financial' && '2.8 TB'}
                  {selectedDataset === 'genomics' && '15 TB'}
                  {selectedDataset === 'climate' && '8.5 TB'}
                  {selectedDataset === 'particle' && '42 TB'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 mb-1">Processing Status</div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-green-400">Quantum Processing Active</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedDataset === 'financial' && 'Market data from 42 global exchanges'}
                    {selectedDataset === 'genomics' && 'DNA sequences from 1.5M species'}
                    {selectedDataset === 'climate' && 'Global climate sensors, 5-minute intervals'}
                    {selectedDataset === 'particle' && 'CERN collision data, 10ns resolution'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/40 p-2 rounded-lg border border-gray-800">
                    <div className="text-xs text-gray-400 mb-1">Features</div>
                    <div className="text-lg font-semibold text-white">
                      {selectedDataset === 'financial' && '1,248'}
                      {selectedDataset === 'genomics' && '9,650'}
                      {selectedDataset === 'climate' && '3,840'}
                      {selectedDataset === 'particle' && '12,750'}
                    </div>
                  </div>
                  
                  <div className="bg-black/40 p-2 rounded-lg border border-gray-800">
                    <div className="text-xs text-gray-400 mb-1">Records</div>
                    <div className="text-lg font-semibold text-white">
                      {selectedDataset === 'financial' && '28B'}
                      {selectedDataset === 'genomics' && '4.5B'}
                      {selectedDataset === 'climate' && '120B'}
                      {selectedDataset === 'particle' && '840B'}
                    </div>
                  </div>
                  
                  <div className="bg-black/40 p-2 rounded-lg border border-gray-800">
                    <div className="text-xs text-gray-400 mb-1">Qubits</div>
                    <div className="text-lg font-semibold text-white">
                      {selectedDataset === 'financial' && '128'}
                      {selectedDataset === 'genomics' && '256'}
                      {selectedDataset === 'climate' && '192'}
                      {selectedDataset === 'particle' && '512'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-400 mb-2">Quantum Processing Advantages</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {selectedDataset === 'financial' && (
                      <>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Pattern recognition in high-frequency trading data
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Multi-market correlation analysis with 450x speedup
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Quantum Monte Carlo simulation for risk assessment
                        </li>
                      </>
                    )}
                    
                    {selectedDataset === 'genomics' && (
                      <>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Quantum sequence alignment with exponential speedup
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Protein folding simulation with 380x performance
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Quantum-enhanced genetic association studies
                        </li>
                      </>
                    )}
                    
                    {selectedDataset === 'climate' && (
                      <>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Multi-dimensional climate model simulation
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Quantum-enhanced weather prediction algorithms
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Climate anomaly detection with 520x speedup
                        </li>
                      </>
                    )}
                    
                    {selectedDataset === 'particle' && (
                      <>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Quantum simulation of high-energy particle collisions
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Dark matter detection algorithms with 1,200x speedup
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          Quantum-enhanced analysis of 42PB collision dataset
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
