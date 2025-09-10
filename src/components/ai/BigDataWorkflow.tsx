
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Database, 
  Server, 
  Network, 
  Cpu, 
  BarChart4, 
  Layers,
  Zap, 
  RefreshCw
} from 'lucide-react';
import { bigDataWorkflowService, BigDataWorkflowConfig } from '@/lib/quantum/BigDataWorkflowService';
import { toast } from 'sonner';

export function BigDataWorkflow() {
  const [activeTab, setActiveTab] = useState('config');
  const [isProcessing, setIsProcessing] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const [optimizationTarget, setOptimizationTarget] = useState<'speed' | 'efficiency' | 'cost' | 'balanced'>('balanced');
  
  // Configuration state
  const [config, setConfig] = useState<BigDataWorkflowConfig>({
    dataVolume: 250,
    processingNodes: 8,
    parallelStreams: 16,
    compressionLevel: 5,
    useQuantumAcceleration: true,
    distributedProcessing: true
  });
  
  const updateConfig = useCallback((field: keyof BigDataWorkflowConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  const handleProcessData = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate processing delay
      const startTime = Date.now();
      
      // Process data using service
      const result = await bigDataWorkflowService.processDataset(config);
      
      // Add artificial delay for better UX if processing was too fast
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 1500) {
        await new Promise(resolve => setTimeout(resolve, 1500 - elapsedTime));
      }
      
      setWorkflowResult(result);
      setActiveTab('results');
      
      toast.success("Big Data workflow completed", {
        description: `Processed ${config.dataVolume}GB of data in ${result.processingTime.toFixed(2)}s`
      });
    } catch (error) {
      console.error("Error processing big data workflow:", error);
      toast.error("Processing failed", {
        description: "An error occurred while processing the data workflow"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [config]);
  
  const handleOptimizeConfig = useCallback(() => {
    const optimizedConfig = bigDataWorkflowService.optimizeConfiguration(config, optimizationTarget);
    setConfig(optimizedConfig);
    
    toast.success("Configuration optimized", {
      description: `Optimized for ${optimizationTarget} performance`
    });
  }, [config, optimizationTarget]);
  
  return (
    <Card className="bg-gray-900/50 border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5 text-purple-400" />
          Quantum-Enhanced Big Data Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="config">
              <Layers className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="process">
              <Network className="w-4 h-4 mr-2" />
              Processing
            </TabsTrigger>
            <TabsTrigger value="results">
              <BarChart4 className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Data Volume</span>
                    <span className="text-sm text-white">{config.dataVolume} GB</span>
                  </div>
                  <Slider 
                    value={[config.dataVolume]} 
                    min={10} 
                    max={1000}
                    step={10}
                    onValueChange={(values) => updateConfig('dataVolume', values[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Processing Nodes</span>
                    <span className="text-sm text-white">{config.processingNodes}</span>
                  </div>
                  <Slider 
                    value={[config.processingNodes]} 
                    min={2} 
                    max={32}
                    step={1}
                    onValueChange={(values) => updateConfig('processingNodes', values[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Parallel Streams</span>
                    <span className="text-sm text-white">{config.parallelStreams}</span>
                  </div>
                  <Slider 
                    value={[config.parallelStreams]} 
                    min={4} 
                    max={64}
                    step={2}
                    onValueChange={(values) => updateConfig('parallelStreams', values[0])}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Compression Level</span>
                    <span className="text-sm text-white">{config.compressionLevel}</span>
                  </div>
                  <Slider 
                    value={[config.compressionLevel]} 
                    min={1} 
                    max={9}
                    step={1}
                    onValueChange={(values) => updateConfig('compressionLevel', values[0])}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-300">Quantum Acceleration</span>
                    </div>
                    <Switch 
                      checked={config.useQuantumAcceleration}
                      onCheckedChange={(checked) => updateConfig('useQuantumAcceleration', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-300">Distributed Processing</span>
                    </div>
                    <Switch 
                      checked={config.distributedProcessing}
                      onCheckedChange={(checked) => updateConfig('distributedProcessing', checked)}
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="text-sm text-gray-400 mb-2">Optimization Target</div>
                  <div className="grid grid-cols-4 gap-2">
                    {(['speed', 'efficiency', 'cost', 'balanced'] as const).map((target) => (
                      <Button 
                        key={target}
                        variant={optimizationTarget === target ? "secondary" : "outline"} 
                        size="sm"
                        onClick={() => setOptimizationTarget(target)}
                        className="text-xs"
                      >
                        {target.charAt(0).toUpperCase() + target.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button 
                variant="outline"
                onClick={handleOptimizeConfig}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                <Zap className="w-4 h-4 mr-2" />
                Auto-Optimize
              </Button>
              
              <Button 
                onClick={() => setActiveTab('process')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Network className="w-4 h-4 mr-2" />
                Continue to Processing
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="process" className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/10 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium">Workflow Processing Configuration</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Process {config.dataVolume} GB of data across {config.processingNodes} nodes with {config.parallelStreams} parallel streams
                  </p>
                </div>
                
                <Button 
                  onClick={() => setActiveTab('config')}
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-700 text-gray-400"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-900/40 p-2 rounded">
                  <div className="text-gray-500 mb-1">Quantum Accel.</div>
                  <div className="text-white">{config.useQuantumAcceleration ? 'Enabled' : 'Disabled'}</div>
                </div>
                
                <div className="bg-gray-900/40 p-2 rounded">
                  <div className="text-gray-500 mb-1">Distribution</div>
                  <div className="text-white">{config.distributedProcessing ? 'Distributed' : 'Centralized'}</div>
                </div>
                
                <div className="bg-gray-900/40 p-2 rounded">
                  <div className="text-gray-500 mb-1">Compression</div>
                  <div className="text-white">Level {config.compressionLevel}/9</div>
                </div>
                
                <div className="bg-gray-900/40 p-2 rounded">
                  <div className="text-gray-500 mb-1">Optimization</div>
                  <div className="text-white capitalize">{optimizationTarget}</div>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleProcessData}
                  disabled={isProcessing}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 w-full max-w-md"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing Data...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 mr-2" />
                      Start Big Data Workflow
                    </>
                  )}
                </Button>
              </div>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400 flex justify-between">
                    <span>Processing progress</span>
                    <span>Please wait...</span>
                  </div>
                  <Progress value={45} className="h-1.5" />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="bg-gray-900/40 p-2 rounded">
                      <div className="text-gray-500">Status</div>
                      <div className="text-green-400">Active</div>
                    </div>
                    <div className="bg-gray-900/40 p-2 rounded">
                      <div className="text-gray-500">Estimated Time</div>
                      <div className="text-white">~{(config.dataVolume / (config.processingNodes * 2.5 * (config.useQuantumAcceleration ? 3 : 1))).toFixed(1)}s</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {workflowResult ? (
              <>
                <div className="bg-green-900/20 border border-green-500/30 text-green-300 p-3 rounded-lg text-sm flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-green-400" />
                  Successfully processed {config.dataVolume} GB with {workflowResult.resourceUtilization.toFixed(2) * 100}% resource utilization
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/10 space-y-3">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <BarChart4 className="h-4 w-4 text-purple-400" />
                      Performance Metrics
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div>
                        <div className="text-gray-400">Processing Time</div>
                        <div className="text-white">{workflowResult.processingTime.toFixed(2)}s</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-400">Throughput</div>
                        <div className="text-white">{workflowResult.throughput.toFixed(2)} GB/s</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-400">Energy Efficiency</div>
                        <div className="text-white">{(workflowResult.energyEfficiency * 100).toFixed(1)}%</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-400">Cost Estimate</div>
                        <div className="text-white">${workflowResult.costEstimate.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="text-gray-400 text-sm mb-1">Quantum Advantage</div>
                      <div className="flex items-center gap-2">
                        <Progress value={workflowResult.quantumAdvantageScore * 25} className="h-1.5" />
                        <span className="text-sm text-purple-300">{workflowResult.quantumAdvantageScore.toFixed(1)}x</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/10 space-y-3">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Optimization Suggestions
                    </h3>
                    
                    <ul className="space-y-2">
                      {workflowResult.optimizationSuggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={handleOptimizeConfig}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Apply Suggestions
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('config')}
                    className="border-gray-700 text-gray-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Modify Configuration
                  </Button>
                  
                  <Button 
                    onClick={handleProcessData}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    Run Again
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-gray-400 mb-2">No Results Available</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Process a data workflow to see the results here
                </p>
                <Button 
                  onClick={() => setActiveTab('process')}
                  variant="outline"
                  className="border-gray-700 text-gray-300"
                >
                  Go to Processing
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
