import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate secure random values
function secureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xFFFFFFFF + 1);
}

// Generate quantum signature
function generateQuantumSignature(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Scheduled threat scan function
async function runScheduledThreatScan(supabase: any, sessionId: string) {
  console.log(`Running scheduled threat scan for session: ${sessionId}`);
  
  const threatTypes = ['malware', 'ddos', 'intrusion', 'phishing', 'ransomware', 'apt', 'zero-day'];
  const detectedThreats: any[] = [];
  
  // Simulate quantum parallel threat analysis
  for (const type of threatTypes) {
    const confidence = secureRandom();
    if (confidence > 0.75) {
      const severity = confidence > 0.95 ? 'critical' : confidence > 0.85 ? 'high' : confidence > 0.78 ? 'medium' : 'low';
      
      detectedThreats.push({
        type,
        severity,
        signature: generateQuantumSignature(),
        confidence,
        quantumFidelity: 0.85 + (secureRandom() * 0.15),
      });
    }
  }

  // Log detected threats to database
  for (const threat of detectedThreats) {
    await supabase.from('quantum_firewall_logs').insert({
      session_id: sessionId,
      event_type: 'threat_detected',
      severity: threat.severity,
      threat_type: threat.type,
      threat_signature: threat.signature,
      quantum_fidelity: threat.quantumFidelity,
      success: true,
      metrics: {
        confidence: threat.confidence,
        detectedAt: new Date().toISOString(),
      },
    });
  }

  // Simulate defense actions
  let neutralizedCount = 0;
  for (const threat of detectedThreats) {
    const defenseSuccess = secureRandom() > 0.2;
    if (defenseSuccess) {
      neutralizedCount++;
      
      await supabase.from('quantum_firewall_logs').insert({
        session_id: sessionId,
        event_type: 'threat_neutralized',
        severity: threat.severity,
        threat_type: threat.type,
        threat_signature: threat.signature,
        defense_action: ['block', 'quarantine', 'redirect-to-honeypot', 'neutralize'][Math.floor(secureRandom() * 4)],
        qnn_layer: `qnn-layer-${Math.floor(secureRandom() * 5) + 1}`,
        success: true,
        quantum_fidelity: threat.quantumFidelity,
        block_hash: generateQuantumSignature(),
        merkle_root: generateQuantumSignature(),
      });
    }
  }

  // Log scan completion
  await supabase.from('quantum_firewall_logs').insert({
    session_id: sessionId,
    event_type: 'scan_completed',
    success: true,
    metrics: {
      threatsDetected: detectedThreats.length,
      threatsNeutralized: neutralizedCount,
      defenseScore: neutralizedCount / Math.max(detectedThreats.length, 1),
      scanDuration: Math.floor(secureRandom() * 500 + 100),
      quantumSpeedup: `${Math.floor(2 + secureRandom() * 8)}x`,
      completedAt: new Date().toISOString(),
    },
  });

  // Send notification if critical threats detected
  const criticalThreats = detectedThreats.filter(t => t.severity === 'critical' || t.severity === 'high');
  
  return {
    threatsDetected: detectedThreats.length,
    threatsNeutralized: neutralizedCount,
    criticalThreats: criticalThreats.length,
    defenseScore: neutralizedCount / Math.max(detectedThreats.length, 1),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { operation, sessionId, userId } = await req.json();
    console.log(`Quantum Firewall Scheduler operation: ${operation}`);

    let result: any;

    switch (operation) {
      case 'run-scheduled-scan': {
        const scanSessionId = sessionId || `scheduled-${crypto.randomUUID().slice(0, 8)}`;
        const scanResult = await runScheduledThreatScan(supabase, scanSessionId);
        
        // Send notification if threats detected
        if (userId && scanResult.criticalThreats > 0) {
          await supabase.from('notifications').insert({
            user_id: userId,
            title: '🛡️ Critical Threat Detected',
            message: `Quantum Firewall detected ${scanResult.criticalThreats} critical/high severity threat(s). ${scanResult.threatsNeutralized} threats neutralized.`,
            type: 'security',
            data: {
              ...scanResult,
              sessionId: scanSessionId,
            },
          });
        }

        result = {
          success: true,
          sessionId: scanSessionId,
          ...scanResult,
        };
        break;
      }

      case 'get-scan-history': {
        const { data: logs, error } = await supabase
          .from('quantum_firewall_logs')
          .select('*')
          .eq('event_type', 'scan_completed')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        result = {
          success: true,
          scans: logs,
        };
        break;
      }

      case 'get-threat-analytics': {
        const { data: logs, error } = await supabase
          .from('quantum_firewall_logs')
          .select('*')
          .in('event_type', ['threat_detected', 'threat_neutralized'])
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        // Aggregate analytics
        const threatsByType: Record<string, number> = {};
        const threatsBySeverity: Record<string, number> = {};
        let totalNeutralized = 0;
        let totalDetected = 0;

        for (const log of logs || []) {
          if (log.event_type === 'threat_detected') {
            totalDetected++;
            threatsByType[log.threat_type] = (threatsByType[log.threat_type] || 0) + 1;
            threatsBySeverity[log.severity] = (threatsBySeverity[log.severity] || 0) + 1;
          } else if (log.event_type === 'threat_neutralized') {
            totalNeutralized++;
          }
        }

        result = {
          success: true,
          analytics: {
            totalDetected,
            totalNeutralized,
            neutralizationRate: totalNeutralized / Math.max(totalDetected, 1),
            threatsByType,
            threatsBySeverity,
          },
        };
        break;
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Quantum Firewall Scheduler error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
