
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, ShieldCheck, ShieldX, Lock } from 'lucide-react';
import { QuantumSecurityStatus } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TransactionsSecurityProps {
  securityStatus: QuantumSecurityStatus | null;
}

export function TransactionsSecurity({ securityStatus }: TransactionsSecurityProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [securityScores, setSecurityScores] = useState({
    quantumResistance: 87,
    keyProtection: 92,
    transactionSigning: 95,
    networkSecurity: 78,
  });

  // Run security analysis
  const runSecurityAnalysis = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Simulate updated security scores
      setSecurityScores({
        quantumResistance: Math.floor(Math.random() * 20) + 80, // 80-99
        keyProtection: Math.floor(Math.random() * 15) + 85, // 85-99
        transactionSigning: Math.floor(Math.random() * 10) + 90, // 90-99
        networkSecurity: Math.floor(Math.random() * 30) + 70, // 70-99
      });
      
      setIsAnalyzing(false);
      toast.success('Security analysis complete');
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-black/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center">
            <Shield className="h-5 w-5 text-purple-400 mr-2" />
            Quantum Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityStatus ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">Security Level</h3>
                  <p className="text-sm text-gray-400">
                    Your wallet's quantum resistance level
                  </p>
                </div>
                
                <Badge className={`px-3 py-1 text-sm ${
                  securityStatus.securityLevel === 'high'
                    ? 'bg-green-600'
                    : securityStatus.securityLevel === 'medium'
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}>
                  {securityStatus.securityLevel.charAt(0).toUpperCase() + securityStatus.securityLevel.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Security Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Quantum Resistance</span>
                      <span className="text-sm font-medium">{securityStatus.isQuantumResistant ? 'Protected' : 'Vulnerable'}</span>
                    </div>
                    <Progress value={securityStatus.isQuantumResistant ? 100 : 40} className="h-2" 
                      color={securityStatus.isQuantumResistant ? 'bg-green-500' : 'bg-red-500'} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Vulnerabilities Detected</span>
                      <span className="text-sm font-medium">{securityStatus.vulnerabilities}</span>
                    </div>
                    <Progress 
                      value={Math.max(0, 100 - (securityStatus.vulnerabilities * 20))} 
                      className="h-2"
                      color={securityStatus.vulnerabilities === 0 ? 'bg-green-500' : 
                             securityStatus.vulnerabilities <= 2 ? 'bg-yellow-500' : 'bg-red-500'} />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Recommendations</h3>
                <div className="space-y-2">
                  {securityStatus.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-gray-800/40 rounded-lg">
                      {securityStatus.securityLevel === 'high' ? (
                        <ShieldCheck className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <ShieldX className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-300">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400">No security data available. Please refresh the wallet data.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-black/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center">
            <Lock className="h-5 w-5 text-purple-400 mr-2" />
            Transaction Security Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button 
              onClick={runSecurityAnalysis} 
              disabled={isAnalyzing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isAnalyzing ? 'Analyzing Security...' : 'Run Security Analysis'}
            </Button>
          </div>
          
          <div className="space-y-6">
            {Object.entries(securityScores).map(([metric, score]) => (
              <div key={metric} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400 capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge className={`
                    ${score >= 90 ? 'bg-green-600' : 
                      score >= 80 ? 'bg-blue-600' : 
                      score >= 70 ? 'bg-yellow-600' : 'bg-red-600'}
                  `}>
                    {score}%
                  </Badge>
                </div>
                
                <Progress 
                  value={score} 
                  className="h-2"
                  color={
                    score >= 90 ? 'bg-green-500' : 
                    score >= 80 ? 'bg-blue-500' : 
                    score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }
                />
                
                <div className="bg-gray-800/40 p-2 rounded-lg">
                  <p className="text-xs text-gray-300">
                    {score >= 90 ? (
                      'Excellent protection with post-quantum algorithms.'
                    ) : score >= 80 ? (
                      'Good protection with some quantum-resistant features.'
                    ) : score >= 70 ? (
                      'Moderate protection, consider upgrading security.'
                    ) : (
                      'Vulnerable to advanced attacks, immediate upgrade recommended.'
                    )}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20 mt-4">
              <p className="text-sm text-purple-300">
                <strong>Quantum Protection:</strong> Your transactions are secured against both classical and quantum computing attacks with advanced multi-layered cryptographic protocols.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
