
import React, { useRef, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';

interface QuantumCanvasProps {
  activeTab: string;
  quantumState: 'stable' | 'processing' | 'entangled';
}

export function QuantumCanvas({ activeTab = 'quantum', quantumState = 'stable' }: QuantumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Function to draw a particle
    function drawParticle(x: number, y: number, radius: number, color: string) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Function to create a random color
    function getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    // Draw multiple particles
    const numberOfParticles = 50;
    for (let i = 0; i < numberOfParticles; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 3 + 1;
      const color = getRandomColor();
      drawParticle(x, y, radius, color);
    }

    // Draw lines between particles (entanglement simulation)
    for (let i = 0; i < numberOfParticles; i++) {
      for (let j = i + 1; j < numberOfParticles; j++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = Math.random() * width;
        const y2 = Math.random() * height;

        // Draw a line between the particles
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();
      }
    }
  }, [activeTab, quantumState]);
  
  // Ensure activeTab is always a string
  const safeActiveTab = typeof activeTab === 'string' ? activeTab : 'quantum';
  
  // Instead of mapping through tabs and creating separate TabsContent components,
  // we'll create a single content that conditionally renders based on the active tab
  return (
    <TabsContent value={safeActiveTab} className="mt-0">
      <div className="relative h-64 w-full bg-black/40 rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
          {`${safeActiveTab.charAt(0).toUpperCase() + safeActiveTab.slice(1)} Visualization - ${quantumState}`}
        </div>
      </div>
    </TabsContent>
  );
}
