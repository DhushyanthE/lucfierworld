
import React from 'react';
import { MarinerWorkflowProgress } from '@/services/realtime/ProjectMarinerRealtimeService';

interface MarinerProgressDisplayProps {
  realtimeProgress: MarinerWorkflowProgress;
}

export function MarinerProgressDisplay({ realtimeProgress }: MarinerProgressDisplayProps) {
  return (
    <div className="p-3 rounded-md bg-blue-900/20 border border-blue-500/30">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-blue-300">
          Current Step: {realtimeProgress.currentStep}
        </span>
        <span className="text-sm text-blue-400">
          {realtimeProgress.progress.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(realtimeProgress.progress, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>Data Collected: {realtimeProgress.dataCollected}</span>
        <span>ETA: {new Date(realtimeProgress.estimatedCompletion).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
