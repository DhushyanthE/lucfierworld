import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function QuantumFabric() {
  const [eve, setEve] = useState(false);
  const [tamper, setTamper] = useState(false);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setLoading(true); setErr(null);
    const { data, error } = await supabase.functions.invoke("agi-bio-fabric", { body: { eavesdropper: eve, tamper, rounds: 512, cells: 9 } });
    if (error) setErr(error.message); else setRes(data);
    setLoading(false);
  };

  const Stage = ({ n, title, ok, children }: { n: number; title: string; ok?: boolean; children: React.ReactNode }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{n}. {title}</span>
          {ok !== undefined && <Badge variant={ok ? "default" : "destructive"}>{ok ? "pass" : "fail"}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-1 break-all">{children}</CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-4xl py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Quantum Synapse Fabric</h1>
        <p className="text-muted-foreground">
          Bell-state key exchange → neural decision → SHA3-512 hash → lattice (ML-DSA-87) signature → cellular-ledger consensus ("Proof of Dharmic State").
        </p>
        <p className="text-xs text-muted-foreground">Simulation: the cells are software nodes and the decision model is a small CNN+RNN, not a conscious AGI. The key exchange, hash and signature are real algorithms.</p>
      </header>

      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2"><Switch id="eve" checked={eve} onCheckedChange={setEve} /><Label htmlFor="eve">Eavesdropper</Label></div>
          <div className="flex items-center gap-2"><Switch id="tamper" checked={tamper} onCheckedChange={setTamper} /><Label htmlFor="tamper">Tamper after signing</Label></div>
          <Button onClick={run} disabled={loading}>{loading ? "Running…" : "Run pipeline"}</Button>
        </CardContent>
      </Card>
      {err && <p className="text-destructive text-sm">{err}</p>}

      {res && (
        <div className="grid gap-4">
          <Stage n={1} title="Entangled key distribution (BB84 / BBM92)" ok={res.qkd.secure}>
            <div>State {res.qkd.state} · sifted {res.qkd.sifted_bits} bits · QBER <b>{res.qkd.qber_percent}%</b> (limit 11%)</div>
            <div>Key: {res.qkd.key_hex || "discarded"}</div>
          </Stage>
          <Stage n={2} title="Decision network (CNN + RNN + policy)">
            <div>Decision: <b>{res.decision.action}</b></div>
            <div>{Object.entries(res.decision.probabilities).map(([k, v]) => `${k} ${(Number(v) * 100).toFixed(1)}%`).join(" · ")}</div>
          </Stage>
          <Stage n={3} title="SHA3-512 + ML-DSA-87 signature" ok={res.verification.valid}>
            <div className="font-mono text-xs">{res.record.hash}</div>
            <div>Signature {res.record.signature_bytes} bytes · hash matches: {String(res.verification.hash_matches)} · signature valid: {String(res.verification.signature_valid)}</div>
          </Stage>
          <Stage n={4} title="Cellular ledger — Proof of Dharmic State" ok={res.consensus.accepted}>
            <div>{res.consensus.rule}</div>
            <div>{res.consensus.accept_votes}/{res.consensus.cells} cells accepted</div>
            <div className="flex flex-wrap gap-1 pt-1">
              {res.consensus.votes.map((v: any) => <Badge key={v.cell} variant={v.accept ? "secondary" : "destructive"}>{v.cell}</Badge>)}
            </div>
            {res.consensus.block && <div className="font-mono text-xs pt-1">Block {res.consensus.block.block_hash.slice(0, 48)}…</div>}
          </Stage>
        </div>
      )}
    </div>
  );
}
