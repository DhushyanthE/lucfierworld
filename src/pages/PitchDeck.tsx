import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Maximize2, Download } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  content: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Title',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-16 bg-gradient-to-br from-[hsl(var(--primary)/0.15)] via-background to-background">
        <div className="space-y-6">
          <Badge className="text-lg px-4 py-1 bg-primary/20 text-primary border-primary/30">Seed Round · $3M</Badge>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Kontour Coin
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl">
            The Quantum-Hybrid Layer-1 Blockchain Secured by Distributed AI
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Badge variant="outline" className="text-sm px-3 py-1">Post-Quantum Native</Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">Proof-of-Neural-Work</Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">ZK-Compressed</Badge>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'The Problem',
    content: (
      <div className="flex flex-col justify-center h-full px-16 space-y-8">
        <div>
          <Badge className="bg-red-600/30 text-red-400 mb-4">THE THREAT</Badge>
          <h2 className="text-4xl font-bold text-foreground">The Expiration Date on Digital Trust</h2>
          <p className="text-lg text-muted-foreground mt-2">Legacy blockchains are mathematically defenseless against the quantum horizon.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-card border border-border space-y-3">
            <div className="text-3xl font-mono font-bold text-red-400">Q-Day</div>
            <p className="text-sm text-muted-foreground">99% of digital assets rely on Elliptic Curve Cryptography. Shor's algorithm will derive private keys from public addresses.</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border space-y-3">
            <div className="text-3xl font-mono font-bold text-amber-400">Trilemma</div>
            <p className="text-sm text-muted-foreground">PoW wastes energy on useless math. Standard PoS centralizes wealth. Neither produces useful computational work.</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border space-y-3">
            <div className="text-3xl font-mono font-bold text-orange-400">Static</div>
            <p className="text-sm text-muted-foreground">Traditional ledgers use rigid routing topologies, causing massive bottlenecks during state sharding attempts.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'The Solution',
    content: (
      <div className="flex flex-col justify-center h-full px-16 space-y-8">
        <div>
          <Badge className="bg-green-600/30 text-green-400 mb-4">THE ARCHITECTURE</Badge>
          <h2 className="text-4xl font-bold text-foreground">Kontour Coin: Quantum-Hybrid Layer-1</h2>
          <p className="text-lg text-muted-foreground mt-2">A self-optimizing, quantum-resistant chain secured by distributed AI.</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <h3 className="text-lg font-bold text-primary">ML-KEM / ML-DSA Base</h3>
            <p className="text-sm text-muted-foreground">NIST-standard post-quantum cryptography (FIPS 203/204). Mathematical immunity from Genesis block zero.</p>
          </div>
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <h3 className="text-lg font-bold text-primary">Proof-of-Neural-Work</h3>
            <p className="text-sm text-muted-foreground">Validators run AI inference to optimize network routing. Must pass the Bell Inequality test (S ≥ 2.0) to mint blocks.</p>
          </div>
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <h3 className="text-lg font-bold text-primary">ZK-Rollup Compression</h3>
            <p className="text-sm text-muted-foreground">RISC Zero zkVM compresses 20-layer quantum coherence checks into succinct proofs. Sub-second finality.</p>
          </div>
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <h3 className="text-lg font-bold text-primary">Cloud Syndicate Economy</h3>
            <p className="text-sm text-muted-foreground">On-chain Epoch Royalties incentivize global ML engineers to continuously train superior routing models.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: 'How It Works',
    content: (
      <div className="flex flex-col justify-center h-full px-16 space-y-8">
        <h2 className="text-4xl font-bold text-foreground">Transaction Lifecycle</h2>
        <div className="flex gap-4 items-stretch">
          {[
            { phase: '1', title: 'ML-DSA Signing', desc: 'Wallet signs with post-quantum ML-DSA (FIPS 204). Immune to Shor\'s algorithm.', color: 'text-blue-400' },
            { phase: '2', title: 'Quantum Echoes', desc: '20-layer simulated quantum coherence check. P(bypass) = 1.05 × 10⁻³⁴.', color: 'text-purple-400' },
            { phase: '3', title: 'ZK Compression', desc: 'RISC Zero generates succinct receipt. Only the proof stored on-chain.', color: 'text-cyan-400' },
            { phase: '4', title: 'PoNW Consensus', desc: 'Validators run AI inference → Bell test. Block commits if S ≥ 2.0.', color: 'text-green-400' },
          ].map(p => (
            <div key={p.phase} className="flex-1 p-5 rounded-xl bg-card border border-border space-y-3">
              <div className={`text-4xl font-mono font-bold ${p.color}`}>{p.phase}</div>
              <h3 className="text-base font-bold text-foreground">{p.title}</h3>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: 'Tokenomics',
    content: (
      <div className="flex flex-col justify-center h-full px-16 space-y-8">
        <h2 className="text-4xl font-bold text-foreground">$KTR Tokenomics</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Token Distribution</h3>
            {[
              { label: 'Protocol Treasury', pct: 30, color: 'bg-primary' },
              { label: 'Team & Advisors (4yr vest)', pct: 20, color: 'bg-purple-500' },
              { label: 'Cloud Syndicate Rewards', pct: 25, color: 'bg-cyan-500' },
              { label: 'Public Sale (TGE)', pct: 15, color: 'bg-green-500' },
              { label: 'Ecosystem Fund', pct: 10, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono font-bold text-foreground">{item.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Economic Flywheel</h3>
            <div className="p-5 bg-card rounded-xl border border-border space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Epoch Royalties (5%):</strong> Each block reward allocates 5% to the reigning Data Scientist whose AI model governs the network.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Deflationary Burns:</strong> A portion of transaction fees are burned, creating deflationary pressure as network usage grows.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Staking Yield:</strong> Validators stake $KTR to participate in PoNW consensus. Higher stake = higher probability of panel selection.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: 'Traction',
    content: (
      <div className="flex flex-col justify-center h-full px-16 space-y-8">
        <h2 className="text-4xl font-bold text-foreground">Built, Not Promised</h2>
        <div className="grid grid-cols-4 gap-6">
          {[
            { metric: '20', label: 'Quantum Firewall Layers', sub: 'Simulated coherence protocol' },
            { metric: '2.828', label: 'Tsirelson Bound', sub: 'Enforced on-chain' },
            { metric: '1,500+', label: 'TPS Target', sub: 'ZK-compressed throughput' },
            { metric: 'FIPS 203/204', label: 'NIST Standards', sub: 'ML-KEM & ML-DSA' },
          ].map(item => (
            <div key={item.label} className="p-6 rounded-xl bg-card border border-border text-center space-y-2">
              <div className="text-3xl font-mono font-bold text-primary">{item.metric}</div>
              <div className="text-sm font-semibold text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <div className="text-sm font-bold text-foreground">✓ Quantum Circuit Studio</div>
            <div className="text-xs text-muted-foreground">12-gate palette, real-mode execution</div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <div className="text-sm font-bold text-foreground">✓ Network Explorer</div>
            <div className="text-xs text-muted-foreground">Live shard topology & PoNW inspector</div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <div className="text-sm font-bold text-foreground">✓ Data Scientist Dashboard</div>
            <div className="text-xs text-muted-foreground">Model submission & Bell score validation</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: 'Roadmap',
    content: (
      <div className="flex flex-col justify-center h-full px-16 space-y-8">
        <h2 className="text-4xl font-bold text-foreground">Development Roadmap</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/30" />
          {[
            { q: 'Q3 2026', title: 'Testnet Alpha', items: ['Core Rust L1 consensus', 'PoNW validator nodes', 'Bell test enforcement (S ≥ 2.0)'], status: 'current' },
            { q: 'Q1 2027', title: 'Testnet Beta', items: ['RISC Zero ZK integration', '20-layer Quantum Echoes', 'Cloud Syndicate onboarding'], status: 'future' },
            { q: 'Q3 2027', title: 'Mainnet Launch', items: ['ML-KEM/ML-DSA production keys', 'Token Generation Event (TGE)', 'DEX listings'], status: 'future' },
            { q: 'Q1 2028', title: 'Ecosystem Growth', items: ['WASM smart contract SDK', 'Cross-chain bridges', 'Enterprise partnerships'], status: 'future' },
          ].map(phase => (
            <div key={phase.q} className="flex gap-6 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold z-10 ${phase.status === 'current' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'}`}>
                {phase.q.split(' ')[0]}
              </div>
              <div className="flex-1 p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{phase.q}</span>
                  {phase.status === 'current' && <Badge className="bg-primary/20 text-primary text-xs">FUNDED</Badge>}
                </div>
                <h3 className="text-lg font-bold text-foreground">{phase.title}</h3>
                <ul className="text-sm text-muted-foreground mt-1 space-y-0.5">
                  {phase.items.map(item => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 8,
    title: 'The Ask',
    content: (
      <div className="flex flex-col items-center justify-center h-full px-16 text-center space-y-8">
        <Badge className="text-lg px-4 py-1 bg-primary/20 text-primary border-primary/30">SEED ROUND</Badge>
        <h2 className="text-5xl font-bold text-foreground">Raising $3,000,000</h2>
        <p className="text-xl text-muted-foreground max-w-2xl">To build the Testnet Alpha and prove the quantum-hybrid architecture works.</p>
        <div className="grid grid-cols-3 gap-8 w-full max-w-3xl">
          <div className="p-6 rounded-xl bg-card border border-border space-y-2">
            <div className="text-4xl font-mono font-bold text-primary">60%</div>
            <div className="text-sm font-semibold text-foreground">Core Engineering</div>
            <div className="text-xs text-muted-foreground">3-5 senior Rust & cryptography engineers</div>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border space-y-2">
            <div className="text-4xl font-mono font-bold text-primary">20%</div>
            <div className="text-sm font-semibold text-foreground">Security & Audits</div>
            <div className="text-xs text-muted-foreground">Formal verification of ML-KEM/ML-DSA</div>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border space-y-2">
            <div className="text-4xl font-mono font-bold text-primary">20%</div>
            <div className="text-sm font-semibold text-foreground">Infrastructure</div>
            <div className="text-xs text-muted-foreground">Cloud compute for PyTorch training pipelines</div>
          </div>
        </div>
        <p className="text-lg font-semibold text-primary mt-4">
          Milestone: Testnet Alpha — the network rejects a block for failing the Bell test.
        </p>
      </div>
    ),
  },
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const next = useCallback(() => setCurrentSlide(i => Math.min(i + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setCurrentSlide(i => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const slideContent = (
    <div className={`relative w-full ${isFullscreen ? 'h-screen' : 'aspect-[16/9]'} bg-background overflow-hidden rounded-lg border border-border`}>
      <div className="absolute inset-0">
        {SLIDES[currentSlide].content}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
        <Button variant="ghost" size="sm" onClick={prev} disabled={currentSlide === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground font-mono">
          {currentSlide + 1} / {SLIDES.length}
        </span>
        <Button variant="ghost" size="sm" onClick={next} disabled={currentSlide === SLIDES.length - 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (isFullscreen) {
    return slideContent;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kontour Coin — Investor Pitch Deck</h1>
            <p className="text-sm text-muted-foreground">Seed Round · $3M Raise · Quantum-Hybrid Layer-1</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" /> Present
            </Button>
          </div>
        </div>

        {slideContent}

        {/* Slide thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`flex-shrink-0 w-32 h-20 rounded border-2 flex items-center justify-center text-xs font-mono transition-all ${
                idx === currentSlide ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {slide.title}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
