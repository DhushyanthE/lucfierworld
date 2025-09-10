
import React, { useState, useEffect, useRef } from 'react';
import { ChartSegment } from './types';
import { ChartRenderer } from './ChartRenderer';

interface ChartInteractionHandlerProps {
  data: ChartSegment[];
  title: string;
  height: number;
  rotationSpeed: number;
}

export function ChartInteractionHandler({
  data,
  title,
  height,
  rotationSpeed
}: ChartInteractionHandlerProps) {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Animation
  useEffect(() => {
    const animate = () => {
      if (!isHovered) {
        setRotation(prev => (prev + rotationSpeed) % 360);
      }
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isHovered, rotationSpeed]);

  // Handle mouse events for interactivity
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calculate distance from center
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // If within the chart radius
    if (dist <= radius) {
      // Calculate angle
      let angle = Math.atan2(y - centerY, x - centerX);
      if (angle < 0) angle += Math.PI * 2;
      
      // Adjust for rotation
      angle = (angle - (rotation * Math.PI) / 180 + Math.PI * 2) % (Math.PI * 2);
      
      // Calculate total
      const total = data.reduce((sum, item) => sum + item.value, 0);
      
      // Find which segment this angle corresponds to
      let currentAngle = 0;
      for (let i = 0; i < data.length; i++) {
        const segmentAngle = (data[i].value / total) * Math.PI * 2;
        currentAngle += segmentAngle;
        
        if (angle <= currentAngle) {
          setActiveSegment(i);
          return;
        }
      }
    } else {
      setActiveSegment(null);
    }
  };
  
  return (
    <div 
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setActiveSegment(null); }}
    >
      <ChartRenderer 
        data={data} 
        title={title} 
        rotation={rotation} 
        activeSegment={activeSegment}
        height={height}
        ref={canvasRef}
      />
    </div>
  );
}
