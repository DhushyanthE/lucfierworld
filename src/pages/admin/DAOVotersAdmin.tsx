import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Users, Trash2, Upload } from 'lucide-react';

interface Voter { id: string; user_id: string; added_at: string; added_by: string | null }

export default function DAOVotersAdmin() {
  const { isAdmin, loading } = useIsAdmin();
  const { user } = useAuth();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [search, setSearch] = useState('');
  const [single, setSingle] = useState('');
  const [bulk, setBulk] = useState('');

  const reload = async () => {
    const { data } = await supabase.from('dao_eligible_voters').select('*').order('added_at', { ascending: false });
    setVoters((data ?? []) as Voter[]);
  };
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  if (loading) return <Layout><div className="p-8">Loading…</div></Layout>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim());

  const addOne = async () => {
    const v = single.trim();
    if (!isUuid(v) || !user) { toast({ title: 'Invalid user UUID', variant: 'destructive' }); return; }
    const { error } = await supabase.from('dao_eligible_voters').insert([{ user_id: v, added_by: user.id }]);
    if (error) { toast({ title: 'Add failed', description: error.message, variant: 'destructive' }); return; }
    await supabase.from('security_audit_log').insert([{ actor_user_id: user.id, action: 'dao_voter_add', target: v, details: {} }]);
    setSingle(''); reload(); toast({ title: 'Voter added' });
  };

  const bulkAdd = async () => {
    if (!user) return;
    const ids = bulk.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    const valid = ids.filter(isUuid);
    const invalid = ids.filter((i) => !isUuid(i));
    if (!valid.length) { toast({ title: 'No valid UUIDs', variant: 'destructive' }); return; }
    const rows = valid.map((id) => ({ user_id: id, added_by: user.id }));
    const { error } = await supabase.from('dao_eligible_voters').upsert(rows, { onConflict: 'user_id', ignoreDuplicates: true });
    if (error) { toast({ title: 'Bulk add failed', description: error.message, variant: 'destructive' }); return; }
    await supabase.from('security_audit_log').insert([{ actor_user_id: user.id, action: 'dao_voter_bulk_add', target: `${valid.length}`, details: { invalid } }]);
    setBulk(''); reload();
    toast({ title: `Added ${valid.length}${invalid.length ? `, skipped ${invalid.length} invalid` : ''}` });
  };

  const remove = async (v: Voter) => {
    if (!user) return;
    const { error } = await supabase.from('dao_eligible_voters').delete().eq('id', v.id);
    if (error) { toast({ title: 'Remove failed', description: error.message, variant: 'destructive' }); return; }
    await supabase.from('security_audit_log').insert([{ actor_user_id: user.id, action: 'dao_voter_remove', target: v.user_id, details: {} }]);
    reload();
  };

  const filtered = voters.filter((v) => !search || v.user_id.includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2"><Users className="h-6 w-6 text-primary" /><h1 className="text-2xl font-bold">DAO Eligible Voters</h1></div>

        <Card>
          <CardHeader><CardTitle>Add a voter</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="user UUID" value={single} onChange={(e) => setSingle(e.target.value)} />
            <Button onClick={addOne}>Add</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4" />Bulk add (UUIDs separated by space, comma, or newline)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Textarea rows={5} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="uuid1, uuid2, uuid3..." />
            <Button onClick={bulkAdd} disabled={!bulk.trim()}>Bulk add</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Current voters ({voters.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Filter by UUID…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="max-h-96 overflow-auto space-y-1">
              {filtered.map((v) => (
                <div key={v.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs">{v.user_id}</span>
                    <span className="text-xs text-muted-foreground">{new Date(v.added_at).toLocaleString()}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(v)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              {!filtered.length && <Badge variant="outline">No voters</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
