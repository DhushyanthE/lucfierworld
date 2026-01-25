import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { CryptoPrice } from '@/services/cryptoApiService';

export interface PortfolioHolding {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  purchase_price: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHoldingData {
  symbol: string;
  amount: number;
  purchase_price: number;
  purchase_date?: string;
  notes?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  holdings: HoldingWithPL[];
}

export interface HoldingWithPL extends PortfolioHolding {
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export function usePortfolio(currentPrices: CryptoPrice[] = []) {
  const { user, isAuthenticated } = useAuth();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    currentPrices.forEach(p => map.set(p.symbol.toUpperCase(), p.price));
    return map;
  }, [currentPrices]);

  const fetchHoldings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setHoldings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setHoldings((data as unknown as PortfolioHolding[]) || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching portfolio holdings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const createHolding = async (holdingData: CreateHoldingData): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to add holdings');
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from('portfolio_holdings')
        .insert({
          user_id: user.id,
          symbol: holdingData.symbol.toUpperCase(),
          amount: holdingData.amount,
          purchase_price: holdingData.purchase_price,
          purchase_date: holdingData.purchase_date || new Date().toISOString(),
          notes: holdingData.notes || null,
        });

      if (insertError) throw insertError;

      toast.success(`Added ${holdingData.amount} ${holdingData.symbol} to portfolio`);
      await fetchHoldings();
      return true;
    } catch (err: any) {
      console.error('Error creating holding:', err);
      toast.error('Failed to add holding');
      return false;
    }
  };

  const updateHolding = async (holdingId: string, updates: Partial<CreateHoldingData>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('portfolio_holdings')
        .update({
          ...(updates.symbol && { symbol: updates.symbol.toUpperCase() }),
          ...(updates.amount && { amount: updates.amount }),
          ...(updates.purchase_price && { purchase_price: updates.purchase_price }),
          ...(updates.purchase_date && { purchase_date: updates.purchase_date }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
        })
        .eq('id', holdingId);

      if (updateError) throw updateError;

      toast.success('Holding updated');
      await fetchHoldings();
      return true;
    } catch (err: any) {
      console.error('Error updating holding:', err);
      toast.error('Failed to update holding');
      return false;
    }
  };

  const deleteHolding = async (holdingId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', holdingId);

      if (deleteError) throw deleteError;

      toast.success('Holding removed from portfolio');
      await fetchHoldings();
      return true;
    } catch (err: any) {
      console.error('Error deleting holding:', err);
      toast.error('Failed to remove holding');
      return false;
    }
  };

  const portfolioSummary = useMemo((): PortfolioSummary => {
    const holdingsWithPL: HoldingWithPL[] = holdings.map(holding => {
      const currentPrice = priceMap.get(holding.symbol.toUpperCase()) || holding.purchase_price;
      const currentValue = holding.amount * currentPrice;
      const costBasis = holding.amount * holding.purchase_price;
      const profitLoss = currentValue - costBasis;
      const profitLossPercent = costBasis > 0 ? ((profitLoss / costBasis) * 100) : 0;

      return {
        ...holding,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossPercent,
      };
    });

    const totalValue = holdingsWithPL.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdingsWithPL.reduce((sum, h) => sum + (h.amount * h.purchase_price), 0);
    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent = totalCost > 0 ? ((totalProfitLoss / totalCost) * 100) : 0;

    return {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent,
      holdings: holdingsWithPL,
    };
  }, [holdings, priceMap]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  return {
    holdings,
    loading,
    error,
    createHolding,
    updateHolding,
    deleteHolding,
    refetch: fetchHoldings,
    portfolioSummary,
  };
}
