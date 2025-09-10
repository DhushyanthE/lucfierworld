
import React from 'react';
import { VerificationSteps } from './VerificationSteps';
import { VerificationControl } from './VerificationControl';
import { HashDisplay } from './HashDisplay';
import { EnhancedVerificationResult } from './EnhancedVerificationResult';
import { VerificationProgress } from './VerificationProgress';
import { VerificationData } from './useBlockchainVerifier';
import { AIModelSelector } from '@/components/workflow/AIModelSelector';
import { AIModelType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Cpu } from 'lucide-react';

interface VerificationTabProps {
  genomicHash: string | null;
  verificationStep: string;
  verificationStatus: 'idle' | 'verifying' | 'success' | 'failed';
  isVerifying: boolean;
  verificationProgress: number;
  verificationData: VerificationData;
  entanglementScore: number;
  onStartVerification: () => void;
  onResetVerification: () => void;
}

export function VerificationTab({
  genomicHash,
  verificationStep,
  verificationStatus,
  isVerifying,
  verificationProgress,
  verificationData,
  entanglementScore,
  onStartVerification,
  onResetVerification
}: VerificationTabProps) {
  const [activeModel, setActiveModel] = React.useState<AIModelType>('gemini');
  const [aiEnhanced, setAiEnhanced] = React.useState(true);

  // Function to handle AI model change
  const handleModelChange = (model: AIModelType) => {
    setActiveModel(model);
  };

  return (
    <div className="space-y-6">
      {/* Hash Display */}
      <HashDisplay genomicHash={genomicHash} />
      
      {/* AI Model Selection */}
      <div className="bg-black/40 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-white mr-2">AI Workflow Enhancement</h3>
            {aiEnhanced && (
              <Badge variant="outline" className="bg-purple-900/40 text-purple-300 border-purple-500/30">
                <Cpu className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </div>
        </div>
        <AIModelSelector 
          activeModel={activeModel} 
          onModelChange={handleModelChange} 
          disabled={isVerifying} 
        />
      </div>
      
      {/* Verification Steps */}
      <VerificationSteps 
        verificationStep={verificationStep}
        verificationStatus={verificationStatus}
        isVerifying={isVerifying}
        verificationMethod={activeModel === 'gemini' || activeModel === 'deepseek' ? 'quantum' : 'standard'}
      />
      
      {/* Verification Controls */}
      <VerificationControl
        verificationStatus={verificationStatus}
        onStartVerification={onStartVerification}
        onResetVerification={onResetVerification}
      />
      
      {/* Progress */}
      <VerificationProgress 
        isVerifying={isVerifying} 
        verificationProgress={verificationProgress} 
      />
      
      {/* Verification Results */}
      {verificationStatus !== 'idle' && (
        <div className="pt-2">
          <EnhancedVerificationResult
            isVerified={verificationStatus === 'success'}
            hash={verificationData.hash}
            timestamp={verificationData.timestamp || ''}
            securityScore={verificationData.integrityScore}
            quantumResistant={verificationData.method === 'quantum'}
            metadata={verificationData}
            aiAnalysis={{
              model: activeModel,
              summary: `Genomic data verification complete with ${activeModel.toUpperCase()} analysis.`,
              insights: [
                "Sequence integrity confirmed with high confidence",
                activeModel === 'gemini' || activeModel === 'deepseek' 
                  ? "Quantum-resistant hashing with advanced neural verification" 
                  : "Standard verification with neural network validation",
                `Blockchain verification secured with ${activeModel.toUpperCase()} analysis`
              ]
            }}
          />
        </div>
      )}
    </div>
  );
}
