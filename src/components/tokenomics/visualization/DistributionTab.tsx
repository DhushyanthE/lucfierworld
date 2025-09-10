
import React from 'react';
import { DistributionTimeline } from './DistributionTimeline';
import { ReleaseScheduleTable } from './ReleaseScheduleTable';
import { CirculatingSupplyChart } from './CirculatingSupplyChart';

export function DistributionTab() {
  return (
    <div className="space-y-4">
      <DistributionTimeline />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ReleaseScheduleTable />
        <CirculatingSupplyChart />
      </div>
    </div>
  );
}
