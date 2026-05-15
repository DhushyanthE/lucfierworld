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

    // Load admin-tunable alert settings
    const { data: settingsRows } = await supabase.from('security_alert_settings').select('*');
    const settings = new Map<string, any>();
    (settingsRows ?? []).forEach((s: any) => settings.set(s.alert_key, s));
    const cfg = (key: string) => settings.get(key) ?? { enabled: true, threshold: 1, window_minutes: 5, channels: ['slack', 'email'] };

    const anomalies: { text: string; channels: string[] }[] = [];

    // Anon firewall log writes
    const anonCfg = cfg('anon_firewall_writes');
    if (anonCfg.enabled) {
      const since = new Date(Date.now() - anonCfg.window_minutes * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('quantum_firewall_logs')
        .select('id', { count: 'exact', head: true })
        .is('user_id', null)
        .gte('created_at', since);
      if ((count ?? 0) >= anonCfg.threshold) {
        anomalies.push({ text: `${count} anonymous firewall_logs inserts in last ${anonCfg.window_minutes}min`, channels: anonCfg.channels });
      }
    }


    // Ineligible DAO votes
    const voteCfg = cfg('ineligible_dao_vote');
    if (voteCfg.enabled) {
      const sinceVote = new Date(Date.now() - voteCfg.window_minutes * 60 * 1000).toISOString();
      const { data: voteRows } = await supabase
        .from('dao_votes').select('user_id, proposal_id, created_at')
        .gte('created_at', sinceVote).limit(500);
      if (voteRows && voteRows.length) {
        const userIds = [...new Set(voteRows.map((v) => v.user_id))];
        const { data: eligible } = await supabase.from('dao_eligible_voters').select('user_id').in('user_id', userIds);
        const allowed = new Set((eligible ?? []).map((e) => e.user_id));
        const bad = voteRows.filter((v) => !allowed.has(v.user_id));
        if (bad.length >= voteCfg.threshold) {
          anomalies.push({ text: `${bad.length} dao_votes from non-eligible users in last ${voteCfg.window_minutes}min`, channels: voteCfg.channels });
        }
      }
    }

    // Cross-user session_id collisions
    const crossCfg = cfg('cross_user_session');
    if (crossCfg.enabled) {
      const sinceCross = new Date(Date.now() - crossCfg.window_minutes * 60 * 1000).toISOString();
      const { data: cross } = await supabase
        .from('quantum_firewall_logs').select('session_id, user_id').gte('created_at', sinceCross);
      if (cross) {
        const map = new Map<string, Set<string>>();
        for (const r of cross) {
          if (!r.session_id || !r.user_id) continue;
          if (!map.has(r.session_id)) map.set(r.session_id, new Set());
          map.get(r.session_id)!.add(r.user_id);
        }
        const collisions = [...map.entries()].filter(([, s]) => s.size > 1);
        if (collisions.length >= crossCfg.threshold) {
          anomalies.push({ text: `${collisions.length} session_id collisions across users in last ${crossCfg.window_minutes}min`, channels: crossCfg.channels });
        }
      }
    }

    if (anomalies.length) {
      const slackItems = anomalies.filter((a) => a.channels.includes('slack'));
      const emailItems = anomalies.filter((a) => a.channels.includes('email'));
      await Promise.all([
        slackItems.length ? sendSlack(`• ${slackItems.map((a) => a.text).join('\n• ')}`) : Promise.resolve(),
        emailItems.length ? sendEmail('Quantum Firewall: cross-user/anon anomalies', `<ul><li>${emailItems.map((a) => a.text).join('</li><li>')}</li></ul>`) : Promise.resolve(),
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
