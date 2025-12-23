import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AnomalyPrediction {
  type: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timeframe: string;
}

export interface AnomalyPredictionResult {
  predictions: AnomalyPrediction[];
  riskScore: number;
  recommendations: string[];
  insights: string[];
}

export function useAIAnomalyPrediction() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnomalyPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPrediction, setLastPrediction] = useState<Date | null>(null);

  const predictAnomalies = useCallback(async (
    metrics: any,
    historicalData?: any[]
  ): Promise<AnomalyPredictionResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-anomaly-prediction', {
        body: { metrics, historicalData }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Prediction failed');
      }

      const predictions = data.predictions as AnomalyPredictionResult;
      setResult(predictions);
      setLastPrediction(new Date());

      // Show toast for critical predictions
      const criticalPredictions = predictions.predictions.filter(
        p => p.severity === 'critical' || p.severity === 'high'
      );
      
      if (criticalPredictions.length > 0) {
        toast.warning(`AI detected ${criticalPredictions.length} high-risk anomalies`, {
          description: criticalPredictions[0].description
        });
      } else {
        toast.success('AI anomaly analysis complete');
      }

      return predictions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to predict anomalies';
      setError(message);
      
      // Handle rate limiting gracefully
      if (message.includes('Rate limits')) {
        toast.error('Rate limit reached', {
          description: 'Please wait a moment before trying again'
        });
      } else if (message.includes('Payment required')) {
        toast.error('Credits required', {
          description: 'Please add credits to continue using AI features'
        });
      } else {
        toast.error('Prediction failed', { description: message });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    result,
    error,
    lastPrediction,
    predictAnomalies,
    clearResult
  };
}
