/**
 * Sentinel defensive cyber-resilience engine.
 * Analysis/recommendation only: it does not target people, control weapons,
 * sign blockchain transactions, or autonomously execute containment.
 */
import { canonical, sha3 } from "./fabric.ts";
import { mlDsa } from "./pqc.ts";

export type Severity = "low" | "medium" | "high" | "critical";
export type Recommendation = "observe" | "review" | "recommend_isolation";

export interface Telemetry {
  source: string;
  failed_auth: number;
  new_processes: number;
  outbound_spike: number; // normalized 0..1
  file_entropy: number;   // normalized 0..1
  privilege_change: boolean;
  known_ioc_match: boolean;
}

export interface SentinelFinding {
  id: string;
  source: string;
  score: number;
  severity: Severity;
  recommendation: Recommendation;
  reasons: string[];
  requires_human_approval: true;
  payload_hash: string;
  signature_b64: string;
  public_key_b64: string;
  created_at: string;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function threatScore(t: Telemetry) {
  const auth = clamp01(t.failed_auth / 20);
  const proc = clamp01(t.new_processes / 25);
  const outbound = clamp01(t.outbound_spike);
  const entropy = clamp01(t.file_entropy);
  const privilege = t.privilege_change ? 1 : 0;
  const ioc = t.known_ioc_match ? 1 : 0;

  // Defensive triage only. IOC and privilege changes are intentionally strong
  // signals, while no single heuristic can silently trigger an action.
  const score =
    auth * 0.12 +
    proc * 0.10 +
    outbound * 0.18 +
    entropy * 0.15 +
    privilege * 0.20 +
    ioc * 0.25;
  return Math.round(clamp01(score) * 10000) / 10000;
}

export function classify(score: number): Severity {
  if (score >= 0.8) return "critical";
  if (score >= 0.6) return "high";
  if (score >= 0.35) return "medium";
  return "low";
}

export function recommendation(score: number): Recommendation {
  if (score >= 0.75) return "recommend_isolation";
  if (score >= 0.35) return "review";
  return "observe";
}

export function reasons(t: Telemetry) {
  const out: string[] = [];
  if (t.known_ioc_match) out.push("known indicator match");
  if (t.privilege_change) out.push("unexpected privilege change");
  if (t.outbound_spike >= 0.7) out.push("outbound traffic anomaly");
  if (t.file_entropy >= 0.7) out.push("high file entropy");
  if (t.failed_auth >= 10) out.push("authentication failures");
  if (t.new_processes >= 15) out.push("process creation spike");
  return out.length ? out : ["no strong anomaly signal"];
}

export function analyzeTelemetry(t: Telemetry, now = new Date().toISOString()): SentinelFinding {
  const score = threatScore(t);
  const unsigned = {
    source: t.source,
    score,
    severity: classify(score),
    recommendation: recommendation(score),
    reasons: reasons(t),
    requires_human_approval: true as const,
    created_at: now,
  };
  const payload_hash = sha3(canonical(unsigned));
  const keys = mlDsa.keygen();
  const signature_b64 = mlDsa.sign(keys.secret_key_b64, payload_hash).signature_b64;
  return {
    id: payload_hash.slice(0, 24),
    ...unsigned,
    payload_hash,
    signature_b64,
    public_key_b64: keys.public_key_b64,
  };
}

export function auditHash(previous: string, finding: Pick<SentinelFinding, "id" | "payload_hash" | "recommendation">) {
  return sha3(canonical({ previous, ...finding }));
}
