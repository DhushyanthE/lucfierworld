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
type StripeWebhookEvent = {
  id: string; event_id: string; event_type: string; stripe_session_id: string | null;
  status: string; error: string | null; payload: any; processed_at: string | null; created_at: string;
};

export default function SecurityAlertOutcomes() {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<StripeWebhookEvent[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  const load = async () => {
    const [o, s, w] = await Promise.all([
      supabase.from("security_alert_outcomes").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("security_alert_settings").select("alert_key,label,enabled,threshold,window_minutes,channels"),
      supabase.from("stripe_webhook_events").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setOutcomes((o.data as Outcome[]) ?? []);
    setSettings(((s.data as any[]) ?? []).map((r) => ({ ...r, channels: r.channels ?? [] })));
    setWebhookEvents((w.data as StripeWebhookEvent[]) ?? []);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const ch = supabase.channel("alert-outcomes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "security_alert_outcomes" },
        (p) => setOutcomes((prev) => [p.new as Outcome, ...prev].slice(0, 100)))
      .on("postgres_changes", { event: "*", schema: "public", table: "stripe_webhook_events" },
        (p) => setWebhookEvents((prev) => [p.new as StripeWebhookEvent, ...prev.filter((row) => row.id !== (p.new as StripeWebhookEvent).id)].slice(0, 100)))
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

  const [replaying, setReplaying] = useState<string | null>(null);
  const replay = async (eventId: string) => {
    setReplaying(eventId);
    try {
      // CSRF defense-in-depth: random per-request token + XHR marker header.
      const csrfBytes = crypto.getRandomValues(new Uint8Array(24));
      const csrfToken = Array.from(csrfBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      const { data, error } = await supabase.functions.invoke("stripe-webhook-replay", {
        body: { event_id: eventId },
        headers: {
          "x-requested-with": "XMLHttpRequest",
          "x-csrf-token": csrfToken,
        },
      });
      if (error) throw error;
      toast.success(`Replayed ${eventId}: ${data?.status ?? "ok"}`);
      load();
    } catch (e: any) {
      toast.error(e.message || "Replay failed");
    } finally { setReplaying(null); }
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

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">Stripe webhook delivery log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr><th className="py-2">Time</th><th>Event</th><th>Type</th><th>Session</th><th>Status</th><th>Error</th><th>Payload</th><th>Replay</th></tr>
              </thead>
              <tbody>
                {webhookEvents.map((event) => (
                  <tr key={event.id} className="border-t align-top">
                    <td className="py-2 whitespace-nowrap">{new Date(event.created_at).toLocaleString()}</td>
                    <td className="font-mono text-xs max-w-40 truncate">{event.event_id}</td>
                    <td>{event.event_type}</td>
                    <td className="font-mono text-xs max-w-44 truncate">{event.stripe_session_id}</td>
                    <td><Badge variant={statusColor(event.status) as any}>{event.status}</Badge></td>
                    <td className="text-destructive text-xs max-w-xs truncate">{event.error}</td>
                    <td>
                      <details className="max-w-md">
                        <summary className="cursor-pointer text-muted-foreground">View</summary>
                        <pre className="mt-2 max-h-72 overflow-auto rounded border bg-muted p-3 text-xs">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </details>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={replaying === event.event_id}
                        onClick={() => replay(event.event_id)}
                      >
                        {replaying === event.event_id ? "Replaying…" : "Replay"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!webhookEvents.length && (
                  <tr><td colSpan={8} className="text-center py-6 text-muted-foreground">No Stripe webhooks logged yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <ReplayAuditExport />
        <DeniedAttemptsTable />
      </div>
    </Layout>
  );
}

const DENIAL_REASONS = [
  "csrf_xhr_missing",
  "csrf_token_missing",
  "cors_origin_blocked",
  "auth_missing",
  "jwt_invalid",
  "jwt_expired",
  "jwt_bad_audience",
  "role_not_admin",
  "rate_limit_minute",
  "rate_limit_hour",
  "rate_limit_event_cooldown",
  "event_not_found",
  "event_id_invalid",
  "body_invalid",
  "method_not_allowed",
] as const;

function ReplayAuditExport() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [denialReason, setDenialReason] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const exportCsv = async () => {
    setBusy(true);
    try {
      const csrfBytes = crypto.getRandomValues(new Uint8Array(24));
      const csrfToken = Array.from(csrfBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-replay-audit-export`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "x-requested-with": "XMLHttpRequest",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          from: `${from}T00:00:00Z`,
          to: `${to}T23:59:59Z`,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const rows = res.headers.get("x-row-count") ?? "?";
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `stripe-replay-audit_${from}_to_${to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);
      toast.success(`Exported ${rows} audit row(s)`);
    } catch (e: any) {
      toast.error(e.message ?? "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-3">Export replay audit log</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Download all replay attempts and denials (including JWT/CSRF/rate-limit blocks) for the selected range.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <div className="mb-1 text-muted-foreground">From</div>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="rounded border bg-background px-2 py-1" />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-muted-foreground">To</div>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="rounded border bg-background px-2 py-1" />
        </label>
        <Button onClick={exportCsv} disabled={busy}>
          {busy ? "Exporting…" : "Download CSV"}
        </Button>
      </div>
    </Card>
  );
}
