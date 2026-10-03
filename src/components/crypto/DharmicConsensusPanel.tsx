import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function DharmicConsensusPanel({ detailed = false }: { detailed?: boolean }) {
  const [res, setRes] = useState<any>(null);
  const [live, setLive] = useState<any>(null);
  const [late, setLate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [bridge, setBridge] = useState("connecting");

  useEffect(() => {
    const ch = supabase.channel("dharmic-rounds")
      .on("broadcast", { event: "rounds" }, ({ payload }) => setLive(payload))
      .subscribe((s) => setBridge(s === "SUBSCRIBED" ? "live" : s.toLowerCase()));
    return () => { supabase.removeChannel(ch); };
  }, []);

  const run = async () => {
    setLoading(true); setErr(null);
    const { data, error } = await supabase.functions.invoke("dharmic-consensus", { body: { cells: 7, rounds: 6, late } });
    if (error) setErr(error.message); else setRes(data);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={loading}>{loading ? "Running…" : "Run Dharmic rounds"}</Button>
        <div className="flex items-center gap-2"><Switch id="late" checked={late} onCheckedChange={setLate} /><Label htmlFor="late">One cell reports late</Label></div>
        <Badge variant={bridge === "live" ? "default" : "secondary"}>Bridge: {bridge}</Badge>
        {live && <span className="text-xs text-muted-foreground">Last broadcast {new Date(live.at).toLocaleTimeString()} · best {live.network_best}</span>}
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      {res && (
        <>
          <p className="text-xs text-muted-foreground">{res.rule}</p>
          {detailed && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-base">Cell nodes</CardTitle></CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {res.cells.map((c: any) => (
                  <div key={c.id} className="rounded-md border p-3 text-sm">
                    <div className="flex justify-between font-medium">{c.id}<Badge variant={c.honest ? "outline" : "destructive"}>{c.honest ? "honest" : "adversarial"}</Badge></div>
                    <div>Stake {c.stake} LVTH · weight {c.stake_weight}</div>
                    <div>Reputation {c.reputation} · slashes {c.slashes}</div>
                    <div className="text-xs text-muted-foreground">ML-DSA-87 key {c.public_key_bytes} bytes</div>
                  </div>
                ))}
              </CardContent></Card>
          )}
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Rounds · network best {res.network_best}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {res.rounds.map((r: any) => (
                <div key={r.round} className="rounded-md border p-3 text-sm space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Round {r.round}</span>
                    <Badge variant={r.accepted ? "default" : "secondary"}>{r.accepted ? "finalized" : r.quorum ? "did not beat best" : "no quorum"}</Badge>
                    <span>leader {r.leader} · score {r.leader_score} · votes {r.accept_votes}/{res.cells.length}</span>
                  </div>
                  {r.block_hash && <div className="text-xs text-muted-foreground break-all">block {r.block_hash.slice(0, 48)}…</div>}
                  {detailed && (
                    <div className="grid gap-1 text-xs">
                      {r.payloads.map((p: any) => (
                        <div key={p.cell} className="flex flex-wrap gap-2 break-all">
                          <span className="w-14">{p.cell}</span>
                          <span className={p.within_bell_bounds ? "" : "text-destructive"}>S={p.bell_score}</span>
                          <span>score {p.score}{p.late ? " (late)" : ""}</span>
                          <span className="text-muted-foreground">sha3 {p.hash}… · sig {p.signature_bytes}B</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent></Card>
          <p className="text-xs text-muted-foreground">{res.status}</p>
        </>
      )}
    </div>
  );
}
