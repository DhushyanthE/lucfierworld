import { useState, useCallback, useMemo } from 'react';
import { UnifiedMetrics } from './useUnifiedMetrics';
import { toast } from '@/hooks/use-toast';

export interface MetricThreshold {
  id: string;
  category: keyof UnifiedMetrics;
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  value: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  name: string;
}

export interface ThresholdAlert {
  id: string;
  threshold: MetricThreshold;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
}

const DEFAULT_THRESHOLDS: MetricThreshold[] = [
  // Quantum thresholds
  { id: 'q1', category: 'quantum', metric: 'fidelity', operator: 'lt', value: 80, severity: 'warning', enabled: true, name: 'Low Quantum Fidelity' },
  { id: 'q2', category: 'quantum', metric: 'securityScore', operator: 'lt', value: 70, severity: 'critical', enabled: true, name: 'Critical Security Score' },
  { id: 'q3', category: 'quantum', metric: 'coherence', operator: 'lt', value: 75, severity: 'warning', enabled: true, name: 'Low Coherence' },
  
  // AGI thresholds
  { id: 'a1', category: 'agi', metric: 'superintelligenceScore', operator: 'lt', value: 50, severity: 'info', enabled: true, name: 'Low SI Score' },
  { id: 'a2', category: 'agi', metric: 'gasSavings', operator: 'lt', value: 10, severity: 'warning', enabled: true, name: 'Poor Gas Savings' },
  
  // Agentic thresholds
  { id: 'ag1', category: 'agentic', metric: 'annAccuracy', operator: 'lt', value: 85, severity: 'warning', enabled: true, name: 'Low ANN Accuracy' },
  { id: 'ag2', category: 'agentic', metric: 'learningProgress', operator: 'lt', value: 50, severity: 'info', enabled: true, name: 'Slow Learning Progress' },
  
  // Anomaly thresholds
  { id: 'an1', category: 'anomaly', metric: 'riskLevel', operator: 'gt', value: 70, severity: 'critical', enabled: true, name: 'High Risk Level' },
  { id: 'an2', category: 'anomaly', metric: 'detectionsCount', operator: 'gt', value: 10, severity: 'warning', enabled: true, name: 'Many Anomalies Detected' },
  
  // Overall thresholds
  { id: 'o1', category: 'overall', metric: 'systemHealth', operator: 'lt', value: 60, severity: 'critical', enabled: true, name: 'Critical System Health' },
  { id: 'o2', category: 'overall', metric: 'uptime', operator: 'lt', value: 99, severity: 'warning', enabled: true, name: 'Degraded Uptime' },
];

export function useMetricThresholds() {
  const [thresholds, setThresholds] = useState<MetricThreshold[]>(DEFAULT_THRESHOLDS);
  const [alerts, setAlerts] = useState<ThresholdAlert[]>([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const checkThreshold = useCallback((threshold: MetricThreshold, value: number): boolean => {
    switch (threshold.operator) {
      case 'gt': return value > threshold.value;
      case 'lt': return value < threshold.value;
      case 'gte': return value >= threshold.value;
      case 'lte': return value <= threshold.value;
      case 'eq': return value === threshold.value;
      default: return false;
    }
  }, []);

  const getMetricValue = useCallback((metrics: UnifiedMetrics, category: keyof UnifiedMetrics, metric: string): number => {
    const categoryData = metrics[category] as Record<string, number>;
    return categoryData[metric] ?? 0;
  }, []);

  const evaluateThresholds = useCallback((metrics: UnifiedMetrics): ThresholdAlert[] => {
    if (!alertsEnabled) return [];
    
    const newAlerts: ThresholdAlert[] = [];
    
    thresholds.forEach(threshold => {
      if (!threshold.enabled) return;
      
      const currentValue = getMetricValue(metrics, threshold.category, threshold.metric);
      if (currentValue === 0) return; // Skip uninitialized metrics
      
      if (checkThreshold(threshold, currentValue)) {
        // Check if alert already exists for this threshold
        const existingAlert = alerts.find(a => a.threshold.id === threshold.id && !a.acknowledged);
        
        if (!existingAlert) {
          const alert: ThresholdAlert = {
            id: `${threshold.id}-${Date.now()}`,
            threshold,
            currentValue,
            timestamp: new Date(),
            acknowledged: false,
          };
          newAlerts.push(alert);
          
          // Show toast for new alerts
          const toastVariant = threshold.severity === 'critical' ? 'destructive' : 'default';
          toast({
            variant: toastVariant,
            title: `${threshold.severity.toUpperCase()}: ${threshold.name}`,
            description: `${threshold.metric} is ${currentValue.toFixed(1)} (threshold: ${threshold.operator} ${threshold.value})`,
          });
        }
      }
    });
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev.slice(-49), ...newAlerts]);
    }
    
    return newAlerts;
  }, [thresholds, alerts, alertsEnabled, checkThreshold, getMetricValue]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, []);

  const acknowledgeAllAlerts = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  }, []);

  const clearAcknowledgedAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(a => !a.acknowledged));
  }, []);

  const updateThreshold = useCallback((id: string, updates: Partial<MetricThreshold>) => {
    setThresholds(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  const addThreshold = useCallback((threshold: Omit<MetricThreshold, 'id'>) => {
    const newThreshold: MetricThreshold = {
      ...threshold,
      id: `custom-${Date.now()}`,
    };
    setThresholds(prev => [...prev, newThreshold]);
  }, []);

  const removeThreshold = useCallback((id: string) => {
    setThresholds(prev => prev.filter(t => t.id !== id));
  }, []);

  const activeAlerts = useMemo(() => 
    alerts.filter(a => !a.acknowledged),
    [alerts]
  );

  const criticalAlerts = useMemo(() => 
    activeAlerts.filter(a => a.threshold.severity === 'critical'),
    [activeAlerts]
  );

  return {
    thresholds,
    alerts,
    activeAlerts,
    criticalAlerts,
    alertsEnabled,
    setAlertsEnabled,
    evaluateThresholds,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    clearAcknowledgedAlerts,
    updateThreshold,
    addThreshold,
    removeThreshold,
  };
}
