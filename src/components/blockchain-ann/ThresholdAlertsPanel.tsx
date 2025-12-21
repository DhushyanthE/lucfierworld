import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, Bell, BellOff, CheckCircle, 
  XCircle, AlertCircle, Info, Trash2 
} from 'lucide-react';
import { ThresholdAlert, MetricThreshold } from '@/hooks/useMetricThresholds';

interface ThresholdAlertsPanelProps {
  alerts: ThresholdAlert[];
  activeAlerts: ThresholdAlert[];
  criticalAlerts: ThresholdAlert[];
  thresholds: MetricThreshold[];
  alertsEnabled: boolean;
  onToggleAlerts: (enabled: boolean) => void;
  onAcknowledge: (alertId: string) => void;
  onAcknowledgeAll: () => void;
  onClearAcknowledged: () => void;
  onToggleThreshold: (id: string, enabled: boolean) => void;
}

export function ThresholdAlertsPanel({
  alerts,
  activeAlerts,
  criticalAlerts,
  thresholds,
  alertsEnabled,
  onToggleAlerts,
  onAcknowledge,
  onAcknowledgeAll,
  onClearAcknowledged,
  onToggleThreshold,
}: ThresholdAlertsPanelProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Warning</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case 'gt': return '>';
      case 'lt': return '<';
      case 'gte': return '≥';
      case 'lte': return '≤';
      case 'eq': return '=';
      default: return operator;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Active Alerts */}
      <Card className="border-destructive/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-destructive" />
              Active Alerts
              {activeAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeAlerts.length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                id="alerts-toggle"
                checked={alertsEnabled}
                onCheckedChange={onToggleAlerts}
              />
              <Label htmlFor="alerts-toggle" className="text-xs">
                {alertsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {criticalAlerts.length > 0 && (
            <div className="mb-3 p-2 rounded bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                {criticalAlerts.length} Critical Alert(s)
              </div>
            </div>
          )}
          
          {activeAlerts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
              <p className="text-sm">No active alerts</p>
              <p className="text-xs">All metrics are within thresholds</p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {activeAlerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className="flex items-center justify-between p-2 rounded bg-muted border-l-4"
                      style={{
                        borderLeftColor: alert.threshold.severity === 'critical' 
                          ? 'hsl(var(--destructive))' 
                          : alert.threshold.severity === 'warning' 
                          ? '#eab308' 
                          : '#3b82f6'
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {getSeverityIcon(alert.threshold.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {alert.threshold.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {alert.currentValue.toFixed(1)} {getOperatorSymbol(alert.threshold.operator)} {alert.threshold.value}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={onAcknowledgeAll}
                >
                  Acknowledge All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onClearAcknowledged}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Configured Thresholds */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Configured Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {thresholds.map(threshold => (
                <div 
                  key={threshold.id}
                  className={`flex items-center justify-between p-2 rounded bg-muted ${
                    !threshold.enabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getSeverityIcon(threshold.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {threshold.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {threshold.category}.{threshold.metric} {getOperatorSymbol(threshold.operator)} {threshold.value}
                      </div>
                    </div>
                    {getSeverityBadge(threshold.severity)}
                  </div>
                  <Switch
                    checked={threshold.enabled}
                    onCheckedChange={(enabled) => onToggleThreshold(threshold.id, enabled)}
                    className="ml-2"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
