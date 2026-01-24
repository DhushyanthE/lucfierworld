import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Plus, Trash2, TrendingUp, TrendingDown, AlertCircle, DollarSign, Percent } from 'lucide-react';
import { usePortfolio, CreateHoldingData } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { CryptoPrice } from '@/services/cryptoApiService';
import { formatCurrency } from '@/lib/utils';

interface PortfolioTrackerProps {
  currentPrices?: CryptoPrice[];
  availableSymbols?: string[];
}

export function PortfolioTracker({ currentPrices = [], availableSymbols = ['BTC', 'ETH', 'SOL', 'QNTM'] }: PortfolioTrackerProps) {
  const { isAuthenticated } = useAuth();
  const { loading, createHolding, deleteHolding, portfolioSummary } = usePortfolio(currentPrices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateHoldingData>({
    symbol: 'BTC',
    amount: 0,
    purchase_price: 0,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentPrice = (symbol: string): number => {
    const price = currentPrices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase());
    return price?.price || 0;
  };

  const handleSubmit = async () => {
    if (formData.amount <= 0 || formData.purchase_price <= 0) return;
    
    setIsSubmitting(true);
    const success = await createHolding(formData);
    if (success) {
      setIsDialogOpen(false);
      setFormData({
        symbol: 'BTC',
        amount: 0,
        purchase_price: 0,
        notes: '',
      });
    }
    setIsSubmitting(false);
  };

  const handleSymbolChange = (symbol: string) => {
    const currentPrice = getCurrentPrice(symbol);
    setFormData(prev => ({
      ...prev,
      symbol,
      purchase_price: currentPrice > 0 ? Math.round(currentPrice * 100) / 100 : prev.purchase_price,
    }));
  };

  const formatPL = (value: number) => {
    const formatted = formatCurrency(Math.abs(value));
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatPLPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Portfolio Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Please log in to track your portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalValue, totalCost, totalProfitLoss, totalProfitLossPercent, holdings } = portfolioSummary;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Portfolio Tracker
            {holdings.length > 0 && (
              <Badge variant="secondary" className="ml-2">{holdings.length} holdings</Badge>
            )}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Holding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Portfolio Holding</DialogTitle>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Price (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.purchase_price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about this purchase..."
                    rows={2}
                  />
                </div>

                {formData.amount > 0 && formData.purchase_price > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(formData.amount * formData.purchase_price)}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || formData.amount <= 0 || formData.purchase_price <= 0}
                >
                  {isSubmitting ? 'Adding...' : 'Add Holding'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Portfolio Summary */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Total Value
              </div>
              <div className="text-lg font-semibold">{formatCurrency(totalValue)}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Total Cost
              </div>
              <div className="text-lg font-semibold">{formatCurrency(totalCost)}</div>
            </div>
            <div className={`p-3 rounded-lg ${totalProfitLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {totalProfitLoss >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                P/L
              </div>
              <div className={`text-lg font-semibold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPL(totalProfitLoss)}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${totalProfitLossPercent >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Percent className="h-3 w-3" />
                P/L %
              </div>
              <div className={`text-lg font-semibold ${totalProfitLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPLPercent(totalProfitLossPercent)}
              </div>
            </div>
          </div>
        )}

        {/* Holdings List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : holdings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No holdings yet</p>
            <p className="text-sm text-muted-foreground">Add your first holding to start tracking your portfolio</p>
          </div>
        ) : (
          <div className="space-y-2">
            {holdings.map(holding => (
              <div 
                key={holding.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    holding.profitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {holding.profitLoss >= 0 
                      ? <TrendingUp className="h-4 w-4 text-green-500" />
                      : <TrendingDown className="h-4 w-4 text-red-500" />
                    }
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {holding.symbol}
                      <span className="text-sm text-muted-foreground">
                        {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bought @ {formatCurrency(holding.purchase_price)} • Now {formatCurrency(holding.currentPrice)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(holding.currentValue)}</div>
                    <div className={`text-sm ${holding.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPL(holding.profitLoss)} ({formatPLPercent(holding.profitLossPercent)})
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteHolding(holding.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
