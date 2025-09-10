import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Network, Zap, Cpu, Activity, Loader2, ShieldAlert, LineChart, Share2, BrainCircuit } from "lucide-react";

interface QuantumNeuralNetworkProps {
  tokenSymbol: string;
}

interface NeuralLayer {
  id: string;
  name: string;
  nodes: number;
  activation: string;
  status: "active" | "learning" | "idle";
}

interface TrainingMetric {
  epoch: number;
  loss: number;
  accuracy: number;
  timestamp: Date;
}

export function QuantumNeuralNetwork({ tokenSymbol }: QuantumNeuralNetworkProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [currentMode, setCurrentMode] = useState<"inference" | "training">("inference");
  const [networkLayers, setNetworkLayers] = useState<NeuralLayer[]>([]);
  const [learningRate, setLearningRate] = useState(0.001);
  const [epochs, setEpochs] = useState(100);
  const [batchSize, setBatchSize] = useState(32);
  const [isQuantumEnabled, setIsQuantumEnabled] = useState(true);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetric[]>([]);
  const [modelAccuracy, setModelAccuracy] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  useEffect(() => {
    // Initialize neural network layers
    setNetworkLayers([
      { id: "input", name: "Input Layer", nodes: 24, activation: "none", status: "active" },
      { id: "hidden1", name: "Hidden Layer 1", nodes: 64, activation: "relu", status: "active" },
      { id: "hidden2", name: "Hidden Layer 2", nodes: 32, activation: "relu", status: "active" },
      { id: "quantum", name: "Quantum Layer", nodes: 16, activation: "quantum", status: "active" },
      { id: "output", name: "Output Layer", nodes: 4, activation: "softmax", status: "active" },
    ]);
    
    // Generate initial metrics
    generateRandomTrainingMetrics();
    
    // Initialize neural network visualization
    if (canvasRef.current) {
      initializeVisualization();
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const initializeVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      if (!canvas || !ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw network
      drawNeuralNetwork(ctx, canvas.width, canvas.height);
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
  };

  const drawNeuralNetwork = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const networkWidth = width * 0.9;
    const networkHeight = height * 0.8;
    const startX = (width - networkWidth) / 2;
    const startY = (height - networkHeight) / 2;
    
    // Draw layers
    networkLayers.forEach((layer, layerIndex) => {
      const layerX = startX + (layerIndex * (networkWidth / (networkLayers.length - 1)));
      
      // Draw nodes in this layer
      const nodesInLayer = Math.min(layer.nodes, 10); // Limit visual nodes for clarity
      
      for (let i = 0; i < nodesInLayer; i++) {
        const nodeY = startY + (i * (networkHeight / (nodesInLayer - 1)));
        const nodeRadius = 5;
        
        // Node color based on layer type and status
        let nodeColor = "#8b5cf6";
        if (layer.id === "quantum") {
          nodeColor = "#3b82f6";
        } else if (layer.status === "learning") {
          nodeColor = "#ef4444";
        }
        
        // Draw node
        ctx.beginPath();
        ctx.arc(layerX, nodeY, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        
        // Draw connections to next layer if not the last layer
        if (layerIndex < networkLayers.length - 1) {
          const nextLayer = networkLayers[layerIndex + 1];
          const nextLayerX = startX + ((layerIndex + 1) * (networkWidth / (networkLayers.length - 1)));
          const nextNodesInLayer = Math.min(nextLayer.nodes, 10);
          
          // For a cleaner visual, only draw some connections
          const connectionsPerNode = 3;
          
          for (let j = 0; j < connectionsPerNode; j++) {
            const targetNodeIndex = Math.floor(Math.random() * nextNodesInLayer);
            const targetNodeY = startY + (targetNodeIndex * (networkHeight / (nextNodesInLayer - 1)));
            
            // Draw connection with pulse effect based on animation frame
            const pulseOffset = (Date.now() % 3000) / 3000;
            const pulsePosition = (pulseOffset + (i / nodesInLayer)) % 1;
            
            const gradient = ctx.createLinearGradient(layerX, nodeY, nextLayerX, targetNodeY);
            gradient.addColorStop(Math.max(0, pulsePosition - 0.1), "rgba(139, 92, 246, 0.1)");
            gradient.addColorStop(pulsePosition, "rgba(139, 92, 246, 0.8)");
            gradient.addColorStop(Math.min(1, pulsePosition + 0.1), "rgba(139, 92, 246, 0.1)");
            
            ctx.beginPath();
            ctx.moveTo(layerX, nodeY);
            ctx.lineTo(nextLayerX, targetNodeY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      
      // Draw layer label
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(layer.name, layerX, startY + networkHeight + 20);
    });
  };

  const generateRandomTrainingMetrics = () => {
    const newMetrics: TrainingMetric[] = [];
    let previousLoss = 0.8;
    let previousAccuracy = 0.2;
    
    for (let i = 0; i < 40; i++) {
      // Simulate decreasing loss
      const lossDecrement = 0.01 + (Math.random() * 0.02);
      const loss = Math.max(0.05, previousLoss - lossDecrement);
      
      // Simulate increasing accuracy
      const accuracyIncrement = 0.01 + (Math.random() * 0.02);
      const accuracy = Math.min(0.99, previousAccuracy + accuracyIncrement);
      
      newMetrics.push({
        epoch: i + 1,
        loss,
        accuracy,
        timestamp: new Date(Date.now() - (40 - i) * 60000)
      });
      
      previousLoss = loss;
      previousAccuracy = accuracy;
    }
    
    setTrainingMetrics(newMetrics);
    setModelAccuracy(newMetrics[newMetrics.length - 1].accuracy);
  };

  const toggleTraining = () => {
    setIsTraining(!isTraining);
    
    if (!isTraining) {
      toast.info("Neural network training initiated", {
        description: `Training ${tokenSymbol} prediction model with ${epochs} epochs and ${batchSize} batch size.`,
        duration: 3000
      });
      
      // Simulate training process
      const trainingInterval = setInterval(() => {
        setNetworkLayers(layers => 
          layers.map(layer => ({
            ...layer,
            status: Math.random() > 0.7 ? "learning" : "active"
          }))
        );
      }, 800);
      
      // Complete training after a delay
      setTimeout(() => {
        clearInterval(trainingInterval);
        setIsTraining(false);
        
        // Reset all layers to active
        setNetworkLayers(layers => 
          layers.map(layer => ({
            ...layer,
            status: "active"
          }))
        );
        
        // Generate new metrics to show improvement
        generateRandomTrainingMetrics();
        
        toast.success("Neural network training completed", {
          description: `Model accuracy improved to ${(modelAccuracy * 100).toFixed(2)}%`,
          duration: 5000
        });
      }, 5000);
    }
  };

  return (
    <Card className="w-full bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-purple-400" />
          <span>Quantum Neural Network for {tokenSymbol}</span>
          {isQuantumEnabled && (
            <Badge className="bg-blue-600 ml-2">Quantum Enhanced</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="visualization" className="flex-1">
              <Brain className="h-4 w-4 mr-2" /> Network Visualization
            </TabsTrigger>
            <TabsTrigger value="training" className="flex-1">
              <Activity className="h-4 w-4 mr-2" /> Training Metrics
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex-1">
              <Cpu className="h-4 w-4 mr-2" /> Model Parameters
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualization" className="space-y-4">
            <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">Neural Network Architecture</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Quantum Mode</span>
                    <Switch 
                      checked={isQuantumEnabled} 
                      onCheckedChange={setIsQuantumEnabled} 
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                  <div>
                    <Badge variant={isTraining ? "destructive" : "outline"}>
                      {isTraining ? (
                        <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Training</>
                      ) : (
                        <><Zap className="h-3 w-3 mr-1" /> Ready</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={400} 
                  className="w-full h-96 border border-gray-800 rounded-md"
                />
              </div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                {networkLayers.map(layer => (
                  <div 
                    key={layer.id} 
                    className={`bg-gray-900/50 p-3 rounded-md border ${
                      layer.status === "learning" 
                        ? "border-red-500 animate-pulse" 
                        : layer.id === "quantum" 
                        ? "border-blue-500" 
                        : "border-purple-500/30"
                    }`}
                  >
                    <div className="text-xs text-gray-400">{layer.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{layer.nodes} nodes</span>
                      <Badge variant="secondary" className="text-xs">
                        {layer.activation}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4">
            <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">Training Performance</span>
                </div>
                <div>
                  <button
                    onClick={toggleTraining}
                    disabled={isTraining}
                    className={`px-3 py-1.5 rounded-md text-sm ${
                      isTraining
                        ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isTraining ? (
                      <><Loader2 className="h-3 w-3 inline animate-spin mr-1" /> Training...</>
                    ) : (
                      "Train Model"
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900/50 p-4 rounded-md border border-purple-500/30">
                  <div className="text-xs text-gray-400 mb-1">Current Model Accuracy</div>
                  <div className="text-2xl font-bold text-white">{(modelAccuracy * 100).toFixed(2)}%</div>
                  <div className="h-2 w-full bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full" 
                      style={{ width: `${modelAccuracy * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-md border border-purple-500/30">
                  <div className="text-xs text-gray-400 mb-1">Loss Function</div>
                  <div className="text-2xl font-bold text-white">
                    {trainingMetrics.length > 0 ? trainingMetrics[trainingMetrics.length - 1].loss.toFixed(4) : "0.0000"}
                  </div>
                  <div className="h-2 w-full bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ 
                        width: `${100 - (trainingMetrics.length > 0 ? trainingMetrics[trainingMetrics.length - 1].loss * 100 : 0)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-md border border-purple-500/30 h-64">
                <div className="text-xs text-gray-400 mb-2">Training History</div>
                {/* Chart would be rendered here in a real implementation */}
                <div className="h-full w-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Activity className="h-16 w-16 mx-auto mb-2 text-purple-500/50" />
                    <p>Chart visualization would render here</p>
                    <p className="text-xs text-gray-600">Last updated: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="parameters" className="space-y-4">
            <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">Model Hyperparameters</span>
                </div>
                <div>
                  <Badge variant="outline" className="bg-gray-800">
                    {currentMode === "inference" ? "Inference Mode" : "Training Mode"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Learning Rate</label>
                    <span className="text-sm text-white">{learningRate}</span>
                  </div>
                  <Slider 
                    value={[learningRate * 1000]} 
                    min={1} 
                    max={100} 
                    step={1} 
                    onValueChange={(vals) => setLearningRate(vals[0] / 1000)} 
                    disabled={isTraining}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Epochs</label>
                    <span className="text-sm text-white">{epochs}</span>
                  </div>
                  <Slider 
                    value={[epochs]} 
                    min={10} 
                    max={500} 
                    step={5} 
                    onValueChange={(vals) => setEpochs(vals[0])} 
                    disabled={isTraining}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Batch Size</label>
                    <span className="text-sm text-white">{batchSize}</span>
                  </div>
                  <Slider 
                    value={[batchSize]} 
                    min={8} 
                    max={128} 
                    step={8} 
                    onValueChange={(vals) => setBatchSize(vals[0])} 
                    disabled={isTraining}
                    className="w-full"
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Advanced Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-gray-400">Quantum Resistance</span>
                      </div>
                      <Switch checked={true} disabled className="data-[state=checked]:bg-purple-600" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-gray-400">Distributed Training</span>
                      </div>
                      <Switch checked={false} disabled />
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
