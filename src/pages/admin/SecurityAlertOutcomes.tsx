import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Outcome = {
  id: string; alert_key: string; channel: string; status: string;
  error: string | null; created_at: string; triggered_count: number; details: any;
};
type Setting = { alert_key: string; label: string; enabled: boolean; threshold: number; window_minutes: number; channels: string[] };

export default function SecurityAlertOutcomes() {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  const load = async () => {
    const [o, s] = await Promise.all([
      supabase.from("security_alert_outcomes").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("security_alert_settings").select("alert_key,label,enabled,threshold,window_minutes,channels"),
    ]);
    setOutcomes((o.data as Outcome[]) ?? []);
    setSettings(((s.data as any[]) ?? []).map((r) => ({ ...r, channels: r.channels ?? [] })));
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const ch = supabase.channel("alert-outcomes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "security_alert_outcomes" },
        (p) => setOutcomes((prev) => [p.new as Outcome, ...prev].slice(0, 100)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin]);

  const simulate = async (scenarios: string[], label: string) => {
    setRunning(label);
    try {
      const { data, error } = await supabase.functions.invoke("security-simulate", { body: { scenarios } });
      if (error) throw error;
      toast.success(`Simulation '${label}' fired: ${data?.watcher?.deliveries?.length ?? 0} deliveries`);
      load();
    } catch (e: any) {
      toast.error(e.message || "Simulation failed");
    } finally { setRunning(null); }
  };

  if (roleLoading) return <Layout><div className="p-8">Loading…</div></Layout>;
  if (!isAdmin) return <Layout><div className="p-8">Admin only.</div></Layout>;

  const statusColor = (s: string) =>
    s === "succeeded" ? "default" : s === "failed" ? "destructive" : s === "rate_limited" ? "secondary" : "outline";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Security Alert Outcomes</h1>
          <p className="text-muted-foreground">Delivery results, thresholds, and on-demand simulations.</p>
        </header>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">Re-run simulations</h2>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => simulate(["anon"], "Anonymous")} disabled={running !== null}>
              {running === "Anonymous" ? "Running…" : "Anonymous writes"}
            </Button>
            <Button onClick={() => simulate(["cross_user"], "Cross-user")} disabled={running !== null} variant="outline">
              {running === "Cross-user" ? "Running…" : "Cross-user session"}
            </Button>
            <Button onClick={() => simulate(["ineligible_vote"], "Ineligible vote")} disabled={running !== null} variant="outline">
              {running === "Ineligible vote" ? "Running…" : "Ineligible DAO vote"}
            </Button>
            <Button onClick={() => simulate(["anon", "cross_user", "ineligible_vote"], "All")} disabled={running !== null} variant="secondary">
              {running === "All" ? "Running…" : "Run all"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">Current thresholds</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {settings.map((s) => (
              <div key={s.alert_key} className="flex justify-between items-center p-3 rounded border">
                <div>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">
                    threshold={s.threshold} · window={s.window_minutes}min · channels={s.channels.join(", ")}
                  </div>
                </div>
                <Badge variant={s.enabled ? "default" : "secondary"}>{s.enabled ? "enabled" : "off"}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">Recent delivery outcomes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr><th className="py-2">Time</th><th>Alert</th><th>Channel</th><th>Status</th><th>Count</th><th>Error</th></tr>
              </thead>
              <tbody>
                {outcomes.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2 whitespace-nowrap">{new Date(o.created_at).toLocaleString()}</td>
                    <td>{o.alert_key}</td>
                    <td>{o.channel}</td>
                    <td><Badge variant={statusColor(o.status) as any}>{o.status}</Badge></td>
                    <td>{o.triggered_count}</td>
                    <td className="text-destructive text-xs max-w-xs truncate">{o.error}</td>
                  </tr>
                ))}
                {!outcomes.length && (
                  <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No outcomes yet — run a simulation.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
