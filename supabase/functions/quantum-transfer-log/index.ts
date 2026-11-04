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
        // Receiver is stored and later exported to CSV: reject formula-like or
        // control characters so a value can never be executed by a spreadsheet.
        const receiverAddress = String(transferData.receiver_address ?? '');
        if (
          receiverAddress.length === 0 || receiverAddress.length > 128 ||
          /^[=+@\-\t\r]/.test(receiverAddress) ||
          /[=,;"'\r\n\t]/.test(receiverAddress) || /[\u0000-\u001f]/.test(receiverAddress)
        ) {
          return json({ success: false, error: 'Invalid receiver address' }, 400);
        }
        const newSessionId = `QTS_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const blockchainHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        const { data, error } = await admin
          .from('quantum_transfer_history')
          .insert({
            session_id: newSessionId,
            sender_address: senderAddress,
            receiver_address: receiverAddress,
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
          .select('sender_address')
          .eq('session_id', sessionId)
          .maybeSingle();
        if (ownErr || !existing) return json({ success: false, error: 'Not found' }, 404);
        if (existing.sender_address !== user.id) {
          return json({ success: false, error: 'Forbidden' }, 403);
        }
        // Field allowlist with type checks: caller updateData is never passed
        // through wholesale, so unapproved columns cannot be written.
        const allowedFields: Record<string, 'string' | 'number' | 'array'> = {
          transfer_status: 'string',
          layers_passed: 'number',
          security_score: 'number',
          quantum_fidelity: 'number',
          entanglement_pairs: 'number',
          blockchain_hash: 'string',
          layer_results: 'array',
          completed_at: 'string',
        };
        const sanitizedUpdate: Record<string, unknown> = {};
        for (const [key, kind] of Object.entries(allowedFields)) {
          const value = (updateData as Record<string, unknown>)[key];
          if (value === undefined || value === null) continue;
          const ok =
            (kind === 'string' && typeof value === 'string' && value.length <= 256) ||
            (kind === 'number' && typeof value === 'number' && Number.isFinite(value)) ||
            (kind === 'array' && Array.isArray(value));
          if (ok) sanitizedUpdate[key] = value;
        }
        if (Object.keys(sanitizedUpdate).length === 0) {
          return json({ success: false, error: 'No valid fields to update' }, 400);
        }
        const { data, error } = await admin
          .from('quantum_transfer_history')
          .update(sanitizedUpdate)
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
