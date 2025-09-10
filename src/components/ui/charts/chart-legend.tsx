
import React from 'react';

interface ChartLegendProps {
  categories: string[];
  colors: string[];
  showLegend: boolean;
}

export function ChartLegend({ categories, colors, showLegend }: ChartLegendProps) {
  if (!showLegend) {
    return null;
  }
  
  return (
    <div className="absolute bottom-0 right-0 flex items-center gap-2">
      <div className="w-3 h-3" style={{ backgroundColor: colors[0] }}></div>
      <span className="text-xs text-gray-400">{categories[0]}</span>
    </div>
  );
}
