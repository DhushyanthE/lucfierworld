// E2E: validates stripe-replay-audit-export against the OpenAPI export contract.
// Specifically:
//   * Content-Type is text/csv
//   * Content-Disposition is `attachment; filename="..."` with the documented prefix
//   * X-Row-Count / X-Sort-By / X-Sort-Order are present and correct
//   * CSV header row exactly matches `x-csv-columns` from public/openapi/admin.json
//     — neither missing nor extra columns are tolerated (no PII / column leaks)
//   * Every data row has exactly that column count
import { test, expect, request as pwRequest } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const ANON         = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const EMAIL        = process.env.E2E_ADMIN_EMAIL!;
const PASSWORD     = process.env.E2E_ADMIN_PASSWORD!;
const EXPORT_URL   = `${SUPABASE_URL}/functions/v1/stripe-replay-audit-export`;

const CSRF = "e2e-csrf-token-0123456789abcdef";

// RFC 4180-ish CSV row parser sufficient for the export's quoted cells.
function parseCsvRow(line: string): string[] {
  const out: string[] = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQ = false; }
      else cur += ch;
    } else {
      if (ch === ",") { out.push(cur); cur = ""; }
      else if (ch === '"') inQ = true;
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

test.describe("stripe-replay-audit-export CSV contract", () => {
  test.skip(
    !SUPABASE_URL || !ANON || !EMAIL || !PASSWORD,
    "Requires VITE_SUPABASE_URL/KEY + E2E_ADMIN_EMAIL/PASSWORD.",
  );

  test("headers, Content-Disposition, and columns match the OpenAPI contract exactly", async () => {
    // Load the documented column contract from the published OpenAPI doc.
    const spec = JSON.parse(
      readFileSync(resolve(process.cwd(), "public/openapi/admin.json"), "utf8"),
    );
    const expectedColumns: string[] =
      spec.paths["/stripe-replay-audit-export"].post.responses["200"]["x-csv-columns"];
    expect(Array.isArray(expectedColumns) && expectedColumns.length > 0).toBe(true);

    const supa = createClient(SUPABASE_URL, ANON);
    const { data: signIn, error } = await supa.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
    expect(error, "admin sign-in must succeed").toBeNull();
    const jwt = signIn.session!.access_token;

    const api = await pwRequest.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${jwt}`,
        apikey: ANON,
        "Content-Type": "application/json",
        "x-requested-with": "XMLHttpRequest",
        "x-csrf-token": CSRF,
      },
    });

    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 3600 * 1000);
    const res = await api.post(EXPORT_URL, {
      data: {
        from: from.toISOString(),
        to: to.toISOString(),
        sort_by: "created_at",
        order: "desc",
        only_denied: true,
      },
    });

    expect(res.status(), await res.text()).toBe(200);

    const headers = res.headers();
    expect(headers["content-type"]).toMatch(/^text\/csv/);
    expect(headers["content-disposition"]).toMatch(
      /^attachment; filename="stripe-replay-audit_.+\.csv"$/,
    );
    expect(headers["x-sort-by"]).toBe("created_at");
    expect(headers["x-sort-order"]).toBe("desc");
    expect(headers["x-row-count"]).toMatch(/^\d+$/);

    const text = await res.text();
    const lines = text.split("\n").filter((l) => l.length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(1);

    // Header must match the OpenAPI x-csv-columns exactly — no extras, no missing.
    const header = parseCsvRow(lines[0]);
    expect(header).toEqual(expectedColumns);

    // Every data row must have exactly the same column count (no leaks).
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvRow(lines[i]);
      expect(cols.length, `row ${i} column count`).toBe(expectedColumns.length);
    }

    // X-Row-Count must match the number of data rows actually returned.
    expect(Number(headers["x-row-count"])).toBe(lines.length - 1);
  });
});
