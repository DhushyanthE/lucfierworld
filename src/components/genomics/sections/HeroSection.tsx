
import React from 'react';
import { Dna, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/hooks/use-wallet';
import { toast } from 'sonner';

interface HeroSectionProps {
  isProcessing: boolean;
  processingProgress: number;
  processingStage: string;
  handleVerifyNow: () => void;
}

export function HeroSection({ isProcessing, processingProgress, processingStage, handleVerifyNow }: HeroSectionProps) {
  const { isConnected, connectWallet } = useWallet();
  
  const onVerifyNow = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to continue", {
        action: {
          label: "Connect Wallet",
          onClick: () => connectWallet('metamask')
        }
      });
      return;
    }
    
    handleVerifyNow();
  };
  
  return (
    <>
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Dna className="h-8 w-8 text-purple-400" />
          <span>Genomic Sequencing & Blockchain Verification</span>
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Our quantum-powered platform enables high-performance genomic data processing with
          blockchain verification for tamper-proof storage, perfect for medical research, 
          ancestry analysis, and personalized medicine.
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-900/30 rounded-lg">
              <Dna className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Quantum DNA Processing Pipeline</h3>
              <p className="text-sm text-gray-400">
                Combine sequence processing with quantum verification for complete data integrity
              </p>
            </div>
          </div>
          
          {isProcessing ? (
            <div className="w-full md:w-64">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{processingStage}</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
          ) : (
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={onVerifyNow}
            >
              Verify Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
