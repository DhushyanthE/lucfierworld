import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dna, 
  ShieldCheck, 
  CircleDollarSign, 
  LinkIcon, 
  Lock, 
  Key,
  BarChart 
} from 'lucide-react';
import { GenomicBlockchainData } from '@/lib/quantum/workflow/utils/genomicBlockchain';

interface GenomicAnalysisResultsProps {
  analysis: {
    hash: string;
    analysis: {
      baseComposition: {
        A: number;
        C: number;
        G: number;
        T: number;
      };
      gcContent: number;
      uniquenessScore: number;
      patternCount: number;
      potentialGenes: number;
    }
  };
  blockchainData: GenomicBlockchainData;
  tokenReward: {
    tokenAmount: number;
    bonusFactors: {
      lengthFactor: number;
      uniquenessFactor: number;
      publicFactor: number;
      quantumFactor: number;
    }
  };
}

export function GenomicAnalysisResults({ 
  analysis, 
  blockchainData, 
  tokenReward 
}: GenomicAnalysisResultsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-blue-500" />
            Genomic Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium text-sm text-gray-500 dark:text-gray-400">DNA Base Composition</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-blue-500/10 p-2 rounded-md">
                  <div className="text-blue-500 font-bold text-lg">A</div>
                  <div className="text-sm">{(analysis.analysis.baseComposition.A * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-green-500/10 p-2 rounded-md">
                  <div className="text-green-500 font-bold text-lg">T</div>
                  <div className="text-sm">{(analysis.analysis.baseComposition.T * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-yellow-500/10 p-2 rounded-md">
                  <div className="text-yellow-500 font-bold text-lg">G</div>
                  <div className="text-sm">{(analysis.analysis.baseComposition.G * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-red-500/10 p-2 rounded-md">
                  <div className="text-red-500 font-bold text-lg">C</div>
                  <div className="text-sm">{(analysis.analysis.baseComposition.C * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="font-medium text-sm text-gray-500 dark:text-gray-400">GC Content</div>
                <div className="text-lg font-medium">{(analysis.analysis.gcContent * 100).toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm text-gray-500 dark:text-gray-400">Sequence Metrics</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Uniqueness Score</div>
                  <div className="text-lg font-medium">{(analysis.analysis.uniquenessScore * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Pattern Count</div>
                  <div className="text-lg font-medium">{analysis.analysis.patternCount}</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md col-span-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Potential Genes</div>
                  <div className="text-lg font-medium">{analysis.analysis.potentialGenes}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-purple-500" />
            Blockchain Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium text-sm text-gray-500 dark:text-gray-400">Transaction ID</div>
              <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-md break-all">
                {blockchainData.blockchainTxId}
              </div>
              
              <div className="pt-2">
                <div className="font-medium text-sm text-gray-500 dark:text-gray-400">Data Hash</div>
                <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-md break-all">
                  {blockchainData.sequenceHash || 'Not available'}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm text-gray-500 dark:text-gray-400">Security Settings</div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <Lock className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Access Control</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {blockchainData.accessControl.isPublic ? 'Public' : 'Private'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <Key className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-medium">Encryption</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {blockchainData.accessControl.encryptionType === 'quantum' ? 
                      'Quantum-Resistant' : 'Standard'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Block Height</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {(blockchainData.blockHeight || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-green-500" />
            Token Reward
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
            <div className="text-3xl font-bold text-green-500">{tokenReward.tokenAmount} KTC</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Kontour Tokens Earned</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Length Bonus</div>
              <div className="font-medium">×{tokenReward.bonusFactors.lengthFactor.toFixed(2)}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Uniqueness Bonus</div>
              <div className="font-medium">×{tokenReward.bonusFactors.uniquenessFactor.toFixed(2)}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Public Bonus</div>
              <div className="font-medium">×{tokenReward.bonusFactors.publicFactor.toFixed(2)}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Quantum Bonus</div>
              <div className="font-medium">×{tokenReward.bonusFactors.quantumFactor.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
