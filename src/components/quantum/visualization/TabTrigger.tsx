
import React from 'react';
import { TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Network } from 'lucide-react';

interface TabTriggerProps {
  value: string;
}

export function TabTrigger({ value }: TabTriggerProps) {
  // Ensure value is a string before calling toLowerCase()
  const safeValue = typeof value === 'string' ? value : '';
  
  const getTabLabel = (val: string) => {
    switch (val.toLowerCase()) {
      case 'quantum':
        return 'Quantum';
      case 'neural':
        return 'Neural Network';
      case 'blockchain':
        return 'Blockchain';
      default:
        return val;
    }
  };

  const getTabIcon = (val: string) => {
    switch (val.toLowerCase()) {
      case 'quantum':
        return <Activity className="h-4 w-4 mr-2" />;
      case 'neural':
        return <Network className="h-4 w-4 mr-2" />;
      case 'blockchain':
        return <BarChart3 className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <TabsTrigger value={value} className="data-[state=active]:bg-purple-600 text-xs sm:text-sm">
      {getTabIcon(safeValue)}
      {getTabLabel(safeValue)}
    </TabsTrigger>
  );
}
