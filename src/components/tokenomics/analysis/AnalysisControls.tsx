
import React from "react";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

interface AnalysisControlsProps {
  isLoading: boolean;
  currentPrice: number | null;
  priceChange: number;
  neuralNetworkActive: boolean;
  onRefresh: () => void;
  onToggleNeuralNetwork: () => void;
}

export function AnalysisControls({
  isLoading,
  currentPrice,
  priceChange,
  neuralNetworkActive,
  onRefresh,
  onToggleNeuralNetwork,
}: AnalysisControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleNeuralNetwork}
        className={`px-3 py-1 rounded-full text-white text-sm flex items-center gap-1 ${
          neuralNetworkActive ? 'bg-green-600/80 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
        } transition-colors`}
        title={neuralNetworkActive ? "Neural network active" : "Neural network inactive"}
      >
        <Activity className="h-3.5 w-3.5" />
        ANN {neuralNetworkActive ? "On" : "Off"}
      </button>
      
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="bg-purple-500/80 hover:bg-purple-600 transition-colors px-3 py-1 rounded-full text-white text-sm flex items-center gap-1"
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Refresh
      </button>
      <div className="flex items-center bg-gray-800/60 rounded-full px-3 py-1">
        <Logo iconType="gem" size={5} interactive={false} />
        <span className="text-white font-medium mx-1">QNTM:</span>
        {currentPrice ? (
          <span className="text-white">${currentPrice.toFixed(4)}</span>
        ) : (
          <span className="text-gray-400">Loading...</span>
        )}
        {priceChange !== 0 && (
          <span className={`ml-2 text-xs ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
            {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}
