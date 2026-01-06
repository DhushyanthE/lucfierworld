/**
 * Hook for managing quantum transfer history with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuantumTransfer {
  id: string;
  session_id: string;
  sender_address: string;
  receiver_address: string;
  amount: number;
  data_payload: string | null;
  blockchain_hash: string | null;
  security_score: number | null;
  layers_passed: number;
  total_layers: number;
  transfer_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  quantum_fidelity: number | null;
  entanglement_pairs: number | null;
  network_nodes: any[];
  layer_results: any[];
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export function useQuantumTransferHistory() {
  const [transfers, setTransfers] = useState<QuantumTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transfer history
  const fetchTransfers = useCallback(async (limit = 50) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('quantum_transfer_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      
      setTransfers((data as unknown as QuantumTransfer[]) || []);
    } catch (err: any) {
      console.error('Error fetching transfers:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new transfer log
  const createTransfer = useCallback(async (transferData: {
    sender_address: string;
    receiver_address: string;
    amount: number;
    data_payload?: string;
    network_nodes?: any[];
  }) => {
    try {
      const sessionId = `QTS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const blockchainHash = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      const { data, error: insertError } = await supabase
        .from('quantum_transfer_history')
        .insert({
          session_id: sessionId,
          sender_address: transferData.sender_address,
          receiver_address: transferData.receiver_address,
          amount: transferData.amount,
          data_payload: transferData.data_payload || '',
          blockchain_hash: blockchainHash,
          transfer_status: 'pending',
          network_nodes: transferData.network_nodes || [],
          entanglement_pairs: Math.floor(Math.random() * 64) + 32
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Transfer initiated', {
        description: `Session: ${sessionId.slice(0, 20)}...`
      });

      return { success: true, data: data as unknown as QuantumTransfer, sessionId };
    } catch (err: any) {
      console.error('Error creating transfer:', err);
      toast.error('Failed to create transfer');
      return { success: false, error: err.message };
    }
  }, []);

  // Update transfer status
  const updateTransfer = useCallback(async (
    sessionId: string, 
    updateData: Partial<Omit<QuantumTransfer, 'id' | 'session_id' | 'created_at'>>
  ) => {
    try {
      const { data, error: updateError } = await supabase
        .from('quantum_transfer_history')
        .update(updateData as any)
        .eq('session_id', sessionId)
        .select()
        .single();

      if (updateError) throw updateError;

      return { success: true, data: data as unknown as QuantumTransfer };
    } catch (err: any) {
      console.error('Error updating transfer:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Set up real-time subscription with notifications
  useEffect(() => {
    fetchTransfers();

    const channel = supabase
      .channel('quantum-transfers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quantum_transfer_history'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTransfer = payload.new as unknown as QuantumTransfer;
            setTransfers(prev => [newTransfer, ...prev]);
            
            toast.info('New Transfer Initiated', {
              description: `Session: ${newTransfer.session_id.slice(0, 15)}... | Amount: ${Number(newTransfer.amount).toLocaleString()} QU`,
              duration: 4000
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedTransfer = payload.new as unknown as QuantumTransfer;
            setTransfers(prev => 
              prev.map(t => t.id === updatedTransfer.id ? updatedTransfer : t)
            );
            
            // Show notification for status changes
            if (updatedTransfer.transfer_status === 'completed') {
              toast.success('Transfer Completed', {
                description: `${updatedTransfer.layers_passed}/${updatedTransfer.total_layers} layers passed | Score: ${updatedTransfer.security_score?.toFixed(1)}%`,
                duration: 5000
              });
            } else if (updatedTransfer.transfer_status === 'failed') {
              toast.error('Transfer Failed', {
                description: `Session: ${updatedTransfer.session_id.slice(0, 15)}...`,
                duration: 5000
              });
            } else if (updatedTransfer.transfer_status === 'in_progress') {
              toast('Transfer In Progress', {
                description: `Processing ${updatedTransfer.layers_passed || 0} of ${updatedTransfer.total_layers} layers...`,
                duration: 3000
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setTransfers(prev => prev.filter(t => t.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransfers]);

  return {
    transfers,
    isLoading,
    error,
    fetchTransfers,
    createTransfer,
    updateTransfer
  };
}
