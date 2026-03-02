import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Vote, Clock, CheckCircle, XCircle, Plus, RefreshCw } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  quorum: number;
  category: string;
  createdAt: string;
  endsAt: string;
  isFromDb?: boolean;
  userId?: string;
}

const SEED_PROPOSALS: Proposal[] = [
  { id: 'dao-1', title: 'Upgrade Quantum Firewall to v3.0', description: 'Implement PQC-lattice encryption across all 20 security layers.', proposer: '0xAb...3f', status: 'active', votesFor: 847, votesAgainst: 123, totalVoters: 1200, quorum: 60, category: 'Security', createdAt: '2026-02-25', endsAt: '2026-03-05' },
  { id: 'dao-2', title: 'Allocate 10% Treasury to AI Research', description: 'Fund AGI research for threat prediction.', proposer: '0xBc...7e', status: 'active', votesFor: 562, votesAgainst: 438, totalVoters: 1200, quorum: 60, category: 'Treasury', createdAt: '2026-02-27', endsAt: '2026-03-07' },
  { id: 'dao-3', title: 'Add New Validator Nodes', description: 'Expand from 10 to 25 validator nodes.', proposer: '0xDe...9a', status: 'passed', votesFor: 921, votesAgainst: 79, totalVoters: 1000, quorum: 60, category: 'Infrastructure', createdAt: '2026-02-20', endsAt: '2026-02-28' },
  { id: 'dao-4', title: 'NFT Royalty Fee Reduction', description: 'Reduce marketplace royalty from 5% to 2.5%.', proposer: '0xFa...1b', status: 'rejected', votesFor: 320, votesAgainst: 680, totalVoters: 1000, quorum: 60, category: 'Marketplace', createdAt: '2026-02-18', endsAt: '2026-02-26' },
  { id: 'dao-5', title: 'Launch Staking Rewards Program', description: '8% APY for QCoin holders who participate in governance.', proposer: '0xCd...2f', status: 'pending', votesFor: 0, votesAgainst: 0, totalVoters: 1200, quorum: 60, category: 'Tokenomics', createdAt: '2026-03-01', endsAt: '2026-03-10' },
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  active: { color: 'text-blue-500 bg-blue-500/10', icon: <Clock className="h-3 w-3" /> },
  passed: { color: 'text-green-500 bg-green-500/10', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { color: 'text-red-500 bg-red-500/10', icon: <XCircle className="h-3 w-3" /> },
  pending: { color: 'text-yellow-500 bg-yellow-500/10', icon: <Clock className="h-3 w-3" /> },
};

export function DAOGovernance() {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>(SEED_PROPOSALS);
  const [dbProposals, setDbProposals] = useState<Proposal[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  useEffect(() => { loadProposals(); }, []);

  const loadProposals = async () => {
    try {
      const { data } = await supabase.from('dao_proposals').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped: Proposal[] = data.map((d: any) => ({
          id: d.id, title: d.title, description: d.description, proposer: d.proposer,
          status: d.status, votesFor: d.votes_for, votesAgainst: d.votes_against,
          totalVoters: d.total_voters || 1200, quorum: d.quorum || 60,
          category: d.category, createdAt: d.created_at, endsAt: d.ends_at,
          isFromDb: true, userId: d.user_id,
        }));
        setDbProposals(mapped);
      }
    } catch { /* use seed */ }
  };

  const allProposals = [...dbProposals, ...proposals.filter(p => !dbProposals.some(d => d.title === p.title))];
  const filtered = allProposals.filter(p => statusFilter === 'all' || p.status === statusFilter);

  const handleVote = async (proposal: Proposal, vote: 'for' | 'against') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && proposal.isFromDb) {
      await supabase.from('dao_votes').insert({ user_id: user.id, proposal_id: proposal.id, vote });
      const updateField = vote === 'for' ? 'votes_for' : 'votes_against';
      await supabase.from('dao_proposals').update({
        [updateField]: vote === 'for' ? proposal.votesFor + 1 : proposal.votesAgainst + 1,
      }).eq('id', proposal.id);
    }
    toast({ title: 'Vote Cast ✅', description: `Voted ${vote} on "${proposal.title}"` });
    loadProposals();
  };

  const createProposal = async () => {
    if (!newTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('dao_proposals').insert({
        user_id: user.id, title: newTitle, description: newDesc,
        proposer: `0x${user.id.slice(0, 6)}`, status: 'active',
        category: newCategory, total_voters: 1200, quorum: 60,
      });
      toast({ title: 'Proposal Created', description: newTitle });
      setNewTitle(''); setNewDesc(''); setShowCreate(false);
      loadProposals();
    } else {
      // Fallback for non-auth
      setProposals(prev => [{
        id: crypto.randomUUID(), title: newTitle, description: newDesc,
        proposer: '0xYou', status: 'active', votesFor: 0, votesAgainst: 0,
        totalVoters: 1200, quorum: 60, category: newCategory,
        createdAt: new Date().toISOString(), endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      }, ...prev]);
      toast({ title: 'Proposal Created (local)', description: 'Sign in to persist' });
      setNewTitle(''); setNewDesc(''); setShowCreate(false);
    }
  };

  const totalMembers = 1200;
  const activeCount = allProposals.filter(p => p.status === 'active').length;
  const passedCount = allProposals.filter(p => p.status === 'passed').length;
  const decidedCount = allProposals.filter(p => p.status !== 'pending').length;
  const passRate = decidedCount > 0 ? Math.round((passedCount / decidedCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-indigo-600/5 to-blue-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-6 w-6 text-indigo-500" />DAO Governance
              </CardTitle>
              <CardDescription>Decentralized governance for protocol decisions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadProposals}><RefreshCw className="h-4 w-4" /></Button>
              <Button onClick={() => setShowCreate(!showCreate)}>
                <Plus className="h-4 w-4 mr-2" />New Proposal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-primary">{totalMembers}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-blue-500">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-green-500">{passRate}%</div>
              <div className="text-xs text-muted-foreground">Pass Rate</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-purple-500">1,250 ETH</div>
              <div className="text-xs text-muted-foreground">Treasury</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreate && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Proposal title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Textarea placeholder="Description..." value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} />
            <div className="flex gap-2">
              {['General', 'Security', 'Treasury', 'Infrastructure', 'Tokenomics'].map(c => (
                <Button key={c} size="sm" variant={newCategory === c ? 'default' : 'outline'} className="text-xs" onClick={() => setNewCategory(c)}>{c}</Button>
              ))}
            </div>
            <Button onClick={createProposal} disabled={!newTitle.trim()}>Submit Proposal</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-1">
        {['all', 'active', 'passed', 'rejected', 'pending'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setStatusFilter(s)}>{s}</Button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(p => {
          const totalVotes = p.votesFor + p.votesAgainst;
          const forPct = totalVotes > 0 ? (p.votesFor / totalVotes) * 100 : 0;
          const quorumPct = totalVotes > 0 ? (totalVotes / p.totalVoters) * 100 : 0;
          const cfg = statusConfig[p.status] || statusConfig.pending;

          return (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{p.title}</h3>
                      <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                        <span className="mr-1">{cfg.icon}</span>{p.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                      {p.isFromDb && <Badge variant="outline" className="text-[10px] text-green-400 border-green-500/30">💾 Persisted</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Proposed by {p.proposer} · Ends {new Date(p.endsAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-16 text-green-500">For ({p.votesFor})</span>
                    <Progress value={forPct} className="h-2 flex-1" />
                    <span className="text-xs w-12 text-right">{forPct.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-16 text-red-500">Against ({p.votesAgainst})</span>
                    <Progress value={100 - forPct} className="h-2 flex-1" />
                    <span className="text-xs w-12 text-right">{(100 - forPct).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-16 text-muted-foreground">Quorum</span>
                    <Progress value={quorumPct} className="h-2 flex-1" />
                    <span className="text-xs w-12 text-right">{quorumPct.toFixed(0)}%/{p.quorum}%</span>
                  </div>
                </div>

                {p.status === 'active' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="text-green-500 border-green-500/30" onClick={() => handleVote(p, 'for')}>
                      <CheckCircle className="h-3 w-3 mr-1" />Vote For
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 border-red-500/30" onClick={() => handleVote(p, 'against')}>
                      <XCircle className="h-3 w-3 mr-1" />Vote Against
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
