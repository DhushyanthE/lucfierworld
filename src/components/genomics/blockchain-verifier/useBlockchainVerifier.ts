
import { useState } from 'react';
import { toast } from 'sonner';
import { workflowOrchestrator } from '@/services/ai/workflowOrchestrator';
import { AIModelType } from '@/types';

export interface VerificationData {
  hash: string;
  timestamp: string | null;
  confirmations: number;
  integrityScore: number;
  method?: 'standard' | 'quantum';
  quantumDetails?: {
    entanglementScore: number;
    quantumCircuitDepth: number;
    resistanceLevel: 'medium' | 'high';
  };
}

export function useBlockchainVerifier() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>('idle');
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'success' | 'failed'
  >('idle');
  const [verificationData, setVerificationData] = useState<VerificationData>({
    hash: '',
    timestamp: null,
    confirmations: 0,
    integrityScore: 0
  });

  // Add the isVerified computed property
  const isVerified = verificationStatus === 'success';

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startVerification = async (method: 'standard' | 'quantum' = 'standard', modelType: AIModelType = 'gemini') => {
    setIsVerifying(true);
    setVerificationStep('prepare');
    setVerificationStatus('verifying');
    
    try {
      // Configure the workflow orchestrator
      workflowOrchestrator.configure({
        modelType,
        quantumEnabled: method === 'quantum',
        blockchainEnabled: true,
        dataProcessingEnabled: true
      });
      
      // Generate a random hash for demonstration
      const hash = Array(64).fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
      
      setVerificationData({
        hash,
        timestamp: null,
        confirmations: 0,
        integrityScore: 0,
        method
      });
      
      // Step 1: Query blockchain
      setVerificationStep('connect');
      await simulateDelay(method === 'quantum' ? 1800 : 1200);
      
      // Step 2: Verify data integrity
      setVerificationStep('submit');
      await simulateDelay(method === 'quantum' ? 2500 : 1500);
      
      // Step 3: Quantum/Cryptographic verification
      setVerificationStep('verify');
      await simulateDelay(method === 'quantum' ? 3000 : 2000);
      
      // Step 4: Result
      setVerificationStep('complete');
      
      // Set final verification data
      const isSuccessful = Math.random() > 0.15; // Higher success rate
      
      if (isSuccessful) {
        // Quantum verification provides higher integrity scores
        const baseIntegrityScore = method === 'quantum' ? 0.9 : 0.75;
        const integrityVariation = method === 'quantum' ? 0.09 : 0.2;
        const integrityScore = baseIntegrityScore + (Math.random() * integrityVariation);
        
        const verificationResult: VerificationData = {
          hash,
          timestamp: new Date().toISOString(),
          confirmations: Math.floor(Math.random() * 20) + 5,
          integrityScore: integrityScore,
          method
        };
        
        // Add quantum-specific details if using quantum verification
        if (method === 'quantum') {
          verificationResult.quantumDetails = {
            entanglementScore: 0.85 + (Math.random() * 0.15),
            quantumCircuitDepth: Math.floor(Math.random() * 50) + 20,
            resistanceLevel: Math.random() > 0.5 ? 'high' : 'medium'
          };
        }
        
        setVerificationData(verificationResult);
        setVerificationStatus('success');
        
        toast.success(`Genomic data verified on blockchain`, {
          description: `The sequence integrity has been confirmed using ${method} verification with ${modelType.toUpperCase()}`,
        });
      } else {
        setVerificationStatus('failed');
        
        toast.error('Verification failed', {
          description: 'Could not verify genomic sequence integrity',
        });
      }
    } catch (error) {
      setVerificationStep('error');
      setVerificationStatus('failed');
      toast.error('Verification process error', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const resetVerification = () => {
    setVerificationStatus('idle');
    setVerificationStep('idle');
    setVerificationData({
      hash: '',
      timestamp: null,
      confirmations: 0,
      integrityScore: 0
    });
  };

  return {
    isVerifying,
    verificationStep,
    verificationStatus,
    verificationData,
    startVerification,
    resetVerification,
    isVerified // Export the computed property
  };
}
