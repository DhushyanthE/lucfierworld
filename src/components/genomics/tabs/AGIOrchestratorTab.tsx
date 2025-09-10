
import React from 'react';
import { AGIOrchestrator } from '@/components/genomics/AGIOrchestrator';
import { OrchestratorArchitecture } from '@/components/genomics/sections/OrchestratorArchitecture';

export function AGIOrchestratorTab() {
  return (
    <div className="space-y-6">
      <AGIOrchestrator />
      <OrchestratorArchitecture />
    </div>
  );
}
