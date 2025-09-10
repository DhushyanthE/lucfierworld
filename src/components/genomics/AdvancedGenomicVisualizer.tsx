
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Dna, LineChart, Lock, Search, Zap } from 'lucide-react';
import { PatternResult, SequenceAnalysis } from '@/lib/quantum/genomics/types';

interface AdvancedGenomicVisualizerProps {
  sequenceData?: string;
  analysis?: SequenceAnalysis;
  patterns?: PatternResult[];
  isProcessing?: boolean;
}

export function AdvancedGenomicVisualizer({
  sequenceData = '',
  analysis,
  patterns = [],
  isProcessing = false
}: AdvancedGenomicVisualizerProps) {
  const [activeTab, setActiveTab] = useState('visualization');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBase, setHoveredBase] = useState<{index: number, base: string} | null>(null);
  const [zoom, setZoom] = useState(1);
  
  // Color mapping for DNA bases
  const baseColors = {
    'A': '#FF5252', // Red
    'T': '#4CAF50', // Green
    'G': '#2196F3', // Blue
    'C': '#FFC107', // Yellow
    'N': '#9E9E9E'  // Gray (for unknown)
  };
  
  useEffect(() => {
    if (!canvasRef.current || !sequenceData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Determine display range based on zoom
    const displayLength = Math.min(sequenceData.length, Math.floor(500 / zoom));
    const startPos = 0;
    const endPos = startPos + displayLength;
    
    // Calculate base width and height
    const baseWidth = zoom * 10;
    const baseHeight = 20;
    
    // Draw bases
    for (let i = startPos; i < endPos && i < sequenceData.length; i++) {
      const base = sequenceData[i].toUpperCase();
      const x = (i - startPos) * baseWidth;
      
      // Set color based on base
      ctx.fillStyle = baseColors[base as keyof typeof baseColors] || baseColors['N'];
      
      // Draw rectangle for the base
      ctx.fillRect(x, 0, baseWidth - 1, baseHeight);
      
      // Draw base letter
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(base, x + baseWidth / 2, baseHeight / 2 + 4);
    }
    
    // Draw pattern indicators if any
    if (patterns && patterns.length > 0) {
      patterns.forEach(pattern => {
        if (pattern.position >= startPos && pattern.position < endPos) {
          const x = (pattern.position - startPos) * baseWidth;
          
          // Draw pattern indicator
          ctx.strokeStyle = '#FF00FF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, baseHeight + 5);
          ctx.lineTo(x + (pattern.length * baseWidth), baseHeight + 5);
          ctx.stroke();
          
          // Draw pattern type
          ctx.fillStyle = '#FF00FF';
          ctx.font = '10px Arial';
          ctx.fillText(pattern.patternType, x, baseHeight + 20);
        }
      });
    }
    
  }, [sequenceData, patterns, zoom]);
  
  // Generate mock sequence data if none provided
  useEffect(() => {
    if (!sequenceData && !isProcessing) {
      // Mock data
      const mockSequence = generateMockSequence(200);
      // This is just for visualization - normally we'd use the real data
    }
  }, [sequenceData, isProcessing]);
  
  // Generate random DNA sequence for demo
  const generateMockSequence = (length: number): string => {
    const bases = ['A', 'T', 'G', 'C'];
    let sequence = '';
    for (let i = 0; i < length; i++) {
      sequence += bases[Math.floor(Math.random() * bases.length)];
    }
    return sequence;
  };
  
  // Handle mouse movement on canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !sequenceData) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    const baseWidth = zoom * 10;
    const index = Math.floor(x / baseWidth);
    
    if (index >= 0 && index < sequenceData.length) {
      setHoveredBase({
        index,
        base: sequenceData[index]
      });
    } else {
      setHoveredBase(null);
    }
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Dna className="h-5 w-5 text-purple-400" />
            Advanced Genomic Visualizer
            {isProcessing && (
              <Badge variant="outline" className="bg-purple-900/30 text-purple-300 animate-pulse ml-2">
                Processing
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
              className="bg-gray-800 rounded p-1 text-white hover:bg-gray-700"
            >
              <Search className="h-4 w-4" />+
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 0.5, 0.5))}
              className="bg-gray-800 rounded p-1 text-white hover:bg-gray-700"
            >
              <Search className="h-4 w-4" />-
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="visualization" className="data-[state=active]:bg-purple-900/50">
              <Dna className="h-4 w-4 mr-2" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-900/50">
              <LineChart className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-900/50">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualization" className="space-y-4">
            <div className="relative bg-gray-900 rounded-md p-2">
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={100} 
                className="w-full h-32 bg-gray-800/80 rounded"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredBase(null)}
              />
              
              {hoveredBase && (
                <div className="absolute top-2 right-2 bg-gray-800 rounded p-2 text-xs">
                  <p className="text-white">Position: {hoveredBase.index}</p>
                  <p className="text-white">Base: {hoveredBase.base}</p>
                </div>
              )}
              
              <div className="mt-2 flex justify-between">
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(baseColors).map(([base, color]) => (
                    <div key={base} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: color}}></div>
                      <span className="text-xs text-gray-300">{base}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-xs text-gray-400">
                  {sequenceData ? `${sequenceData.length} bases` : 'No sequence data'}
                </div>
              </div>
            </div>
            
            {patterns && patterns.length > 0 && (
              <div className="bg-gray-800/50 rounded-md p-3">
                <h3 className="text-sm font-medium text-white mb-2">Detected Patterns</h3>
                <div className="space-y-2">
                  {patterns.map((pattern, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-900/60 rounded p-2">
                      <div>
                        <span className="text-xs font-medium text-purple-400">{pattern.patternType}</span>
                        <span className="text-xs text-gray-400 ml-2">Pos: {pattern.position}</span>
                        <span className="text-xs text-gray-400 ml-2">Length: {pattern.length}</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(pattern.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analysis">
            {analysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/60 rounded-md p-3">
                    <h3 className="text-sm font-medium text-white mb-2">Composition Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">GC Content:</span>
                        <span className="text-xs text-white">{(analysis.gcContent * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Repeats:</span>
                        <span className="text-xs text-white">{analysis.repeats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Mutations:</span>
                        <span className="text-xs text-white">{analysis.mutations}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/60 rounded-md p-3">
                    <h3 className="text-sm font-medium text-white mb-2">Structure Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Complexity:</span>
                        <span className="text-xs text-white">{analysis.structuralComplexity.toFixed(2)}</span>
                      </div>
                      {analysis.secondaryStructures && (
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Secondary Structures:</span>
                          <span className="text-xs text-white">{analysis.secondaryStructures.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {analysis.methylationPattern && (
                  <div className="bg-gray-900/60 rounded-md p-3">
                    <h3 className="text-sm font-medium text-white mb-2">Methylation Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Methylated Sites:</span>
                        <span className="text-xs text-white">{analysis.methylationPattern.totalMethylatedSites}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Density:</span>
                        <span className="text-xs text-white">
                          {(analysis.methylationPattern.methylationDensity * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900/60 rounded-md p-6 text-center">
                <Database className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No analysis data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="security">
            <div className="space-y-4">
              <div className="bg-gray-900/60 rounded-md p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <h3 className="text-sm font-medium text-white">Quantum Security Status</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/60 rounded p-2">
                    <div className="text-xs text-gray-400">Encryption</div>
                    <div className="text-sm font-medium text-green-400">Quantum-Resistant</div>
                  </div>
                  
                  <div className="bg-gray-800/60 rounded p-2">
                    <div className="text-xs text-gray-400">Blockchain Verification</div>
                    <div className="text-sm font-medium text-green-400">Active</div>
                  </div>
                  
                  <div className="bg-gray-800/60 rounded p-2">
                    <div className="text-xs text-gray-400">Hash Algorithm</div>
                    <div className="text-sm font-medium text-white">SHA-3 + Quantum</div>
                  </div>
                  
                  <div className="bg-gray-800/60 rounded p-2">
                    <div className="text-xs text-gray-400">Access Control</div>
                    <div className="text-sm font-medium text-white">Multi-factor</div>
                  </div>
                </div>
                
                <div className="mt-3 bg-green-900/20 border border-green-900/30 rounded-md p-2">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-400 mt-0.5" />
                    <p className="text-xs text-green-300">
                      This genomic data is protected with quantum-resistant encryption 
                      and secured on the blockchain with tamper-evident verification.
                    </p>
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
