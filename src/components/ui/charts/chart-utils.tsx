
import React from 'react';

// Create tooltip element for chart data points
export const createTooltip = (name: string, value: string | number, clientX: number, clientY: number) => {
  const tooltip = document.createElement('div');
  tooltip.className = 'absolute bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none';
  tooltip.style.left = `${clientX}px`;
  tooltip.style.top = `${clientY - 30}px`;
  tooltip.innerHTML = `${name}: ${value}`;
  tooltip.id = 'chart-tooltip';
  document.body.appendChild(tooltip);
};

// Remove tooltip element
export const removeTooltip = () => {
  const tooltip = document.getElementById('chart-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
};

// Calculate chart value range
export const getValueRange = (values: number[]) => {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  
  return { minValue, maxValue, range };
};

// Generate axis ticks
export const generateYAxisTicks = (
  minValue: number, 
  range: number, 
  valueFormatter: (value: number) => string
) => {
  return [0, 25, 50, 75, 100].map((tick) => {
    const yPos = 90 - (tick * 0.8);
    const tickValue = minValue + (tick / 100) * range;
    
    return { tick, yPos, tickValue, formattedValue: valueFormatter(tickValue) };
  });
};
