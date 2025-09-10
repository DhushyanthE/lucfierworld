
import React from 'react';

type VestingItem = {
  name: string;
  color: string;
  tgePercent: number;
  cliff: string;
  vesting: string;
};

interface VestingSchedulesProps {
  items: VestingItem[];
}

export function VestingSchedules({ items }: VestingSchedulesProps) {
  return (
    <div className="rounded-lg bg-black/40 p-4 border border-purple-500/20">
      <h3 className="text-sm font-medium mb-3">Vesting Schedules by Category</h3>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-${item.color}-500 mr-2`}></div>
                <h4 className="text-sm">{item.name}</h4>
              </div>
              <div className={`text-xs text-${item.color}-400`}>{item.tgePercent}% at TGE</div>
            </div>
            <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-${item.color}-500`} 
                style={{ width: `${item.tgePercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>TGE unlock: {item.tgePercent}%</span>
              {item.cliff !== "None" && <span>Cliff: {item.cliff}</span>}
              <span>Linear vesting: {item.vesting}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <div className="font-medium text-gray-300 mb-1">Vesting Notes:</div>
        <ul className="list-disc list-inside space-y-1">
          <li>All vesting is linear unless otherwise specified</li>
          <li>Team tokens have a 6-month cliff before vesting begins</li>
          <li>Ecosystem tokens will be deployed according to community roadmap</li>
          <li>Treasury funds controlled by DAO governance after 12 months</li>
        </ul>
      </div>
    </div>
  );
}
