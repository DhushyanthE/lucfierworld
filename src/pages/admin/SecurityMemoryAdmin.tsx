import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { FileText, History } from 'lucide-react';

export default function SecurityMemoryAdmin() {
  const { isAdmin, loading } = useIsAdmin();
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');

  const reload = async () => {
    const { data: snaps } = await (supabase.from('security_memory_snapshots' as never).select('*').order('version', { ascending: false }]) as any);
    setSnapshots(snaps ?? []);
    const { data: a } = await (supabase.from('security_audit_log' as never).select('*').order('created_at', { ascending: false }).limit(200) as any);
    setAudit(a ?? []);
  };
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  if (loading) return <Layout><div className="p-8">Loading…</div></Layout>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const saveSnapshot = async () => {
    if (!draft.trim() || !user) return;
    const nextVersion = (snapshots[0]?.version ?? 0) + 1;
    const { error } = await (supabase.from('security_memory_snapshots' as never).insert([{
      version: nextVersion, content: draft, created_by: user.id,
    }]) as any);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    await (supabase.from('security_audit_log' as never).insert([{
      actor_user_id: user.id, action: 'snapshot_security_memory', target: `v${nextVersion}`, details: { length: draft.length },
    }]) as any);
    setDraft(''); reload();
    toast({ title: `Saved v${nextVersion}` });
  };

  const filtered = snapshots.filter((s) => !search || s.content.toLowerCase().includes(search.toLowerCase()));
  const auditFiltered = audit.filter((a) => !search || JSON.stringify(a).toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /><h1 className="text-2xl font-bold">Security Memory & Audit Trail</h1></div>
        <Input placeholder="Search snapshots and audit log…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Card>
          <CardHeader><CardTitle>New snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Textarea rows={6} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Paste current security baseline (markdown)…" />
            <Button onClick={saveSnapshot} disabled={!draft.trim()}>Save snapshot</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Snapshots ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-auto">
            {filtered.map((s) => (
              <div key={s.id} className="p-3 bg-muted/30 rounded">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>v{s.version}</span><span>{new Date(s.created_at).toLocaleString()}</span>
                </div>
                <pre className="whitespace-pre-wrap text-xs mt-2">{s.content}</pre>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-4 w-4" />Audit trail ({auditFiltered.length})</CardTitle></CardHeader>
          <CardContent className="space-y-1 max-h-96 overflow-auto text-xs font-mono">
            {auditFiltered.map((a) => (
              <div key={a.id} className="grid grid-cols-4 gap-2 py-1 border-b border-muted/20">
                <span>{new Date(a.created_at).toLocaleString()}</span>
                <span>{a.action}</span>
                <span>{a.target ?? '-'}</span>
                <span className="truncate">{JSON.stringify(a.details)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
