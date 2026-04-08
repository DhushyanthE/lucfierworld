import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Brain, Zap, Trophy, Upload, Shield, Activity, TrendingUp, Users } from 'lucide-react';

interface NetworkState {
  activeModelHash: string;
  bestBellScore: number;
  reigningWallet: string;
  epoch: number;
  totalModelsSubmitted: number;
  epochRewardPool: number;
}

interface SubmissionHistory {
  id: string;
  modelHash: string;
  bellScore: number;
  status: 'accepted' | 'rejected';
  reason: string;
  timestamp: Date;
  rewardEarned: number;
}

const TSIRELSON_BOUND = 2.828;
const CLASSICAL_LIMIT = 2.0;

export default function DataScientist() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    activeModelHash: 'QmX7b...91A',
    bestBellScore: 2.500,
    reigningWallet: 'KTR_WALLET_772...8f3',
    epoch: 42,
    totalModelsSubmitted: 1847,
    epochRewardPool: 12500,
  });

  const [modelHash, setModelHash] = useState('');
  const [bellScore, setBellScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<SubmissionHistory[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  // Simulate epoch ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkState(prev => ({
        ...prev,
        bestBellScore: prev.bestBellScore + (Math.random() - 0.5) * 0.002,
        epochRewardPool: prev.epochRewardPool + Math.random() * 10,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!modelHash.trim()) { toast.error('Model hash is required'); return; }
    const score = parseFloat(bellScore);
    if (isNaN(score)) { toast.error('Enter a valid Bell Score'); return; }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));

    let status: 'accepted' | 'rejected';
    let reason: string;
    let reward = 0;

    if (score > TSIRELSON_BOUND) {
      status = 'rejected';
      reason = `Violation of Tsirelson\'s Bound (${TSIRELSON_BOUND}). Impossible score.`;
    } else if (score <= networkState.bestBellScore) {
      status = 'rejected';
      reason = `Insufficient Quantum Advantage. Must beat current best (${networkState.bestBellScore.toFixed(3)}).`;
    } else if (score <= CLASSICAL_LIMIT) {
      status = 'rejected';
      reason = `Score within classical limit (S ≤ ${CLASSICAL_LIMIT}). No quantum advantage demonstrated.`;
    } else {
      status = 'accepted';
      reason = 'Model accepted! Epoch royalties re-routed to your wallet.';
      reward = networkState.epochRewardPool * 0.05;
      setNetworkState(prev => ({
        ...prev,
        activeModelHash: modelHash.slice(0, 8) + '...' + modelHash.slice(-3),
        bestBellScore: score,
        reigningWallet: 'Your_Wallet',
        totalModelsSubmitted: prev.totalModelsSubmitted + 1,
      }));
      setTotalEarned(prev => prev + reward);
    }

    const entry: SubmissionHistory = {
      id: crypto.randomUUID(),
      modelHash: modelHash.slice(0, 12) + '...',
      bellScore: score,
      status,
      reason,
      timestamp: new Date(),
      rewardEarned: reward,
    };
    setHistory(prev => [entry, ...prev]);

    if (status === 'accepted') toast.success(reason);
    else toast.error(reason);

    setIsSubmitting(false);
    setModelHash('');
    setBellScore('');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Data Scientist Dashboard</h1>
            <p className="text-sm text-muted-foreground">Tier 3 · Proof-of-Neural-Work Model Submission</p>
          </div>
        </div>

        {/* Live Network Consensus State */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-mono font-bold text-foreground">{networkState.bestBellScore.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">Live Bell Score (S)</div>
              <Progress value={(networkState.bestBellScore / TSIRELSON_BOUND) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Shield className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <div className="text-sm font-mono font-bold text-foreground truncate">{networkState.activeModelHash}</div>
              <div className="text-xs text-muted-foreground">Active AI Model</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <div className="text-sm font-mono font-bold text-foreground truncate">{networkState.reigningWallet}</div>
              <div className="text-xs text-muted-foreground">Epoch Royalty Earner</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <div className="text-lg font-mono font-bold text-foreground">{networkState.epochRewardPool.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Epoch Reward Pool (KTR)</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Form */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Submit PoNW Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Model Weights Hash (IPFS CID)</label>
                <Input
                  value={modelHash}
                  onChange={e => setModelHash(e.target.value)}
                  placeholder="Qm..."
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Simulated Bell Score (S)</label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  max="3"
                  value={bellScore}
                  onChange={e => setBellScore(e.target.value)}
                  placeholder="e.g., 2.540"
                  className="font-mono"
                />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Classical limit: S ≤ {CLASSICAL_LIMIT}</span>
                  <span>Tsirelson's bound: S ≤ {TSIRELSON_BOUND}</span>
                  <span>Current best: {networkState.bestBellScore.toFixed(3)}</span>
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Your model must produce a Bell Score exceeding the current network best ({networkState.bestBellScore.toFixed(3)})
                  and the classical limit ({CLASSICAL_LIMIT}). Scores above Tsirelson's bound ({TSIRELSON_BOUND}) are physically
                  impossible and will be rejected.
                </p>
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full gap-2">
                <Zap className="h-4 w-4" />
                {isSubmitting ? 'Simulating quantum advantage on-chain...' : 'Sign & Submit Transaction'}
              </Button>
            </CardContent>
          </Card>

          {/* Your Stats */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" /> Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Earned</span>
                  <span className="font-mono font-bold text-primary">{totalEarned.toFixed(2)} KTR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Models Submitted</span>
                  <span className="font-mono">{history.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Accepted</span>
                  <span className="font-mono text-green-500">{history.filter(h => h.status === 'accepted').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rejected</span>
                  <span className="font-mono text-red-500">{history.filter(h => h.status === 'rejected').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Epoch</span>
                  <span className="font-mono">#{networkState.epoch}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bell Score Scale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-red-500/30 rounded-l-full" style={{ width: `${(CLASSICAL_LIMIT / 3) * 100}%` }} />
                  <div className="absolute inset-y-0 bg-green-500/30" style={{ left: `${(CLASSICAL_LIMIT / 3) * 100}%`, width: `${((TSIRELSON_BOUND - CLASSICAL_LIMIT) / 3) * 100}%` }} />
                  <div className="absolute inset-y-0 bg-destructive/30 rounded-r-full" style={{ left: `${(TSIRELSON_BOUND / 3) * 100}%`, right: 0 }} />
                  {/* Current best marker */}
                  <div className="absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${(networkState.bestBellScore / 3) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>0</span>
                  <span>Classical ≤2.0</span>
                  <span>Tsirelson 2.828</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submission History */}
        {history.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Submission History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <Badge variant={entry.status === 'accepted' ? 'default' : 'destructive'} className="text-xs">
                        {entry.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                      </Badge>
                      <span className="font-mono text-sm text-muted-foreground">{entry.modelHash}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm">S = {entry.bellScore.toFixed(3)}</span>
                      {entry.rewardEarned > 0 && (
                        <span className="font-mono text-sm text-primary">+{entry.rewardEarned.toFixed(2)} KTR</span>
                      )}
                      <span className="text-xs text-muted-foreground">{entry.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
