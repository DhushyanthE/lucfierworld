
import React from 'react';
import { DataPoint } from './types';
import { createTooltip, removeTooltip } from './chart-utils';

interface ChartPointsProps {
  data: DataPoint[];
  minValue: number;
  range: number;
  color: string;
  valueFormatter: (value: number) => string;
}

export function ChartPoints({ 
  data, 
  minValue, 
  range, 
  color, 
  valueFormatter 
}: ChartPointsProps) {
  return (
    <>
      {data.map((item, index) => {
        const x = 10 + ((index / (data.length - 1)) * 85);
        const y = 90 - ((item.value - minValue) / (range || 1)) * 80;
        
        return (
          <g key={index}>
            <circle
              cx={`${x}%`}
              cy={`${y}%`}
              r="3"
              fill={color}
              stroke="#1e293b"
              strokeWidth="1"
              className="hover:opacity-80 transition-opacity"
            />
            <circle
              cx={`${x}%`}
              cy={`${y}%`}
              r="10"
              fill="transparent"
              className="cursor-pointer"
              onMouseOver={(e) => {
                createTooltip(item.name, valueFormatter(item.value), e.clientX, e.clientY);
              }}
              onMouseOut={removeTooltip}
            />
          </g>
        );
      })}
    </>
  );
}
