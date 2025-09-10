
import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FailureResultProps {
  onRetry: () => void;
}

export function FailureResult({ onRetry }: FailureResultProps) {
  return (
    <div className="bg-red-900/20 rounded-lg p-4 border border-red-900/30">
      <div className="flex items-center gap-2 mb-2">
        <XCircle className="h-5 w-5 text-red-500" />
        <h3 className="text-sm font-medium text-red-400">Verification Failed</h3>
      </div>
      <p className="text-xs text-gray-400">
        The genomic data could not be verified on the blockchain. This could be due to data tampering,
        network issues, or invalid sequence data.
      </p>
      <div className="mt-3 flex justify-end">
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry Verification
        </Button>
      </div>
    </div>
  );
}
