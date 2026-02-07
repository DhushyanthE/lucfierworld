import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface FirewallLogEvent {
  id: string;
  session_id: string;
  event_type: string;
  severity?: string | null;
  threat_type?: string | null;
  threat_signature?: string | null;
  defense_action?: string | null;
  qnn_layer?: string | null;
  success: boolean | null;
  quantum_fidelity?: number | null;
  subspace_id?: string | null;
  honeypot_id?: string | null;
  block_hash?: string | null;
  merkle_root?: string | null;
  metrics?: Record<string, any> | null;
  created_at: string;
}

interface RealtimeMetrics {
  totalThreats: number;
  neutralizedThreats: number;
  activeScans: number;
  lastScanTime?: string;
  defenseScore: number;
  criticalAlerts: number;
}

export function useQuantumFirewallRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeLogs, setRealtimeLogs] = useState<FirewallLogEvent[]>([]);
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    totalThreats: 0,
    neutralizedThreats: 0,
    activeScans: 0,
    defenseScore: 0,
    criticalAlerts: 0,
  });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Subscribe to realtime updates
  const connect = useCallback(() => {
    console.log('Connecting to Quantum Firewall realtime...');
    
    const newChannel = supabase
      .channel('quantum-firewall-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quantum_firewall_logs',
        },
        (payload) => {
          console.log('Realtime firewall event:', payload);
          const newLog = payload.new as FirewallLogEvent;
          
          setRealtimeLogs((prev) => [newLog, ...prev].slice(0, 50));
          
          // Update metrics based on event type
          setMetrics((prev) => {
            const updated = { ...prev };
            
            if (newLog.event_type === 'threat_detected') {
              updated.totalThreats++;
              if (newLog.severity === 'critical' || newLog.severity === 'high') {
                updated.criticalAlerts++;
              }
            } else if (newLog.event_type === 'threat_neutralized') {
              updated.neutralizedThreats++;
              updated.defenseScore = updated.neutralizedThreats / Math.max(updated.totalThreats, 1);
            } else if (newLog.event_type === 'scan_completed') {
              updated.lastScanTime = newLog.created_at;
              if (newLog.metrics) {
                updated.defenseScore = newLog.metrics.defenseScore || updated.defenseScore;
              }
            }
            
            return updated;
          });
        }
      )
      .subscribe((status) => {
        console.log('Quantum Firewall realtime status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(newChannel);
  }, []);

  // Disconnect from realtime
  const disconnect = useCallback(() => {
    if (channel) {
      console.log('Disconnecting from Quantum Firewall realtime...');
      supabase.removeChannel(channel);
      setChannel(null);
      setIsConnected(false);
    }
  }, [channel]);

  // Fetch historical logs
  const fetchHistoricalLogs = useCallback(async (limit = 50) => {
    const { data, error } = await supabase
      .from('quantum_firewall_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching firewall logs:', error);
      return [];
    }

    // Map to our interface type
    const mappedLogs: FirewallLogEvent[] = (data || []).map(log => ({
      id: log.id,
      session_id: log.session_id,
      event_type: log.event_type,
      severity: log.severity,
      threat_type: log.threat_type,
      threat_signature: log.threat_signature,
      defense_action: log.defense_action,
      qnn_layer: log.qnn_layer,
      success: log.success,
      quantum_fidelity: log.quantum_fidelity,
      subspace_id: log.subspace_id,
      honeypot_id: log.honeypot_id,
      block_hash: log.block_hash,
      merkle_root: log.merkle_root,
      metrics: typeof log.metrics === 'object' ? log.metrics as Record<string, any> : null,
      created_at: log.created_at,
    }));

    setRealtimeLogs(mappedLogs);

    // Calculate metrics from historical data
    const threats = data?.filter(l => l.event_type === 'threat_detected').length || 0;
    const neutralized = data?.filter(l => l.event_type === 'threat_neutralized').length || 0;
    const critical = data?.filter(l => 
      l.event_type === 'threat_detected' && 
      (l.severity === 'critical' || l.severity === 'high')
    ).length || 0;
    const lastScan = data?.find(l => l.event_type === 'scan_completed');

    setMetrics({
      totalThreats: threats,
      neutralizedThreats: neutralized,
      activeScans: 0,
      lastScanTime: lastScan?.created_at,
      defenseScore: neutralized / Math.max(threats, 1),
      criticalAlerts: critical,
    });

    return data;
  }, []);

  // Trigger a scheduled scan
  const triggerScheduledScan = useCallback(async (userId?: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quantum-firewall-scheduler`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            operation: 'run-scheduled-scan',
            userId,
            sessionId: `manual-${Date.now()}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error triggering scheduled scan:', error);
      throw error;
    }
  }, []);

  // Get threat analytics
  const getThreatAnalytics = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quantum-firewall-scheduler`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            operation: 'get-threat-analytics',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.analytics;
    } catch (error) {
      console.error('Error fetching threat analytics:', error);
      throw error;
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    fetchHistoricalLogs();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    realtimeLogs,
    metrics,
    connect,
    disconnect,
    fetchHistoricalLogs,
    triggerScheduledScan,
    getThreatAnalytics,
  };
}
