import { useState, useCallback, useMemo } from 'react';
import { UnifiedMetrics } from './useUnifiedMetrics';

export interface MetricDataPoint {
  timestamp: Date;
  metrics: {
    systemHealth: number;
    quantumFidelity: number;
    agiScore: number;
    agenticAccuracy: number;
    anomalyRisk: number;
    bigDataThroughput: number;
    genomicAccuracy: number;
  };
}

const MAX_HISTORY_POINTS = 50;

export function useMetricHistory() {
  const [history, setHistory] = useState<MetricDataPoint[]>([]);

  const addDataPoint = useCallback((metrics: UnifiedMetrics) => {
    const dataPoint: MetricDataPoint = {
      timestamp: new Date(),
      metrics: {
        systemHealth: metrics.overall.systemHealth,
        quantumFidelity: metrics.quantum.fidelity,
        agiScore: metrics.agi.superintelligenceScore,
        agenticAccuracy: metrics.agentic.annAccuracy,
        anomalyRisk: metrics.anomaly.riskLevel,
        bigDataThroughput: metrics.bigData.throughput,
        genomicAccuracy: metrics.genomic.accuracy,
      },
    };

    setHistory(prev => {
      const newHistory = [...prev, dataPoint];
      // Keep only the last MAX_HISTORY_POINTS
      return newHistory.slice(-MAX_HISTORY_POINTS);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const chartData = useMemo(() => {
    return history.map((point, index) => ({
      name: point.timestamp.toLocaleTimeString(),
      index,
      systemHealth: point.metrics.systemHealth,
      quantumFidelity: point.metrics.quantumFidelity,
      agiScore: point.metrics.agiScore,
      agenticAccuracy: point.metrics.agenticAccuracy,
      anomalyRisk: point.metrics.anomalyRisk,
      bigDataThroughput: point.metrics.bigDataThroughput,
      genomicAccuracy: point.metrics.genomicAccuracy,
    }));
  }, [history]);

  const latestPoint = useMemo(() =>
    history.length > 0 ? history[history.length - 1] : null,
    [history]
  );

  return {
    history,
    chartData,
    latestPoint,
    addDataPoint,
    clearHistory,
    dataPointCount: history.length,
  };
}
