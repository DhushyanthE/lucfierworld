import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PriceAlert {
  id: string;
  user_id: string;
  symbol: string;
  target_price: number;
  condition: 'above' | 'below';
  is_active: boolean;
  triggered_at: string | null;
  notification_method: 'in_app' | 'email' | 'both';
  email_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePriceAlertData {
  symbol: string;
  target_price: number;
  condition: 'above' | 'below';
  notification_method: 'in_app' | 'email' | 'both';
}

export function usePriceAlerts() {
  const { user, isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('price_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setAlerts((data as unknown as PriceAlert[]) || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching price alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const createAlert = async (alertData: CreatePriceAlertData): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to create price alerts');
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user.id,
          symbol: alertData.symbol.toUpperCase(),
          target_price: alertData.target_price,
          condition: alertData.condition,
          notification_method: alertData.notification_method,
        });

      if (insertError) throw insertError;

      toast.success(`Price alert created for ${alertData.symbol}`);
      await fetchAlerts();
      return true;
    } catch (err: any) {
      console.error('Error creating price alert:', err);
      toast.error('Failed to create price alert');
      return false;
    }
  };

  const deleteAlert = async (alertId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (deleteError) throw deleteError;

      toast.success('Price alert deleted');
      await fetchAlerts();
      return true;
    } catch (err: any) {
      console.error('Error deleting price alert:', err);
      toast.error('Failed to delete price alert');
      return false;
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (updateError) throw updateError;

      toast.success(`Alert ${isActive ? 'enabled' : 'disabled'}`);
      await fetchAlerts();
      return true;
    } catch (err: any) {
      console.error('Error toggling price alert:', err);
      toast.error('Failed to update alert');
      return false;
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    createAlert,
    deleteAlert,
    toggleAlert,
    refetch: fetchAlerts,
    activeAlerts: alerts.filter(a => a.is_active),
    triggeredAlerts: alerts.filter(a => a.triggered_at),
  };
}
