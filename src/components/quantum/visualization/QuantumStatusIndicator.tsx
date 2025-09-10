
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface QuantumStatusIndicatorProps {
  state: 'stable' | 'processing' | 'entangled';
}

export function QuantumStatusIndicator({ state }: QuantumStatusIndicatorProps) {
  const getStatusColor = () => {
    switch (state) {
      case 'stable': return 'bg-green-700';
      case 'processing': return 'bg-blue-700';
      case 'entangled': return 'bg-purple-700';
    }
  };
  
  const getStatusLabel = () => {
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  return (
    <Badge className={`ml-2 ${getStatusColor()}`}>
      {getStatusLabel()}
    </Badge>
  );
}
