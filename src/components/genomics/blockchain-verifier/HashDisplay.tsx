
import React from 'react';

interface HashDisplayProps {
  genomicHash: string | null;
}

export function HashDisplay({ genomicHash }: HashDisplayProps) {
  if (!genomicHash) return null;
  
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-300">Genomic Data Hash</h3>
        <div className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded">
          SHA3-256
        </div>
      </div>
      <div className="font-mono text-xs text-gray-500 break-all bg-gray-950/50 p-2 rounded">
        {genomicHash}
      </div>
    </div>
  );
}
