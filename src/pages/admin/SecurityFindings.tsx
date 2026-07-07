import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, Search } from "lucide-react";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "WONT_FIX";

interface Finding {
  id: string;
  scanner: string;
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
const PAGE_SIZES = [10, 25, 50, 100];

// CSV column contract — mirrors the Finding schema exactly. Additional columns
// MUST NEVER appear here, matching the discipline of the OpenAPI x-csv-columns
// contract used by the server-side audit export.
export const CSV_COLUMNS: (keyof Finding)[] = [
  "id", "scanner", "rule", "severity", "status",
  "resource", "owner", "fix_commit", "detected_at",
];

const FINDINGS_URL =
  (import.meta.env.VITE_SECURITY_FINDINGS_URL as string | undefined) ??
  "/security/findings.json";

const SEARCH_DEBOUNCE_MS = 250;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  // Formula-injection guard (mirrors the audit export handler).
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Finding[]): string {
  const header = CSV_COLUMNS.join(",");
  const body = rows.map((r) => CSV_COLUMNS.map((c) => csvEscape(r[c])).join(","));
  return [header, ...body].join("\n");
}

// ---- URL-state helpers ----------------------------------------------------
// We persist all filter, search, and pagination state in the URL so a reload
// or shared link reproduces the same view. Empty/default values are stripped
// to keep the URL tidy.
const isSeverity = (v: string): v is Severity =>
  (SEVERITIES as string[]).includes(v);
const isStatus = (v: string): v is Status =>
  (STATUSES as string[]).includes(v);

function coercePageSize(v: string | null): number {
  const n = Number(v);
  return PAGE_SIZES.includes(n) ? n : 25;
}
function coercePage(v: string | null): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default function SecurityFindings() {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [findings, setFindings] = useState<Finding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);

  // Derived state from URL.
  const query = searchParams.get("q") ?? "";
  const sevParam = searchParams.get("severity") ?? "ALL";
  const statusParam = searchParams.get("status") ?? "ALL";
  const owner = searchParams.get("owner") ?? "";
  const scanner = searchParams.get("scanner") ?? "";
  const page = coercePage(searchParams.get("page"));
  const pageSize = coercePageSize(searchParams.get("size"));
  const severity: "ALL" | Severity =
    sevParam !== "ALL" && isSeverity(sevParam) ? sevParam : "ALL";
  const status: "ALL" | Status =
    statusParam !== "ALL" && isStatus(statusParam) ? statusParam : "ALL";

  // Local search-box state feeding a debounced URL update.
  const [searchInput, setSearchInput] = useState(query);
  useEffect(() => { setSearchInput(query); }, [query]);

  const updateParams = useCallback(
    (patch: Record<string, string | number | null | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === undefined || v === "" || v === "ALL") {
              next.delete(k);
            } else {
              next.set(k, String(v));
            }
          }
          // page defaults to 1, size defaults to 25 — strip to keep URL clean.
          if (next.get("page") === "1") next.delete("page");
          if (next.get("size") === "25") next.delete("size");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Debounce search-input into URL.
  useEffect(() => {
    if (searchInput === query) return;
    const t = window.setTimeout(() => {
      updateParams({ q: searchInput, page: 1 });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput, query, updateParams]);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  // Track in-flight fetches so a rapid Reload or unmount cancels the previous one.
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError(null);
    try {
      const res = await fetch(FINDINGS_URL, { cache: "no-store", signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Finding[] = await res.json();
      if (ctrl.signal.aborted) return;
      setFindings(Array.isArray(data) ? data : []);
      setLoadedAt(new Date().toISOString());
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return findings.filter((f) => {
      if (severity !== "ALL" && f.severity !== severity) return false;
      if (status !== "ALL" && f.status !== status) return false;
      if (owner && !f.owner.toLowerCase().includes(owner.toLowerCase())) return false;
      if (scanner && !f.scanner.toLowerCase().includes(scanner.toLowerCase())) return false;
      if (q) {
        const hay = [
          f.id, f.scanner, f.rule, f.severity, f.status,
          f.resource, f.owner, f.fix_commit ?? "", f.detected_at,
        ].join(" \u0001 ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [findings, severity, status, owner, scanner, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const f of findings) c[f.severity]++;
    return c;
  }, [findings]);

  const updateStatus = (id: string, next: Status) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, status: next } : f)));
  };

  const downloadCsv = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `security-findings_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8">Loading…</div>;
  if (!isAdmin) return null;

  const pageWindow = (): (number | "ellipsis")[] => {
    const items: (number | "ellipsis")[] = [];
    const push = (n: number | "ellipsis") => items.push(n);
    const span = 1;
    for (let i = 1; i <= pageCount; i++) {
      if (
        i === 1 ||
        i === pageCount ||
        (i >= currentPage - span && i <= currentPage + span)
      ) {
        push(i);
      } else if (items[items.length - 1] !== "ellipsis") {
        push("ellipsis");
      }
    }
    return items;
  };

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
        <div className="flex gap-2">
          <Button onClick={downloadCsv} variant="default" data-testid="export-csv">
            <Download className="mr-2 h-4 w-4" />
            Export CSV ({filtered.length})
          </Button>
          <Button onClick={() => void load()} variant="outline">Reload</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SEVERITIES.map((s) => (
          <Card key={s}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wide">{s}</CardTitle>
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
          <div className="relative w-full md:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rule, resource, id, commit…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search findings"
              data-testid="findings-search"
            />
          </div>
          <Select
            value={severity}
            onValueChange={(v) => updateParams({ severity: v, page: 1 })}
          >
            <SelectTrigger className="w-44"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All severities</SelectItem>
              {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => updateParams({ status: v, page: 1 })}
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
            value={owner}
            onChange={(e) => updateParams({ owner: e.target.value, page: 1 })}
          />
          <Input
            placeholder="Scanner contains…"
            className="w-56"
            value={scanner}
            onChange={(e) => updateParams({ scanner: e.target.value, page: 1 })}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Findings ({filtered.length}{findings.length !== filtered.length && ` / ${findings.length}`})
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => updateParams({ size: Number(v), page: 1 })}
            >
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto space-y-4">
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
              {pageRows.map((f) => (
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
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No findings match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {pageCount > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
              </div>
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        updateParams({ page: Math.max(1, currentPage - 1) });
                      }}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {pageWindow().map((it, i) =>
                    it === "ellipsis" ? (
                      <PaginationItem key={`e${i}`}><PaginationEllipsis /></PaginationItem>
                    ) : (
                      <PaginationItem key={it}>
                        <PaginationLink
                          href="#"
                          isActive={it === currentPage}
                          onClick={(e) => { e.preventDefault(); updateParams({ page: it }); }}
                        >
                          {it}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        updateParams({ page: Math.min(pageCount, currentPage + 1) });
                      }}
                      aria-disabled={currentPage === pageCount}
                      className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
