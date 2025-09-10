
import React from 'react';

export const SecurityTab: React.FC = () => {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
      <h3 className="text-sm font-medium text-purple-400 mb-2">Quantum Security</h3>
      <div className="text-xs text-gray-400">
        <p>
          This model includes quantum-resistant security features to protect against
          both classical and quantum attacks. The trained model parameters are secured using
          post-quantum cryptography.
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span>Quantum Resistance Level</span>
            <span className="text-blue-400">Level 3 (High)</span>
          </div>
          <div className="flex justify-between">
            <span>Key Encryption</span>
            <span className="text-blue-400">Lattice-based</span>
          </div>
          <div className="flex justify-between">
            <span>Parameter Protection</span>
            <span className="text-blue-400">Homomorphic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
