
import React from 'react';
import { Card } from '@/components/ui/card';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  complexity: number | string;
  layers: number[];
}

interface ModelSelectorProps {
  models: ModelOption[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

export function ModelSelector({ models, selectedModel, onModelSelect }: ModelSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Select Model Architecture</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-black/40 p-2 rounded-md border border-gray-800">
        {models.map((model) => (
          <Card
            key={model.id}
            className={`p-3 cursor-pointer bg-gray-900/50 border ${
              selectedModel === model.id
                ? "border-purple-500"
                : "border-gray-800"
            } hover:border-purple-500/50 transition-colors`}
            onClick={() => onModelSelect(model.id)}
          >
            <h4 className="text-sm font-medium">
              {model.name}{" "}
              <span className="text-xs text-gray-400">({model.layers}L)</span>
            </h4>
            <div className="mt-2 flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-full rounded-full ${
                    typeof model.complexity === 'number' 
                      ? (i < model.complexity ? "bg-purple-500" : "bg-gray-700")
                      : (i < parseInt(model.complexity as string) ? "bg-purple-500" : "bg-gray-700")
                  }`}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
