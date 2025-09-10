
import React from 'react';

export function TokenAllocationStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-black/40 border border-purple-500/20 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Max Supply</div>
        <div className="text-lg font-semibold">1B QNTM</div>
        <div className="text-xs text-gray-400">Fixed cap</div>
      </div>
      <div className="bg-black/40 border border-purple-500/20 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Initial Circulating</div>
        <div className="text-lg font-semibold">250M QNTM</div>
        <div className="text-xs text-gray-400">25% of supply</div>
      </div>
      <div className="bg-black/40 border border-purple-500/20 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Initial Market Cap</div>
        <div className="text-lg font-semibold">$25M</div>
        <div className="text-xs text-gray-400">At $0.10 per token</div>
      </div>
    </div>
  );
}
