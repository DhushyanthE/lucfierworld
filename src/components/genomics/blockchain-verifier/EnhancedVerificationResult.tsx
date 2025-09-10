
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Shield, 
  Clock, 
  AlertTriangle, 
  Lock, 
  FileText,
  Brain,
  Sparkles
} from 'lucide-react';
import { AIModelType } from '@/types';

interface AIAnalysis {
  model?: AIModelType;
  summary: string;
  insights: string[];
}

interface EnhancedVerificationResultProps {
  isVerified: boolean;
  hash: string;
  timestamp: string;
  securityScore: number;
  quantumResistant: boolean;
  metadata: Record<string, any>;
  aiAnalysis?: AIAnalysis;
}

export function EnhancedVerificationResult({
  isVerified,
  hash,
  timestamp,
  securityScore,
  quantumResistant,
  metadata,
  aiAnalysis
}: EnhancedVerificationResultProps) {
  // Format timestamp for display
  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : 'N/A';
  
  // Format security score as percentage
  const securityScorePercent = Math.round(securityScore * 100);
  
  // Determine security level based on score
  const getSecurityLevel = () => {
    if (securityScore >= 0.9) return { level: 'High', color: 'text-green-400' };
    if (securityScore >= 0.7) return { level: 'Medium', color: 'text-yellow-400' };
    return { level: 'Low', color: 'text-red-400' };
  };
  
  const securityLevel = getSecurityLevel();
  
  return (
    <Card className={`border ${isVerified ? 'border-green-500/30' : 'border-red-500/30'} bg-black/80`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${isVerified ? 'text-green-400' : 'text-red-400'}`} />
            <span>Verification Result</span>
          </div>
          <Badge 
            variant="outline" 
            className={`${isVerified ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-red-900/20 text-red-400 border-red-500/30'}`}
          >
            {isVerified ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
            {isVerified ? 'Verified' : 'Failed'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hash and timestamp info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FileText className="h-4 w-4" />
              <span>Hash:</span>
            </div>
            <code className="bg-black/60 p-2 rounded-md text-xs block overflow-x-auto">
              {hash}
            </code>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Timestamp:</span>
            </div>
            <div className="bg-black/60 p-2 rounded-md text-xs">
              {formattedTime}
            </div>
          </div>
        </div>
        
        {/* Security information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-900/60 rounded-md">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Security Score</span>
              <span className={securityLevel.color}>{securityLevel.level}</span>
            </div>
            <div className="w-full bg-gray-700/30 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  securityScorePercent >= 90 ? 'bg-green-500' : 
                  securityScorePercent >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${securityScorePercent}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-right">{securityScorePercent}%</div>
          </div>
          
          <div className="p-3 bg-gray-900/60 rounded-md flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Quantum Resistance</span>
            </div>
            <Badge 
              variant="outline" 
              className={`self-end mt-2 ${
                quantumResistant 
                  ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' 
                  : 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30'
              }`}
            >
              {quantumResistant ? 'Quantum Resistant' : 'Standard Protection'}
            </Badge>
          </div>
        </div>
        
        {/* AI Analysis */}
        {aiAnalysis && (
          <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                AI Analysis
                {aiAnalysis.model && (
                  <Badge variant="outline" className="ml-2 bg-blue-900/30 text-blue-300 border-blue-500/30">
                    {aiAnalysis.model.toUpperCase()}
                  </Badge>
                )}
              </span>
            </div>
            
            <p className="text-sm mb-2">{aiAnalysis.summary}</p>
            
            <div className="space-y-1 mt-3">
              {aiAnalysis.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Sparkles className="h-3 w-3 text-blue-400 mt-1" />
                  <span className="text-xs text-gray-300">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional metadata if verification failed */}
        {!isVerified && (
          <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Verification Failed</span>
            </div>
            <p className="text-xs text-gray-300">
              The genomic data sequence could not be verified on the blockchain. 
              This may indicate data tampering or corruption.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
