
import React from 'react';
import { DataPoint } from './types';

interface YAxisProps {
  minValue: number;
  range: number;
  valueFormatter: (value: number) => string;
}

export function YAxis({ minValue, range, valueFormatter }: YAxisProps) {
  const ticks = [0, 25, 50, 75, 100];
  
  return (
    <>
      {/* Y-axis line */}
      <line x1="10%" y1="10%" x2="10%" y2="90%" stroke="#334155" strokeWidth="1" />
      
      {/* Y-axis ticks */}
      {ticks.map((tick) => {
        const yPos = 90 - (tick * 0.8);
        const tickValue = minValue + (tick / 100) * range;
        
        return (
          <React.Fragment key={tick}>
            <line 
              x1="8%" 
              y1={`${yPos}%`} 
              x2="10%" 
              y2={`${yPos}%`} 
              stroke="#334155" 
              strokeWidth="1" 
            />
            <text 
              x="7%" 
              y={`${yPos}%`} 
              fontSize="8" 
              fill="#64748b" 
              textAnchor="end" 
              dominantBaseline="middle"
            >
              {valueFormatter(tickValue)}
            </text>
          </React.Fragment>
        );
      })}
    </>
  );
}

interface XAxisProps {
  data: DataPoint[];
}

export function XAxis({ data }: XAxisProps) {
  return (
    <>
      {/* X-axis line */}
      <line x1="10%" y1="90%" x2="95%" y2="90%" stroke="#334155" strokeWidth="1" />
      
      {/* X-axis labels (show first, middle, and last) */}
      {[0, Math.floor(data.length / 2), data.length - 1].map((index) => {
        if (index < data.length) {
          const xPos = 10 + ((index / (data.length - 1)) * 85);
          
          return (
            <text 
              key={index}
              x={`${xPos}%`} 
              y="95%" 
              fontSize="8" 
              fill="#64748b" 
              textAnchor="middle"
            >
              {data[index].name}
            </text>
          );
        }
        return null;
      })}
    </>
  );
}
