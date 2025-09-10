
import React from 'react';
import { Dna, Brain, Cpu, Network } from 'lucide-react';

export function HowItWorks() {
  return (
    <div className="space-y-4 bg-black/40 p-6 rounded-lg border border-purple-500/10 mt-8">
      <h2 className="text-xl font-bold text-white">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center">
            <Dna className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-white">1. Quantum Sequencing</h3>
          <p className="text-sm text-gray-400">
            Our quantum algorithms process genomic data thousands of times faster than
            traditional methods with higher accuracy and error correction.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center">
            <Brain className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white">2. AGI Analysis</h3>
          <p className="text-sm text-gray-400">
            Our AGI Orchestrator provides intelligent analysis, summaries, and access
            control through chain-of-thought reasoning.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-lg bg-cyan-900/30 flex items-center justify-center">
            <Cpu className="h-6 w-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-medium text-white">3. Circuit Optimization</h3>
          <p className="text-sm text-gray-400">
            Custom quantum circuits are automatically optimized for genomic data patterns, 
            reducing noise and enhancing signal extraction.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-lg bg-green-900/30 flex items-center justify-center">
            <Network className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-white">4. Blockchain Verification</h3>
          <p className="text-sm text-gray-400">
            Results are securely stored with quantum-resistant cryptography on our distributed
            ledger, ensuring data integrity and immutability.
          </p>
        </div>
      </div>
    </div>
  );
}
