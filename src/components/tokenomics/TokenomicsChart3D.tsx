
import React from 'react';
import { ChartInteractionHandler } from './chart3d/ChartInteractionHandler';
import { TokenChartProps } from './chart3d/types';

export function TokenomicsChart3D({ 
  data,
  title,
  height = 200,
  rotationSpeed = 0.5
}: TokenChartProps) {
  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <ChartInteractionHandler 
        data={data}
        title={title}
        height={height}
        rotationSpeed={rotationSpeed}
      />
    </div>
  );
}
