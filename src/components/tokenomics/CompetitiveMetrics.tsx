
import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export function CompetitiveMetrics() {
  const performanceData = [
    { name: "QuantumCoin", tps: 10000, color: "#8b5cf6" },
    { name: "Ripple", tps: 1500, color: "#6366f1" },
    { name: "Ethereum", tps: 30, color: "#ec4899" },
    { name: "Solana", tps: 65000, color: "#14b8a6" },
  ];

  const energyData = [
    { name: "Bitcoin", value: 1147, viewValue: "1147 kWh/tx", color: "#f43f5e" },
    { name: "Ethereum", value: 0.03, viewValue: "0.03 kWh/tx", color: "#ec4899" },
    { name: "Ripple", value: 0.01, viewValue: "0.01 kWh/tx", color: "#6366f1" },
    { name: "QuantumCoin", value: 0.01, viewValue: "0.01 kWh/tx", color: "#8b5cf6" },
    { name: "Solana", value: 0.0006, viewValue: "0.0006 kWh/tx", color: "#14b8a6" },
  ];

  return (
    <Card className="p-6 bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-6">Competitive Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-medium text-purple-400 mb-4">Transactions Per Second</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <XAxis dataKey="name" tick={{ fill: '#d1d5db' }} />
                <YAxis tickFormatter={(value) => `${value} TPS`} tick={{ fill: '#d1d5db' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tps" radius={[4, 4, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Bar key={`perf-${index}`} dataKey="tps" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-purple-400 mb-4">Energy Usage (kWh/tx)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={energyData.filter(d => d.name !== "Bitcoin")} // Bitcoin value skews the chart
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <XAxis dataKey="name" tick={{ fill: '#d1d5db' }} />
                <YAxis tickFormatter={(value) => `${value}`} tick={{ fill: '#d1d5db' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {energyData.map((entry, index) => (
                    <Bar key={`energy-${index}`} dataKey="value" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <p>* Bitcoin (1147 kWh/tx) is not shown to scale</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-6">
        <div>
          <h4 className="text-lg font-medium text-purple-400 mb-4">Quantum AI Technology Stack</h4>
          <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-medium mb-2">Frontend Technologies</h5>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Next.js for server-side rendering
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    React.js for interactive UI components
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    15 languages internationalization support
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-medium mb-2">Backend Infrastructure</h5>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Express.js for API communications
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Ether.js for blockchain interactions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Hardhat for blockchain development
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-medium mb-2">Smart Contract Technologies</h5>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Solidity for EVM-compatible contracts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Vyper for Python-based contracts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Solana integration for high throughput
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-medium mb-2">Security Innovations</h5>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Custom quantum-resistant SHA256 algorithm
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Advanced multi-signature authorization
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Quantum entropy for enhanced randomization
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
