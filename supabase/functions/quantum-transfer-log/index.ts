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

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // 1. Require auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ success: false, error: 'Missing authorization' }, 401);
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !userData?.user) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }
    const user = userData.user;

    const body = (await req.json()) as TransferLogRequest;
    const { action, sessionId, transferData, updateData, limit = 50 } = body || {} as TransferLogRequest;

    console.log(`quantum-transfer-log action=${action} user=${user.id}`);

    // Service-role client for writes (RLS-bypassing) — only used after ownership checks
    const admin = createClient(supabaseUrl, serviceKey);

    switch (action) {
      case 'create': {
        if (!transferData) return json({ success: false, error: 'transferData required' }, 400);
        // Force the authenticated user as the sender (do not trust client)
        const senderAddress = user.id;
        const newSessionId = `QTS_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const blockchainHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        const { data, error } = await admin
          .from('quantum_transfer_history')
          .insert({
            session_id: newSessionId,
            user_id: user.id,
            sender_address: senderAddress,
            receiver_address: transferData.receiver_address,
            amount: transferData.amount,
            data_payload: transferData.data_payload || '',
            blockchain_hash: blockchainHash,
            transfer_status: 'pending',
            network_nodes: transferData.network_nodes || [],
            entanglement_pairs: Math.floor(Math.random() * 64) + 32,
          })
          .select()
          .single();

        if (error) {
          console.error(`create error user=${user.id}:`, error.message);
          return json({ success: false, error: 'Failed to create transfer' }, 500);
        }
        return json({ success: true, data, sessionId: newSessionId });
      }

      case 'update': {
        if (!sessionId || !updateData) return json({ success: false, error: 'sessionId and updateData required' }, 400);
        // Verify ownership before updating
        const { data: existing, error: ownErr } = await admin
          .from('quantum_transfer_history')
          .select('user_id')
          .eq('session_id', sessionId)
          .maybeSingle();
        if (ownErr || !existing) return json({ success: false, error: 'Not found' }, 404);
        if (existing.user_id && existing.user_id !== user.id) {
          return json({ success: false, error: 'Forbidden' }, 403);
        }
        const { data, error } = await admin
          .from('quantum_transfer_history')
          .update(updateData)
          .eq('session_id', sessionId)
          .select()
          .single();
        if (error) {
          console.error(`update error user=${user.id}:`, error.message);
          return json({ success: false, error: 'Failed to update transfer' }, 500);
        }
        return json({ success: true, data });
      }

      case 'get': {
        if (!sessionId) return json({ success: false, error: 'sessionId required' }, 400);
        // Use the user-scoped client so RLS enforces ownership
        const { data, error } = await userClient
          .from('quantum_transfer_history')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle();
        if (error) return json({ success: false, error: 'Failed to fetch' }, 500);
        if (!data) return json({ success: false, error: 'Not found' }, 404);
        return json({ success: true, data });
      }

      case 'list': {
        const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
        // RLS scopes the result to the calling user's transfers
        const { data, error } = await userClient
          .from('quantum_transfer_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(safeLimit);
        if (error) return json({ success: false, error: 'Failed to list' }, 500);
        return json({ success: true, data, count: data?.length ?? 0 });
      }

      default:
        return json({ success: false, error: 'Unknown action' }, 400);
    }
  } catch (error: any) {
    console.error('quantum-transfer-log error:', error?.message || error);
    return json({ success: false, error: 'Internal error' }, 500);
  }
});
