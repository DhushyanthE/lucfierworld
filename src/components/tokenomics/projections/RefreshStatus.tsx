
import React from "react";
import { RefreshCw } from "lucide-react";

interface RefreshStatusProps {
  isLoading: boolean;
  hasData: boolean;
}

export const RefreshStatus: React.FC<RefreshStatusProps> = ({ isLoading, hasData }) => {
  return (
    <div className="flex items-center gap-2">
      {isLoading && <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />}
      <span className="text-xs text-purple-400">
        {isLoading 
          ? "Updating market data..." 
          : hasData 
            ? `Last updated: ${new Date().toLocaleTimeString()}` 
            : ""}
      </span>
    </div>
  );
};
