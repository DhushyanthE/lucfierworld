
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface SecurityMetric {
  algorithm: string;
  keySize: number;
  resistanceScore: number;
  isQuantumResistant: boolean;
  qubitEstimate: number;
}

interface SecurityAssessmentProps {
  securityMetrics: SecurityMetric[];
}

export function SecurityAssessment({ securityMetrics }: SecurityAssessmentProps) {
  return (
    <Card className="bg-black/50 border-purple-500/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-purple-400" />
          <div className="text-sm font-medium">Quantum Security Assessment</div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            The quantum security system employs post-quantum cryptographic algorithms that are 
            resistant to attacks from both classical and quantum computers. The primary protection
            is provided by {securityMetrics[0]?.algorithm || 'Dilithium'} with a key size of{' '}
            {securityMetrics[0]?.keySize || 2048} bits, providing a security margin well beyond 
            the capabilities of current and near-term quantum computers.
          </p>
          <p>
            Current estimates suggest quantum computers would need at least{' '}
            {securityMetrics[0]?.qubitEstimate?.toLocaleString() || '4,800'} error-corrected qubits
            to pose a meaningful threat to these algorithms, which is beyond the current state of the art.
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-400">Entropy Source</div>
            <div className="text-sm text-gray-300">Quantum TRNG</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Key Exchange</div>
            <div className="text-sm text-gray-300">CRYSTALS-Kyber</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Signature Scheme</div>
            <div className="text-sm text-gray-300">CRYSTALS-Dilithium</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
