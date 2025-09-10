
import React from "react";
import { Zap } from "lucide-react";

interface AnalysisFooterProps {
  isLoading: boolean;
  lastUpdated: Date;
}

export function AnalysisFooter({ isLoading, lastUpdated }: AnalysisFooterProps) {
  return (
    <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Zap className="h-3 w-3 text-purple-400" />
        <span>Powered by Quantum AI</span>
      </div>
      <span className="text-xs text-gray-500">
        {isLoading ? "Updating..." : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
      </span>
    </div>
  );
}
