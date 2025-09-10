import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Network, 
  Cpu, 
  Eye, 
  Target,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Activity,
  Layers
} from 'lucide-react';

interface NeuralNode {
  id: string;
  x: number;
  y: number;
  layer: number;
  activation: number;
  type: 'input' | 'hidden' | 'quantum' | 'output';
  quantumState?: 'superposition' | 'entangled' | 'collapsed';
}

interface NeuralConnection {
  from: string;
  to: string;
  weight: number;
  quantumStrength: number;
}

interface TechnologyFunction {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'processing' | 'completed';
  progress: number;
  description: string;
  icon: React.ReactNode;
  quantumEnhanced: boolean;
}

export function QuantumNeuralNetworkFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [nodes, setNodes] = useState<NeuralNode[]>([]);
  const [connections, setConnections] = useState<NeuralConnection[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  
  const [technologyFunctions] = useState<TechnologyFunction[]>([
    {
      id: 'quantum-superposition',
      name: 'Quantum Superposition',
      status: 'idle',
      progress: 0,
      description: 'Neurons exist in multiple states simultaneously',
      icon: <Layers className="h-4 w-4" />,
      quantumEnhanced: true
    },
    {
      id: 'quantum-entanglement',
      name: 'Quantum Entanglement',
      status: 'idle',
      progress: 0,
      description: 'Instantaneous correlation between distant neurons',
      icon: <Network className="h-4 w-4" />,
      quantumEnhanced: true
    },
    {
      id: 'neural-plasticity',
      name: 'Neural Plasticity',
      status: 'idle',
      progress: 0,
      description: 'Dynamic weight adjustment and learning',
      icon: <Brain className="h-4 w-4" />,
      quantumEnhanced: false
    },
    {
      id: 'quantum-tunneling',
      name: 'Quantum Tunneling',
      status: 'idle',
      progress: 0,
      description: 'Information bypass through quantum barriers',
      icon: <Zap className="h-4 w-4" />,
      quantumEnhanced: true
    },
    {
      id: 'coherence-control',
      name: 'Coherence Control',
      status: 'idle',
      progress: 0,
      description: 'Maintaining quantum states during computation',
      icon: <Target className="h-4 w-4" />,
      quantumEnhanced: true
    },
    {
      id: 'pattern-recognition',
      name: 'Pattern Recognition',
      status: 'idle',
      progress: 0,
      description: 'Advanced pattern detection and classification',
      icon: <Eye className="h-4 w-4" />,
      quantumEnhanced: false
    }
  ]);

  // Initialize neural network structure
  useEffect(() => {
    const newNodes: NeuralNode[] = [];
    const newConnections: NeuralConnection[] = [];

    // Create layers
    const layers = [
      { count: 4, type: 'input' as const },
      { count: 6, type: 'hidden' as const },
      { count: 6, type: 'quantum' as const },
      { count: 4, type: 'hidden' as const },
      { count: 2, type: 'output' as const }
    ];

    let nodeId = 0;
    layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        newNodes.push({
          id: `node-${nodeId++}`,
          x: (layerIndex + 1) * 120,
          y: 50 + (i * 60) + (120 - layer.count * 30),
          layer: layerIndex,
          activation: Math.random(),
          type: layer.type,
          quantumState: layer.type === 'quantum' ? 'superposition' : undefined
        });
      }
    });

    // Create connections between adjacent layers
    for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
      const currentLayerNodes = newNodes.filter(n => n.layer === layerIndex);
      const nextLayerNodes = newNodes.filter(n => n.layer === layerIndex + 1);

      currentLayerNodes.forEach(fromNode => {
        nextLayerNodes.forEach(toNode => {
          newConnections.push({
            from: fromNode.id,
            to: toNode.id,
            weight: Math.random() * 2 - 1, // -1 to 1
            quantumStrength: toNode.type === 'quantum' ? Math.random() : 0
          });
        });
      });
    }

    setNodes(newNodes);
    setConnections(newConnections);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          activation: Math.max(0, Math.min(1, node.activation + (Math.random() - 0.5) * 0.3)),
          quantumState: node.type === 'quantum' 
            ? (['superposition', 'entangled', 'collapsed'] as const)[Math.floor(Math.random() * 3)]
            : node.quantumState
        }))
      );

      setCurrentStep(prev => (prev + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (!fromNode || !toNode) return;

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      
      // Connection styling based on quantum strength
      if (conn.quantumStrength > 0) {
        ctx.strokeStyle = `hsl(270, 70%, ${50 + conn.quantumStrength * 30}%)`;
        ctx.lineWidth = 1 + conn.quantumStrength * 2;
      } else {
        ctx.strokeStyle = `hsl(200, 30%, ${30 + Math.abs(conn.weight) * 40}%)`;
        ctx.lineWidth = Math.abs(conn.weight);
      }
      
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8 + node.activation * 4, 0, Math.PI * 2);

      // Node styling based on type and state
      switch (node.type) {
        case 'input':
          ctx.fillStyle = `hsl(120, 70%, ${40 + node.activation * 40}%)`;
          break;
        case 'hidden':
          ctx.fillStyle = `hsl(200, 60%, ${35 + node.activation * 45}%)`;
          break;
        case 'quantum':
          if (node.quantumState === 'superposition') {
            ctx.fillStyle = `hsl(270, 80%, ${50 + node.activation * 30}%)`;
          } else if (node.quantumState === 'entangled') {
            ctx.fillStyle = `hsl(300, 90%, ${60 + node.activation * 25}%)`;
          } else {
            ctx.fillStyle = `hsl(240, 70%, ${45 + node.activation * 35}%)`;
          }
          break;
        case 'output':
          ctx.fillStyle = `hsl(30, 80%, ${45 + node.activation * 40}%)`;
          break;
      }

      ctx.fill();

      // Add quantum glow effect for quantum nodes
      if (node.type === 'quantum') {
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10 + node.activation * 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }, [nodes, connections]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    // Reset nodes to initial state
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        activation: Math.random(),
        quantumState: node.type === 'quantum' ? 'superposition' : node.quantumState
      }))
    );
  };

  const handleFunctionSelect = (functionId: string) => {
    setSelectedFunction(selectedFunction === functionId ? null : functionId);
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            Quantum Neural Network Flow
            <Badge variant="outline" className="ml-2 bg-purple-900/40 text-purple-300 border-purple-500/30">
              {isRunning ? 'Active' : 'Idle'}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartStop}
              className="bg-purple-900/30 border-purple-500/30 text-purple-300 hover:bg-purple-900/50"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="bg-gray-900/30 border-gray-700 text-gray-400 hover:bg-gray-800/50"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-900/30 border-blue-700 text-blue-400 hover:bg-blue-800/50"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isRunning && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Processing Step: {currentStep}</span>
              <span className="text-sm text-gray-400">Quantum Coherence</span>
            </div>
            <Progress value={(currentStep % 10) * 10} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Neural Network Visualization Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-80 bg-black/40 border border-gray-700 rounded-lg"
          />
          
          {/* Layer Labels */}
          <div className="absolute top-2 left-0 right-0 flex justify-around text-xs text-gray-400">
            <span>Input</span>
            <span>Hidden</span>
            <span>Quantum</span>
            <span>Hidden</span>
            <span>Output</span>
          </div>
        </div>

        {/* Technology Functions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Technology Functions</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {technologyFunctions.map(func => (
              <Card
                key={func.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedFunction === func.id
                    ? 'bg-purple-900/40 border-purple-500/50'
                    : 'bg-gray-900/40 border-gray-700/50 hover:border-gray-600/50'
                }`}
                onClick={() => handleFunctionSelect(func.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {func.icon}
                    <span className="text-sm font-medium text-white">{func.name}</span>
                    {func.quantumEnhanced && (
                      <Zap className="h-3 w-3 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{func.description}</p>
                  
                  {selectedFunction === func.id && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-300">Status: {func.status}</span>
                        <span className="text-xs text-gray-400">{func.progress}%</span>
                      </div>
                      <Progress value={func.progress} className="h-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Function Keys */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-gray-200">Function Keys</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-green-900/30 border-green-700 text-green-400 hover:bg-green-800/50"
            >
              F1: Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-900/30 border-blue-700 text-blue-400 hover:bg-blue-800/50"
            >
              F2: Quantum
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-purple-900/30 border-purple-700 text-purple-400 hover:bg-purple-800/50"
            >
              F3: Entangle
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-orange-900/30 border-orange-700 text-orange-400 hover:bg-orange-800/50"
            >
              F4: Analyze
            </Button>
          </div>
        </div>

        {/* Status Information */}
        <div className="pt-4 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
            <div>
              <span className="text-gray-300">Nodes:</span> {nodes.length}
            </div>
            <div>
              <span className="text-gray-300">Connections:</span> {connections.length}
            </div>
            <div>
              <span className="text-gray-300">Quantum Nodes:</span> {nodes.filter(n => n.type === 'quantum').length}
            </div>
            <div>
              <span className="text-gray-300">Processing:</span> {isRunning ? 'Active' : 'Idle'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}