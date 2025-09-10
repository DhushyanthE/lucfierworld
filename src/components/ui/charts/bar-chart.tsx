
import React from 'react';
import { ChartProps } from './types';
import { XAxis, YAxis } from './chart-axes';
import { ChartLegend } from './chart-legend';
import { createTooltip, removeTooltip, getValueRange } from './chart-utils';

export function BarChart({ 
  data, 
  categories, 
  colors, 
  valueFormatter = (value) => `${value}`,
  showLegend = true 
}: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  // Get max value for scaling
  const values = data.map(item => item.value);
  const maxValue = Math.max(...values);
  
  // Calculate bar width
  const barWidth = 85 / (data.length * 2); // 85% of width divided by double the number of bars to leave space
  
  return (
    <div className="w-full h-full relative">
      <svg width="100%" height="100%" className="overflow-visible">
        <YAxis minValue={0} range={maxValue} valueFormatter={valueFormatter} />
        <XAxis data={data} />
        
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 80;
          const x = 10 + ((index / (data.length - 0.5)) * 85);
          
          return (
            <g key={index}>
              <rect
                x={`${x - barWidth/2}%`}
                y={`${90 - barHeight}%`}
                width={`${barWidth}%`}
                height={`${barHeight}%`}
                fill={colors[0]}
                rx="2"
                className="hover:opacity-80 transition-opacity"
                onMouseOver={(e) => {
                  createTooltip(item.name, valueFormatter(item.value), e.clientX, e.clientY);
                }}
                onMouseOut={removeTooltip}
              />
              <text 
                x={`${x}%`} 
                y="95%" 
                fontSize="8" 
                fill="#64748b" 
                textAnchor="middle"
              >
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
      
      <ChartLegend categories={categories} colors={colors} showLegend={showLegend} />
    </div>
  );
}
