/**
 * Hook for managing Quantum Blockchain ANN Analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { quantumBlockchainAnalytics, CombinedAnalytics, AnalyticsHistory } from '@/services/analytics/QuantumBlockchainAnalytics';
import { toast } from 'sonner';

export function useQuantumBlockchainAnalytics(autoRefresh = false, refreshInterval = 5000) {
  const [analytics, setAnalytics] = useState<CombinedAnalytics | null>(null);
  const [history, setHistory] = useState<AnalyticsHistory>({
    blockchain: [],
    quantum: [],
    ann: [],
    combined: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);

  // Generate fresh analytics
  const generateAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await quantumBlockchainAnalytics.generateCombinedAnalytics();
      setAnalytics(data);
      setHistory(quantumBlockchainAnalytics.getAnalyticsHistory());
      toast.success('Analytics updated successfully');
    } catch (error) {
      console.error('Failed to generate analytics:', error);
      toast.error('Failed to generate analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate predictions
  const generatePredictions = useCallback(async () => {
    try {
      const data = await quantumBlockchainAnalytics.generatePredictions(10);
      setPredictions(data);
      toast.success('Predictions generated');
    } catch (error) {
      console.error('Failed to generate predictions:', error);
      toast.error('Failed to generate predictions');
    }
  }, []);

  // Export report
  const exportReport = useCallback(async (format: 'json' | 'csv') => {
    try {
      const report = await quantumBlockchainAnalytics.exportReport(format);
      
      // Create download link
      const blob = new Blob([report], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quantum-blockchain-analytics-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error('Failed to export report');
    }
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    quantumBlockchainAnalytics.clearHistory();
    setHistory({
      blockchain: [],
      quantum: [],
      ann: [],
      combined: []
    });
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(generateAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, generateAnalytics]);

  // Initial load
  useEffect(() => {
    generateAnalytics();
  }, [generateAnalytics]);

  return {
    analytics,
    history,
    isLoading,
    predictions,
    generateAnalytics,
    generatePredictions,
    exportReport,
    clearHistory
  };
}
