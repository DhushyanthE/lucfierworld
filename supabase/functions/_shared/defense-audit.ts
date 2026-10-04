/**
 * Defensive audit-chain helpers.
 * The database remains the authority; clients never choose the previous head.
 */
export type AuditHead = { audit_hash: string } | null;

export async function loadAuditHead(client: any, userId: string): Promise<AuditHead> {
  const { data, error } = await client
    .from("defense_audit_events")
    .select("audit_hash")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("audit head lookup failed");
  return data ?? null;
}

export async function persistAuditEvent(client: any, row: Record<string, unknown>) {
  const { data, error } = await client
    .from("defense_audit_events")
    .insert(row)
    .select("id,created_at")
    .single();
  if (error) throw new Error("audit persistence failed");
  return data;
}
