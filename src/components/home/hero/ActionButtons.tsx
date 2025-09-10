
import React from "react";
import { ArrowRight } from "lucide-react";

interface ActionButtonsProps {
  onTrySwap: () => void;
}

export function ActionButtons({ onTrySwap }: ActionButtonsProps) {
  return (
    <div className="flex gap-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
      <button className="quantum-button px-8 py-4 rounded-lg text-white font-medium flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-purple-700/20 hover:shadow-purple-700/40 group">
        Technical Whitepaper 
        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
      <button 
        onClick={onTrySwap}
        className="px-8 py-4 rounded-lg text-white font-medium bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 shadow-lg shadow-purple-900/5 hover:shadow-purple-900/20"
      >
        Try QuantumSwap
      </button>
    </div>
  );
}
