
import React from "react";

export function StatsIndicators() {
  return (
    <div className="absolute top-full mt-12 left-0 w-full flex justify-start gap-8 animate-fade-in" style={{animationDelay: '0.6s'}}>
      <div className="px-6 py-3 rounded-full bg-black/40 border border-purple-500/20 backdrop-blur-sm flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-sm text-gray-200">100,000+ TPS</span>
      </div>
      <div className="px-6 py-3 rounded-full bg-black/40 border border-purple-500/20 backdrop-blur-sm flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-sm text-gray-200">Quantum Secure</span>
      </div>
      <div className="px-6 py-3 rounded-full bg-black/40 border border-purple-500/20 backdrop-blur-sm flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
        <span className="text-sm text-gray-200">Energy Efficient</span>
      </div>
    </div>
  );
}
