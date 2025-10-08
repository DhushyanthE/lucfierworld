import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Anomaly {
  index: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reason: string;
  quantumScore: number;
}

export function useAnomalyDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  const detectAnomalies = useCallback(async (
    dataPoints: any[],
    threshold = 0.85,
    quantumEnhanced = true
  ) => {
    setIsDetecting(true);
    try {
      console.log('Starting anomaly detection for', dataPoints.length, 'points');
      
      const { data, error } = await supabase.functions.invoke('anomaly-detection', {
        body: { dataPoints, threshold, quantumEnhanced }
      });

      if (error) throw error;

      setAnomalies(data.anomalies || []);
      setStatistics(data.statistics || {});
      
      const criticalCount = data.anomalies?.filter((a: Anomaly) => a.severity === 'critical').length || 0;
      if (criticalCount > 0) {
        toast.error(`Found ${criticalCount} critical anomalies!`);
      } else {
        toast.success(`Detection complete: ${data.anomalies?.length || 0} anomalies found`);
      }

      return data;
    } catch (error) {
      console.error('Anomaly detection error:', error);
      toast.error('Failed to detect anomalies');
      throw error;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return {
    isDetecting,
    anomalies,
    statistics,
    detectAnomalies
  };
}
