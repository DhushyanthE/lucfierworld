import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuantumFirewallRealtime } from '@/hooks/useQuantumFirewallRealtime';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  Wifi,
  WifiOff,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
  Zap,
  BarChart3,
  Radio,
} from 'lucide-react';

export function QuantumFirewallRealtimePanel() {
  const [user, setUser] = useState<any>(null);

  // Get user on mount
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  const {
    isConnected,
    realtimeLogs,
    metrics,
    connect,
    disconnect,
    triggerScheduledScan,
    getThreatAnalytics,
  } = useQuantumFirewallRealtime();

  const [isScanning, setIsScanning] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      await triggerScheduledScan(user?.id);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await getThreatAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Analytics fetch failed:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'threat_detected': return <AlertTriangle className="h-3 w-3" />;
      case 'threat_neutralized': return <CheckCircle className="h-3 w-3" />;
      case 'scan_completed': return <Activity className="h-3 w-3" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              Real-Time Threat Streaming
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'} className="flex items-center gap-1">
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={isConnected ? disconnect : connect}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Metrics */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-muted text-center">
              <div className="text-xl font-bold text-red-500">{metrics.totalThreats}</div>
              <div className="text-xs text-muted-foreground">Threats Detected</div>
            </div>
            <div className="p-3 rounded-lg bg-muted text-center">
              <div className="text-xl font-bold text-green-500">{metrics.neutralizedThreats}</div>
              <div className="text-xs text-muted-foreground">Neutralized</div>
            </div>
            <div className="p-3 rounded-lg bg-muted text-center">
              <div className="text-xl font-bold text-blue-500">{(metrics.defenseScore * 100).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Defense Score</div>
            </div>
            <div className="p-3 rounded-lg bg-muted text-center">
              <div className="text-xl font-bold text-orange-500">{metrics.criticalAlerts}</div>
              <div className="text-xs text-muted-foreground">Critical Alerts</div>
            </div>
            <div className="p-3 rounded-lg bg-muted text-center">
              <div className="text-xs font-mono text-primary truncate">
                {metrics.lastScanTime 
                  ? new Date(metrics.lastScanTime).toLocaleTimeString() 
                  : 'No scan yet'}
              </div>
              <div className="text-xs text-muted-foreground">Last Scan</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <Button onClick={handleTriggerScan} disabled={isScanning} className="flex-1">
              {isScanning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {isScanning ? 'Scanning...' : 'Trigger Scheduled Scan'}
            </Button>
            <Button onClick={handleLoadAnalytics} disabled={isLoadingAnalytics} variant="outline">
              {isLoadingAnalytics ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Analytics
            </Button>
          </div>

          {/* Analytics Display */}
          {analytics && (
            <div className="p-4 rounded-lg bg-muted/50 mb-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Threat Analytics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">By Threat Type</div>
                  <div className="space-y-1">
                    {Object.entries(analytics.threatsByType || {}).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="capitalize">{type}</span>
                        <span className="font-mono">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">By Severity</div>
                  <div className="space-y-1">
                    {Object.entries(analytics.threatsBySeverity || {}).map(([severity, count]) => (
                      <div key={severity} className="flex justify-between text-xs">
                        <Badge className={`${getSeverityColor(severity)} text-[10px] px-1`}>{severity}</Badge>
                        <span className="font-mono">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                <span className="text-muted-foreground">Neutralization Rate</span>
                <span className="font-bold text-green-500">{(analytics.neutralizationRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Event Feed */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            Live Event Feed
            <Badge variant="outline" className="ml-auto">
              {realtimeLogs.length} events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {realtimeLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No events yet. Trigger a scan or wait for real-time updates.</p>
              </div>
            ) : (
              realtimeLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    log.event_type === 'threat_detected'
                      ? 'border-red-500/30 bg-red-500/5'
                      : log.event_type === 'threat_neutralized'
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-primary/10 bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getEventIcon(log.event_type)}
                      <span className="text-sm font-medium capitalize">
                        {log.event_type.replace(/_/g, ' ')}
                      </span>
                      {log.severity && (
                        <Badge className={`${getSeverityColor(log.severity)} text-[10px] px-1`}>
                          {log.severity}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {log.threat_type && (
                      <span className="px-2 py-0.5 rounded bg-muted">
                        Type: {log.threat_type}
                      </span>
                    )}
                    {log.defense_action && (
                      <span className="px-2 py-0.5 rounded bg-muted">
                        Action: {log.defense_action}
                      </span>
                    )}
                    {log.qnn_layer && (
                      <span className="px-2 py-0.5 rounded bg-muted">
                        Layer: {log.qnn_layer}
                      </span>
                    )}
                    {log.quantum_fidelity && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                        Fidelity: {(log.quantum_fidelity * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {log.threat_signature && (
                    <div className="mt-1 text-xs font-mono text-muted-foreground truncate">
                      Sig: {log.threat_signature.slice(0, 32)}...
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
