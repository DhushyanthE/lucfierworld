
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CryptoPrice } from "@/services/cryptoApiService";

interface PerformanceChartProps {
  tokens: CryptoPrice[];
}

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

export function PerformanceChart({ tokens }: PerformanceChartProps) {
  const getPerformanceData = () => {
    return tokens.map(token => ({
      name: token.symbol,
      change: token.change24h,
      color: token.change24h >= 0 ? "#4ade80" : "#f87171"
    }));
  };

  return (
    <Card className="bg-gray-900/50 border-purple-500/20 md:col-span-2">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-white mb-4">24h Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getPerformanceData()}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" tick={{ fill: '#d1d5db' }} />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="change" 
                name="24h Change"
                fill="url(#colorGradient)"
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
