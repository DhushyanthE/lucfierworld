
import React from 'react';

interface AnalysisDisplayProps {
  analysis: string;
}

export function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  return (
    <div className="mt-4 p-4 bg-white rounded-md border border-gray-200 shadow-sm">
      <h3 className="text-gray-800 font-medium mb-2">Analysis:</h3>
      <p className="text-gray-600 text-sm whitespace-pre-line">{analysis}</p>
    </div>
  );
}
