import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Bell, BellOff, Plus, Trash2, TrendingUp, TrendingDown, Mail, Smartphone, AlertCircle } from 'lucide-react';
import { usePriceAlerts, CreatePriceAlertData } from '@/hooks/usePriceAlerts';
import { useAuth } from '@/hooks/useAuth';
import { CryptoPrice } from '@/services/cryptoApiService';
import { formatCurrency } from '@/lib/utils';

interface PriceAlertsProps {
  currentPrices?: CryptoPrice[];
  availableSymbols?: string[];
}

export function PriceAlerts({ currentPrices = [], availableSymbols = ['BTC', 'ETH', 'SOL', 'QNTM'] }: PriceAlertsProps) {
  const { isAuthenticated } = useAuth();
  const { alerts, loading, createAlert, deleteAlert, toggleAlert } = usePriceAlerts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePriceAlertData>({
    symbol: 'BTC',
    target_price: 0,
    condition: 'above',
    notification_method: 'in_app',
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
        notification_method: 'in_app',
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

  if (!isAuthenticated) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Price Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Please log in to create price alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Price Alerts
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">{alerts.length}</Badge>
            )}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Price Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Cryptocurrency</Label>
                  <Select value={formData.symbol} onValueChange={handleSymbolChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSymbols.map(symbol => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol} {getCurrentPrice(symbol) > 0 && `(${formatCurrency(getCurrentPrice(symbol))})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select 
                    value={formData.condition} 
                    onValueChange={(v: 'above' | 'below') => setFormData(prev => ({ ...prev, condition: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Price goes above
                        </span>
                      </SelectItem>
                      <SelectItem value="below">
                        <span className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          Price goes below
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Price (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.target_price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_price: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter target price"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notification Method</Label>
                  <Select 
                    value={formData.notification_method} 
                    onValueChange={(v: 'in_app' | 'email' | 'both') => setFormData(prev => ({ ...prev, notification_method: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_app">
                        <span className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          In-App Only
                        </span>
                      </SelectItem>
                      <SelectItem value="email">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Only
                        </span>
                      </SelectItem>
                      <SelectItem value="both">
                        <span className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Both
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || formData.target_price <= 0}>
                  {isSubmitting ? 'Creating...' : 'Create Alert'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No price alerts yet</p>
            <p className="text-sm text-muted-foreground">Create an alert to get notified when prices hit your targets</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => {
              const currentPrice = getCurrentPrice(alert.symbol);
              const isTriggered = alert.triggered_at !== null;
              const wouldTrigger = alert.condition === 'above' 
                ? currentPrice >= alert.target_price 
                : currentPrice <= alert.target_price;
              
              return (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isTriggered ? 'bg-green-500/10 border-green-500/30' :
                    !alert.is_active ? 'bg-muted/30 border-border/30 opacity-60' :
                    'bg-card border-border/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      alert.condition === 'above' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {alert.condition === 'above' 
                        ? <TrendingUp className="h-4 w-4 text-green-500" />
                        : <TrendingDown className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {alert.symbol}
                        {isTriggered && <Badge variant="default" className="text-xs">Triggered</Badge>}
                        {!isTriggered && wouldTrigger && alert.is_active && (
                          <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500">Near Target</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {alert.condition === 'above' ? 'Above' : 'Below'} {formatCurrency(alert.target_price)}
                        {currentPrice > 0 && (
                          <span className="ml-2 text-xs">
                            (Current: {formatCurrency(currentPrice)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                      disabled={isTriggered}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
