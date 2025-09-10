
import React from 'react';

export function ReleaseScheduleTable() {
  return (
    <div className="bg-black/40 border border-purple-500/20 p-3 rounded-lg">
      <h4 className="text-sm font-medium mb-2">Release Schedule</h4>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400">
            <th className="text-left pb-2">Category</th>
            <th className="text-right pb-2">TGE</th>
            <th className="text-right pb-2">Cliff</th>
            <th className="text-right pb-2">Vesting</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1">Public Sale</td>
            <td className="text-right">25%</td>
            <td className="text-right">None</td>
            <td className="text-right">6 months</td>
          </tr>
          <tr>
            <td className="py-1">Team & Advisors</td>
            <td className="text-right">0%</td>
            <td className="text-right">6 months</td>
            <td className="text-right">18 months</td>
          </tr>
          <tr>
            <td className="py-1">Ecosystem</td>
            <td className="text-right">10%</td>
            <td className="text-right">None</td>
            <td className="text-right">24 months</td>
          </tr>
          <tr>
            <td className="py-1">Treasury</td>
            <td className="text-right">5%</td>
            <td className="text-right">3 months</td>
            <td className="text-right">24 months</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
