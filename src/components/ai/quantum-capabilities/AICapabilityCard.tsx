
import React from 'react';
import { Brain, Cpu, Zap, Network, ShieldCheck, Database } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AICapabilityProps {
  capability: {
    id: string;
    name?: string;
    description?: string;
    probabilityOfSuccess?: number;
    powerLevel?: number;
  };
  type: 'agi' | 'super';
}

export function AICapabilityCard({ capability, type }: AICapabilityProps) {
  // Function to get an icon based on capability name
  const getCapabilityIcon = (name: string | undefined) => {
    // Add null check to prevent error when name is undefined
    if (!name) {
      return <Zap className="h-4 w-4 text-orange-400" />; // Default icon
    }
    
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('neural') || lowerName.includes('learning')) {
      return <Brain className="h-4 w-4 text-blue-400" />;
    } else if (lowerName.includes('quantum')) {
      return <Cpu className="h-4 w-4 text-purple-400" />;
    } else if (lowerName.includes('pattern') || lowerName.includes('recognition')) {
      return <Network className="h-4 w-4 text-green-400" />;
    } else if (lowerName.includes('blockchain') || lowerName.includes('security')) {
      return <ShieldCheck className="h-4 w-4 text-yellow-400" />;
    } else if (lowerName.includes('data') || lowerName.includes('knowledge')) {
      return <Database className="h-4 w-4 text-teal-400" />;
    } else {
      return <Zap className="h-4 w-4 text-orange-400" />;
    }
  };

  // Helper function to safely format numbers with toFixed
  const safeToFixed = (value: any, decimals: number = 2) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return Number(value).toFixed(decimals);
  };

  return (
    <div className="flex items-start gap-3 bg-gray-900/40 p-3 rounded-lg border border-blue-500/10">
      {getCapabilityIcon(capability.name)}
      <div>
        <h4 className="text-sm font-medium">{capability.name}</h4>
        <p className="text-xs text-gray-400 mt-1">{capability.description}</p>
        <div className="flex items-center gap-2 mt-2">
          {type === 'agi' ? (
            <>
              <div className="text-xs text-gray-500">Success Rate:</div>
              <Progress value={(capability.probabilityOfSuccess || 0) * 100} className="h-1 flex-1" />
              <div className="text-xs text-gray-300">{Math.round((capability.probabilityOfSuccess || 0) * 100)}%</div>
            </>
          ) : (
            <>
              <div className="text-xs text-gray-500">Power Level:</div>
              <Progress 
                value={(capability.powerLevel || 0) * 10} 
                className="h-1 flex-1 bg-gray-800" 
              />
              <div className="text-xs text-gray-300">{safeToFixed(capability.powerLevel || 0, 1)}/10</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
