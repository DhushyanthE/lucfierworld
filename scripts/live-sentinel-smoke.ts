import { mlDsa } from "../supabase/functions/_shared/pqc.ts";

const url = Deno.env.get("VITE_SUPABASE_URL")?.replace(/\/$/, "");
const apiKey = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");
const jwt = Deno.env.get("SUPABASE_TEST_JWT");
if (!url || !apiKey || !jwt) {
  throw new Error("VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY and SUPABASE_TEST_JWT are required");
}

const telemetry = {
  source: "sentinel-live-smoke-01",
  failed_auth: 18,
  new_processes: 21,
  outbound_spike: 0.91,
  file_entropy: 0.84,
  privilege_change: true,
  known_ioc_match: true,
};

const headers = {
  "content-type": "application/json",
  apikey: apiKey,
  authorization: `Bearer ${jwt}`,
};

const response = await fetch(`${url}/functions/v1/integration-gateway/defense/analyze`, {
  method: "POST",
  headers,
  body: JSON.stringify(telemetry),
});
const body = await response.json();
if (!response.ok) throw new Error(`gateway returned ${response.status}: ${body?.error ?? "unknown error"}`);

const finding = body.finding;
const review = body.review;
const audit = body.audit;
if (!finding || !review || !audit) throw new Error("gateway response is missing finding/review/audit");
if (!/^[0-9a-f]{128}$/.test(finding.payload_hash)) {
  throw new Error("finding payload_hash is not a 128-hex SHA3-512 digest");
}
if (!mlDsa.verify(finding.public_key_b64, finding.payload_hash, finding.signature_b64)) {
  throw new Error("ML-DSA-87 signature verification failed");
}
if (!Array.isArray(review.votes) || review.votes.length !== 9) {
  throw new Error(`expected nine policy votes, got ${review.votes?.length ?? 0}`);
}
if (review.executable !== false || body.execution?.executed !== false) {
  throw new Error("defensive review must remain non-executable");
}
if (!audit.id || !/^[0-9a-f]{128}$/.test(audit.audit_hash)) {
  throw new Error("persisted audit record is missing an id or valid hash");
}

const select = new URL(`${url}/rest/v1/defense_audit_events`);
select.searchParams.set("id", `eq.${audit.id}`);
select.searchParams.set("select", "id,correlation_id,payload_hash,audit_hash,review_yes,review_total,quorum_met,human_approval_required,executed");
const persistedResponse = await fetch(select, { headers });
const rows = await persistedResponse.json();
if (!persistedResponse.ok) throw new Error(`audit readback failed: ${persistedResponse.status}`);
if (!Array.isArray(rows) || rows.length !== 1) throw new Error("audit row was not readable through owner RLS");
const row = rows[0];
if (row.payload_hash !== finding.payload_hash || row.audit_hash !== audit.audit_hash) {
  throw new Error("persisted audit hashes do not match the signed gateway finding");
}
if (row.review_total !== 9 || row.human_approval_required !== true || row.executed !== false) {
  throw new Error("persisted audit safety invariants do not match the gateway review");
}

console.log(JSON.stringify({
  source: telemetry.source,
  score: finding.score,
  severity: finding.severity,
  digest: "SHA3-512",
  payload_hash_chars: finding.payload_hash.length,
  ml_dsa_87_verified: true,
  audit_id: audit.id,
  audit_hash: audit.audit_hash,
  review_yes: review.yes,
  review_total: review.votes.length,
  quorum_required: review.quorum_required,
  quorum_met: review.quorum_met,
  decision: review.decision,
  votes: review.votes.map((v: { cell: string; accept: boolean; rationale: string }) => ({
    cell: v.cell,
    accept: v.accept,
    rationale: v.rationale,
  })),
  persisted_via_owner_rls: true,
  executed: false,
}, null, 2));
