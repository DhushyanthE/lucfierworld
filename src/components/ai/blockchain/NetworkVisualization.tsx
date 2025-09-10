
import React, { useRef, useEffect } from 'react';

interface NetworkNode {
  id: string;
  type: 'miner' | 'validator' | 'full' | 'light';
  connections: string[];
  status: 'active' | 'syncing' | 'inactive';
  isQuantum: boolean;
  performance: number;
  location: { x: number; y: number };
}

interface NetworkVisualizationProps {
  networkNodes: NetworkNode[];
}

export function NetworkVisualization({ networkNodes }: NetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Create a separate ref for animation frame ID that persists between renders
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const parentWidth = canvas.parentElement?.clientWidth || 600;
    canvas.width = parentWidth;
    canvas.height = 200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.lineWidth = 1;

    networkNodes.forEach(node => {
      const sourceX = node.location.x * canvas.width;
      const sourceY = node.location.y * canvas.height;

      node.connections.forEach(targetId => {
        const targetNode = networkNodes.find(n => n.id === targetId);
        if (targetNode) {
          const targetX = targetNode.location.x * canvas.width;
          const targetY = targetNode.location.y * canvas.height;

          ctx.beginPath();
          ctx.moveTo(sourceX, sourceY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    networkNodes.forEach(node => {
      const x = node.location.x * canvas.width;
      const y = node.location.y * canvas.height;
      const radius = node.isQuantum ? 6 : 4;

      // Node color based on status
      let fillColor;
      switch (node.status) {
        case 'active':
          fillColor = node.isQuantum ? '#8b5cf6' : '#22c55e';
          break;
        case 'syncing':
          fillColor = '#eab308';
          break;
        case 'inactive':
          fillColor = '#ef4444';
          break;
        default:
          fillColor = '#6b7280';
      }

      // Draw node
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Draw pulse effect for quantum nodes
      if (node.isQuantum && node.status === 'active') {
        ctx.beginPath();
        ctx.arc(x, y, radius + 3 + Math.sin(Date.now() / 500) * 2, 0, Math.PI * 2, false);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.stroke();
      }
    });

    // Animation loop - defined inside useEffect to avoid invalid hook calls
    const animate = () => {
      // Store the animation frame ID in the ref so we can cancel it later
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Redraw connections with animation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections with animated data flow
      networkNodes.forEach(node => {
        const sourceX = node.location.x * canvas.width;
        const sourceY = node.location.y * canvas.height;

        node.connections.forEach(targetId => {
          const targetNode = networkNodes.find(n => n.id === targetId);
          if (targetNode) {
            const targetX = targetNode.location.x * canvas.width;
            const targetY = targetNode.location.y * canvas.height;

            // Draw line
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
            ctx.moveTo(sourceX, sourceY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();

            // Draw animated data packet if node is active
            if (node.status === 'active' && targetNode.status === 'active' && Math.random() > 0.98) {
              const time = Date.now() / 1000;
              const progress = (time % 2) / 2; // 0 to 1 every 2 seconds
              
              const packetX = sourceX + (targetX - sourceX) * progress;
              const packetY = sourceY + (targetY - sourceY) * progress;
              
              ctx.beginPath();
              ctx.arc(packetX, packetY, 2, 0, Math.PI * 2, false);
              ctx.fillStyle = node.isQuantum ? '#8b5cf6' : '#22c55e';
              ctx.fill();
            }
          }
        });
      });
      
      // Redraw nodes
      networkNodes.forEach(node => {
        const x = node.location.x * canvas.width;
        const y = node.location.y * canvas.height;
        const radius = node.isQuantum ? 6 : 4;
        
        // Pulse effect timing
        const pulseRadius = radius + 3 + Math.sin(Date.now() / 500) * 2;

        // Node color based on status
        let fillColor;
        switch (node.status) {
          case 'active':
            fillColor = node.isQuantum ? '#8b5cf6' : '#22c55e';
            break;
          case 'syncing':
            fillColor = '#eab308';
            break;
          case 'inactive':
            fillColor = '#ef4444';
            break;
          default:
            fillColor = '#6b7280';
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Draw pulse effect for quantum nodes
        if (node.isQuantum && node.status === 'active') {
          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2, false);
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
          ctx.stroke();
        }
      });
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function to cancel animation frame when component unmounts
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [networkNodes]); // Re-run effect when networkNodes change

  return (
    <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Network Visualization</h3>
      <div className="relative">
        <canvas ref={canvasRef} className="w-full h-[200px] rounded" />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/60 rounded px-2 py-1 flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
            <span>Quantum</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            <span>Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
