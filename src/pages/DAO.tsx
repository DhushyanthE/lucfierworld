import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Vote, Shield } from 'lucide-react';

interface Proposal { id: string; title: string; description: string; status: string; votes_for: number; votes_against: number; ends_at: string; category: string }

export default function DAOPage() {
  const { user, loading } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});
  const [eligible, setEligible] = useState(false);

  const reload = async () => {
    const { data: ps } = await supabase.from('dao_proposals').select('*').order('created_at', { ascending: false });
    setProposals((ps as any) ?? []);
    if (user) {
      const { data: v } = await supabase.from('dao_votes').select('proposal_id, vote').eq('user_id', user.id);
      const m: Record<string, string> = {};
      (v ?? []).forEach((row: any) => { m[row.proposal_id] = row.vote; });
      setMyVotes(m);
      const { data: e } = await (supabase as any).from('dao_eligible_voters').select('user_id').eq('user_id', user.id).maybeSingle();
      setEligible(!!e);
    }
  };
  useEffect(() => { if (!loading) reload(); }, [loading, user]);

  if (loading) return <Layout><div className="p-8">Loading…</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  const cast = async (proposalId: string, vote: 'for' | 'against') => {
    if (!eligible) { toast({ title: 'Not eligible', description: 'Ask an admin to add you to the DAO voter allowlist.', variant: 'destructive' }); return; }
    const { error } = await supabase.from('dao_votes').insert([{ proposal_id: proposalId, user_id: user.id, vote }]);
    if (error) { toast({ title: 'Vote rejected', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Vote recorded' });
    reload();
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Vote className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">DAO Governance</h1>
          {eligible
            ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><Shield className="h-3 w-3 mr-1" />Eligible voter</Badge>
            : <Badge variant="outline">Read-only · not on allowlist</Badge>}
        </div>
        {proposals.length === 0 && <Card><CardContent className="p-6 text-muted-foreground text-center">No proposals yet.</CardContent></Card>}
        <div className="grid gap-4">
          {proposals.map((p) => {
            const my = myVotes[p.id];
            return (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{p.title}</CardTitle>
                      <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline">{p.category}</Badge>
                        <Badge variant="outline">{p.status}</Badge>
                        <span>Ends {new Date(p.ends_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {my && <Badge className="bg-primary/20 text-primary">You voted {my}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{p.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-500">For: {p.votes_for}</span>
                    <span className="text-destructive">Against: {p.votes_against}</span>
                  </div>
                  {!my && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => cast(p.id, 'for')} disabled={!eligible}>Vote For</Button>
                      <Button size="sm" variant="outline" onClick={() => cast(p.id, 'against')} disabled={!eligible}>Vote Against</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
