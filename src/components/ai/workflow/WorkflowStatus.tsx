
import React from 'react';
import { AlertCircle, Check, Clock, Zap, Brain } from 'lucide-react';

interface WorkflowStatusProps {
  isRunning: boolean;
  lastExecutionTime: Date | null;
  currentStep?: string;
  errors: string[];
  quantumEntanglement: number;
  neuralNetworkAccuracy: number;
  agiSynthesisLevel?: number;
  superintelligenceScore?: number;
}

export function WorkflowStatus({
  isRunning,
  lastExecutionTime,
  currentStep,
  errors,
  quantumEntanglement,
  neuralNetworkAccuracy,
  agiSynthesisLevel = 0,
  superintelligenceScore = 0
}: WorkflowStatusProps) {
  return (
    <div className="space-y-3">
      {/* Status section */}
      <div className="bg-black/40 rounded-md border border-gray-800 p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${isRunning ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium">
              {isRunning ? 'Running' : 'Ready'}
            </span>
          </div>
          
          {currentStep && isRunning && (
            <div className="text-sm">
              <span className="text-gray-400">Processing: </span>
              <span className="text-gray-300">{currentStep}</span>
            </div>
          )}
          
          {lastExecutionTime && (
            <div className="text-sm flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
              <span className="text-gray-400">Last run: </span>
              <span className="text-gray-300 ml-1">
                {lastExecutionTime.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Errors section */}
      {errors.length > 0 && (
        <div className="bg-red-950/30 rounded-md border border-red-800/50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-300">Workflow validation errors</span>
          </div>
          <ul className="text-xs text-red-300 space-y-1 ml-6 list-disc">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Quantum entanglement */}
        <div className="bg-black/40 rounded-md border border-gray-800 p-3">
          <div className="text-xs text-gray-400 mb-1">Quantum Entanglement</div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-purple-500" 
                style={{ width: `${quantumEntanglement}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium">
              {quantumEntanglement}%
            </span>
          </div>
        </div>
        
        {/* Neural network accuracy */}
        <div className="bg-black/40 rounded-md border border-gray-800 p-3">
          <div className="text-xs text-gray-400 mb-1">Neural Network Accuracy</div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-blue-500" 
                style={{ width: `${neuralNetworkAccuracy}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium">
              {neuralNetworkAccuracy}%
            </span>
          </div>
        </div>
        
        {/* AGI Synthesis Level */}
        <div className="bg-black/40 rounded-md border border-gray-800 p-3">
          <div className="text-xs text-gray-400 mb-1 flex items-center">
            <Brain className="h-3 w-3 mr-1 text-indigo-400" />
            AGI Synthesis Level
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-indigo-500" 
                style={{ width: `${agiSynthesisLevel}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium">
              {agiSynthesisLevel}%
            </span>
          </div>
        </div>
        
        {/* Superintelligence Score */}
        <div className="bg-black/40 rounded-md border border-gray-800 p-3">
          <div className="text-xs text-gray-400 mb-1 flex items-center">
            <Zap className="h-3 w-3 mr-1 text-yellow-400" />
            Superintelligence Score
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-yellow-500 to-orange-500" 
                style={{ width: `${superintelligenceScore}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium">
              {superintelligenceScore}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
