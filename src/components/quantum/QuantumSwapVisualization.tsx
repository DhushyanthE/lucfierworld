
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Zap, Activity, Atom, Shield } from 'lucide-react';

interface SwapParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
  entangled: boolean;
  processing: boolean;
}

export function QuantumSwapVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<SwapParticle[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapProgress, setSwapProgress] = useState(0);
  const [quantumSecurity, setQuantumSecurity] = useState(96.7);
  const requestRef = useRef<number>();
  const progressTimerRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    initializeParticles();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      animate();
    }
    
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [particles]);

  const initializeParticles = () => {
    const newParticles: SwapParticle[] = [];
    const count = 40;
    
    for (let i = 0; i < count; i++) {
      const entangled = Math.random() > 0.7;
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        color: i < count / 2 ? 
          `rgba(139, 92, 246, ${Math.random() * 0.5 + 0.5})` : 
          `rgba(14, 165, 233, ${Math.random() * 0.5 + 0.5})`,
        speed: Math.random() * 0.3 + 0.1,
        angle: Math.random() * Math.PI * 2,
        entangled,
        processing: false
      });
    }
    
    setParticles(newParticles);
  };

  const animate = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles
    const updatedParticles = particles.map(particle => {
      // Calculate positions in percentage to actual pixels
      const x = (particle.x / 100) * canvas.width;
      const y = (particle.y / 100) * canvas.height;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = isSwapping && particle.processing ? 
        'rgba(16, 185, 129, 0.8)' : // Green during swap
        particle.color;
      ctx.fill();
      
      // Add glow effect
      if (isSwapping && particle.processing) {
        ctx.beginPath();
        ctx.arc(x, y, particle.size + 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.fill();
      }
      
      // Draw connection lines between entangled particles if not swapping
      if (particle.entangled && !isSwapping) {
        const partner = particles.find(p => 
          p.entangled && 
          p.id !== particle.id && 
          p.color !== particle.color
        );
        
        if (partner) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            (partner.x / 100) * canvas.width, 
            (partner.y / 100) * canvas.height
          );
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      
      // Update position
      const newX = particle.x + Math.cos(particle.angle) * particle.speed;
      const newY = particle.y + Math.sin(particle.angle) * particle.speed;
      
      // Bounce off walls
      let newAngle = particle.angle;
      if (newX < 0 || newX > 100) {
        newAngle = Math.PI - newAngle;
      }
      if (newY < 0 || newY > 100) {
        newAngle = -newAngle;
      }
      
      return {
        ...particle,
        x: newX < 0 ? 0 : newX > 100 ? 100 : newX,
        y: newY < 0 ? 0 : newY > 100 ? 100 : newY,
        angle: newAngle
      };
    });
    
    setParticles(updatedParticles);
    
    // Draw swap beam in the middle if swapping
    if (isSwapping) {
      const centerX = canvas.width / 2;
      const beamWidth = 15;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(
        centerX - beamWidth / 2, 0, 
        centerX + beamWidth / 2, 0
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.7)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      
      // Draw beam
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - beamWidth / 2, 0, beamWidth, canvas.height);
    }
    
    requestRef.current = requestAnimationFrame(animate);
  };

  const handleSwap = () => {
    if (isSwapping) return;
    
    setIsSwapping(true);
    setSwapProgress(0);
    
    // Mark random particles as processing
    setParticles(prev => 
      prev.map(p => ({
        ...p,
        processing: Math.random() > 0.3
      }))
    );
    
    // Start progress timer
    progressTimerRef.current = setInterval(() => {
      setSwapProgress(prev => {
        const nextProgress = prev + (Math.random() * 3 + 1);
        if (nextProgress >= 100) {
          completeSwap();
          return 100;
        }
        return nextProgress;
      });
    }, 100);
  };
  
  const completeSwap = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    
    // Swap particle colors
    setParticles(prev => 
      prev.map(p => ({
        ...p,
        color: p.color.includes('139, 92, 246') ?
          p.color.replace('139, 92, 246', '14, 165, 233') :
          p.color.replace('14, 165, 233', '139, 92, 246'),
        processing: false
      }))
    );
    
    setIsSwapping(false);
    setQuantumSecurity(prev => Math.min(Math.max(prev + (Math.random() * 2 - 1), 90), 99.9));
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-white gap-2">
            <ArrowRightLeft className="h-5 w-5 text-purple-400" />
            Quantum Swap Protocol
            <Badge variant="outline" className="ml-2 bg-purple-900/30 text-purple-300">
              v2.1.0
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full h-56 bg-black/40 rounded-lg overflow-hidden border border-purple-500/20">
          <canvas ref={canvasRef} className="w-full h-full" />
          
          {isSwapping && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-black/70 px-4 py-2 rounded-lg">
                <div className="text-center text-sm font-medium text-white mb-2">
                  Quantum Swap in Progress
                </div>
                <div className="h-1.5 w-48 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
                    style={{ width: `${swapProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 text-center mt-1">
                  {Math.round(swapProgress)}% Complete
                </div>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 right-2">
            <div className="text-xs text-gray-400 bg-black/70 px-2 py-1 rounded flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-purple-400" />
              <span>Security: {quantumSecurity.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/50 p-3 rounded-lg border border-purple-500/20 flex flex-col items-center justify-center">
            <Zap className="h-5 w-5 text-purple-400 mb-1" />
            <div className="text-sm font-medium text-white">Quantum-Secured</div>
            <div className="text-xs text-gray-400">256-bit encryption</div>
          </div>
          
          <div className="bg-black/50 p-3 rounded-lg border border-purple-500/20 flex flex-col items-center justify-center">
            <Activity className="h-5 w-5 text-purple-400 mb-1" />
            <div className="text-sm font-medium text-white">Low Latency</div>
            <div className="text-xs text-gray-400">{"<"}42ms execution</div>
          </div>
          
          <div className="bg-black/50 p-3 rounded-lg border border-purple-500/20 flex flex-col items-center justify-center">
            <Atom className="h-5 w-5 text-purple-400 mb-1" />
            <div className="text-sm font-medium text-white">Entanglement</div>
            <div className="text-xs text-gray-400">99.2% fidelity</div>
          </div>
        </div>
        
        <Button 
          onClick={handleSwap} 
          disabled={isSwapping}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isSwapping ? (
            <>
              <Activity className="mr-2 h-4 w-4 animate-pulse" />
              Processing Quantum Swap...
            </>
          ) : (
            <>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Execute Quantum Swap
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
