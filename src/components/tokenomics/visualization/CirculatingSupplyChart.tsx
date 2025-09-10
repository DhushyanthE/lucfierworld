
import React from 'react';

export function CirculatingSupplyChart() {
  return (
    <div className="bg-black/40 border border-purple-500/20 p-3 rounded-lg">
      <h4 className="text-sm font-medium mb-2">Circulating Supply Growth</h4>
      <div className="h-32 relative">
        {/* Simple line chart showing circulating supply growth */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          
          {/* Growth line */}
          <path 
            d="M0,90 C10,85 20,75 30,65 C40,55 50,45 70,30 C85,20 100,15 100,15" 
            fill="none" 
            stroke="#8b5cf6" 
            strokeWidth="2"
          />
          
          {/* Area under the curve */}
          <path 
            d="M0,90 C10,85 20,75 30,65 C40,55 50,45 70,30 C85,20 100,15 100,15 L100,100 L0,100 Z" 
            fill="url(#purpleGradient)" 
            opacity="0.5"
          />
          
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute top-0 left-0 text-xs text-gray-400">100%</div>
        <div className="absolute top-1/4 left-0 transform -translate-y-1/2 text-xs text-gray-400">75%</div>
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 text-xs text-gray-400">50%</div>
        <div className="absolute top-3/4 left-0 transform -translate-y-1/2 text-xs text-gray-400">25%</div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>TGE</span>
        <span>6M</span>
        <span>12M</span>
        <span>18M</span>
        <span>24M</span>
      </div>
    </div>
  );
}
