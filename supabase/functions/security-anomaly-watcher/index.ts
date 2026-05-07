import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL');
const ALERT_EMAIL = Deno.env.get('SECURITY_ALERT_EMAIL');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

async function sendSlack(text: string) {
  if (!SLACK_WEBHOOK_URL) return;
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `🚨 *Security alert*\n${text}` }),
  }).catch((e) => console.error('slack error', e));
}

async function sendEmail(subject: string, html: string) {
  if (!RESEND_API_KEY || !ALERT_EMAIL) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Security <onboarding@resend.dev>',
      to: [ALERT_EMAIL],
      subject,
      html,
    }),
  }).catch((e) => console.error('resend error', e));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const anomalies: string[] = [];

    // Anon firewall log writes (should be impossible after hardening)
    const { count: anonCount } = await supabase
      .from('quantum_firewall_logs')
      .select('id', { count: 'exact', head: true })
      .is('user_id', null)
      .gte('created_at', since);
    if ((anonCount ?? 0) > 0) {
      anomalies.push(`${anonCount} anonymous firewall_logs inserts in last 5min`);
    }

    // dao_votes inserted by non-eligible users (cross-user check)
    const { data: voteRows } = await supabase
      .from('dao_votes')
      .select('user_id, proposal_id, created_at')
      .gte('created_at', since)
      .limit(500);
    if (voteRows && voteRows.length) {
      const userIds = [...new Set(voteRows.map((v) => v.user_id))];
      const { data: eligible } = await supabase
        .from('dao_eligible_voters')
        .select('user_id')
        .in('user_id', userIds);
      const allowed = new Set((eligible ?? []).map((e) => e.user_id));
      const bad = voteRows.filter((v) => !allowed.has(v.user_id));
      if (bad.length) anomalies.push(`${bad.length} dao_votes from non-eligible users`);
    }

    // Cross-user pattern: same session_id firing under multiple user_ids
    const { data: cross } = await supabase
      .from('quantum_firewall_logs')
      .select('session_id, user_id')
      .gte('created_at', since);
    if (cross) {
      const map = new Map<string, Set<string>>();
      for (const r of cross) {
        if (!r.session_id || !r.user_id) continue;
        if (!map.has(r.session_id)) map.set(r.session_id, new Set());
        map.get(r.session_id)!.add(r.user_id);
      }
      const collisions = [...map.entries()].filter(([, s]) => s.size > 1);
      if (collisions.length) anomalies.push(`${collisions.length} session_id collisions across users`);
    }

    if (anomalies.length) {
      const text = anomalies.join('\n• ');
      await Promise.all([
        sendSlack(`• ${text}`),
        sendEmail('Quantum Firewall: cross-user/anon anomalies', `<ul><li>${anomalies.join('</li><li>')}</li></ul>`),
      ]);
    }

    return new Response(JSON.stringify({ ok: true, anomalies }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
