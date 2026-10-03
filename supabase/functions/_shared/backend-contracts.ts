/**
 * Stable contracts between QuantumSynapse technologies.
 * Keeps crypto, defensive analysis, consensus and external adapters decoupled.
 */
export type IntegrationStatus = "ready" | "degraded" | "unconfigured";
export type TechnologyStatus = {
  name: string;
  role: string;
  status: IntegrationStatus;
  boundary: string;
};

export type DefenseEnvelope = {
  version: "qs-defense/1";
  correlation_id: string;
  received_at: string;
  source: string;
  telemetry: unknown;
};

export function correlationId(source: string, now = Date.now()) {
  const safe = source.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 48) || "unknown";
  return `${safe}-${now.toString(36)}`;
}
