
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Network } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Fingerprint } from 'lucide-react';
import { useBlockchainVerifier } from './blockchain-verifier/useBlockchainVerifier';
import { RealTimeWorkflowOptimizer } from '@/components/ai/workflow-optimizer/RealTimeWorkflowOptimizer';
import { VerificationTab } from './blockchain-verifier/VerificationTab';
import { QuantumHashTab } from './blockchain-verifier/QuantumHashTab';

export function BlockchainVerifier() {
  // State for the demo
  const [activeTab, setActiveTab] = useState('verification');
  const [genomicHash, setGenomicHash] = useState<string | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [entanglementScore, setEntanglementScore] = useState(0);
  
  // Use the blockchain verifier hook
  const { 
    isVerifying, 
    verificationStep,
    verificationStatus, 
    verificationData,
    startVerification, 
    resetVerification 
  } = useBlockchainVerifier();

  // Generate a sample genomic hash for visualization
  useEffect(() => {
    // Generate a random hash
    const hash = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    setGenomicHash(hash);
  }, []);
  
  // Update verification progress based on step
  useEffect(() => {
    if (!isVerifying) {
      return;
    }
    
    // Map steps to progress percentages
    const progressMap: Record<string, number> = {
      prepare: 10,
      connect: 30,
      submit: 50,
      verify: 75,
      complete: 100,
      error: 100
    };
    
    // Use string comparison since verificationStep is now a string
    setVerificationProgress(progressMap[verificationStep] || 0);
    
    // Update entanglement score if verification is successful
    if (verificationStep === 'complete' && verificationStatus === 'success') {
      setEntanglementScore((Math.random() * 0.2) + 0.8); // 0.8 to 1.0
    }
  }, [verificationStep, isVerifying, verificationStatus]);

  // Handle verification start
  const handleStartVerification = () => {
    resetVerification();
    startVerification();
    toast.info("Starting blockchain verification process");
  };

  // Handle generating new hash and starting verification
  const handleGenerateNewHash = () => {
    // Generate a new hash and start verification
    const hash = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setGenomicHash(hash);
    handleStartVerification();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/70 border-purple-500/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-400" />
            <span>Quantum-Secured Blockchain Verification</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="verification" className="text-sm">
                <Shield className="h-4 w-4 mr-2" />
                Verification
              </TabsTrigger>
              <TabsTrigger value="workflow" className="text-sm">
                <Lock className="h-4 w-4 mr-2" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="fingerprint" className="text-sm">
                <Fingerprint className="h-4 w-4 mr-2" />
                Quantum Hash
              </TabsTrigger>
            </TabsList>
            
            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6">
              <VerificationTab
                genomicHash={genomicHash}
                verificationStep={verificationStep}
                verificationStatus={verificationStatus}
                isVerifying={isVerifying}
                verificationProgress={verificationProgress}
                verificationData={verificationData}
                entanglementScore={entanglementScore}
                onStartVerification={handleStartVerification}
                onResetVerification={resetVerification}
              />
            </TabsContent>
            
            {/* Workflow Tab */}
            <TabsContent value="workflow">
              <RealTimeWorkflowOptimizer />
            </TabsContent>
            
            {/* Quantum Hash Tab */}
            <TabsContent value="fingerprint">
              <QuantumHashTab
                genomicHash={genomicHash}
                entanglementScore={entanglementScore}
                onGenerateNewHash={handleGenerateNewHash}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
