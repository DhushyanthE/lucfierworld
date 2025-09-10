
import React from "react";
import { Button } from "@/components/ui/button";
import { Info, Bot, BrainCircuit } from "lucide-react";
import { QuerySuggestion } from "../types";

interface SuggestedQueriesProps {
  suggestions: QuerySuggestion[];
  onSelectQuery: (query: string) => void;
  isLoading: boolean;
}

export const SuggestedQueries: React.FC<SuggestedQueriesProps> = ({
  suggestions,
  onSelectQuery,
  isLoading,
}) => {
  return (
    <div className="px-6 py-3 border-t border-purple-500/20">
      <p className="text-sm text-gray-600 mb-2 flex items-center">
        <BrainCircuit className="w-3 h-3 mr-1" /> QuantumBot suggested queries:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((query, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="bg-gray-100 border-purple-500/30 hover:bg-gray-200 text-gray-800 flex items-center gap-1"
            onClick={() => onSelectQuery(query.text)}
            disabled={isLoading}
          >
            {query.icon}
            <span className="text-xs">{query.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
