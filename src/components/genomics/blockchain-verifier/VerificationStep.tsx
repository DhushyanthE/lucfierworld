
import React from 'react';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

export interface VerificationStepProps {
  number: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  result?: 'success' | 'failed';
}

export function VerificationStep({ number, title, description, status, result }: VerificationStepProps) {
  return (
    <div className="flex items-start gap-3">
      <div 
        className={`
          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
          ${status === 'pending' ? 'bg-gray-800 text-gray-500' : 
            status === 'active' ? 'bg-blue-900/50 text-blue-400 animate-pulse' : 
              result === 'failed' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}
        `}
      >
        {status === 'pending' ? (
          <span className="text-xs">{number}</span>
        ) : status === 'active' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : result === 'failed' ? (
          <XCircle className="h-4 w-4" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
      </div>
      
      <div className="flex-1">
        <h4 className={`text-sm font-medium ${
          status === 'pending' ? 'text-gray-400' : 
          status === 'active' ? 'text-blue-400' : 
          result === 'failed' ? 'text-red-400' : 'text-green-400'
        }`}>
          {title}
        </h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}
