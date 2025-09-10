
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomTooltip } from "../CustomTooltip";

interface PriceProjection {
  year: string;
  price: number;
  marketCap: string;
  roi: string;
}

interface PriceProjectionsChartProps {
  projections: PriceProjection[];
  timeframe: string;
  onTimeframeChange: (value: string) => void;
}

export const PriceProjectionsChart: React.FC<PriceProjectionsChartProps> = ({
  projections,
  timeframe,
  onTimeframeChange
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-purple-400 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Price Projections
        </h4>
        <Tabs defaultValue="7year" value={timeframe} onValueChange={onTimeframeChange} className="w-auto">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="1year" className="data-[state=active]:bg-purple-600 text-xs">
              1 Year
            </TabsTrigger>
            <TabsTrigger value="7year" className="data-[state=active]:bg-purple-600 text-xs">
              7 Years
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={projections}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="year" tick={{ fill: '#d1d5db' }} />
            <YAxis 
              tickFormatter={(value) => `$${value}`} 
              tick={{ fill: '#d1d5db' }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 6 }}
              activeDot={{ fill: '#a78bfa', r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
