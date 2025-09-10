
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface VerificationControlProps {
  verificationStatus: 'idle' | 'verifying' | 'success' | 'failed';
  onStartVerification: () => void;
  onResetVerification: () => void;
}

export function VerificationControl({ 
  verificationStatus, 
  onStartVerification, 
  onResetVerification 
}: VerificationControlProps) {
  return (
    <div className="bg-gray-900/60 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-300">Quantum-Resistant Verification</h3>
        <p className="text-xs text-gray-400">
          Verify genomic data integrity using quantum-secured blockchain
        </p>
      </div>
      
      {verificationStatus === 'idle' && (
        <Button
          onClick={onStartVerification}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Start Verification
        </Button>
      )}
      
      {verificationStatus === 'verifying' && (
        <Button disabled className="bg-purple-700 text-white">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        </Button>
      )}
      
      {(verificationStatus === 'success' || verificationStatus === 'failed') && (
        <Button
          onClick={onResetVerification}
          variant="outline"
        >
          New Verification
        </Button>
      )}
    </div>
  );
}
