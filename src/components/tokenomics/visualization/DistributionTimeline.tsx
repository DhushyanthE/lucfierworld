
import React from 'react';

export function DistributionTimeline() {
  return (
    <div className="rounded-lg bg-black/40 p-4 border border-purple-500/20">
      <h3 className="text-sm font-medium mb-3">Token Distribution Schedule</h3>
      <div className="h-64 relative">
        {/* Timeline visualization */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Timeline axis */}
          <div className="absolute bottom-0 w-full h-0.5 bg-gray-600"></div>
          
          {/* Timeline markers */}
          {['TGE', 'Month 3', 'Month 6', 'Month 12', 'Month 18', 'Month 24'].map((label, index) => (
            <div key={index} className="absolute bottom-0 transform -translate-x-1/2" 
                 style={{ left: `${index * 20}%` }}>
              <div className="h-2 w-0.5 bg-gray-600"></div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
          
          {/* Distribution curves */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Public Sale release at TGE */}
            <path d="M0,100 L0,75 L100,75 L100,100" fill="rgba(59, 130, 246, 0.3)" />
            
            {/* Ecosystem Growth gradual release */}
            <path d="M0,100 L0,75 C20,75 40,65 60,45 C80,25 100,10 100,10 L100,100" 
                  fill="rgba(139, 92, 246, 0.3)" />
            
            {/* Team & Advisors with cliff and vesting */}
            <path d="M0,100 L0,100 L20,100 L20,80 C40,80 60,65 80,65 L100,65 L100,100" 
                  fill="rgba(16, 185, 129, 0.3)" />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <div>Public Sale</div>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <div>Ecosystem Growth</div>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <div>Team & Advisors</div>
        </div>
      </div>
    </div>
  );
}
