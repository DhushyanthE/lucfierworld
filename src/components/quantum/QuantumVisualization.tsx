
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Activity, Zap, Network } from 'lucide-react';
import { toast } from 'sonner';

interface QuantumVisualizationProps {
  activeMode?: 'quantum' | 'neural' | 'blockchain';
  initialState?: 'stable' | 'processing' | 'entangled';
  showMetrics?: boolean;
}

export function QuantumVisualization({
  activeMode = 'quantum',
  initialState = 'stable',
  showMetrics = true
}: QuantumVisualizationProps) {
  const [quantumState, setQuantumState] = useState<'stable' | 'processing' | 'entangled'>(initialState);
  const [activeTab, setActiveTab] = useState<string>(activeMode);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);

  // Quantum metrics (would be connected to real data in a full implementation)
  const [metrics, setMetrics] = useState({
    coherence: 0.85,
    entanglement: 0.76,
    fidelity: 0.92,
    qubits: 16
  });

  // Initialize the visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match its display size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        const { devicePixelRatio: ratio = 1 } = window;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        ctx.scale(ratio, ratio);
        return true;
      }
      return false;
    };

    resizeCanvas();

    // Handle window resize
    const handleResize = () => {
      if (resizeCanvas()) {
        render();
      }
    };

    window.addEventListener('resize', handleResize);

    // Animation variables
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      color: string;
      connections: number[];
    }> = [];

    // Create particles
    const createParticles = () => {
      particles = [];
      const particleCount = activeTab === 'quantum' ? 50 : 
                           activeTab === 'neural' ? 30 : 20;
      
      const { width, height } = canvas.getBoundingClientRect();

      for (let i = 0; i < particleCount; i++) {
        const particle = {
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 0.5 + 0.1,
          color: getParticleColor(i, particleCount),
          connections: []
        };
        particles.push(particle);
      }

      // Establish connections between particles (for entanglement visualization)
      if (activeTab === 'quantum' && quantumState === 'entangled') {
        for (let i = 0; i < particles.length; i++) {
          const connectionCount = Math.floor(Math.random() * 3) + 1;
          for (let j = 0; j < connectionCount; j++) {
            const targetParticle = Math.floor(Math.random() * particles.length);
            if (targetParticle !== i && !particles[i].connections.includes(targetParticle)) {
              particles[i].connections.push(targetParticle);
            }
          }
        }
      }
    };

    const getParticleColor = (index: number, total: number) => {
      if (activeTab === 'quantum') {
        return `rgba(139, 92, 246, ${0.5 + Math.random() * 0.5})`;
      } else if (activeTab === 'neural') {
        return `rgba(59, 130, 246, ${0.5 + Math.random() * 0.5})`;
      } else {
        return `rgba(6, 182, 212, ${0.5 + Math.random() * 0.5})`;
      }
    };

    // Animation render function
    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw background effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw particles
      particles.forEach((particle, index) => {
        // Move particles
        particle.y += particle.speed;
        if (particle.y > height) {
          particle.y = 0;
          particle.x = Math.random() * width;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Draw connections (for entangled state)
        if (quantumState === 'entangled' && activeTab === 'quantum') {
          particle.connections.forEach(targetIndex => {
            const target = particles[targetIndex];
            const gradient = ctx.createLinearGradient(
              particle.x, particle.y, target.x, target.y
            );
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          });
        }
        
        // Draw neural network connections for neural tab
        if (activeTab === 'neural' && index % 3 === 0) {
          const targetIndex = (index + 5) % particles.length;
          const target = particles[targetIndex];
          
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        
        // Draw blockchain connections for blockchain tab
        if (activeTab === 'blockchain' && index % 5 === 0) {
          for (let i = 1; i <= 3; i++) {
            const targetIndex = (index + i * 3) % particles.length;
            const target = particles[targetIndex];
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      
      // Continue animation loop
      animationFrameId.current = requestAnimationFrame(render);
    };

    // Initialize and start animation
    createParticles();
    animationFrameId.current = requestAnimationFrame(render);

    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      setMetrics(prev => ({
        coherence: Math.min(0.99, prev.coherence + (Math.random() * 0.1 - 0.05)),
        entanglement: Math.min(0.99, prev.entanglement + (Math.random() * 0.1 - 0.05)),
        fidelity: Math.min(0.99, prev.fidelity + (Math.random() * 0.05 - 0.025)),
        qubits: prev.qubits
      }));
    }, 3000);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
      clearInterval(metricsInterval);
    };
  }, [activeTab, quantumState]);

  // Effect to handle tab changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Notify user about tab change
    toast.info(`Switched to ${activeTab} visualization mode`);
    
    // Reset quantum state when switching tabs
    setQuantumState('stable');
  }, [activeTab]);

  // Change quantum state
  const toggleQuantumState = () => {
    const states: Array<'stable' | 'processing' | 'entangled'> = ['stable', 'processing', 'entangled'];
    const currentIndex = states.indexOf(quantumState);
    const nextIndex = (currentIndex + 1) % states.length;
    setQuantumState(states[nextIndex]);
    
    toast.info(`Quantum state changed to ${states[nextIndex]}`);
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-400" />
            Quantum Intelligence Visualization
            <Badge 
              className={`ml-2 ${
                quantumState === 'stable' ? 'bg-green-600' : 
                quantumState === 'processing' ? 'bg-yellow-600' : 
                'bg-purple-600'
              }`}
            >
              {quantumState}
            </Badge>
          </CardTitle>
          <button 
            onClick={toggleQuantumState}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Change State
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="quantum">Quantum</TabsTrigger>
            <TabsTrigger value="neural">Neural</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          </TabsList>
          
          <div className="relative h-64 w-full bg-black/40 rounded-lg overflow-hidden">
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 h-full w-full"
            />
            
            {showMetrics && (
              <div className="absolute bottom-2 right-2 bg-black/50 p-2 rounded text-xs text-gray-300 grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center">
                  <Zap className="h-3 w-3 mr-1 text-purple-400" />
                  <span>Coherence:</span>
                  <span className="ml-auto">{metrics.coherence.toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <Network className="h-3 w-3 mr-1 text-purple-400" />
                  <span>Entanglement:</span>
                  <span className="ml-auto">{metrics.entanglement.toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-3 w-3 mr-1 text-purple-400" />
                  <span>Fidelity:</span>
                  <span className="ml-auto">{metrics.fidelity.toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <BrainCircuit className="h-3 w-3 mr-1 text-purple-400" />
                  <span>Qubits:</span>
                  <span className="ml-auto">{metrics.qubits}</span>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
