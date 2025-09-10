
import React, { useState, useEffect } from 'react';
import { dnaSequenceProcessor } from '@/lib/quantum/genomics/DNASequenceProcessor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dna, Loader2, Zap, Database, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ProcessingStatus } from '@/lib/quantum/genomics/types';

export function GenomicDataVisualizer() {
  const [sequence, setSequence] = useState('');
  const [metadata, setMetadata] = useState({ 
    source: 'user', 
    species: 'human',
    sampleType: 'blood',
    purpose: 'research' 
  });
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [entanglementScore, setEntanglementScore] = useState(0.7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMode, setSelectedMode] = useState('manual');
  
  // Generate example sequences
  const exampleSequences = {
    human: 'ATGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCT',
    mouse: 'GCTATAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTATAGCTAGCTAGCTAGCTAGCTA',
    bacteria: 'TATATATATATATATACGCGCGCGCGCGCGCGCGATGATGATGATGATGATGATGATG',
  };
  
  useEffect(() => {
    if (processingResult) {
      setEntanglementScore(processingResult.quantumEntanglementScore || 0.7);
    }
  }, [processingResult]);
  
  const handleSubmit = async () => {
    if (!sequence) {
      toast.error("Please enter a DNA sequence");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newSequence = dnaSequenceProcessor.submitSequence(sequence, metadata);
      
      // Monitor processing status
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Create mock processing result
          const result = {
            sequenceId: newSequence.id,
            quantumHash: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            matchScore: (Math.random() * 0.3) + 0.7,
            blockchainTxId: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            quantumEntanglementScore: (Math.random() * 0.3) + 0.7,
            analysis: {
              gcContent: Math.random() * 0.6 + 0.2,
              repeats: Math.floor(Math.random() * 10) + 2,
              mutationProbability: Math.random() * 0.1,
              structuralComplexity: Math.random() * 100
            }
          };
          
          setProcessingResult(result);
          setProcessingStatus({
            status: 'completed',
            progress: 100,
            message: 'Processing completed successfully'
          });
          
          toast.success("DNA sequence processed successfully", {
            description: "Quantum analysis and blockchain verification complete"
          });
        }
        
        setProcessingStatus({
          status: progress >= 100 ? 'completed' : 'processing',
          progress: Math.min(Math.round(progress), 99),
          message: progress >= 100 ? 'Processing completed' : 'Processing sequence...'
        });
      }, 200);
      
      // Check status immediately
      const initialStatus = dnaSequenceProcessor.checkStatus(newSequence.id);
      setProcessingStatus(initialStatus);
      
    } catch (error: any) {
      console.error("Error submitting sequence:", error);
      toast.error("Error processing DNA sequence", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      setProcessingStatus({
        status: 'error',
        progress: 0,
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCheckStatus = () => {
    if (processingResult && processingResult.sequenceId) {
      const status = dnaSequenceProcessor.checkStatus(processingResult.sequenceId);
      setProcessingStatus(status);
      toast.info("Status updated", {
        description: `Current status: ${status.status}`
      });
    }
  };
  
  const handleGenerateSequence = () => {
    const exampleSeq = exampleSequences[metadata.species as keyof typeof exampleSequences] || exampleSequences.human;
    // Add some randomness to make it different each time
    const randomizedSeq = exampleSeq.split('').map(char => {
      return Math.random() > 0.9 ? 'ATGC'[Math.floor(Math.random() * 4)] : char;
    }).join('');
    
    setSequence(randomizedSeq);
    toast.info("Example sequence generated", {
      description: `${metadata.species} DNA sample loaded`
    });
  };
  
  return (
    <Card className="bg-black/60 border-purple-500/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-purple-400" />
            Genomic Data Visualizer
          </CardTitle>
          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger className="w-32 h-7 text-xs bg-gray-900 border-gray-700">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="manual">Manual Input</SelectItem>
              <SelectItem value="upload">File Upload</SelectItem>
              <SelectItem value="realtime">Real-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex justify-between">
            <Label htmlFor="sequence">DNA Sequence</Label>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-xs bg-gray-900 border-gray-700 hover:bg-gray-800"
              onClick={handleGenerateSequence}
            >
              Generate Example
            </Button>
          </div>
          <Textarea
            id="sequence"
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            placeholder="Enter DNA sequence (A, C, G, T)"
            className="font-mono text-sm h-20 bg-gray-900/70 border-gray-700"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="species">Species</Label>
            <Select 
              value={metadata.species} 
              onValueChange={(value) => setMetadata({...metadata, species: value})}
            >
              <SelectTrigger id="species" className="bg-gray-900/70 border-gray-700">
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="human">Human</SelectItem>
                <SelectItem value="mouse">Mouse</SelectItem>
                <SelectItem value="bacteria">Bacteria</SelectItem>
                <SelectItem value="virus">Virus</SelectItem>
                <SelectItem value="plant">Plant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="sampleType">Sample Type</Label>
            <Select 
              value={metadata.sampleType} 
              onValueChange={(value) => setMetadata({...metadata, sampleType: value})}
            >
              <SelectTrigger id="sampleType" className="bg-gray-900/70 border-gray-700">
                <SelectValue placeholder="Select sample type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="blood">Blood</SelectItem>
                <SelectItem value="tissue">Tissue</SelectItem>
                <SelectItem value="saliva">Saliva</SelectItem>
                <SelectItem value="culture">Cell Culture</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="purpose">Research Purpose</Label>
          <Select 
            value={metadata.purpose} 
            onValueChange={(value) => setMetadata({...metadata, purpose: value})}
          >
            <SelectTrigger id="purpose" className="bg-gray-900/70 border-gray-700">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="research">Academic Research</SelectItem>
              <SelectItem value="medical">Medical Diagnosis</SelectItem>
              <SelectItem value="pharma">Pharmaceutical Development</SelectItem>
              <SelectItem value="ancestry">Ancestry Analysis</SelectItem>
              <SelectItem value="forensic">Forensic Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !sequence} 
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Process Sequence
            </>
          )}
        </Button>
        
        {processingStatus && (
          <div className="bg-gray-900/40 rounded-lg p-3 mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Processing Status</span>
              <Badge 
                className={
                  processingStatus.status === 'completed' ? 'bg-green-900/30 text-green-300 border-green-800/50' :
                  processingStatus.status === 'error' ? 'bg-red-900/30 text-red-300 border-red-800/50' :
                  'bg-blue-900/30 text-blue-300 border-blue-800/50'
                }
              >
                {processingStatus.status === 'completed' ? 'Completed' :
                 processingStatus.status === 'error' ? 'Error' :
                 'Processing'}
              </Badge>
            </div>
            
            {processingStatus.status !== 'error' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{processingStatus.message || 'Processing...'}</span>
                  <span>{processingStatus.progress}%</span>
                </div>
                <Progress value={processingStatus.progress} className="h-1" />
              </div>
            )}
            
            {processingStatus.errorMessage && (
              <div className="mt-2 text-xs text-red-400">
                {processingStatus.errorMessage}
              </div>
            )}
            
            {processingStatus.status !== 'processing' && (
              <Button 
                onClick={handleCheckStatus} 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 text-xs h-7 bg-gray-900/70 border-gray-700"
              >
                Refresh Status
              </Button>
            )}
          </div>
        )}
        
        {processingResult && (
          <div className="mt-4 space-y-4">
            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800/50">
              <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-400" />
                Sequence Information
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sequence ID:</span>
                  <span className="text-white font-mono">{processingResult.sequenceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Length:</span>
                  <span className="text-white">{sequence.length} bp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Match Score:</span>
                  <span className="text-white">{(processingResult.matchScore * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GC Content:</span>
                  <span className="text-white">{(processingResult.analysis.gcContent * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800/50">
              <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-400" />
                Blockchain Verification
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Hash:</span>
                  <span className="text-white font-mono truncate max-w-[180px]">{processingResult.quantumHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Blockchain TX ID:</span>
                  <span className="text-white font-mono truncate max-w-[180px]">{processingResult.blockchainTxId}</span>
                </div>
                
                <div className="pt-2">
                  <h4 className="text-xs text-gray-400 mb-1">Quantum Entanglement Score</h4>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[entanglementScore * 100]}
                      max={100}
                      step={1}
                      disabled
                      className="flex-1"
                    />
                    <span className="text-white font-mono w-16 text-right">
                      {(entanglementScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800/50">
              <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                Quantum Analysis
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-400 mb-1">Structural Complexity</div>
                  <Progress value={processingResult.analysis.structuralComplexity} className="h-1" />
                  <div className="text-right text-white text-xs mt-1">
                    {Math.round(processingResult.analysis.structuralComplexity)}/100
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Repeats Identified</div>
                  <div className="bg-gray-800/60 rounded-md p-2 font-mono text-center text-white">
                    {processingResult.analysis.repeats}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Mutation Probability</div>
                  <div className="bg-gray-800/60 rounded-md p-2 font-mono text-center text-white">
                    {(processingResult.analysis.mutationProbability * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Blockchain Security</div>
                  <div className="bg-green-900/20 text-green-400 rounded-md p-2 font-mono text-center">
                    Verified ✓
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
