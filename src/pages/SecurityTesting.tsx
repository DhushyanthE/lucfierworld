import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, PlayCircle } from "lucide-react";

/**
 * Security Testing Suite hub.
 *
 * One card per industry category (SAST, DAST, IAST, SCA, vulnerability
 * scanners, penetration testing, security auditing, mobile appsec) with the
 * representative industry tools and what actually runs in this project.
 *
 * The DAST card includes a real, runnable baseline probe: a same-origin fetch
 * of this deployment that grades the HTTP security headers and transport.
 * It runs in the browser, so it only sees what a visitor's browser sees —
 * no fabricated findings.
 */

type Status = "pass" | "warn" | "fail";

type Finding = {
  id: string;
  title: string;
  status: Status;
  detail: string;
};

type Category = {
  acronym: string;
  name: string;
  blurb: string;
  tools: string;
  here: string;
  badge: string;
  variant: "default" | "secondary" | "outline";
};

const CATEGORIES: Category[] = [
  {
    acronym: "SAST",
    name: "Static Application Security Testing",
    blurb: "Analyzes source code for insecure patterns before the code ever runs.",
    tools: "Semgrep, SonarQube, CodeQL",
    here: "Strict TypeScript typecheck on every build; Zod input validation at every edge-function boundary; no raw SQL — typed clients only.",
    badge: "Active",
    variant: "default",
  },
  {
    acronym: "DAST",
    name: "Dynamic Application Security Testing",
    blurb: "Probes the running application from the outside, the way an attacker would.",
    tools: "OWASP ZAP, Burp Suite",
    here: "The live baseline probe below grades this deployment's HTTP security headers and transport. Deeper crawling is a roadmap item.",
    badge: "Active (baseline)",
    variant: "default",
  },
  {
    acronym: "IAST",
    name: "Interactive Application Security Testing",
    blurb: "Instruments the running app to trace how untrusted data flows into sinks.",
    tools: "Contrast Security, HCL AppScan",
    here: "Edge-function runtime telemetry (console and error logs per request) gives partial coverage; full taint instrumentation is not in place.",
    badge: "Baseline",
    variant: "secondary",
  },
  {
    acronym: "SCA",
    name: "Software Composition Analysis",
    blurb: "Audits third-party dependencies and transitive packages for known CVEs.",
    tools: "Snyk, Dependabot, osv-scanner, npm audit",
    here: "Dependency scanning runs against the project manifest and lockfile before merges; findings are triaged in the security dashboard.",
    badge: "Active",
    variant: "default",
  },
  {
    acronym: "VULN-SCAN",
    name: "Vulnerability Scanners",
    blurb: "Network- and host-level scanning of exposed services and infrastructure.",
    tools: "Nessus, OpenVAS/GVM, Nikto",
    here: "The managed platform deep scan covers the deployment's exposed surfaces; no self-hosted infrastructure to scan.",
    badge: "Platform",
    variant: "secondary",
  },
  {
    acronym: "PENTEST",
    name: "Penetration Testing",
    blurb: "Human-led red-teaming that chains findings into realistic attack paths.",
    tools: "Burp Suite Pro, Metasploit, manual testing",
    here: "Sentinel injects simulated attacks and produces signed findings, but deliberately stops at a human-approval gate — nothing executes automatically.",
    badge: "Simulated",
    variant: "secondary",
  },
  {
    acronym: "AUDIT",
    name: "Security Auditing",
    blurb: "Configuration review, code review, and tamper-evident compliance evidence.",
    tools: "Manual audit, compliance frameworks (ISO 27001, SOC 2)",
    here: "Hash-linked audit chain with SHA3-512 digests and ML-DSA-87 signatures on every Sentinel finding; row-level security validated by the platform linter.",
    badge: "Active",
    variant: "default",
  },
  {
    acronym: "MOBILE",
    name: "Mobile Application Security Testing",
    blurb: "Static and dynamic analysis of mobile binaries, storage, and traffic.",
    tools: "MobSF, Frida, Objection",
    here: "This is a web application — there are no mobile binaries to test. If a mobile wrapper ships, MobSF belongs in the pipeline.",
    badge: "Not applicable",
    variant: "outline",
  },
];

const HEADER_CHECKS: { id: string; header: string; expect: string; failTitle: string }[] = [
  {
    id: "csp",
    header: "content-security-policy",
    expect: "present",
    failTitle: "Content-Security-Policy missing",
  },
  {
    id: "hsts",
    header: "strict-transport-security",
    expect: "present",
    failTitle: "Strict-Transport-Security missing",
  },
  {
    id: "xcto",
    header: "x-content-type-options",
    expect: "nosniff",
    failTitle: "X-Content-Type-Options not nosniff",
  },
  {
    id: "xfo",
    header: "x-frame-options",
    expect: "present",
    failTitle: "Clickjacking protection missing",
  },
  {
    id: "rp",
    header: "referrer-policy",
    expect: "present",
    failTitle: "Referrer-Policy missing",
  },
  {
    id: "pp",
    header: "permissions-policy",
    expect: "present",
    failTitle: "Permissions-Policy missing",
  },
];

async function runBaselineScan(): Promise<Finding[]> {
  const res = await fetch(window.location.origin + "/", { cache: "no-store" });
  const findings: Finding[] = [];

  if (window.location.protocol === "https:") {
    findings.push({ id: "https", title: "Served over HTTPS", status: "pass", detail: "Transport is encrypted end to end." });
  } else {
    findings.push({
      id: "https",
      title: "Served over plain HTTP",
      status: "warn",
      detail: "This preview runs on localhost, which is expected here; the published site must be HTTPS.",
    });
  }

  for (const check of HEADER_CHECKS) {
    const value = res.headers.get(check.header);
    if (!value) {
      findings.push({
        id: check.id,
        title: check.failTitle,
        status: check.id === "pp" ? "warn" : "fail",
        detail: `No ${check.header} header on the response.`,
      });
      continue;
    }
    if (check.expect !== "present" && !value.toLowerCase().includes(check.expect)) {
      findings.push({ id: check.id, title: check.failTitle, status: "fail", detail: `Header value: ${value}` });
      continue;
    }
    findings.push({ id: check.id, title: `${check.header} present`, status: "pass", detail: value.slice(0, 120) });
  }

  const server = res.headers.get("server");
  findings.push({
    id: "server",
    title: server ? `Server banner exposed: ${server}` : "Server banner not disclosed",
    status: server && /\d/.test(server) ? "warn" : "pass",
    detail: server ? "Version banners help attackers fingerprint the stack." : "No version detail leaked.",
  });

  return findings;
}

export default function SecurityTesting() {
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedAt, setScannedAt] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      const result = await runBaselineScan();
      setFindings(result);
      setScannedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "scan failed");
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    void scan();
  }, [scan]);

  const passCount = findings?.filter((f) => f.status === "pass").length ?? 0;
  const failCount = findings?.filter((f) => f.status === "fail").length ?? 0;
  const warnCount = findings?.filter((f) => f.status === "warn").length ?? 0;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Security Testing Suite</h1>
        <p className="text-muted-foreground max-w-3xl">
          The eight industry categories of security testing software, mapped to what actually
          runs in this project. Real capabilities are marked Active; partial coverage is marked
          Baseline — nothing here is claimed to be covered that isn't.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Live baseline probe — this deployment</CardTitle>
            <CardDescription>
              A DAST-style check of the HTTP security headers and transport your browser sees
              right now. Runs from your browser against this exact origin.
            </CardDescription>
          </div>
          <Button onClick={() => void scan()} disabled={scanning} size="sm">
            {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
            {scanning ? "Scanning…" : "Run scan"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Probe failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {findings && !error && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="default">{passCount} pass</Badge>
                {warnCount > 0 && <Badge variant="secondary">{warnCount} warning</Badge>}
                {failCount > 0 && <Badge variant="destructive">{failCount} failing</Badge>}
                <span className="text-muted-foreground">scanned at {scannedAt}</span>
              </div>
              <ul className="divide-y rounded-lg border">
                {findings.map((f) => (
                  <li key={f.id} className="flex items-start justify-between gap-3 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.detail}</p>
                    </div>
                    <Badge variant={f.status === "pass" ? "default" : f.status === "warn" ? "secondary" : "destructive"}>
                      {f.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {CATEGORIES.map((c) => (
          <Card key={c.acronym}>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">
                  <span className="mr-2 font-mono text-sm text-muted-foreground">{c.acronym}</span>
                  {c.name}
                </CardTitle>
                <Badge variant={c.variant}>{c.badge}</Badge>
              </div>
              <CardDescription>{c.blurb}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Industry tools:</span> {c.tools}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">In this project:</span> {c.here}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <AlertTitle>Where the live results go</AlertTitle>
        <AlertDescription>
          Sentinel findings and their signed audit records live on{" "}
          <Link to="/defense" className="underline">
            Sentinel Command
          </Link>{" "}
          and the{" "}
          <Link to="/admin/security-findings" className="underline">
            security findings dashboard
          </Link>
          .
        </AlertDescription>
      </Alert>
    </main>
  );
}
