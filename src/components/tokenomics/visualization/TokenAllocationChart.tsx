
import React from 'react';

export function TokenAllocationChart() {
  return (
    <div className="rounded-lg bg-black/40 p-4 border border-purple-500/20">
      <h3 className="text-sm font-medium mb-3">Token Allocation</h3>
      <div className="flex mb-4">
        <div className="w-1/2">
          <div className="aspect-square relative">
            {/* Circular chart using SVG */}
            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
              {/* Ecosystem Growth - 30% */}
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="#8b5cf6" strokeWidth="10"
                      strokeDasharray="282.7" strokeDashoffset="0" />
              
              {/* Public Sale - 25% */}
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="#3b82f6" strokeWidth="10"
                      strokeDasharray="282.7" strokeDashoffset="282.7 - 282.7 * 0.3" />
              
              {/* Team & Advisors - 20% */}
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="#10b981" strokeWidth="10"
                      strokeDasharray="282.7" strokeDashoffset="282.7 - 282.7 * 0.55" />
              
              {/* Treasury - 15% */}
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f59e0b" strokeWidth="10"
                      strokeDasharray="282.7" strokeDashoffset="282.7 - 282.7 * 0.75" />
              
              {/* Community Rewards - 10% */}
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="#ef4444" strokeWidth="10"
                      strokeDasharray="282.7" strokeDashoffset="282.7 - 282.7 * 0.9" />
            </svg>
          </div>
        </div>
        <div className="w-1/2 flex flex-col justify-center gap-3">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <div className="text-xs mr-auto">Ecosystem Growth</div>
            <div className="text-xs font-bold">30%</div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <div className="text-xs mr-auto">Public Sale</div>
            <div className="text-xs font-bold">25%</div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <div className="text-xs mr-auto">Team & Advisors</div>
            <div className="text-xs font-bold">20%</div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <div className="text-xs mr-auto">Treasury</div>
            <div className="text-xs font-bold">15%</div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="text-xs mr-auto">Community Rewards</div>
            <div className="text-xs font-bold">10%</div>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Total Supply: 1,000,000,000 QNTM
      </div>
    </div>
  );
}
