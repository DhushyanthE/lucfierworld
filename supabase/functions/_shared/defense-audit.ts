/**
 * Defensive audit-chain helpers.
 * Postgres serializes each authenticated user's append to prevent chain forks.
 */
export type AuditHead = { audit_hash: string } | null;

export async function loadAuditHead(client: any, userId: string): Promise<AuditHead> {
  const { data, error } = await client
    .from("defense_audit_events")
    .select("audit_hash")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("audit head lookup failed");
  return data ?? null;
}

export async function persistAuditEvent(client: any, row: Record<string, any>) {
  const { data, error } = await client.rpc("append_defense_audit_event", {
    p_correlation_id: row.correlation_id,
    p_source: row.source,
    p_severity: row.severity,
    p_recommendation: row.recommendation,
    p_score: row.score,
    p_payload_hash: row.payload_hash,
    p_audit_hash: row.audit_hash,
    p_previous_audit_hash: row.previous_audit_hash,
    p_review_engine: row.review_engine,
    p_review_yes: row.review_yes,
    p_review_total: row.review_total,
    p_quorum_met: row.quorum_met,
    p_reasons: row.reasons,
  });
  if (error) throw new Error(error.message || "audit persistence failed");
  return data;
}
