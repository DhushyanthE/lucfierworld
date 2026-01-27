import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  added_at: string;
  notes: string | null;
}

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch watchlist
  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      setWatchlist((data || []) as WatchlistItem[]);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add to watchlist
  const addToWatchlist = useCallback(async (symbol: string, notes?: string) => {
    if (!user) {
      toast.error('Please sign in to use watchlist');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol: symbol.toUpperCase(),
          notes,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error(`${symbol} is already in your watchlist`);
        } else {
          throw error;
        }
        return false;
      }

      setWatchlist(prev => [data as WatchlistItem, ...prev]);
      toast.success(`${symbol} added to watchlist`);
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
      return false;
    }
  }, [user]);

  // Remove from watchlist
  const removeFromWatchlist = useCallback(async (symbol: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol.toUpperCase());

      if (error) throw error;

      setWatchlist(prev => prev.filter(item => item.symbol !== symbol.toUpperCase()));
      toast.success(`${symbol} removed from watchlist`);
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
      return false;
    }
  }, [user]);

  // Update notes
  const updateNotes = useCallback(async (symbol: string, notes: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('watchlist')
        .update({ notes })
        .eq('user_id', user.id)
        .eq('symbol', symbol.toUpperCase());

      if (error) throw error;

      setWatchlist(prev =>
        prev.map(item =>
          item.symbol === symbol.toUpperCase() ? { ...item, notes } : item
        )
      );
      toast.success('Notes updated');
      return true;
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
      return false;
    }
  }, [user]);

  // Check if symbol is in watchlist
  const isInWatchlist = useCallback((symbol: string) => {
    return watchlist.some(item => item.symbol === symbol.toUpperCase());
  }, [watchlist]);

  // Toggle watchlist
  const toggleWatchlist = useCallback(async (symbol: string) => {
    if (isInWatchlist(symbol)) {
      return removeFromWatchlist(symbol);
    } else {
      return addToWatchlist(symbol);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    updateNotes,
    isInWatchlist,
    toggleWatchlist,
    refetch: fetchWatchlist,
  };
}
