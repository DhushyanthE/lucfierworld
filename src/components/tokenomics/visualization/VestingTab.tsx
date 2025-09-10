
import React from 'react';
import { VestingSchedules } from './VestingSchedules';
import { SmartContractProtection } from './SmartContractProtection';

export function VestingTab() {
  const vestingItems = [
    {
      name: "Public Sale",
      color: "blue",
      tgePercent: 25,
      cliff: "None",
      vesting: "6 months"
    },
    {
      name: "Team & Advisors",
      color: "green",
      tgePercent: 0,
      cliff: "6 months",
      vesting: "18 months"
    },
    {
      name: "Ecosystem Growth",
      color: "purple",
      tgePercent: 10,
      cliff: "None",
      vesting: "24 months"
    },
    {
      name: "Treasury",
      color: "amber",
      tgePercent: 5,
      cliff: "3 months",
      vesting: "24 months"
    }
  ];

  return (
    <div className="space-y-4">
      <VestingSchedules items={vestingItems} />
      <SmartContractProtection />
    </div>
  );
}
