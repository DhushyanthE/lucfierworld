import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Cpu, Shield, Zap, Network, Eye, ChevronRight, Hash, Clock, Award } from 'lucide-react';

interface BlockData {
  height: number;
  bellScore: number;
  proposer: string;
  zkVerified: boolean;
  tps: number;
  timestamp: number;
  txCount: number;
  gasUsed: number;
  ponwAngles: { a1: number; a2: number; b1: number; b2: number };
  mlDsaSigned: boolean;
}

interface ShardNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  shard: number;
  active: boolean;
}

interface ShardEdge {
  from: number;
  to: number;
  weight: number;
}

function generateBlock(height: number): BlockData {
  return {
    height,
    bellScore: 2.0 + Math.random() * 0.82,
    proposer: `KTR_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    zkVerified: Math.random() > 0.02,
    tps: 1200 + Math.floor(Math.random() * 800),
    timestamp: Date.now(),
    txCount: 50 + Math.floor(Math.random() * 200),
    gasUsed: 40 + Math.random() * 55,
    ponwAngles: {
      a1: Math.random() * Math.PI,
      a2: Math.random() * Math.PI,
      b1: Math.random() * Math.PI,
      b2: Math.random() * Math.PI,
    },
    mlDsaSigned: true,
  };
}

function ShardTopology({ isLive }: { isLive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<ShardNode[]>([]);
  const edgesRef = useRef<ShardEdge[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const nodes: ShardNode[] = [];
    for (let i = 0; i < 24; i++) {
      nodes.push({
        id: i,
        x: 100 + Math.random() * 400,
        y: 50 + Math.random() * 250,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        shard: Math.floor(i / 6),
        active: Math.random() > 0.1,
      });
    }
    nodesRef.current = nodes;

    const edges: ShardEdge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const connections = 1 + Math.floor(Math.random() * 3);
      for (let c = 0; c < connections; c++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i) edges.push({ from: i, to: target, weight: 0.3 + Math.random() * 0.7 });
      }
    }
    edgesRef.current = edges;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const shardColors = ['hsl(260, 70%, 60%)', 'hsl(200, 70%, 55%)', 'hsl(150, 60%, 50%)', 'hsl(30, 80%, 55%)'];
    let tick = 0;

    const draw = () => {
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      if (isLive) {
        tick++;
        // Rewire an edge occasionally
        if (tick % 120 === 0 && edges.length > 0) {
          const idx = Math.floor(Math.random() * edges.length);
          edges[idx].to = Math.floor(Math.random() * nodes.length);
          edges[idx].weight = 0.3 + Math.random() * 0.7;
        }
      }

      for (const n of nodes) {
        if (isLive) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 20 || n.x > w - 20) n.vx *= -1;
          if (n.y < 20 || n.y > h - 20) n.vy *= -1;
          n.x = Math.max(20, Math.min(w - 20, n.x));
          n.y = Math.max(20, Math.min(h - 20, n.y));
        }
      }

      // Edges
      for (const e of edges) {
        const a = nodes[e.from], b = nodes[e.to];
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `hsla(260, 50%, 60%, ${e.weight * 0.3})`;
        ctx.lineWidth = e.weight * 2;
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        const pulse = isLive ? 1 + Math.sin(tick * 0.03 + n.id) * 0.3 : 1;
        const r = (n.active ? 5 : 3) * pulse;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n.active ? shardColors[n.shard] : 'hsl(0, 0%, 40%)';
        ctx.fill();
        if (n.active && isLive) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 4 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `${shardColors[n.shard]}44`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isLive]);

  return <canvas ref={canvasRef} className="w-full h-[300px] rounded-lg bg-background/50" />;
}

function BlockInspector({ block }: { block: BlockData }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Block Height</p>
          <p className="font-mono font-bold text-foreground">#{block.height.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Bell Score (S)</p>
          <p className="font-mono font-bold text-foreground">{block.bellScore.toFixed(3)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Transactions</p>
          <p className="font-mono text-foreground">{block.txCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Gas Used</p>
          <p className="font-mono text-foreground">{block.gasUsed.toFixed(1)}%</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">PoNW Tensor Angles</p>
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(block.ponwAngles).map(([k, v]) => (
            <div key={k} className="bg-muted/50 px-2 py-1 rounded text-center">
              <p className="text-[10px] text-muted-foreground">{k}</p>
              <p className="text-xs font-mono text-foreground">{(v / Math.PI).toFixed(3)}π</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {block.zkVerified && <Badge className="bg-green-600/30 text-green-400 text-xs">ZK-Echo Verified</Badge>}
        {block.mlDsaSigned && <Badge className="bg-primary/30 text-primary text-xs">ML-DSA Signed</Badge>}
      </div>
    </div>
  );
}

export default function NetworkExplorer() {
  const [blocks, setBlocks] = useState<BlockData[]>(() => {
    const initial: BlockData[] = [];
    for (let i = 0; i < 8; i++) initial.push(generateBlock(1045200 - i));
    return initial;
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const latestBlock = blocks[0];
  const activeModel = 'QmX7bK9...d91A';
  const epochEarner = 'KTR_WALLET_772...';

  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = setInterval(() => {
        setBlocks(prev => {
          const newBlock = generateBlock(prev[0].height + 1);
          return [newBlock, ...prev.slice(0, 49)];
        });
      }, 2500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isStreaming]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Live Telemetry Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Network TPS', value: latestBlock.tps.toLocaleString(), icon: <Zap className="h-4 w-4 text-primary" />, badge: 'Live' },
            { label: 'Active AI Model', value: activeModel, icon: <Cpu className="h-4 w-4 text-blue-400" />, badge: 'IPFS' },
            { label: 'Bell Score (S)', value: latestBlock.bellScore.toFixed(3), icon: <Activity className="h-4 w-4 text-green-400" />, badge: latestBlock.bellScore > 2.5 ? 'Quantum ✓' : 'Classical' },
            { label: 'Epoch Royalty Earner', value: epochEarner, icon: <Award className="h-4 w-4 text-yellow-400" />, badge: 'Tier 3' },
          ].map((m, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  {m.icon}
                  <Badge variant="secondary" className="text-[10px]">{m.badge}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-sm font-mono font-bold text-foreground truncate">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shard Topology */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" /> Live Shard Topology
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Auto-Stream</span>
                  <Switch checked={isStreaming} onCheckedChange={setIsStreaming} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ShardTopology isLive={isStreaming} />
              <div className="flex gap-3 mt-2">
                {['Shard 0', 'Shard 1', 'Shard 2', 'Shard 3'].map((s, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ['hsl(260,70%,60%)', 'hsl(200,70%,55%)', 'hsl(150,60%,50%)', 'hsl(30,80%,55%)'][i] }} />
                    <span className="text-[10px] text-muted-foreground">{s}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Block Inspector */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Block Inspector
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBlock ? (
                <BlockInspector block={selectedBlock} />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Click a block from the list below to inspect its PoNW proof and ZK-Echo receipt.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Latest Blocks */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" /> Latest Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {blocks.map((b, i) => (
                <button
                  key={b.height}
                  onClick={() => setSelectedBlock(b)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors hover:bg-muted/50 ${selectedBlock?.height === b.height ? 'bg-muted/70' : ''} ${i === 0 && isStreaming ? 'animate-pulse' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-foreground font-bold">#{b.height.toLocaleString()}</span>
                    <span className="text-muted-foreground text-xs">{b.txCount} txns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">S={b.bellScore.toFixed(2)}</Badge>
                    {b.zkVerified && <Badge className="bg-green-600/30 text-green-400 text-[10px]">ZK ✓</Badge>}
                    <span className="text-[10px] text-muted-foreground">{new Date(b.timestamp).toLocaleTimeString()}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
