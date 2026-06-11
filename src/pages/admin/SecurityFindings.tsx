import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useNavigate } from "react-router-dom";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "WONT_FIX";

interface Finding {
  id: string;
  scanner: string;       // "wiz" | "trivy" | "npm-audit" | ...
  rule: string;
  severity: Severity;
  status: Status;
  resource: string;
  owner: string;
  fix_commit: string | null;
  detected_at: string;
}

const SEV_VARIANT: Record<Severity, "destructive" | "default" | "secondary" | "outline"> = {
  CRITICAL: "destructive",
  HIGH: "destructive",
  MEDIUM: "default",
  LOW: "secondary",
};

const STATUSES: Status[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "WONT_FIX"];
const SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// The page loads JSON exports from scanners (Wiz, Trivy, npm-audit, ...).
// Drop new JSON arrays into public/security/findings.json or expose them at
// VITE_SECURITY_FINDINGS_URL — the schema is documented in the Finding type.
const FINDINGS_URL =
  (import.meta.env.VITE_SECURITY_FINDINGS_URL as string | undefined) ??
  "/security/findings.json";

export default function SecurityFindings() {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    severity: "ALL" as "ALL" | Severity,
    status: "ALL" as "ALL" | Status,
    owner: "",
    scanner: "",
  });

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  const load = async () => {
    setError(null);
    try {
      const res = await fetch(FINDINGS_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Finding[] = await res.json();
      setFindings(Array.isArray(data) ? data : []);
      setLoadedAt(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => findings.filter((f) =>
    (filter.severity === "ALL" || f.severity === filter.severity) &&
    (filter.status === "ALL" || f.status === filter.status) &&
    (!filter.owner || f.owner.toLowerCase().includes(filter.owner.toLowerCase())) &&
    (!filter.scanner || f.scanner.toLowerCase().includes(filter.scanner.toLowerCase()))
  ), [findings, filter]);

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const f of findings) c[f.severity]++;
    return c;
  }, [findings]);

  const updateStatus = (id: string, status: Status) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  };

  if (loading) return <div className="p-8">Loading…</div>;
  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Findings</h1>
          <p className="text-sm text-muted-foreground">
            Aggregated scanner output (Wiz, Trivy, npm-audit, custom). Source:{" "}
            <code className="text-xs">{FINDINGS_URL}</code>
            {loadedAt && <> · loaded {new Date(loadedAt).toLocaleString()}</>}
          </p>
        </div>
        <Button onClick={load} variant="outline">Reload</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SEVERITIES.map((s) => (
          <Card key={s}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wide">
                {s}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{counts[s]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select
            value={filter.severity}
            onValueChange={(v) => setFilter((f) => ({ ...f, severity: v as Severity | "ALL" }))}
          >
            <SelectTrigger className="w-44"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All severities</SelectItem>
              {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={filter.status}
            onValueChange={(v) => setFilter((f) => ({ ...f, status: v as Status | "ALL" }))}
          >
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            placeholder="Owner contains…"
            className="w-56"
            value={filter.owner}
            onChange={(e) => setFilter((f) => ({ ...f, owner: e.target.value }))}
          />
          <Input
            placeholder="Scanner contains…"
            className="w-56"
            value={filter.scanner}
            onChange={(e) => setFilter((f) => ({ ...f, scanner: e.target.value }))}
          />
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-sm text-destructive">
            Failed to load findings: {error}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Findings ({filtered.length}{findings.length !== filtered.length && ` / ${findings.length}`})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Scanner</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Fix commit</TableHead>
                <TableHead>Detected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={`${f.scanner}:${f.id}`}>
                  <TableCell className="font-medium max-w-md">{f.rule}</TableCell>
                  <TableCell><Badge variant="outline">{f.scanner}</Badge></TableCell>
                  <TableCell><Badge variant={SEV_VARIANT[f.severity]}>{f.severity}</Badge></TableCell>
                  <TableCell>
                    <Select value={f.status} onValueChange={(v) => updateStatus(f.id, v as Status)}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{f.resource}</TableCell>
                  <TableCell>{f.owner}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {f.fix_commit ? f.fix_commit.slice(0, 10) : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(f.detected_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No findings match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
