
import React from 'react';
import { ChartProps } from './types';
import { XAxis, YAxis } from './chart-axes';
import { ChartLine } from './chart-line';
import { ChartPoints } from './chart-points';
import { ChartLegend } from './chart-legend';
import { getValueRange } from './chart-utils';

export function LineChart({ 
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

  // Get min and max values for scaling
  const values = data.map(item => item.value);
  const { minValue, range } = getValueRange(values);
  
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <svg width="100%" height="100%" className="overflow-visible">
        <YAxis minValue={minValue} range={range} valueFormatter={valueFormatter} />
        <XAxis data={data} />
        
        <ChartLine 
          data={data} 
          minValue={minValue} 
          range={range} 
          color={colors[0]} 
          showArea={false} 
        />
        
        <ChartPoints 
          data={data} 
          minValue={minValue} 
          range={range} 
          color={colors[0]}
          valueFormatter={valueFormatter}
        />
      </svg>
      
      <ChartLegend categories={categories} colors={colors} showLegend={showLegend} />
    </div>
  );
}
