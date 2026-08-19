/**
 * Quantum Core console — the browser surface for the ported DEVELOPMENT.md
 * services: the native statevector engine, BB84, the PQC demos, and the
 * ML-DSA-87 signed gateway.
 *
 * Every panel shows the raw response or the raw error. Nothing here fabricates
 * a result when the backend is unreachable.
 */

import { useCallback, useMemo, useState } from "react";
import { ml_dsa87 } from "@noble/post-quantum/ml-dsa.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Outcome = { ok: boolean; status: number | null; body: unknown } | null;

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

async function callCore(path: string, body?: unknown, method: "GET" | "POST" = "POST"): Promise<Outcome> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/quantum-core${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* keep raw text */
    }
    return { ok: res.ok, status: res.status, body: parsed };
  } catch (e) {
    return {
      ok: false,
      status: null,
      body: {
        error: "network_error",
        detail: e instanceof Error ? e.message : String(e),
        hint: "The request never reached the backend. If the hosted database is paused, resume it and retry.",
      },
    };
  }
}

function ResultBlock({ outcome }: { outcome: Outcome }) {
  if (!outcome) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {outcome.ok ? (
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="h-3 w-3" /> {outcome.status} OK
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <ShieldX className="h-3 w-3" /> {outcome.status ?? "no response"}
          </Badge>
        )}
      </div>
      <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
        {JSON.stringify(outcome.body, null, 2)}
      </pre>
    </div>
  );
}

function useCall() {
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const run = useCallback(async (fn: () => Promise<Outcome>) => {
    setBusy(true);
    setOutcome(null);
    setOutcome(await fn());
    setBusy(false);
  }, []);
  return { busy, outcome, run };
}

function RunButton({ busy, children, onClick }: { busy: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <Button onClick={onClick} disabled={busy} size="sm">
      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

function QrngPanel() {
  const [bits, setBits] = useState(32);
  const { busy, outcome, run } = useCall();
  return (
    <Card>
      <CardHeader>
        <CardTitle>QRNG — /v1/quantum/qrng</CardTitle>
        <CardDescription>
          One Hadamard-basis measurement per bit on the native statevector engine. Entropy comes from
          the host CSPRNG, so this is a simulator, not a physical quantum source.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="qrng-bits">num_bits</Label>
            <Input
              id="qrng-bits"
              type="number"
              min={1}
              max={4096}
              value={bits}
              onChange={(e) => setBits(Number(e.target.value))}
              className="w-32"
            />
          </div>
          <RunButton busy={busy} onClick={() => run(() => callCore("/v1/quantum/qrng", { num_bits: bits }))}>
            Generate
          </RunButton>
        </div>
        <ResultBlock outcome={outcome} />
      </CardContent>
    </Card>
  );
}

function EntanglePanel() {
  const [qubits, setQubits] = useState(3);
  const [shots, setShots] = useState(1024);
  const { busy, outcome, run } = useCall();
  return (
    <Card>
      <CardHeader>
        <CardTitle>GHZ entanglement — /v1/quantum/entangle</CardTitle>
        <CardDescription>
          h(0) then cx(0,k). Only the all-zeros and all-ones outcomes are possible; anything else
          would mean the entanglement broke.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="ghz-q">num_qubits</Label>
            <Input id="ghz-q" type="number" min={2} max={16} value={qubits} onChange={(e) => setQubits(Number(e.target.value))} className="w-28" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ghz-s">shots</Label>
            <Input id="ghz-s" type="number" min={1} max={20000} value={shots} onChange={(e) => setShots(Number(e.target.value))} className="w-28" />
          </div>
          <RunButton busy={busy} onClick={() => run(() => callCore("/v1/quantum/entangle", { num_qubits: qubits, shots }))}>
            Run
          </RunButton>
        </div>
        <ResultBlock outcome={outcome} />
      </CardContent>
    </Card>
  );
}

const DEFAULT_CIRCUIT = `[
  { "gate": "h", "qubit": 0 },
  { "gate": "cx", "control": 0, "target": 1 },
  { "gate": "rz", "qubit": 1, "theta": 0.7853981634 },
  { "gate": "h", "qubit": 1 }
]`;

function CircuitPanel() {
  const [qubits, setQubits] = useState(2);
  const [shots, setShots] = useState(1024);
  const [gates, setGates] = useState(DEFAULT_CIRCUIT);
  const [parseError, setParseError] = useState<string | null>(null);
  const { busy, outcome, run } = useCall();

  const submit = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(gates);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "invalid JSON");
      return;
    }
    setParseError(null);
    run(() => callCore("/v1/native-engine/run-circuit", { num_qubits: qubits, gates: parsed, shots }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Circuit runner — /v1/native-engine/run-circuit</CardTitle>
        <CardDescription>
          Supported gates: h, x, y, z, s, t, rz(theta), cx, cz. Up to 16 qubits and 512 gates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="circ-q">num_qubits</Label>
            <Input id="circ-q" type="number" min={1} max={16} value={qubits} onChange={(e) => setQubits(Number(e.target.value))} className="w-28" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="circ-s">shots</Label>
            <Input id="circ-s" type="number" min={1} max={20000} value={shots} onChange={(e) => setShots(Number(e.target.value))} className="w-28" />
          </div>
          <RunButton busy={busy} onClick={submit}>Execute</RunButton>
        </div>
        <div className="space-y-1">
          <Label htmlFor="circ-gates">gates (JSON array)</Label>
          <Textarea id="circ-gates" rows={8} value={gates} onChange={(e) => setGates(e.target.value)} className="font-mono text-xs" />
          {parseError && <p className="text-xs text-destructive">JSON error: {parseError}</p>}
        </div>
        <ResultBlock outcome={outcome} />
      </CardContent>
    </Card>
  );
}

function Bb84Panel() {
  const [bits, setBits] = useState(256);
  const [eve, setEve] = useState(false);
  const { busy, outcome, run } = useCall();
  return (
    <Card>
      <CardHeader>
        <CardTitle>BB84 — /v1/quantum/bb84/simulate</CardTitle>
        <CardDescription>
          Each bit is prepared and measured on the statevector engine, so the eavesdropper's ~25% QBER
          comes from real wrong-basis collapse rather than a hardcoded error rate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="bb84-bits">num_bits</Label>
            <Input id="bb84-bits" type="number" min={8} max={4096} value={bits} onChange={(e) => setBits(Number(e.target.value))} className="w-32" />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Switch id="bb84-eve" checked={eve} onCheckedChange={setEve} />
            <Label htmlFor="bb84-eve">simulate_eavesdropper</Label>
          </div>
          <RunButton
            busy={busy}
            onClick={() =>
              run(() =>
                callCore("/v1/quantum/bb84/simulate", {
                  num_bits: bits,
                  simulate_eavesdropper: eve,
                  sample_fraction: 0.25,
                }),
              )
            }
          >
            Simulate
          </RunButton>
        </div>
        <ResultBlock outcome={outcome} />
      </CardContent>
    </Card>
  );
}

function PqcPanel() {
  const kem = useCall();
  const dsa = useCall();
  const [message, setMessage] = useState("quantumsynapse-fabric");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>ML-KEM-1024 — /v1/pqc/ml-kem/demo</CardTitle>
          <CardDescription>
            Full keygen → encapsulate → decapsulate round trip. Keys are per-request and never stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RunButton busy={kem.busy} onClick={() => kem.run(() => callCore("/v1/pqc/ml-kem/demo"))}>
            Run round trip
          </RunButton>
          <ResultBlock outcome={kem.outcome} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>ML-DSA-87 — /v1/pqc/ml-dsa/demo</CardTitle>
          <CardDescription>
            Signs your message, then verifies both the correct message and a tampered one. A correct
            implementation returns true and false respectively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="dsa-msg">message</Label>
            <Input id="dsa-msg" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <RunButton
            busy={dsa.busy}
            onClick={() =>
              dsa.run(() =>
                callCore(`/v1/pqc/ml-dsa/demo?message=${encodeURIComponent(message)}`, undefined, "POST"),
              )
            }
          >
            Sign and verify
          </RunButton>
          <ResultBlock outcome={dsa.outcome} />
        </CardContent>
      </Card>
    </div>
  );
}

function GatewayPanel() {
  const [keys, setKeys] = useState<{ publicKey: Uint8Array; secretKey: Uint8Array } | null>(null);
  const [target, setTarget] = useState("/v1/quantum/qrng");
  const { busy, outcome, run } = useCall();
  const [genBusy, setGenBusy] = useState(false);

  const pubB64 = useMemo(() => (keys ? toB64(keys.publicKey) : ""), [keys]);

  const generate = () => {
    setGenBusy(true);
    // Keygen is CPU-bound; yield first so the button can show its busy state.
    setTimeout(() => {
      setKeys(ml_dsa87.keygen());
      setGenBusy(false);
    }, 0);
  };

  const send = (tamper: boolean) =>
    run(async () => {
      if (!keys) return { ok: false, status: null, body: { error: "generate a keypair first" } };
      const body = JSON.stringify({ num_bits: 16 });
      const timestamp = String(Date.now());
      const payload = new TextEncoder().encode(`${timestamp}.${body}`);
      const signature = ml_dsa87.sign(payload, keys.secretKey);
      if (tamper) signature[0] ^= 0xff;
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/quantum-gateway`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
            "x-client-pubkey": toB64(keys.publicKey),
            "x-timestamp": timestamp,
            "x-signature": toB64(signature),
            "x-target": target,
          },
          body,
        });
        const text = await res.text();
        let parsed: unknown = text;
        try {
          parsed = JSON.parse(text);
        } catch {
          /* keep raw */
        }
        return { ok: res.ok, status: res.status, body: parsed };
      } catch (e) {
        return {
          ok: false,
          status: null,
          body: { error: "network_error", detail: e instanceof Error ? e.message : String(e) },
        };
      }
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signed gateway — /functions/v1/quantum-gateway</CardTitle>
        <CardDescription>
          Generates an ML-DSA-87 keypair in this browser, signs <code>{"`${timestamp}.${body}`"}</code>,
          and forwards to quantum-core only if the signature verifies. The tampered button flips one
          byte so you can see the real 401.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <Button size="sm" variant="secondary" onClick={generate} disabled={genBusy}>
            {genBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate client keypair
          </Button>
          <div className="space-y-1">
            <Label htmlFor="gw-target">x-target</Label>
            <Input id="gw-target" value={target} onChange={(e) => setTarget(e.target.value)} className="w-72 font-mono text-xs" />
          </div>
          <RunButton busy={busy} onClick={() => send(false)}>Send signed</RunButton>
          <Button size="sm" variant="destructive" onClick={() => send(true)} disabled={busy}>
            Send tampered
          </Button>
        </div>
        {pubB64 && (
          <p className="break-all rounded-md bg-muted p-2 font-mono text-[10px] text-muted-foreground">
            x-client-pubkey: {pubB64.slice(0, 96)}… ({keys?.publicKey.length} bytes)
          </p>
        )}
        <ResultBlock outcome={outcome} />
      </CardContent>
    </Card>
  );
}

export default function QuantumCore() {
  const health = useCall();
  return (
    <main className="container mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quantum Core Console</h1>
        <p className="max-w-3xl text-muted-foreground">
          The DEVELOPMENT.md service contract, ported to TypeScript on Deno. Paths and payload shapes
          match the document; the Python-only providers (Qiskit, Cirq, Braket) are served by the native
          statevector engine instead, and every response labels itself accordingly.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RunButton busy={health.busy} onClick={() => health.run(() => callCore("/health", undefined, "GET"))}>
            Check /health
          </RunButton>
          <ResultBlock outcome={health.outcome} />
        </CardContent>
      </Card>

      <Tabs defaultValue="quantum">
        <TabsList>
          <TabsTrigger value="quantum">Quantum</TabsTrigger>
          <TabsTrigger value="qkd">QKD</TabsTrigger>
          <TabsTrigger value="pqc">PQC</TabsTrigger>
          <TabsTrigger value="gateway">Gateway</TabsTrigger>
        </TabsList>
        <TabsContent value="quantum" className="mt-4 space-y-6">
          <QrngPanel />
          <EntanglePanel />
          <CircuitPanel />
        </TabsContent>
        <TabsContent value="qkd" className="mt-4">
          <Bb84Panel />
        </TabsContent>
        <TabsContent value="pqc" className="mt-4">
          <PqcPanel />
        </TabsContent>
        <TabsContent value="gateway" className="mt-4">
          <GatewayPanel />
        </TabsContent>
      </Tabs>
    </main>
  );
}
