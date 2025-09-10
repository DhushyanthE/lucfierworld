
import React from 'react';
import { DataPoint } from './types';

interface ChartLineProps {
  data: DataPoint[];
  minValue: number;
  range: number;
  color: string;
  showArea?: boolean;
}

export function ChartLine({ 
  data, 
  minValue, 
  range, 
  color, 
  showArea = true 
}: ChartLineProps) {
  // Generate points for the line
  const linePoints = data.map((item, index) => {
    const x = 10 + ((index / (data.length - 1)) * 85);
    const y = 90 - ((item.value - minValue) / (range || 1)) * 80;
    return `${x}%,${y}%`;
  }).join(' ');
  
  return (
    <>
      {/* Area under the line */}
      {showArea && (
        <>
          <polygon 
            points={`10%,90% ${data.map((item, index) => {
              const x = 10 + ((index / (data.length - 1)) * 85);
              const y = 90 - ((item.value - minValue) / (range || 1)) * 80;
              return `${x}%,${y}%`;
            }).join(' ')} 95%,90%`}
            fill={`url(#gradient-${color.replace('#', '')})`}
            opacity="0.2"
          />
          
          {/* Create gradient for area */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </>
      )}
      
      {/* Line */}
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}
