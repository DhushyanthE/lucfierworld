
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface VerificationData {
  hash: string;
  timestamp: string | null;
  confirmations: number;
  integrityScore: number;
}

interface SuccessResultProps {
  verificationData: VerificationData;
}

export function SuccessResult({ verificationData }: SuccessResultProps) {
  return (
    <div className="bg-gray-900/40 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-medium text-green-400 flex items-center gap-2">
        <CheckCircle className="h-4 w-4" />
        Verification Successful
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs text-gray-400">Blockchain Hash</div>
          <div className="font-mono text-xs bg-black/30 p-2 rounded-md break-all text-gray-300">
            {verificationData.hash}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-400">Timestamp</div>
              <div className="text-xs text-white">
                {verificationData.timestamp && new Date(verificationData.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-400">Confirmations</div>
              <div className="text-xs text-white">
                {verificationData.confirmations}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-400 mb-1">Integrity Score</div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all"
                  style={{ 
                    width: `${verificationData.integrityScore * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs text-white">
                {(verificationData.integrityScore * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
