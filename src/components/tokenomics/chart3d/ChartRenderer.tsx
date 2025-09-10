
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ChartSegment } from './types';
import { lightenColor, darkenColor } from '../utils/colorUtils';

interface ChartRendererProps {
  data: ChartSegment[];
  title: string;
  rotation: number;
  activeSegment: number | null;
  height: number;
}

export const ChartRenderer = forwardRef<HTMLCanvasElement, ChartRendererProps>(({ 
  data,
  title,
  rotation,
  activeSegment,
  height
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Forward the canvas ref to parent component
  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Center of the chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Radius of the chart
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Height of the chart (3D effect)
    const chartHeight = 20;
    
    // Starting angle
    let startAngle = (rotation * Math.PI) / 180;
    
    // Draw each segment
    data.forEach((segment, index) => {
      // Calculate angles
      const segmentValue = segment.value / total;
      const angle = Math.PI * 2 * segmentValue;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;
      
      // Determine if this segment is active (hovered/selected)
      const isActive = activeSegment === index;
      const segmentRadius = isActive ? radius * 1.05 : radius;
      
      // Draw top face
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, segmentRadius, startAngle, endAngle);
      ctx.closePath();
      
      // Fill with gradient for 3D effect
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, segmentRadius
      );
      gradient.addColorStop(0, lightenColor(segment.color, 30));
      gradient.addColorStop(1, segment.color);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw side face for 3D effect (only for segments in the back half)
      if (startAngle < Math.PI) {
        ctx.beginPath();
        ctx.moveTo(
          centerX + segmentRadius * Math.cos(startAngle),
          centerY + segmentRadius * Math.sin(startAngle)
        );
        ctx.lineTo(
          centerX + segmentRadius * Math.cos(startAngle),
          centerY + segmentRadius * Math.sin(startAngle) + chartHeight
        );
        ctx.lineTo(
          centerX + segmentRadius * Math.cos(endAngle),
          centerY + segmentRadius * Math.sin(endAngle) + chartHeight
        );
        ctx.lineTo(
          centerX + segmentRadius * Math.cos(endAngle),
          centerY + segmentRadius * Math.sin(endAngle)
        );
        ctx.closePath();
        
        ctx.fillStyle = darkenColor(segment.color, 20);
        ctx.fill();
      }
      
      // Add label line and text
      if (segmentValue > 0.05) { // Only show labels for segments > 5%
        const labelRadius = segmentRadius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(midAngle);
        const labelY = centerY + labelRadius * Math.sin(midAngle);
        
        ctx.font = isActive ? 'bold 12px Arial' : '10px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${segment.label}`, labelX, labelY);
        
        // Add percentage below
        const percentY = labelY + 14;
        ctx.font = '9px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`${Math.round(segmentValue * 100)}%`, labelX, percentY);
      }
      
      // Update start angle for next segment
      startAngle = endAngle;
    });
    
    // Add title
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, centerX, 16);
    
  }, [data, rotation, activeSegment, title]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
});

ChartRenderer.displayName = 'ChartRenderer';
