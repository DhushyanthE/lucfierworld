import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Verifies the admin CSV audit export downloads successfully for a known
 * date range and that every returned row matches the active denial_reason
 * filter and falls inside the requested [from, to] window.
 *
 * Calls the stripe-replay-audit-export edge function directly with an admin
 * JWT — that way we can assert row-level contents deterministically without
 * coupling to UI markup.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://lttxaakpruqqgqdlwpki.supabase.co";
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dHhhYWtwcnVxcWdxZGx3cGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTA4MzIsImV4cCI6MjA3NTE4NjgzMn0.q9EXcUP3RNU290B0y36BYOlrj6S7u3MuJaZ13J5W6cA";
const EXPORT_URL = `${SUPABASE_URL}/functions/v1/stripe-replay-audit-export`;

const EMAIL = process.env.E2E_ADMIN_EMAIL!;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test.skip(!EMAIL || !PASSWORD, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

/** Minimal RFC-4180-aware CSV row parser (handles quoted commas/newlines). */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (inQuotes) {
      if (c === '"' && csv[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cell += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c === "\r") { /* skip */ }
    else cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

test("admin CSV export — date range + denial_reason filter is honoured row-by-row", async ({ request }) => {
  test.setTimeout(45_000);

  const client = createClient(SUPABASE_URL, ANON_KEY);
  const { data: signIn, error } = await client.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (error || !signIn.session) throw new Error(`admin sign-in failed: ${error?.message}`);
  const jwt = signIn.session.access_token;

  // 30-day window ending now — wide enough to catch the audit rows produced
  // by the other E2E suites in this run, narrow enough to bound the export.
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = now.toISOString();
  const denialReason = "csrf_xhr_missing";

  const res = await request.post(EXPORT_URL, {
    headers: {
      "content-type": "application/json",
      apikey: ANON_KEY,
      authorization: `Bearer ${jwt}`,
      "x-requested-with": "XMLHttpRequest",
      "x-csrf-token": "export-e2e".padEnd(32, "0"),
    },
    data: {
      from,
      to,
      denial_reason: denialReason,
      only_denied: true,
      sort_by: "created_at",
      order: "desc",
    },
  });

  expect(res.status(), await res.text().catch(() => "")).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/text\/csv/);
  expect(res.headers()["content-disposition"]).toMatch(/attachment;\s*filename=/i);

  const csv = await res.text();
  const rows = parseCsv(csv);
  expect(rows.length).toBeGreaterThanOrEqual(1);

  const [header, ...dataRows] = rows;
  expect(header).toEqual([
    "id", "created_at", "admin_user_id", "event_id", "status",
    "error", "origin", "ip_hash", "user_agent",
  ]);

  // x-row-count must match the data rows we actually parsed.
  expect(Number(res.headers()["x-row-count"])).toBe(dataRows.length);

  const fromMs = Date.parse(from);
  const toMs = Date.parse(to);
  const expectedStatus = `denied:${denialReason}`;

  for (const r of dataRows) {
    const [, createdAt, , , status] = r;
    expect(status, `row status mismatch: ${r.join(",")}`).toBe(expectedStatus);
    const ts = Date.parse(createdAt);
    expect(Number.isFinite(ts)).toBe(true);
    expect(ts).toBeGreaterThanOrEqual(fromMs);
    expect(ts).toBeLessThanOrEqual(toMs);
  }
});
