import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferLogRequest {
  action: 'create' | 'update' | 'get' | 'list';
  sessionId?: string;
  transferData?: {
    sender_address: string;
    receiver_address: string;
    amount: number;
    data_payload?: string;
    network_nodes?: any[];
  };
  updateData?: {
    transfer_status?: string;
    layers_passed?: number;
    security_score?: number;
    quantum_fidelity?: number;
    entanglement_pairs?: number;
    blockchain_hash?: string;
    layer_results?: any[];
    completed_at?: string;
  };
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, sessionId, transferData, updateData, limit = 50 }: TransferLogRequest = await req.json();

    console.log(`Processing quantum transfer log action: ${action}`);

    switch (action) {
      case 'create': {
        if (!transferData) {
          throw new Error('Transfer data required for create action');
        }

        const newSessionId = `QTS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const blockchainHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        const { data, error } = await supabase
          .from('quantum_transfer_history')
          .insert({
            session_id: newSessionId,
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

        if (error) {
          console.error('Error creating transfer log:', error);
          throw error;
        }

        console.log(`Created transfer log: ${newSessionId}`);

        return new Response(
          JSON.stringify({ success: true, data, sessionId: newSessionId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        if (!sessionId || !updateData) {
          throw new Error('Session ID and update data required');
        }

        const { data, error } = await supabase
          .from('quantum_transfer_history')
          .update(updateData)
          .eq('session_id', sessionId)
          .select()
          .single();

        if (error) {
          console.error('Error updating transfer log:', error);
          throw error;
        }

        console.log(`Updated transfer log: ${sessionId}`);

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        if (!sessionId) {
          throw new Error('Session ID required');
        }

        const { data, error } = await supabase
          .from('quantum_transfer_history')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error) {
          console.error('Error getting transfer log:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        const { data, error } = await supabase
          .from('quantum_transfer_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error listing transfer logs:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true, data, count: data.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Quantum transfer log error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
