
import React from "react";
import { Fingerprint, Shield } from "lucide-react";

interface WebCryptoDisplayProps {
  securityLevel: number;
}

export function WebCryptoDisplay({ securityLevel }: WebCryptoDisplayProps) {
  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 rounded-lg border border-purple-500/30">
      <div className="flex justify-between items-center">
        <div>
          <h5 className="font-medium text-white flex items-center">
            <Fingerprint className="h-4 w-4 mr-1 text-yellow-400" /> Web Crypto API 
          </h5>
          <p className="text-gray-300 text-sm mt-1">
            Quantum-safe security with browser's cryptography
          </p>
          <div className="mt-2 bg-black/40 p-2 rounded text-xs text-gray-300 font-mono">
            <span className="text-purple-300">crypto</span>.<span className="text-blue-300">subtle</span>.<span className="text-yellow-300">digest</span>(<span className="text-green-300">'SHA-256'</span>, data)
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-black/40 w-12 h-12 rounded-full flex items-center justify-center animate-pulse border border-purple-500/40">
            <Shield className="h-6 w-6 text-purple-400" />
          </div>
          <div className="mt-1 text-center">
            <span className="text-xs text-purple-300">{securityLevel}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
