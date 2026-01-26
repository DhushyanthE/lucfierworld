import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PortfolioSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_value: number;
  total_cost: number;
  total_profit_loss: number;
  holdings_data: any[];
  created_at: string;
}

export interface CreateSnapshotData {
  total_value: number;
  total_cost: number;
  total_profit_loss: number;
  holdings_data: any[];
}

export function usePortfolioSnapshots() {
  const { user, isAuthenticated } = useAuth();
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async (days: number = 30) => {
    if (!isAuthenticated || !user) {
      setSnapshots([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error: fetchError } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (fetchError) throw fetchError;
      
      // Cast data properly
      const typedData = (data as unknown as PortfolioSnapshot[]) || [];
      setSnapshots(typedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching portfolio snapshots:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const saveSnapshot = async (snapshotData: CreateSnapshotData): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Upsert - update if exists for today, insert if not
      const { error: upsertError } = await supabase
        .from('portfolio_snapshots')
        .upsert({
          user_id: user.id,
          snapshot_date: today,
          total_value: snapshotData.total_value,
          total_cost: snapshotData.total_cost,
          total_profit_loss: snapshotData.total_profit_loss,
          holdings_data: snapshotData.holdings_data,
        }, {
          onConflict: 'user_id,snapshot_date',
        });

      if (upsertError) throw upsertError;

      await fetchSnapshots();
      return true;
    } catch (err: any) {
      console.error('Error saving portfolio snapshot:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  return {
    snapshots,
    loading,
    error,
    saveSnapshot,
    refetch: fetchSnapshots,
  };
}
