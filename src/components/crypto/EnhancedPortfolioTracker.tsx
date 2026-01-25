import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Briefcase, Plus, Trash2, TrendingUp, TrendingDown, AlertCircle, DollarSign, Percent, PieChart, BarChart3, Edit2 } from 'lucide-react';
import { usePortfolio, CreateHoldingData } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { CryptoPrice } from '@/services/cryptoApiService';
import { formatCurrency } from '@/lib/utils';
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart';

interface EnhancedPortfolioTrackerProps {
  currentPrices?: CryptoPrice[];
  availableSymbols?: string[];
}

export function EnhancedPortfolioTracker({ currentPrices = [], availableSymbols = ['BTC', 'ETH', 'SOL', 'QNTM'] }: EnhancedPortfolioTrackerProps) {
  const { isAuthenticated } = useAuth();
  const { loading, createHolding, deleteHolding, portfolioSummary } = usePortfolio(currentPrices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState('holdings');
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

  if (!isAuthenticated) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            Portfolio Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted/30 mb-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Login Required</p>
            <p className="text-muted-foreground text-sm">Please log in to track your portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalValue, totalCost, totalProfitLoss, totalProfitLossPercent, holdings } = portfolioSummary;

  return (
    <div className="space-y-6">
      {/* Main Portfolio Card */}
      <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Hero Stats Section */}
        {holdings.length > 0 && (
          <div className="relative p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/30">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  <DollarSign className="h-3.5 w-3.5" />
                  Total Value
                </div>
                <div className="text-3xl font-bold text-foreground">{formatCurrency(totalValue)}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  <DollarSign className="h-3.5 w-3.5" />
                  Cost Basis
                </div>
                <div className="text-3xl font-bold text-foreground">{formatCurrency(totalCost)}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {totalProfitLoss >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  Profit / Loss
                </div>
                <div className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  <Percent className="h-3.5 w-3.5" />
                  Return
                </div>
                <div className={`text-3xl font-bold ${totalProfitLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalProfitLossPercent >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              Portfolio Tracker
              {holdings.length > 0 && (
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  {holdings.length} holdings
                </Badge>
              )}
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                  <Plus className="h-4 w-4" />
                  Add Holding
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add Portfolio Holding
                  </DialogTitle>
                  <DialogDescription>
                    Add a cryptocurrency holding to track its performance.
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Amount</Label>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Purchase Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.purchase_price || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          className="pl-7 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Notes (optional)</Label>
                    <Textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes about this purchase..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  {formData.amount > 0 && formData.purchase_price > 0 && (
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Cost</span>
                        <span className="text-xl font-bold text-foreground">
                          {formatCurrency(formData.amount * formData.purchase_price)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || formData.amount <= 0 || formData.purchase_price <= 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Holding'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4 bg-muted/30">
              <TabsTrigger value="holdings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Briefcase className="h-4 w-4 mr-1.5" />
                Holdings
              </TabsTrigger>
              <TabsTrigger value="charts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="holdings" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : holdings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-muted/30 mb-4">
                    <Briefcase className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">No Holdings Yet</p>
                  <p className="text-muted-foreground text-sm mb-4">Add your first holding to start tracking</p>
                  <Button onClick={() => setIsDialogOpen(true)} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add Your First Holding
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {holdings.map(holding => (
                    <div 
                      key={holding.id} 
                      className="group relative overflow-hidden rounded-xl border bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            holding.profitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {holding.profitLoss >= 0 
                              ? <TrendingUp className="h-5 w-5 text-green-500" />
                              : <TrendingDown className="h-5 w-5 text-red-500" />
                            }
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-lg text-foreground">{holding.symbol}</span>
                              <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border/50">
                                {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>Bought @ {formatCurrency(holding.purchase_price)}</span>
                              <span className="text-foreground/70">→</span>
                              <span className="text-foreground">Now {formatCurrency(holding.currentPrice)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-bold text-lg text-foreground">{formatCurrency(holding.currentValue)}</div>
                            <div className={`text-sm font-medium ${holding.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {holding.profitLoss >= 0 ? '+' : ''}{formatCurrency(holding.profitLoss)}
                              <span className="ml-1.5 opacity-80">
                                ({holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteHolding(holding.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {holding.notes && (
                        <div className="px-4 pb-3 pt-0">
                          <p className="text-xs text-muted-foreground italic bg-muted/30 rounded-lg px-3 py-2">
                            {holding.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="charts" className="mt-0">
              <PortfolioPerformanceChart
                holdings={holdings}
                totalValue={totalValue}
                totalCost={totalCost}
                totalProfitLoss={totalProfitLoss}
                totalProfitLossPercent={totalProfitLossPercent}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
