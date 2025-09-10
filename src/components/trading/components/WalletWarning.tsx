
import React from 'react';
import { AlertCircle } from 'lucide-react';

export function WalletWarning() {
  return (
    <div className="bg-yellow-50 border border-yellow-300/50 rounded-md p-3 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
      <p className="text-sm text-yellow-700">Connect your wallet to use trading features and execute trades.</p>
    </div>
  );
}
