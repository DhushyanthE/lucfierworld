
import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { CustomTooltip } from "../CustomTooltip";

interface ValueDriver {
  quarter: string;
  educational: number;
  enterprise: number;
  defi: number;
  total: number;
}

interface ValueDriversChartProps {
  data: ValueDriver[];
}

export const ValueDriversChart: React.FC<ValueDriversChartProps> = ({ data }) => {
  return (
    <div>
      <h4 className="text-lg font-medium text-purple-400 mt-6 mb-3 flex items-center">
        <Activity className="mr-2 h-5 w-5" />
        Value Drivers (2025)
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="quarter" tick={{ fill: '#d1d5db' }} />
            <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: '#d1d5db' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone"
              dataKey="educational"
              stackId="1"
              stroke="#8b5cf6"
              fill="#8b5cf6"
            />
            <Area 
              type="monotone"
              dataKey="enterprise"
              stackId="1"
              stroke="#ec4899"
              fill="#ec4899"
            />
            <Area 
              type="monotone"
              dataKey="defi"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
