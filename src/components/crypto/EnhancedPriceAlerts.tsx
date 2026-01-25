import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Bell, BellOff, BellRing, Plus, Trash2, TrendingUp, TrendingDown, Mail, Smartphone, AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { usePriceAlerts, CreatePriceAlertData, PriceAlert } from '@/hooks/usePriceAlerts';
import { useAuth } from '@/hooks/useAuth';
import { CryptoPrice } from '@/services/cryptoApiService';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedPriceAlertsProps {
  currentPrices?: CryptoPrice[];
  availableSymbols?: string[];
}

export function EnhancedPriceAlerts({ currentPrices = [], availableSymbols = ['BTC', 'ETH', 'SOL', 'QNTM'] }: EnhancedPriceAlertsProps) {
  const { isAuthenticated } = useAuth();
  const { alerts, loading, createAlert, deleteAlert, toggleAlert, activeAlerts, triggeredAlerts } = usePriceAlerts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCheckingAlerts, setIsCheckingAlerts] = useState(false);
  const [alertsTab, setAlertsTab] = useState('active');
  const [formData, setFormData] = useState<CreatePriceAlertData>({
    symbol: 'BTC',
    target_price: 0,
    condition: 'above',
    notification_method: 'both',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentPrice = (symbol: string): number => {
    const price = currentPrices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase());
    return price?.price || 0;
  };

  const handleSubmit = async () => {
    if (formData.target_price <= 0) return;
    
    setIsSubmitting(true);
    const success = await createAlert(formData);
    if (success) {
      setIsDialogOpen(false);
      setFormData({
        symbol: 'BTC',
        target_price: 0,
        condition: 'above',
        notification_method: 'both',
      });
    }
    setIsSubmitting(false);
  };

  const handleSymbolChange = (symbol: string) => {
    const currentPrice = getCurrentPrice(symbol);
    setFormData(prev => ({
      ...prev,
      symbol,
      target_price: currentPrice > 0 ? Math.round(currentPrice * 100) / 100 : prev.target_price,
    }));
  };

  const handleCheckAlerts = async () => {
    setIsCheckingAlerts(true);
    try {
      const prices = currentPrices.map(p => ({
        symbol: p.symbol,
        price: p.price,
      }));

      const { data, error } = await supabase.functions.invoke('check-price-alerts', {
        body: { prices },
      });

      if (error) throw error;

      if (data.triggered > 0) {
        toast.success(`${data.triggered} alert(s) triggered!`);
      } else {
        toast.info('No alerts triggered at current prices');
      }
    } catch (err: any) {
      console.error('Error checking alerts:', err);
      toast.error('Failed to check alerts');
    } finally {
      setIsCheckingAlerts(false);
    }
  };

  const getDistanceToTarget = (alert: PriceAlert) => {
    const currentPrice = getCurrentPrice(alert.symbol);
    if (!currentPrice) return null;
    
    const difference = alert.target_price - currentPrice;
    const percentDiff = (difference / currentPrice) * 100;
    
    return {
      difference,
      percentDiff,
      isNear: Math.abs(percentDiff) < 5,
    };
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            Price Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted/30 mb-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Login Required</p>
            <p className="text-muted-foreground text-sm">Please log in to create and manage price alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            Price Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {activeAlerts.length} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckAlerts}
              disabled={isCheckingAlerts || activeAlerts.length === 0}
              className="gap-1.5 border-border/50 hover:bg-primary/10"
            >
              {isCheckingAlerts ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Check Now
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                  <Plus className="h-4 w-4" />
                  New Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-primary" />
                    Create Price Alert
                  </DialogTitle>
                  <DialogDescription>
                    Get notified when a cryptocurrency reaches your target price.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cryptocurrency</Label>
                    <Select value={formData.symbol} onValueChange={handleSymbolChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSymbols.map(symbol => (
                          <SelectItem key={symbol} value={symbol}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="font-medium">{symbol}</span>
                              {getCurrentPrice(symbol) > 0 && (
                                <span className="text-muted-foreground text-sm">
                                  {formatCurrency(getCurrentPrice(symbol))}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Alert Condition</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={formData.condition === 'above' ? 'default' : 'outline'}
                        className={`h-12 ${formData.condition === 'above' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, condition: 'above' }))}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Price Above
                      </Button>
                      <Button
                        type="button"
                        variant={formData.condition === 'below' ? 'default' : 'outline'}
                        className={`h-12 ${formData.condition === 'below' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, condition: 'below' }))}
                      >
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Price Below
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Target Price (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.target_price || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, target_price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="pl-7 h-11"
                      />
                    </div>
                    {formData.target_price > 0 && getCurrentPrice(formData.symbol) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {((formData.target_price - getCurrentPrice(formData.symbol)) / getCurrentPrice(formData.symbol) * 100).toFixed(2)}% from current price
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Notification Method</Label>
                    <Select 
                      value={formData.notification_method} 
                      onValueChange={(v: 'in_app' | 'email' | 'both') => setFormData(prev => ({ ...prev, notification_method: v }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_app">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <span>In-App Only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>Email Only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="both">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span>Both (Recommended)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || formData.target_price <= 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Alert'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={alertsTab} onValueChange={setAlertsTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4 bg-muted/30">
            <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="h-4 w-4 mr-1.5" />
              Active ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="triggered" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Triggered ({triggeredAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-muted-foreground data-[state=active]:text-muted">
              All ({alerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted/30 mb-4">
                  <BellOff className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No active alerts</p>
                <p className="text-sm text-muted-foreground/70">Create an alert to get notified</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map(alert => renderAlertCard(alert, getCurrentPrice, getDistanceToTarget, toggleAlert, deleteAlert))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="triggered" className="mt-0">
            {triggeredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted/30 mb-4">
                  <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No triggered alerts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {triggeredAlerts.map(alert => renderAlertCard(alert, getCurrentPrice, getDistanceToTarget, toggleAlert, deleteAlert, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted/30 mb-4">
                  <Bell className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No alerts created</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => renderAlertCard(alert, getCurrentPrice, getDistanceToTarget, toggleAlert, deleteAlert))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function renderAlertCard(
  alert: PriceAlert,
  getCurrentPrice: (symbol: string) => number,
  getDistanceToTarget: (alert: PriceAlert) => { difference: number; percentDiff: number; isNear: boolean } | null,
  toggleAlert: (id: string, isActive: boolean) => Promise<boolean>,
  deleteAlert: (id: string) => Promise<boolean>,
  isTriggeredView = false
) {
  const currentPrice = getCurrentPrice(alert.symbol);
  const distance = getDistanceToTarget(alert);
  const isTriggered = alert.triggered_at !== null;

  return (
    <div 
      key={alert.id} 
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg ${
        isTriggered 
          ? 'bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/30' 
          : !alert.is_active 
            ? 'bg-muted/20 border-border/30 opacity-60' 
            : distance?.isNear
              ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/30'
              : 'bg-card/50 border-border/50 hover:border-primary/30'
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            alert.condition === 'above' 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-red-500/20 text-red-500'
          }`}>
            {alert.condition === 'above' 
              ? <TrendingUp className="h-5 w-5" />
              : <TrendingDown className="h-5 w-5" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg text-foreground">{alert.symbol}</span>
              {isTriggered && (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Triggered
                </Badge>
              )}
              {!isTriggered && distance?.isNear && alert.is_active && (
                <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 animate-pulse">
                  Near Target!
                </Badge>
              )}
              {alert.notification_method !== 'in_app' && (
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {alert.condition === 'above' ? '↑ Above' : '↓ Below'} {formatCurrency(alert.target_price)}
              </span>
              {currentPrice > 0 && !isTriggered && (
                <span className={`font-medium ${
                  distance && distance.percentDiff >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {distance && distance.percentDiff >= 0 ? '+' : ''}{distance?.percentDiff.toFixed(2)}%
                </span>
              )}
            </div>
            {currentPrice > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Current: {formatCurrency(currentPrice)}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isTriggered && (
            <Switch
              checked={alert.is_active}
              onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => deleteAlert(alert.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
