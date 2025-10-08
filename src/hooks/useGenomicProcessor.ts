import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type GenomicOperation = 'analyze' | 'sequence' | 'predict' | 'classify';

export function useGenomicProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [blockchain, setBlockchain] = useState<any>(null);
  const [quantumAnalysis, setQuantumAnalysis] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);

  const processGenomic = useCallback(async (
    genomicData: any,
    operation: GenomicOperation = 'analyze',
    blockchainStore = true,
    quantumCircuits = true
  ) => {
    setIsProcessing(true);
    try {
      console.log('Processing genomic data with operation:', operation);
      
      const { data, error } = await supabase.functions.invoke('genomic-processor', {
        body: { genomicData, operation, blockchainStore, quantumCircuits }
      });

      if (error) throw error;

      setAnalysis(data.analysis || {});
      setBlockchain(data.blockchain || {});
      setQuantumAnalysis(data.quantumAnalysis || {});
      setPredictions(data.predictions || []);
      
      toast.success(`Genomic analysis complete: ${data.analysis?.geneCount || 0} genes found`);
      return data;
    } catch (error) {
      console.error('Genomic processing error:', error);
      toast.error('Failed to process genomic data');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    analysis,
    blockchain,
    quantumAnalysis,
    predictions,
    processGenomic
  };
}
