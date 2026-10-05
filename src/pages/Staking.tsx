import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type CellRow = { id: string; stake: number; reputation: number; slashes: number; stake_weight: number; last_dharmic_score: number | null; last_vote: boolean | null };
type Result = { cells: CellRow[]; rounds: { accepted: boolean }[]; network_best: number; total_locked_lvth: number; accepted_rounds: number; rejected_rounds: number; realtime_bridge: string; on_chain: boolean };

export default function Staking() {
  const [stakes, setStakes] = useState<Record<string, number>>({});
  const [cell, setCell] = useState("cell-0");
  const [amount, setAmount] = useState("100");
  const [data, setData] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (next: Record<string, number>) => {
    setBusy(true); setError(null);
    const { data, error } = await supabase.functions.invoke("dharmic-consensus", { body: { rounds: 5, stakes: next } });
    setBusy(false);
    if (error || data?.error) return setError(error?.message ?? data.error);
    setData(data); setStakes(next);
  };

  const stake = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return setError("Enter a positive LVTH amount");
    run({ ...stakes, [cell]: (stakes[cell] ?? 0) + n });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">LVTH Staking</h1>
        <p className="text-muted-foreground">Stake into a cell and watch its Dharmic score and rounds update. Rounds run live on the backend; stakes are not on-chain until LeviathanCoin is deployed.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Stake LVTH</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-end">
          <select className="h-10 rounded-md border border-input bg-background px-3" value={cell} onChange={(e) => setCell(e.target.value)}>
            {Array.from({ length: 9 }, (_, i) => <option key={i} value={`cell-${i}`}>cell-{i}</option>)}
          </select>
          <Input className="w-40" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button onClick={stake} disabled={busy}>{busy ? "Running round…" : "Stake & run round"}</Button>
          <Button variant="outline" onClick={() => run(stakes)} disabled={busy}>Refresh rounds</Button>
          {error && <p className="text-destructive text-sm w-full">{error}</p>}
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[["Total locked", `${data.total_locked_lvth} LVTH`], ["Network best", data.network_best.toFixed(4)], ["Accepted / rejected", `${data.accepted_rounds} / ${data.rejected_rounds}`], ["Live bridge", data.realtime_bridge]].map(([k, v]) => (
              <Card key={k}><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{k}</p><p className="text-2xl font-semibold">{v}</p></CardContent></Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle>Cells</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground text-left"><tr><th>Cell</th><th>Stake</th><th>Your stake</th><th>Stake weight</th><th>Reputation</th><th>Slashes</th><th>DH score</th><th>Last vote</th></tr></thead>
                <tbody>
                  {data.cells.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-2 font-mono">{c.id}</td><td>{c.stake}</td><td>{stakes[c.id] ?? 0}</td><td>{c.stake_weight}</td><td>{c.reputation}</td><td>{c.slashes}</td>
                      <td>{c.last_dharmic_score ?? "—"}</td>
                      <td>{c.last_vote === null ? "—" : <Badge variant={c.last_vote ? "default" : "destructive"}>{c.last_vote ? "accept" : "reject"}</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
