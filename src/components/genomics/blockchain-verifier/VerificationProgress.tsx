
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface VerificationProgressProps {
  isVerifying: boolean;
  verificationProgress: number;
}

export function VerificationProgress({ 
  isVerifying,
  verificationProgress 
}: VerificationProgressProps) {
  if (!isVerifying) return null;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>Verification Progress</span>
        <span>{verificationProgress}%</span>
      </div>
      <Progress 
        value={verificationProgress} 
        className="h-2"
      />
    </div>
  );
}
