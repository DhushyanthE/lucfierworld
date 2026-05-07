import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';

interface Row { bucket: string; source: string; principal: string; events: number; anon_events: number; sessions: number }

export default function SecurityDashboard() {
  const { isAdmin, loading } = useIsAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    (supabase.from('security_access_summary' as never).select('*').order('bucket', { ascending: false }).limit(200) as any)
      .then(({ data, error }: any) => { if (error) setErr(error.message); else setRows(data ?? []); });
  }, [isAdmin]);

  if (loading) return <Layout><div className="container mx-auto p-8">Loading…</div></Layout>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const totals = rows.reduce((acc, r) => {
    acc.events += Number(r.events);
    acc.anon += Number(r.anon_events);
    return acc;
  }, { events: 0, anon: 0 });
  const byPrincipal = new Map<string, number>();
  rows.forEach((r) => byPrincipal.set(r.principal, (byPrincipal.get(r.principal) ?? 0) + Number(r.events)));
  const topUsers = [...byPrincipal.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Security Access Dashboard</h1>
        </div>
        {err && <Card><CardContent className="p-4 text-destructive flex gap-2"><AlertTriangle className="h-4 w-4" />{err}</CardContent></Card>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardHeader><CardTitle>Total events (7d)</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.events}</CardContent></Card>
          <Card><CardHeader><CardTitle>Anonymous events</CardTitle></CardHeader><CardContent className={`text-3xl font-bold ${totals.anon > 0 ? 'text-destructive' : 'text-green-500'}`}>{totals.anon}</CardContent></Card>
          <Card><CardHeader><CardTitle>Distinct principals</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{byPrincipal.size}</CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Top principals (firewall_logs + dao_votes)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topUsers.map(([p, c]) => (
              <div key={p} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="font-mono text-xs">{p}</span>
                <Badge>{c} events</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Hourly buckets</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-96 overflow-auto text-xs font-mono">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 py-1 border-b border-muted/20">
                  <span>{new Date(r.bucket).toLocaleString()}</span>
                  <span><Badge variant="outline">{r.source}</Badge></span>
                  <span className="truncate">{r.principal}</span>
                  <span>{r.events} events</span>
                  <span className={r.anon_events > 0 ? 'text-destructive' : ''}>{r.anon_events} anon</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
