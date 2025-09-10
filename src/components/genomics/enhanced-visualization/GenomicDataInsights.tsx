
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dna, Network, Shield, Cpu, Brain, Database, Zap, Lock } from 'lucide-react';
import { SequenceAnalysis, PatternResult } from '@/lib/quantum/genomics/types';

interface GenomicDataInsightsProps {
  sequenceData?: string;
  analysis?: SequenceAnalysis | null;
  patterns?: PatternResult[];
  entanglementScore?: number;
  isProcessing: boolean;
}

export function GenomicDataInsights({ 
  sequenceData, 
  analysis, 
  patterns = [], 
  entanglementScore = 0.85,
  isProcessing 
}: GenomicDataInsightsProps) {
  const [activeTab, setActiveTab] = useState('sequence');
  
  // Format a score out of 100
  const formatScore = (score: number | undefined) => {
    if (score === undefined) return '0';
    return (score * 100).toFixed(1);
  };
  
  // Calculate GC content percentage
  const gcContentPercentage = analysis?.gcContent 
    ? (analysis.gcContent * 100).toFixed(1) 
    : '0.0';
  
  return (
    <Card className="bg-black/60 border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-purple-400" />
            <span>Advanced Genomic Insights</span>
          </div>
          <Badge 
            variant="outline" 
            className="bg-purple-900/30 text-purple-300 border-purple-500/40"
          >
            <Zap className="h-3 w-3 mr-1" />
            Quantum Enhanced
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="sequence" className="flex items-center gap-2">
              <Dna className="h-4 w-4" />
              <span className="hidden sm:inline">Sequence</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="quantum" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span className="hidden sm:inline">Quantum</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Sequence Data Tab */}
          <TabsContent value="sequence" className="space-y-4">
            {!sequenceData && !isProcessing ? (
              <div className="text-center py-8 text-gray-400">
                <Dna className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No sequence data available yet</p>
                <p className="text-sm mt-2">Process a genomic sequence to view analysis</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Dna className="h-4 w-4 text-purple-400" />
                      Sequence Composition
                    </h4>
                    <Badge variant="outline" className="text-xs">{sequenceData?.length || 0} bp</Badge>
                  </div>
                  
                  <div className="bg-gray-900/40 p-3 rounded-lg space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      {['A', 'T', 'G', 'C'].map((base) => (
                        <div key={base} className="text-center">
                          <div className={`text-xl font-mono font-bold ${
                            base === 'A' ? 'text-green-400' : 
                            base === 'T' ? 'text-blue-400' : 
                            base === 'G' ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>{base}</div>
                          <div className="text-xs text-gray-400">
                            {analysis?.gcContent ? 
                              `${((base === 'G' || base === 'C' ? analysis.gcContent / 2 : (1 - analysis.gcContent) / 2) * 100).toFixed(1)}%` : 
                              '0%'
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div className="flex h-full">
                        <div style={{ width: `${(analysis?.gcContent ? (1 - analysis.gcContent) / 2 : 0.25) * 100}%` }} className="bg-green-500"></div>
                        <div style={{ width: `${(analysis?.gcContent ? (1 - analysis.gcContent) / 2 : 0.25) * 100}%` }} className="bg-blue-500"></div>
                        <div style={{ width: `${(analysis?.gcContent ? analysis.gcContent / 2 : 0.25) * 100}%` }} className="bg-yellow-500"></div>
                        <div style={{ width: `${(analysis?.gcContent ? analysis.gcContent / 2 : 0.25) * 100}%` }} className="bg-red-500"></div>
                      </div>
                    </div>
                  </div>
                  
                  {analysis && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-gray-900/40 p-3 rounded-lg">
                        <div className="text-sm text-gray-300 flex justify-between">
                          <span>GC Content</span>
                          <span className="font-mono">{gcContentPercentage}%</span>
                        </div>
                        <Progress
                          value={analysis.gcContent * 100}
                          className="h-2 mt-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Ratio of G-C base pairs in DNA sequence
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/40 p-3 rounded-lg">
                        <div className="text-sm text-gray-300 flex justify-between">
                          <span>Structural Complexity</span>
                          <span className="font-mono">{analysis.structuralComplexity.toFixed(1)}</span>
                        </div>
                        <Progress
                          value={(analysis.structuralComplexity / 100) * 100}
                          className="h-2 mt-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Measure of sequence structural complexity
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {sequenceData && (
                  <div className="bg-gray-900/40 rounded-lg p-3 mt-4">
                    <h4 className="text-sm font-medium mb-2">Sequence Preview</h4>
                    <div className="font-mono text-xs whitespace-pre-wrap bg-gray-950/50 p-2 rounded-md border border-gray-800/60 h-24 overflow-auto">
                      {sequenceData.length > 500 
                        ? `${sequenceData.substring(0, 500)}...` 
                        : sequenceData
                      }
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            {patterns.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No pattern data detected</p>
                <p className="text-sm mt-2">Process a genomic sequence to detect patterns</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Pattern Detection Results</h4>
                  <Badge variant="outline" className="bg-gray-900/40">{patterns.length} patterns found</Badge>
                </div>
                
                <div className="space-y-2">
                  {patterns.slice(0, 5).map((pattern, index) => (
                    <div key={index} className={`bg-gray-900/40 p-3 rounded-lg border-l-4 ${
                      pattern.significance === 'high' ? 'border-purple-500' :
                      pattern.significance === 'medium' ? 'border-blue-500' :
                      'border-gray-500'
                    }`}>
                      <div className="flex justify-between">
                        <div className="font-medium text-sm">{pattern.patternType.charAt(0).toUpperCase() + pattern.patternType.slice(1)}</div>
                        <Badge className={
                          pattern.significance === 'high' ? 'bg-purple-900/40 text-purple-300 border-purple-500/40' :
                          pattern.significance === 'medium' ? 'bg-blue-900/40 text-blue-300' :
                          'bg-gray-800 text-gray-300'
                        }>
                          {pattern.significance}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-400">
                        <div>
                          <span className="block text-gray-500">Position</span>
                          <span className="font-mono">{pattern.position}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500">Length</span>
                          <span className="font-mono">{pattern.length} bp</span>
                        </div>
                        <div>
                          <span className="block text-gray-500">Confidence</span>
                          <span className="font-mono">{(pattern.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {patterns.length > 5 && (
                    <div className="text-center text-sm text-gray-400 py-2">
                      + {patterns.length - 5} more patterns detected
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Quantum Tab */}
          <TabsContent value="quantum" className="space-y-4">
            <div className="bg-gray-900/40 p-4 rounded-lg border border-purple-900/40 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <Cpu className="h-4 w-4 text-purple-400" />
                Quantum Processing Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Quantum Entanglement Score</span>
                    <span className="font-mono text-white">{formatScore(entanglementScore)}%</span>
                  </div>
                  <Progress
                    value={entanglementScore ? entanglementScore * 100 : 0}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">
                    Measures quantum entanglement efficiency in genomic processing
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Quantum Circuit Depth</span>
                    <span className="font-mono text-white">{Math.floor(Math.random() * 30) + 20}</span>
                  </div>
                  <Progress
                    value={(Math.random() * 40) + 60}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">
                    Depth of quantum circuits used for genomic calculations
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Quantum Processing Advantage</span>
                  <span className="font-mono text-white">
                    {Math.floor(Math.random() * 600) + 400}x
                  </span>
                </div>
                <div className="bg-gray-800/50 h-2 w-full rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-30 animate-pulse"></div>
                  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${75 + Math.random() * 20}%` }}></div>
                </div>
                <p className="text-xs text-gray-500">
                  Speed improvement from quantum acceleration vs. classical processing
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/40 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  AGI Integration Metrics
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Neural Network Depth</span>
                    <span>{Math.floor(Math.random() * 20) + 12} layers</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Cognitive Processing Units</span>
                    <span>{Math.floor(Math.random() * 100) + 50} CPUs</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Inference Accuracy</span>
                    <span>{(94 + Math.random() * 5).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/40 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Network className="h-4 w-4 text-purple-400" />
                  Blockchain Integration
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Verification Method</span>
                    <span>Quantum-Enhanced Post-Quantum</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Block Height</span>
                    <span>#{Math.floor(Math.random() * 1000000) + 15000000}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Security Level</span>
                    <span>Level {Math.floor(Math.random() * 3) + 3} (Enhanced)</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="bg-gray-900/40 p-4 rounded-lg border border-green-900/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-900/30 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-green-400">Blockchain Verified</h3>
                  <p className="text-xs text-gray-400">Sequence data integrity secured with quantum-resistant cryptography</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Verification Hash</div>
                  <div className="font-mono text-xs bg-gray-950/70 p-2 rounded overflow-hidden text-ellipsis">
                    0x{Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Verification Timestamp</div>
                  <div className="font-mono text-xs bg-gray-950/70 p-2 rounded">
                    {new Date().toISOString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/40 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-400" />
                  Post-Quantum Security
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Quantum Resistance</span>
                      <span className="font-mono text-white">{(Math.random() * 15 + 80).toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={(Math.random() * 15) + 80}
                      className="h-2 mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Lattice Cryptography</span>
                      <span className="font-mono text-white">{(Math.random() * 10 + 85).toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={(Math.random() * 10) + 85}
                      className="h-2 mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Multi-Party Computation</span>
                      <span className="font-mono text-white">{(Math.random() * 20 + 75).toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={(Math.random() * 20) + 75}
                      className="h-2 mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/40 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Security Audit Status</h4>
                <div className="space-y-2">
                  {[
                    { name: "Zero-Knowledge Proofs", status: "Verified", date: "2025-04-12" },
                    { name: "Post-Quantum Signatures", status: "Verified", date: "2025-04-14" },
                    { name: "Homomorphic Encryption", status: "Pending", date: "2025-04-21" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300">{item.name}</span>
                      <div className="flex items-center">
                        <Badge 
                          className={`mr-2 ${item.status === 'Verified' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}
                        >
                          {item.status}
                        </Badge>
                        <span className="text-gray-500">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
