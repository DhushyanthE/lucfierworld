
import React from 'react';
import { Ship } from 'lucide-react';

interface MarinerIdleStateProps {
  shouldShow: boolean;
}

export function MarinerIdleState({ shouldShow }: MarinerIdleStateProps) {
  if (!shouldShow) return null;

  return (
    <div className="text-center p-6 text-gray-400">
      <Ship className="h-16 w-16 mx-auto mb-4 text-blue-500/30" />
      <p>Project Mariner workflow is ready to launch.</p>
      <p className="text-sm mt-2">Click the "Launch Workflow" button to start the deep ocean exploration process.</p>
    </div>
  );
}
