
import React from 'react';
import { Shield } from 'lucide-react';

interface SecurityMetric {
  algorithm: string;
  keySize: number;
  resistanceScore: number;
  isQuantumResistant: boolean;
  qubitEstimate: number;
}

interface SecurityTableProps {
  securityMetrics: SecurityMetric[];
}

export function SecurityTable({ securityMetrics }: SecurityTableProps) {
  return (
    <div className="overflow-x-auto bg-black/30 rounded-lg border border-purple-500/20">
      <table className="min-w-full divide-y divide-gray-800">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Algorithm
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Key Size (bits)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Quantum Resistance
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Estimated Qubits to Crack
            </th>
          </tr>
        </thead>
        <tbody className="bg-black/30 divide-y divide-gray-800">
          {securityMetrics.map((metric, index) => (
            <tr key={index} className="transition-colors hover:bg-purple-900/10">
              <td className="px-4 py-3 text-sm text-gray-300">
                {metric.algorithm}
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">
                {metric.keySize}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        metric.resistanceScore >= 90 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                        metric.resistanceScore >= 75 ? 'bg-gradient-to-r from-blue-600 to-cyan-400' :
                        'bg-gradient-to-r from-amber-600 to-yellow-400'
                      }`}
                      style={{ 
                        width: `${metric.resistanceScore}%`,
                        boxShadow: metric.resistanceScore >= 90 ? '0 0 4px rgba(74, 222, 128, 0.5)' : 'none'
                      }}
                    />
                  </div>
                  <span className="text-gray-300">{metric.resistanceScore.toFixed(0)}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                {metric.isQuantumResistant ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400 flex items-center w-fit gap-1">
                    <Shield className="h-3 w-3" />
                    Quantum Resistant
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-amber-900/30 text-amber-400 flex items-center w-fit gap-1">
                    <Shield className="h-3 w-3" />
                    Vulnerable
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">
                {metric.qubitEstimate.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
