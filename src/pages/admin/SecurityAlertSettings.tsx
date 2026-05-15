import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

interface Setting {
  id: string; alert_key: string; label: string; enabled: boolean;
  threshold: number; window_minutes: number; channels: string[];
}

export default function SecurityAlertSettings() {
  const { isAdmin, loading } = useIsAdmin();
  const { user } = useAuth();
  const [rows, setRows] = useState<Setting[]>([]);

  const reload = async () => {
    const { data } = await supabase.from('security_alert_settings').select('*').order('alert_key');
    setRows((data ?? []) as Setting[]);
  };
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  if (loading) return <Layout><div className="p-8">Loading…</div></Layout>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const save = async (s: Setting) => {
    if (!user) return;
    const { error } = await supabase.from('security_alert_settings').update({
      enabled: s.enabled, threshold: s.threshold, window_minutes: s.window_minutes,
      channels: s.channels, updated_by: user.id,
    }).eq('id', s.id);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    await supabase.from('security_audit_log').insert([{ actor_user_id: user.id, action: 'alert_setting_update', target: s.alert_key, details: { enabled: s.enabled, threshold: s.threshold, window_minutes: s.window_minutes, channels: s.channels } }]);
    toast({ title: `Saved ${s.alert_key}` });
  };

  const update = (i: number, patch: Partial<Setting>) => {
    setRows((r) => r.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  };

  const toggleChannel = (i: number, ch: string) => {
    const cur = rows[i].channels;
    const next = cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch];
    update(i, { channels: next });
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /><h1 className="text-2xl font-bold">Security Alert Settings</h1></div>
        <p className="text-sm text-muted-foreground">Toggle alert types and tune thresholds for the anomaly watcher (runs every 5 minutes).</p>
        {rows.map((s, i) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{s.label}</span>
                <Badge variant="outline" className="font-mono text-xs">{s.alert_key}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={s.enabled} onCheckedChange={(v) => update(i, { enabled: v })} />
                <Label>{s.enabled ? 'Enabled' : 'Disabled'}</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Threshold (events)</Label>
                  <Input type="number" min={1} value={s.threshold} onChange={(e) => update(i, { threshold: Math.max(1, Number(e.target.value)) })} />
                </div>
                <div>
                  <Label>Window (minutes)</Label>
                  <Input type="number" min={1} max={60} value={s.window_minutes} onChange={(e) => update(i, { window_minutes: Math.max(1, Math.min(60, Number(e.target.value))) })} />
                </div>
              </div>
              <div className="flex gap-4">
                {['slack', 'email'].map((ch) => (
                  <div key={ch} className="flex items-center gap-2">
                    <Switch checked={s.channels.includes(ch)} onCheckedChange={() => toggleChannel(i, ch)} />
                    <Label className="capitalize">{ch}</Label>
                  </div>
                ))}
              </div>
              <Button onClick={() => save(s)}>Save</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
