
import React from 'react';
import { TokenAllocationChart } from './TokenAllocationChart';
import { TokenAllocationStats } from './TokenAllocationStats';

export function TokenAllocationTab() {
  return (
    <div className="space-y-4">
      <TokenAllocationChart />
      <TokenAllocationStats />
    </div>
  );
}
