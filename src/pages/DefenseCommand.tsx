import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const initial = {
  source: "sensor-alpha",
  failed_auth: 2,
  new_processes: 4,
  outbound_spike: 0.18,
  file_entropy: 0.22,
  privilege_change: false,
  known_ioc_match: false,
};

export default function DefenseCommand() {
  const [telemetry, setTelemetry] = useState(initial);
  const [result, setResult] = useState<any>(null);
  const analyze = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("defense-sentinel", {
      body: {
        ...telemetry,
        previous_audit_hash: result?.audit?.audit_hash,
      },
    });
    setResult(error ? { error: error.message } : data);
    setLoading(false);
  };

  const injectSimulation = () => setTelemetry({
    source: "simulated-endpoint-07",
    failed_auth: 18,
    new_processes: 21,
    outbound_spike: 0.91,
    file_entropy: 0.84,
    privilege_change: true,
    known_ioc_match: true,
  });

  const f = result?.finding;
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">QuantumSynapse / Defensive Cyber Resilience</div>
        <h1 className="text-3xl font-bold mt-2">Sentinel Command</h1>
        <p className="text-muted-foreground mt-2 max-w-4xl">
          Defensive telemetry triage with post-quantum signed findings, nine-perspective policy review and session-local hash-linked audit. Recommendations always require a human operator; this module cannot control weapons or autonomously execute containment.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Telemetry gateway</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Label>Source<Input value={telemetry.source} onChange={e => setTelemetry({...telemetry, source:e.target.value})}/></Label>
            <Label>Failed authentication<Input type="number" value={telemetry.failed_auth} onChange={e => setTelemetry({...telemetry, failed_auth:Number(e.target.value)})}/></Label>
            <Label>New processes<Input type="number" value={telemetry.new_processes} onChange={e => setTelemetry({...telemetry, new_processes:Number(e.target.value)})}/></Label>
            <Label>Outbound anomaly 0–1<Input type="number" step=".01" min="0" max="1" value={telemetry.outbound_spike} onChange={e => setTelemetry({...telemetry, outbound_spike:Number(e.target.value)})}/></Label>
            <Label>File entropy signal 0–1<Input type="number" step=".01" min="0" max="1" value={telemetry.file_entropy} onChange={e => setTelemetry({...telemetry, file_entropy:Number(e.target.value)})}/></Label>
            <div className="space-y-3">
              <Label className="flex gap-2 items-center"><Switch checked={telemetry.privilege_change} onCheckedChange={v=>setTelemetry({...telemetry,privilege_change:v})}/>Privilege change</Label>
              <Label className="flex gap-2 items-center"><Switch checked={telemetry.known_ioc_match} onCheckedChange={v=>setTelemetry({...telemetry,known_ioc_match:v})}/>Known IOC match</Label>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button onClick={analyze} disabled={loading}>{loading ? "Analyzing…" : "Analyze defensively"}</Button>
              <Button variant="outline" onClick={injectSimulation}>Inject simulated attack telemetry</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Command boundary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge variant="outline">Private realtime: pending</Badge>
            <p>Autonomous action: <b>disabled</b></p>
            <p>Human approval: <b>mandatory</b></p>
            <p>Indexer: <b>read-only</b></p>
            <p className="text-muted-foreground">The engine recommends observe, review or isolation. It never performs the action itself.</p>
          </CardContent>
        </Card>
      </div>

      {f && <Card>
        <CardHeader><CardTitle>Signed defensive finding</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>{f.severity}</Badge><Badge variant="secondary">score {f.score}</Badge>
            <Badge variant="outline">{f.recommendation}</Badge><Badge variant="outline">ML-DSA-87 signed</Badge>
          </div>
          <p>{f.reasons.join(" · ")}</p>
          <div className="text-xs text-muted-foreground break-all">SHA3-512 payload: {f.payload_hash}</div>
          <div className="text-xs text-muted-foreground break-all">Audit head: {result.audit.audit_hash}</div>
          <p className="text-sm font-medium">Awaiting human decision — no containment action has been executed.</p>
        </CardContent>
      </Card>}

      {result?.review && <Card>
        <CardHeader><CardTitle>Defensive verification perspectives</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="outline">{result.review.mode}</Badge>
          <p>{result.review.yes}/{result.review.votes.length} policy checks; strict threshold {result.review.quorum_required}. Decision: {result.review.decision}</p>
          <p className="text-sm text-muted-foreground">These perspectives run in one server process; they are not independent distributed validators. No containment action is executed.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {result.review.votes.map((v: any) => <div key={v.cell} className="rounded border p-2 text-xs">
              <strong>{v.cell}</strong> · {v.accept ? "accepted" : "not accepted"}
              <div className="text-muted-foreground">{v.rationale}</div>
            </div>)}
          </div>
          <p className="text-xs text-muted-foreground">Audit linkage is session-local and untrusted until server-managed persistence is deployed.</p>
        </CardContent>
      </Card>}
    </div>
  );
}
