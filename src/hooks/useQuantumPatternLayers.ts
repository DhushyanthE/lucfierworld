import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PatternLayerDefinition {
  key: string;
  id: number;
  name: string;
  description: string;
}

export interface PatternLayerResult {
  layer: string;
  layerId: number;
  key: string;
  result: any;
  score: number;
  passed: boolean;
}

export interface PatternLayerExecutionSummary {
  layers: PatternLayerResult[];
  summary: {
    totalLayers: number;
    passedLayers: number;
    overallScore: number;
    securityLevel: 'maximum' | 'high' | 'standard';
    transferReady: boolean;
  };
  timestamp: string;
}

export function useQuantumPatternLayers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layers, setLayers] = useState<PatternLayerDefinition[]>([]);
  const [executionResult, setExecutionResult] = useState<PatternLayerExecutionSummary | null>(null);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(-1);

  const listLayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('quantum-pattern-layers', {
        body: { operation: 'list' }
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error('Failed to list layers');

      setLayers(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list layers';
      setError(message);
      toast.error('Failed to load pattern layers');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeLayer = useCallback(async (layerKey: string, input?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('quantum-pattern-layers', {
        body: { operation: 'execute', layer: layerKey, input }
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(`Failed to execute layer: ${layerKey}`);

      toast.success(`${data.data.layer} completed`, {
        description: `Score: ${(data.data.result.score || 95).toFixed(1)}%`
      });

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Layer execution failed';
      setError(message);
      toast.error('Layer execution failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeAllLayers = useCallback(async (input?: any, onLayerComplete?: (layer: PatternLayerResult, index: number) => void) => {
    setIsLoading(true);
    setError(null);
    setCurrentLayerIndex(0);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('quantum-pattern-layers', {
        body: { operation: 'execute-all', input }
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error('Failed to execute all layers');

      const result = data.data as PatternLayerExecutionSummary;
      setExecutionResult(result);
      setCurrentLayerIndex(20);

      // Notify for each layer
      if (onLayerComplete) {
        result.layers.forEach((layer, index) => {
          setTimeout(() => onLayerComplete(layer, index), index * 100);
        });
      }

      toast.success('All 20 pattern layers executed', {
        description: `Security Level: ${result.summary.securityLevel.toUpperCase()} | Score: ${(result.summary.overallScore * 100).toFixed(1)}%`
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      setError(message);
      toast.error('Pattern layer execution failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
      setCurrentLayerIndex(-1);
    }
  }, []);

  const resetExecution = useCallback(() => {
    setExecutionResult(null);
    setCurrentLayerIndex(-1);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    layers,
    executionResult,
    currentLayerIndex,
    listLayers,
    executeLayer,
    executeAllLayers,
    resetExecution
  };
}
