
import React, { useState } from "react";
import { Shield } from "lucide-react";
import { QuantumSecurityAnalysis } from "@/services/aiService";

interface SecurityAnalysisSectionProps {
  securityAnalysis: QuantumSecurityAnalysis | null;
}

export function SecurityAnalysisSection({ securityAnalysis }: SecurityAnalysisSectionProps) {
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  if (!securityAnalysis) return null;

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/10">
      <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2 cursor-pointer"
          onClick={() => setShowSecurityDetails(!showSecurityDetails)}>
        <Shield className="h-4 w-4" />
        Quantum Security
        <span className="text-xs text-gray-400 ml-auto">{showSecurityDetails ? 'Hide' : 'Show'} details</span>
      </h4>
      
      <div className="flex items-center mb-3">
        <span className="text-gray-400 text-sm mr-2">Security Score:</span>
        <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              securityAnalysis.resistanceScore > 0.8 ? 'bg-green-500' : 
              securityAnalysis.resistanceScore > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`} 
            style={{width: `${securityAnalysis.resistanceScore * 100}%`}}
          ></div>
        </div>
        <span className="text-white text-sm ml-2">
          {Math.round(securityAnalysis.resistanceScore * 100)}%
        </span>
      </div>
      
      {showSecurityDetails && (
        <>
          <div className="mt-3">
            <h5 className="text-sm text-gray-400 mb-1">Quantum-Safe Algorithms:</h5>
            <div className="flex flex-wrap gap-2">
              {securityAnalysis.quantumSafeAlgorithms.map((algo, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-purple-900/50 px-2 py-1 rounded text-purple-200"
                >
                  {algo}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-3">
            <h5 className="text-sm text-gray-400 mb-1">Vulnerabilities:</h5>
            <ul className="text-xs text-gray-300 list-disc list-inside">
              {securityAnalysis.vulnerabilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
