
import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 p-2 border border-purple-500/30 rounded">
        <p className="text-white text-sm">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};
