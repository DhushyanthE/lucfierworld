
import React from 'react';
import { CheckCircle, Loader2, XCircle, Zap } from 'lucide-react';

interface VerificationStepsProps {
  verificationStep: string;
  verificationStatus: 'idle' | 'verifying' | 'success' | 'failed';
  isVerifying: boolean;
  verificationMethod?: 'standard' | 'quantum';
}

export function VerificationSteps({ 
  verificationStep, 
  verificationStatus,
  isVerifying,
  verificationMethod = 'standard'
}: VerificationStepsProps) {
  const isQuantum = verificationMethod === 'quantum';
  
  return (
    <div className="bg-gray-900/40 rounded-lg p-4">
      <div className="space-y-3">
        <VerificationStep 
          number={1}
          title="Querying Blockchain"
          description="Retrieving genomic data from distributed ledger"
          status={verificationStep === 'prepare' ? 'active' : 
                 (verificationStep === 'connect' || verificationStep === 'submit' || 
                  verificationStep === 'verify' || verificationStep === 'complete') ? 'completed' : 'pending'}
        />
        
        <VerificationStep 
          number={2}
          title="Verifying Data Integrity"
          description="Calculating hash consistency across network"
          status={verificationStep === 'connect' ? 'active' : 
                 (verificationStep === 'submit' || verificationStep === 'verify' || 
                  verificationStep === 'complete') ? 'completed' : 'pending'}
        />
        
        <VerificationStep 
          number={3}
          title={isQuantum ? "Quantum Verification" : "Cryptographic Verification"}
          description={
            isQuantum 
              ? "Applying quantum-resistant validation algorithm" 
              : "Applying standard cryptographic verification"
          }
          status={verificationStep === 'submit' ? 'active' : 
                 (verificationStep === 'verify' || verificationStep === 'complete') ? 'completed' : 'pending'}
          isQuantum={isQuantum}
        />
        
        <VerificationStep 
          number={4}
          title="Verification Result"
          description="Final verification status"
          status={verificationStep === 'verify' || verificationStep === 'complete' ? 'active' : 'pending'}
          result={verificationStatus === 'success' ? 'success' : verificationStatus === 'failed' ? 'failed' : undefined}
        />
      </div>
    </div>
  );
}

interface VerificationStepProps {
  number: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  result?: 'success' | 'failed';
  isQuantum?: boolean;
}

export function VerificationStep({ 
  number, 
  title, 
  description, 
  status, 
  result,
  isQuantum 
}: VerificationStepProps) {
  return (
    <div className="flex items-start gap-3">
      <div 
        className={`
          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
          ${status === 'pending' ? 'bg-gray-800 text-gray-500' : 
            status === 'active' ? 
              isQuantum ? 'bg-purple-900/50 text-purple-400 animate-pulse' : 'bg-blue-900/50 text-blue-400 animate-pulse' : 
              result === 'failed' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}
        `}
      >
        {status === 'pending' ? (
          <span className="text-xs">{number}</span>
        ) : status === 'active' ? (
          isQuantum ? 
            <Zap className="h-3 w-3 animate-pulse" /> : 
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
          status === 'active' ? 
            isQuantum ? 'text-purple-400' : 'text-blue-400' : 
            result === 'failed' ? 'text-red-400' : 'text-green-400'
        }`}>
          {title}
          {isQuantum && status === 'active' && (
            <span className="ml-2 text-xs bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded-full">
              Quantum
            </span>
          )}
        </h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}
