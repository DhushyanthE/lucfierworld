
import React from 'react';
import { Lock, Zap } from 'lucide-react';

export function SmartContractProtection() {
  return (
    <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-medium">Smart Contract Vesting Protection</h3>
      </div>
      <p className="text-xs text-gray-300">
        All token vesting schedules are enforced by quantum-resistant smart contracts, ensuring
        that the distribution follows exactly as described. Token releases are automated and immutable, 
        providing transparency and trust for all token holders.
      </p>
      <div className="flex items-center gap-1 mt-3 text-xs text-purple-300">
        <Zap className="h-3 w-3" />
        <span>Contract audited by QuantumShield and ChainSafe</span>
      </div>
    </div>
  );
}
