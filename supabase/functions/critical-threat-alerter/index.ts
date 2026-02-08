import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CriticalThreat {
  id: string;
  type: string;
  severity: 'critical' | 'high';
  signature: string;
  detectedAt: string;
  defenseAction: string;
  layersPassed: number;
  quantumFidelity: number;
}

interface AlertRequest {
  threats: CriticalThreat[];
  userId?: string;
  sessionId: string;
  metrics: {
    defenseScore: number;
    threatsNeutralized: number;
    echoResonance: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const { threats, userId, sessionId, metrics }: AlertRequest = await req.json();
    console.log(`Processing ${threats.length} critical threats for session ${sessionId}`);

    // Filter only critical/high severity threats
    const criticalThreats = threats.filter(t => t.severity === 'critical' || t.severity === 'high');
    
    if (criticalThreats.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No critical threats to alert",
        alertsSent: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const alertResults = {
      emailSent: false,
      pushSent: false,
      inAppCreated: false,
      notificationIds: [] as string[],
    };

    // 1. Create in-app notifications for each critical threat
    if (userId) {
      const notifications = criticalThreats.map(threat => ({
        user_id: userId,
        title: `🚨 ${threat.severity.toUpperCase()} Threat Detected`,
        message: `${threat.type.toUpperCase()} threat detected. Defense action: ${threat.defenseAction}. Security layers passed: ${threat.layersPassed}/20.`,
        type: 'security_alert',
        is_read: false,
        data: {
          threatId: threat.id,
          threatType: threat.type,
          severity: threat.severity,
          signature: threat.signature.slice(0, 16) + '...',
          detectedAt: threat.detectedAt,
          defenseAction: threat.defenseAction,
          quantumFidelity: threat.quantumFidelity,
          layersPassed: threat.layersPassed,
          metrics,
        },
      }));

      const { data: insertedNotifications, error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)
        .select('id');

      if (notifError) {
        console.error("Error creating notifications:", notifError);
      } else {
        alertResults.inAppCreated = true;
        alertResults.notificationIds = insertedNotifications?.map(n => n.id) || [];
        console.log(`Created ${insertedNotifications?.length} in-app notifications`);
      }
    }

    // 2. Send push notification if user has subscription
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('push_subscription, notification_push, notification_email')
        .eq('user_id', userId)
        .single();

      if (profile?.notification_push && profile?.push_subscription) {
        try {
          const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              userId,
              title: '🚨 Critical Security Alert',
              body: `${criticalThreats.length} critical threat(s) detected! Defense score: ${(metrics.defenseScore * 100).toFixed(1)}%`,
              data: {
                type: 'security_alert',
                threatCount: criticalThreats.length,
                defenseScore: metrics.defenseScore,
              },
            }),
          });

          if (pushResponse.ok) {
            alertResults.pushSent = true;
            console.log("Push notification sent successfully");
          }
        } catch (pushError) {
          console.error("Error sending push notification:", pushError);
        }
      }

      // 3. Send email alert if enabled and Resend is configured
      if (profile?.notification_email && resend) {
        try {
          // Get user email from auth
          const { data: authUser } = await supabase.auth.admin.getUserById(userId);
          
          if (authUser?.user?.email) {
            const threatList = criticalThreats.map(t => `
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px; color: ${t.severity === 'critical' ? '#ff4444' : '#ff9944'}; font-weight: bold;">${t.severity.toUpperCase()}</td>
                <td style="padding: 12px;">${t.type.toUpperCase()}</td>
                <td style="padding: 12px;">${t.defenseAction}</td>
                <td style="padding: 12px;">${t.layersPassed}/20</td>
                <td style="padding: 12px; font-family: monospace; font-size: 10px;">${t.signature.slice(0, 12)}...</td>
              </tr>
            `).join('');

            const emailResponse = await resend.emails.send({
              from: "Security <security@lucfierworld.lovable.app>",
              to: [authUser.user.email],
              subject: `🚨 CRITICAL: ${criticalThreats.length} Security Threat(s) Detected - Quantum Firewall Alert`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #fff; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #333; }
                    .header { background: linear-gradient(90deg, #ff4444 0%, #ff6b6b 100%); padding: 24px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; color: #fff; }
                    .content { padding: 24px; }
                    .metrics { display: flex; gap: 16px; margin-bottom: 24px; }
                    .metric { flex: 1; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; text-align: center; }
                    .metric-value { font-size: 28px; font-weight: bold; color: #7c3aed; }
                    .metric-label { font-size: 12px; color: #888; margin-top: 4px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                    th { background: rgba(124,58,237,0.2); padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
                    .footer { padding: 24px; text-align: center; background: rgba(0,0,0,0.3); font-size: 12px; color: #666; }
                    .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(90deg, #7c3aed, #9333ea); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🛡️ Quantum Firewall Security Alert</h1>
                    </div>
                    <div class="content">
                      <p style="margin-bottom: 24px; font-size: 16px;">
                        <strong>${criticalThreats.length}</strong> critical/high severity threat(s) were detected and processed by your Quantum Firewall Defense System.
                      </p>
                      
                      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
                        <div class="metric">
                          <div class="metric-value">${(metrics.defenseScore * 100).toFixed(0)}%</div>
                          <div class="metric-label">Defense Score</div>
                        </div>
                        <div class="metric">
                          <div class="metric-value" style="color: #22c55e;">${metrics.threatsNeutralized}</div>
                          <div class="metric-label">Neutralized</div>
                        </div>
                        <div class="metric">
                          <div class="metric-value" style="color: #3b82f6;">${(metrics.echoResonance * 100).toFixed(1)}%</div>
                          <div class="metric-label">Echo Resonance</div>
                        </div>
                      </div>

                      <h3 style="margin-bottom: 8px;">Threat Details</h3>
                      <table>
                        <thead>
                          <tr>
                            <th>Severity</th>
                            <th>Type</th>
                            <th>Action</th>
                            <th>Layers</th>
                            <th>Signature</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${threatList}
                        </tbody>
                      </table>

                      <div style="text-align: center; margin-top: 24px;">
                        <a href="https://lucfierworld.lovable.app/#/blockchain-ann" class="btn">View Firewall Dashboard →</a>
                      </div>
                    </div>
                    <div class="footer">
                      <p>This is an automated security alert from Quantum Firewall Defense System.</p>
                      <p>Session ID: ${sessionId} | ${new Date().toISOString()}</p>
                    </div>
                  </div>
                </body>
                </html>
              `,
            });

            if (emailResponse) {
              alertResults.emailSent = true;
              console.log("Email alert sent successfully:", emailResponse);
            }
          }
        } catch (emailError) {
          console.error("Error sending email alert:", emailError);
        }
      }
    }

    // 4. Log the alert event to firewall logs
    await supabase.from('quantum_firewall_logs').insert({
      session_id: sessionId,
      event_type: 'critical_alert_sent',
      severity: 'critical',
      user_id: userId || null,
      success: alertResults.inAppCreated || alertResults.emailSent || alertResults.pushSent,
      metrics: {
        threatCount: criticalThreats.length,
        defenseScore: metrics.defenseScore,
        alertsSent: {
          email: alertResults.emailSent,
          push: alertResults.pushSent,
          inApp: alertResults.inAppCreated,
        },
      },
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${criticalThreats.length} critical threats`,
      alerts: alertResults,
      threatCount: criticalThreats.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Critical threat alerter error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
