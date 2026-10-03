import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/* eslint-disable @typescript-eslint/no-explicit-any */

const faultLabels: Array<[string, string]> = [
  ["late", "Late node"],
  ["forge_signature", "Forge signature"],
  ["tamper_payload", "Tamper payload"],
  ["impossible_bell", "Impossible Bell"],
  ["replay_round", "Replay round"],
  ["insecure_qkd", "Insecure QKD"],
];

export function DharmicConsensusPanel({ detailed = false }: { detailed?: boolean }) {
  const [res, setRes] = useState<any>(null);
  const [live, setLive] = useState<any>(null);
  const [faults, setFaults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [bridge, setBridge] = useState("connecting");

  useEffect(() => {
    const ch = supabase
      .channel("dharmic-rounds")
      .on("broadcast", { event: "rounds" }, ({ payload }) => setLive(payload))
      .subscribe((status) => setBridge(status === "SUBSCRIBED" ? "live" : status.toLowerCase()));
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const run = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase.functions.invoke("dharmic-consensus", {
      body: {
        cells: 9,
        rounds: 6,
        late: !!faults.late,
        forge_signature: !!faults.forge_signature,
        tamper_payload: !!faults.tamper_payload,
        impossible_bell: !!faults.impossible_bell,
        replay_round: !!faults.replay_round,
        qkd_secure: !faults.insecure_qkd,
      },
    });
    if (error) setErr(error.message);
    else setRes(data);
    setLoading(false);
  };

  const latest = res?.rounds?.at?.(-1) ?? null;
  const metrics = useMemo(
    () => [
      ["Network best", res?.network_best ?? live?.network_best ?? "—"],
      ["Accepted", res?.accepted_rounds ?? live?.accepted_rounds ?? "—"],
      ["Rejected", res?.rejected_rounds ?? live?.rejected_rounds ?? "—"],
      ["Validators", res?.cells?.length ?? 9],
      ["Locked LVTH", res?.total_locked_lvth ?? live?.total_locked_lvth ?? "—"],
      ["Persistence", res?.persistence_mode ?? "Server simulation"],
    ],
    [res, live],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Proof of Dharmic State</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Research consensus over software cell nodes. SHA3-512 + ML-DSA-87 are cryptographic primitives; this UI does not represent living cells or physical QKD.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={bridge === "live" ? "default" : "secondary"}>Realtime: {bridge}</Badge>
              <Badge variant="outline">{res?.on_chain ? "On-chain" : "Server simulation"}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {metrics.map(([label, value]) => (
              <div key={label} className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="mt-1 font-semibold">{String(value)}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={run} disabled={loading}>{loading ? "Running…" : "Run PoDS rounds"}</Button>
            {faultLabels.map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Switch
                  id={key}
                  checked={!!faults[key]}
                  onCheckedChange={(checked) => setFaults((f) => ({ ...f, [key]: checked }))}
                />
                <Label htmlFor={key} className="text-xs">{label}</Label>
              </div>
            ))}
          </div>

          <div className="flex gap-3 text-xs">
            <Link to="/cells" className="underline">Open cellular blockchain</Link>
            <Link to="/fabric" className="underline">Open BBB8 fabric</Link>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          {live && (
            <p className="text-xs text-muted-foreground">
              Last realtime broadcast {new Date(live.at).toLocaleTimeString()}.
            </p>
          )}
        </CardContent>
      </Card>

      {res && (
        <>
          <p className="text-xs text-muted-foreground">{res.rule}</p>

          {detailed && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Nine cell nodes</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="p-2">Cell</th><th>Bell S</th><th>Reputation</th><th>Locked LVTH</th>
                      <th>Slashes</th><th>Dharmic score</th><th>ML-DSA-87</th><th>Vote</th><th>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.cells.map((c: any) => (
                      <tr key={c.id} className="border-t">
                        <td className="p-2 font-medium">{c.id}</td>
                        <td>{c.last_bell_score ?? "—"}</td>
                        <td>{c.reputation}</td>
                        <td>{c.stake}</td>
                        <td>{c.slashes}</td>
                        <td>{c.last_dharmic_score ?? "—"}</td>
                        <td><Badge variant={c.last_signature_valid === false ? "destructive" : "outline"}>{c.last_signature_valid === false ? "invalid" : "verified"}</Badge></td>
                        <td>{c.last_vote === null ? "—" : c.last_vote ? "yes" : "no"}</td>
                        <td className={c.last_on_time === false ? "text-destructive" : ""}>{c.last_latency_ms ?? "—"} ms {c.last_on_time === false ? "late" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                PoDS rounds · best {res.network_best} · head {String(res.chain_head).slice(0, 16)}…
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {res.rounds.map((round: any) => (
                <div key={round.round} className="rounded-md border p-3 text-sm space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Round {round.round}</span>
                    <Badge variant={round.accepted ? "default" : "destructive"}>{round.accepted ? "accepted" : "rejected"}</Badge>
                    <span>winner {round.leader} · score {round.leader_score}</span>
                    <span>quorum {round.accept_votes}/{round.total_cells} (need {round.quorum_required})</span>
                    {!round.accepted && <span className="text-destructive">{round.rejection_reason}</span>}
                  </div>
                  <div className="grid gap-1 text-xs text-muted-foreground">
                    <span className="break-all">previous {round.previous_hash}</span>
                    <span className="break-all">round hash {round.round_hash}</span>
                    <span className="break-all">payload digest {round.payload_digest}</span>
                    <span>signature {round.signature_valid ? "verified" : "invalid"} · hash {round.hash_matches ? "canonical" : "mismatch"} · QKD gate {round.qkd_secure ? "secure" : "rejected"}</span>
                  </div>
                  {detailed && (
                    <div className="grid gap-1 text-xs">
                      {round.payloads.map((p: any) => (
                        <div key={p.cell} className="grid grid-cols-[70px_80px_90px_90px_1fr] gap-2 border-t pt-1">
                          <span>{p.cell}</span>
                          <span className={p.within_bell_bounds ? "" : "text-destructive"}>S={p.bell_score}</span>
                          <span>score {p.score}</span>
                          <span>{p.vote ? "vote yes" : "vote no"}</span>
                          <span className="break-all text-muted-foreground">ML-DSA-87 {p.signature_preview}… · SHA3 {p.hash.slice(0, 40)}…</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">{res.status}</p>
        </>
      )}

      {!res && latest && (
        <p className="text-xs text-muted-foreground">
          Latest round {latest.round}: {latest.accepted ? "accepted" : "rejected"}.
        </p>
      )}
    </div>
  );
}
