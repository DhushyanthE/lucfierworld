
import { Settings } from "lucide-react";
import { useState } from "react";

interface SwapSettingsProps {
  slippage: string;
  setSlippage: (value: string) => void;
  showSettings: boolean;
  setShowSettings: (value: boolean) => void;
}

export function SwapSettings({ slippage, setSlippage, showSettings, setShowSettings }: SwapSettingsProps) {
  return (
    <>
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Settings className="w-5 h-5 text-gray-400" />
      </button>
      
      {showSettings && (
        <div className="mb-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">Slippage Tolerance</label>
            <div className="flex gap-2">
              {["0.1", "0.5", "1.0"].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    slippage === value 
                      ? "bg-purple-600 text-white" 
                      : "bg-white/10 text-gray-400 hover:bg-white/20"
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
