import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Ping {
  id: string;
  message: string;
  user_id: string | null;
  created_at: string;
}

interface IBMJob {
  id?: string;
  status?: string;
  results?: unknown;
  error?: unknown;
  [k: string]: unknown;
}

const DEFAULT_QASM = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`;

export default function RealtimeDemo() {
  const [pings, setPings] = useState<Ping[]>([]);
  const [msg, setMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [qasm, setQasm] = useState(DEFAULT_QASM);
  const [backend, setBackend] = useState("ibm_brisbane");
  const [shots, setShots] = useState(1024);
  const [running, setRunning] = useState(false);
  const [job, setJob] = useState<IBMJob | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let alive = true;
    supabase
      .from("realtime_pings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (alive && data) setPings(data as Ping[]);
      });

    const channel = supabase
      .channel("realtime_pings_demo")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "realtime_pings" },
        (payload) => {
          setPings((prev) => [payload.new as Ping, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const sendPing = async (e: FormEvent) => {
    e.preventDefault();
    const text = msg.trim();
    if (!text) return;
    if (!userId) {
      toast.error("Sign in to send a ping");
      return;
    }
    const { error } = await supabase.from("realtime_pings").insert({ message: text, user_id: userId });
    if (error) toast.error(error.message);
    else setMsg("");
  };

  const runOnIBM = async () => {
    setRunning(true);
    setJob(null);
    const { data, error } = await supabase.functions.invoke("quantum-run", {
      body: { qasm, backend, shots },
    });
    setRunning(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setJob(data as IBMJob);
    if ((data as IBMJob)?.id) toast.success(`Job submitted: ${(data as IBMJob).id}`);
  };

  const pollJob = async () => {
    if (!job?.id) return;
    const { data, error } = await supabase.functions.invoke(`quantum-run?jobId=${job.id}`, {
      method: "GET",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setJob(data as IBMJob);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Realtime + IBM Quantum</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Live Supabase Realtime demo, plus a proxy that submits OpenQASM 2.0 circuits to IBM Quantum.
        </p>
      </header>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Live pings</h2>
          <p className="text-sm text-muted-foreground">
            Every INSERT into <code>realtime_pings</code> broadcasts to every open browser.
          </p>
        </div>
        <form onSubmit={sendPing} className="flex gap-2">
          <Input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={userId ? "Say something…" : "Sign in to send"}
            maxLength={500}
            disabled={!userId}
          />
          <Button type="submit" disabled={!userId || !msg.trim()}>Send</Button>
        </form>
        <ul className="divide-y">
          {pings.length === 0 && <li className="py-4 text-sm text-muted-foreground">No pings yet.</li>}
          {pings.map((p) => (
            <li key={p.id} className="py-2 text-sm flex justify-between gap-4">
              <span className="truncate">{p.message}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(p.created_at).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">IBM Quantum runner</h2>
          <p className="text-sm text-muted-foreground">
            Submits your circuit to IBM's Sampler primitive. Requires an active IBM Quantum
            Platform instance on the account the IBM_QUANTUM_TOKEN belongs to.
          </p>
        </div>
        <Textarea
          value={qasm}
          onChange={(e) => setQasm(e.target.value)}
          className="font-mono text-xs h-48"
        />
        <div className="flex gap-2">
          <Input value={backend} onChange={(e) => setBackend(e.target.value)} placeholder="backend" />
          <Input
            type="number"
            min={1}
            max={100000}
            value={shots}
            onChange={(e) => setShots(Number(e.target.value) || 1024)}
            className="w-32"
          />
          <Button onClick={runOnIBM} disabled={running}>{running ? "Submitting…" : "Run"}</Button>
          <Button onClick={pollJob} variant="outline" disabled={!job?.id}>Poll status</Button>
        </div>
        {job && (
          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
            {JSON.stringify(job, null, 2)}
          </pre>
        )}
      </Card>
    </div>
  );
}
