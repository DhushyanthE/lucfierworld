
import React from 'react';
import { Brain, Zap } from 'lucide-react';
import { AICapabilityCard } from './AICapabilityCard';

interface CapabilitiesSectionProps {
  title: string;
  icon: 'brain' | 'zap';
  capabilities: any[];
  type: 'agi' | 'super';
}

export function CapabilitiesSection({ title, icon, capabilities, type }: CapabilitiesSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3 flex items-center">
        {icon === 'brain' ? (
          <Brain className="h-4 w-4 mr-2 text-blue-400" />
        ) : (
          <Zap className="h-4 w-4 mr-2 text-yellow-400" />
        )}
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {capabilities.slice(0, 4).map((capability) => (
          <AICapabilityCard 
            key={capability.id} 
            capability={capability} 
            type={type} 
          />
        ))}
      </div>
    </div>
  );
}
