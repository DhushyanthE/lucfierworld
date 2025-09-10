
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { MarketStats } from "@/services/cryptoApiService";

interface MarketCapDistributionProps {
  marketStats: MarketStats | null;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#6b7280'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-2 border border-gray-700 rounded-md shadow-lg text-sm">
        <p className="text-white">{payload[0].name}</p>
        <p className="text-gray-300">{`${payload[0].value.toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};

export function MarketCapDistribution({ marketStats }: MarketCapDistributionProps) {
  const getDominanceData = () => {
    if (!marketStats) return [];

    return [
      { name: 'BTC', value: marketStats.btcDominance },
      { name: 'ETH', value: marketStats.ethDominance },
      { name: 'Others', value: 100 - marketStats.btcDominance - marketStats.ethDominance }
    ];
  };

  return (
    <Card className="bg-gray-900/50 border-purple-500/20">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-white mb-4">Market Cap Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getDominanceData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getDominanceData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
