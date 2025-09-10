
import React from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, CheckCircle, XCircle } from 'lucide-react';

interface QuantumHashTabProps {
  genomicHash: string | null;
  entanglementScore: number;
  onGenerateNewHash: () => void;
}

export function QuantumHashTab({ 
  genomicHash, 
  entanglementScore, 
  onGenerateNewHash 
}: QuantumHashTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Fingerprint className="h-4 w-4 mr-2 text-purple-400" />
          Quantum-Enhanced Hash Generation
        </h3>
        
        <p className="text-sm text-gray-400 mb-4">
          Quantum-resistant hashing employs post-quantum cryptography to secure genomic data 
          against future quantum computing attacks, utilizing quantum entanglement for enhanced security.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded border border-gray-800">
            <h4 className="text-xs font-medium text-gray-300 mb-2">Classical Hash</h4>
            <div className="font-mono text-xs text-gray-500 break-all">
              {genomicHash?.substring(0, 32) || "No hash generated"}
            </div>
          </div>
          
          <div className="bg-black/30 p-3 rounded border border-purple-900/30">
            <h4 className="text-xs font-medium text-purple-300 mb-2">Quantum Hash</h4>
            <div className="font-mono text-xs text-purple-500/80 break-all">
              {genomicHash ? `q${genomicHash.substring(5, 37)}` : "No hash generated"}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Quantum Resistance Score: <span className="text-purple-400 font-medium">{Math.floor(entanglementScore * 100)}%</span>
          </div>
          <Button 
            size="sm"
            variant="outline"
            className="bg-purple-900/20 border-purple-500/30 hover:bg-purple-800/30 text-purple-300"
            onClick={onGenerateNewHash}
          >
            Generate New Hash
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
          <h4 className="text-sm font-medium mb-2">Quantum Advantages</h4>
          <ul className="space-y-1 text-xs text-gray-400">
            <li className="flex items-start">
              <CheckCircle className="h-3.5 w-3.5 text-green-400 mr-2 mt-0.5 shrink-0" />
              <span>Post-quantum cryptographic resistance</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-3.5 w-3.5 text-green-400 mr-2 mt-0.5 shrink-0" />
              <span>Quantum random number generation</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-3.5 w-3.5 text-green-400 mr-2 mt-0.5 shrink-0" />
              <span>Entanglement-based validation</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-3.5 w-3.5 text-green-400 mr-2 mt-0.5 shrink-0" />
              <span>Quantum key distribution (QKD)</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
          <h4 className="text-sm font-medium mb-2">Potential Threats</h4>
          <ul className="space-y-1 text-xs text-gray-400">
            <li className="flex items-start">
              <XCircle className="h-3.5 w-3.5 text-red-400 mr-2 mt-0.5 shrink-0" />
              <span>Shor's algorithm on RSA/ECC cryptography</span>
            </li>
            <li className="flex items-start">
              <XCircle className="h-3.5 w-3.5 text-red-400 mr-2 mt-0.5 shrink-0" />
              <span>Grover's algorithm reducing hash security</span>
            </li>
            <li className="flex items-start">
              <XCircle className="h-3.5 w-3.5 text-red-400 mr-2 mt-0.5 shrink-0" />
              <span>Quantum decoherence affecting reliability</span>
            </li>
            <li className="flex items-start">
              <XCircle className="h-3.5 w-3.5 text-red-400 mr-2 mt-0.5 shrink-0" />
              <span>Fault tolerance limitations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
