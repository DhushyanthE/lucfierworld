/**
 * Automated Anomaly Alerting System
 * Scheduled AI predictions with notification system
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, BellRing, Clock, AlertTriangle, CheckCircle, 
  Play, Pause, Settings, Trash2, Brain, Shield
} from 'lucide-react';
import { useAIAnomalyPrediction, AnomalyPrediction } from '@/hooks/useAIAnomalyPrediction';
import { useUnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { toast } from 'sonner';

interface AlertRecord {
  id: string;
  timestamp: Date;
  predictions: AnomalyPrediction[];
  riskScore: number;
  acknowledged: boolean;
}

const SCHEDULE_OPTIONS = [
  { value: '30000', label: '30 seconds' },
  { value: '60000', label: '1 minute' },
  { value: '300000', label: '5 minutes' },
  { value: '600000', label: '10 minutes' },
  { value: '1800000', label: '30 minutes' },
];

export function AutomatedAnomalyAlerting() {
  const { metrics } = useUnifiedMetrics();
  const { isLoading, predictAnomalies } = useAIAnomalyPrediction();
  
  const [isSchedulerActive, setIsSchedulerActive] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState('60000');
  const [alertHistory, setAlertHistory] = useState<AlertRecord[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [criticalOnlyNotifications, setCriticalOnlyNotifications] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [nextRun, setNextRun] = useState<Date | null>(null);
  
  const schedulerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const runPrediction = useCallback(async () => {
    const result = await predictAnomalies(metrics);
    
    if (result) {
      const alertRecord: AlertRecord = {
        id: `alert_${Date.now()}`,
        timestamp: new Date(),
        predictions: result.predictions,
        riskScore: result.riskScore,
        acknowledged: false
      };
      
      setAlertHistory(prev => [alertRecord, ...prev.slice(0, 49)]);
      setLastRun(new Date());
      
      // Send notifications
      if (notificationsEnabled) {
        const criticalPredictions = result.predictions.filter(
          p => p.severity === 'critical' || p.severity === 'high'
        );
        
        if (criticalPredictions.length > 0) {
          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⚠️ Critical Anomaly Detected', {
              body: `${criticalPredictions.length} high-risk anomalies detected. Risk score: ${(result.riskScore * 100).toFixed(0)}%`,
              icon: '/favicon.ico'
            });
          }
          
          toast.warning(`${criticalPredictions.length} Critical Anomalies Detected`, {
            description: criticalPredictions[0].description,
            duration: 10000
          });
        } else if (!criticalOnlyNotifications && result.predictions.length > 0) {
          toast.info('AI Scan Complete', {
            description: `${result.predictions.length} potential anomalies detected. Risk: ${(result.riskScore * 100).toFixed(0)}%`
          });
        }
      }
    }
    
    return result;
  }, [metrics, predictAnomalies, notificationsEnabled, criticalOnlyNotifications]);

  const startScheduler = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
    }
    
    const interval = parseInt(scheduleInterval);
    
    // Run immediately
    runPrediction();
    
    // Set up interval
    schedulerRef.current = setInterval(() => {
      runPrediction();
    }, interval);
    
    // Update next run time
    setNextRun(new Date(Date.now() + interval));
    
    // Countdown timer
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    countdownRef.current = setInterval(() => {
      setNextRun(new Date(Date.now() + interval));
    }, interval);
    
    setIsSchedulerActive(true);
    toast.success('Automated alerting started', {
      description: `AI predictions will run every ${SCHEDULE_OPTIONS.find(o => o.value === scheduleInterval)?.label}`
    });
  }, [scheduleInterval, runPrediction]);

  const stopScheduler = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    
    setIsSchedulerActive(false);
    setNextRun(null);
    toast.info('Automated alerting stopped');
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setAlertHistory(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const clearHistory = () => {
    setAlertHistory([]);
    toast.success('Alert history cleared');
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Browser notifications enabled');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (schedulerRef.current) clearInterval(schedulerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const unacknowledgedCount = alertHistory.filter(a => !a.acknowledged).length;
  const criticalCount = alertHistory.filter(a => 
    a.predictions.some(p => p.severity === 'critical' || p.severity === 'high')
  ).length;

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className={`border-2 ${isSchedulerActive ? 'border-green-500/50' : 'border-border'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isSchedulerActive ? 'bg-green-500/20' : 'bg-muted'}`}>
                {isSchedulerActive ? (
                  <BellRing className="h-6 w-6 text-green-500 animate-pulse" />
                ) : (
                  <Bell className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Automated Anomaly Alerting
                  <Badge variant={isSchedulerActive ? 'default' : 'secondary'}>
                    {isSchedulerActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Scheduled AI predictions with automatic notifications
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSchedulerActive ? (
                <Button variant="destructive" onClick={stopScheduler}>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button onClick={startScheduler} disabled={isLoading}>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Schedule Settings */}
            <div className="space-y-2">
              <Label>Schedule Interval</Label>
              <Select value={scheduleInterval} onValueChange={setScheduleInterval} disabled={isSchedulerActive}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled}
                />
                <Label>Enable Notifications</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={criticalOnlyNotifications} 
                  onCheckedChange={setCriticalOnlyNotifications}
                />
                <Label className="text-sm">Critical Only</Label>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Last Run</div>
              <div className="font-mono text-sm">
                {lastRun ? lastRun.toLocaleTimeString() : 'Never'}
              </div>
              {nextRun && isSchedulerActive && (
                <>
                  <div className="text-sm text-muted-foreground">Next Run</div>
                  <div className="font-mono text-sm text-green-500">
                    {nextRun.toLocaleTimeString()}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestNotificationPermission}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Browser Alerts
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => runPrediction()}
                disabled={isLoading}
                className="w-full"
              >
                <Brain className="h-4 w-4 mr-2" />
                Run Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{alertHistory.length}</p>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">{unacknowledgedCount}</p>
              <p className="text-sm text-muted-foreground">Unacknowledged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{criticalCount}</p>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">
                {alertHistory.length > 0 
                  ? ((alertHistory.filter(a => a.riskScore < 0.3).length / alertHistory.length) * 100).toFixed(0)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Low Risk Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alert History</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alertHistory.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {alertHistory.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.acknowledged ? 'bg-muted/50' : 'bg-card'
                    } ${
                      alert.predictions.some(p => p.severity === 'critical') ? 'border-red-500/50' :
                      alert.predictions.some(p => p.severity === 'high') ? 'border-orange-500/50' :
                      'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{alert.timestamp.toLocaleString()}</span>
                        {alert.acknowledged && (
                          <Badge variant="outline" className="text-xs">Acknowledged</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          alert.riskScore > 0.6 ? 'destructive' :
                          alert.riskScore > 0.3 ? 'secondary' : 'default'
                        }>
                          Risk: {(alert.riskScore * 100).toFixed(0)}%
                        </Badge>
                        {!alert.acknowledged && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {alert.predictions.slice(0, 3).map((pred, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline"
                          className={
                            pred.severity === 'critical' ? 'border-red-500 text-red-500' :
                            pred.severity === 'high' ? 'border-orange-500 text-orange-500' :
                            pred.severity === 'medium' ? 'border-yellow-500 text-yellow-500' :
                            'border-green-500 text-green-500'
                          }
                        >
                          {pred.type}
                        </Badge>
                      ))}
                      {alert.predictions.length > 3 && (
                        <Badge variant="outline">+{alert.predictions.length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No alerts yet. Start the scheduler to begin monitoring.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
