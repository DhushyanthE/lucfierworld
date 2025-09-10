
import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export function TokenAllocation() {
  const distributionData = [
    { name: "Presale", value: 10, color: "#8b5cf6" },
    { name: "Ecosystem", value: 20, color: "#6366f1" },
    { name: "Team & Advisors", value: 10, color: "#ec4899" },
    { name: "Foundation", value: 15, color: "#f43f5e" },
    { name: "Community", value: 25, color: "#10b981" },
    { name: "Staking Rewards", value: 20, color: "#14b8a6" },
  ];

  return (
    <Card className="p-6 bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-6">Token Distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-medium text-purple-400 mb-4">Allocation (100,000,000,000 Tokens)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distributionData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                layout="vertical"
              >
                <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#d1d5db' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                  {distributionData.map((entry, index) => (
                    <Bar key={`cell-${index}`} dataKey="value" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-4">Token Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-gray-400 text-sm">Total Supply</div>
                <div className="text-xl font-bold text-white">100,000,000,000</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-sm">Initial Price</div>
                <div className="text-xl font-bold text-white">$0.10</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-sm">Presale Amount</div>
                <div className="text-xl font-bold text-white">10,000,000,000</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-sm">Presale Value</div>
                <div className="text-xl font-bold text-white">$1,000,000,000</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-4">Vesting Schedule</h4>
            <ul className="space-y-2 text-gray-200">
              <li className="flex justify-between">
                <span>Team & Advisors:</span>
                <span>4-year vesting, 1-year cliff</span>
              </li>
              <li className="flex justify-between">
                <span>Ecosystem:</span>
                <span>Scheduled quarterly release</span>
              </li>
              <li className="flex justify-between">
                <span>Foundation:</span>
                <span>5-year vesting</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
