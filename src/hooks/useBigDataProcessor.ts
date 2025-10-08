import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type BigDataOperation = 'aggregate' | 'transform' | 'analyze' | 'predict' | 'classify' | 'cluster';

export function useBigDataProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);

  const processBigData = useCallback(async (
    operation: BigDataOperation,
    dataset: any[],
    options = {}
  ) => {
    setIsProcessing(true);
    try {
      console.log('Processing big data:', operation, 'on', dataset.length, 'records');
      
      const { data, error } = await supabase.functions.invoke('big-data-processor', {
        body: { operation, dataset, options }
      });

      if (error) throw error;

      setResults(data.results || {});
      setPerformance(data.performance || {});
      
      toast.success(`Processed ${data.results?.processedRecords || 0} records`);
      return data;
    } catch (error) {
      console.error('Big data processing error:', error);
      toast.error('Failed to process big data');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    results,
    performance,
    processBigData
  };
}
