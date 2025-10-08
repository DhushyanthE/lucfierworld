import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dna, Cpu, Link, Zap } from 'lucide-react';
import { useGenomicProcessor } from '@/hooks/useGenomicProcessor';

export function GenomicProcessorPanel() {
  const { isProcessing, analysis, blockchain, quantumAnalysis, predictions, processGenomic } = useGenomicProcessor();

  const handleProcess = () => {
    // Generate sample genomic data
    const genomicData = {
      sequence: 'ATCGATCGATCGATCG',
      sampleId: `sample_${Date.now()}`,
      metadata: {
        organism: 'Homo sapiens',
        chromosome: '1'
      }
    };

    processGenomic(genomicData, 'analyze', true, true);
  };

  return (
    <Card className="border-green-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Dna className="h-5 w-5 text-green-400" />
              Genomic Data Processor
            </CardTitle>
            <CardDescription>
              Quantum-enhanced genomic analysis with blockchain storage
            </CardDescription>
          </div>
          <Button 
            onClick={handleProcess} 
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            <Cpu className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Analyze Genomic Data'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {analysis && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sequence Length</p>
                    <p className="text-2xl font-bold">{analysis.sequenceLength?.toLocaleString()}</p>
                  </div>
                  <Dna className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Genes Identified</p>
                    <p className="text-2xl font-bold">{analysis.geneCount || 0}</p>
                  </div>
                  <Cpu className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {blockchain && blockchain.verified && (
          <Card className="bg-background/50 border-green-500/30">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold">Blockchain Verification</h3>
                <Badge variant="outline" className="ml-auto">Verified</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  TX Hash: <span className="font-mono text-xs">{blockchain.txHash?.slice(0, 20)}...</span>
                </p>
                <p className="text-muted-foreground">
                  IPFS: <span className="font-mono text-xs">{blockchain.ipfsHash?.slice(0, 20)}...</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {quantumAnalysis && (
          <Card className="bg-background/50">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                Quantum Analysis
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Circuits Used</p>
                  <p className="font-mono">{quantumAnalysis.circuitsUsed}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entanglement</p>
                  <p className="font-mono">{(quantumAnalysis.entanglementScore * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantum Advantage</p>
                  <p className="font-mono">{quantumAnalysis.quantumAdvantage?.toFixed(2)}x</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {predictions && predictions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Variant Predictions</h3>
            <div className="space-y-2">
              {predictions.map((pred: any, index: number) => (
                <Card key={index} className="bg-background/30">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{pred.type}</p>
                        <p className="text-xs text-muted-foreground">{pred.location}</p>
                      </div>
                      <Badge variant="outline">
                        {(pred.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
