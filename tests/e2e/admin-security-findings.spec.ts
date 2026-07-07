// E2E: /admin/security-findings — debounced search, URL-persisted pagination,
// and CSV export column contract + quote escaping.
//
// We intercept /security/findings.json with a deterministic synthetic dataset
// so the assertions do not depend on whatever the live static file happens to
// contain, while still exercising the real component (routing, admin gate,
// URL state, search debounce, CSV builder).
import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:8080";
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

// Column contract mirrors src/pages/admin/SecurityFindings.tsx (CSV_COLUMNS)
// and the Finding schema — additional columns must NEVER appear.
const EXPECTED_COLUMNS = [
  "id", "scanner", "rule", "severity", "status",
  "resource", "owner", "fix_commit", "detected_at",
] as const;

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

// Includes rows engineered to exercise CSV escaping:
//   - a comma in `rule`
//   - a double quote in `rule`
//   - a formula-injection prefix (=) in `owner`
//   - a newline in `resource`
function makeFindings(): Finding[] {
  const base: Finding[] = [
    {
      id: "F-001",
      scanner: "wiz",
      rule: "Public S3 bucket, world-readable",
      severity: "CRITICAL",
      status: "OPEN",
      resource: "aws://s3/public-assets\nsecond-line",
      owner: "=cmd|calc",
      fix_commit: null,
      detected_at: "2026-06-01T00:00:00Z",
    },
    {
      id: "F-002",
      scanner: "trivy",
      rule: 'CVE with "quoted" identifier',
      severity: "HIGH",
      status: "IN_PROGRESS",
      resource: "npm://lodash",
      owner: "platform-team",
      fix_commit: "abc1234567deadbeef",
      detected_at: "2026-06-02T00:00:00Z",
    },
  ];
  // Pad to force multiple pages at pageSize=25.
  for (let i = 3; i <= 40; i++) {
    base.push({
      id: `F-${String(i).padStart(3, "0")}`,
      scanner: i % 2 ? "npm-audit" : "wiz",
      rule: `Synthetic rule ${i}`,
      severity: (["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Severity[])[i % 4],
      status: "OPEN",
      resource: `supabase://table-${i}`,
      owner: i % 3 === 0 ? "sec-team" : "platform-team",
      fix_commit: null,
      detected_at: `2026-06-${String((i % 28) + 1).padStart(2, "0")}T00:00:00Z`,
    });
  }
  return base;
}

async function stubFindings(page: Page) {
  await page.route("**/security/findings.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(makeFindings()),
    });
  });
}

async function signIn(page: Page) {
  await page.goto(`${BASE}/#/auth`);
  await page.getByLabel(/email/i).fill(EMAIL!);
  await page.getByLabel(/password/i).fill(PASSWORD!);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
}

// RFC 4180-ish parser sufficient for our escaped cells (quotes + newlines).
function parseCsv(text: string): string[][] {
  const rows: string[][] = [[]];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQ = false; }
      else cur += ch;
    } else {
      if (ch === ",") { rows[rows.length - 1].push(cur); cur = ""; }
      else if (ch === "\n") { rows[rows.length - 1].push(cur); cur = ""; rows.push([]); }
      else if (ch === "\r") { /* skip */ }
      else if (ch === '"') inQ = true;
      else cur += ch;
    }
  }
  if (cur.length || rows[rows.length - 1].length) rows[rows.length - 1].push(cur);
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

test.describe("/admin/security-findings — search, URL state, CSV contract", () => {
  test.skip(!EMAIL || !PASSWORD, "Requires E2E_ADMIN_EMAIL/PASSWORD env vars.");

  test.beforeEach(async ({ page }) => {
    await stubFindings(page);
    await signIn(page);
  });

  test("debounced search updates the URL and filters visible rows", async ({ page }) => {
    await page.goto(`${BASE}/#/admin/security-findings`);
    await expect(page.getByRole("heading", { name: /security findings/i })).toBeVisible();

    // 40 seeded rows → default pageSize 25 → 25 visible on page 1.
    await expect(page.locator("table tbody tr")).toHaveCount(25);

    await page.getByTestId("findings-search").fill("lodash");

    // URL updates after debounce (~250ms).
    await expect
      .poll(() => new URL(page.url()).hash, { timeout: 2000 })
      .toContain("q=lodash");

    // Only the CVE row matches "lodash" in resource text.
    await expect(page.locator("table tbody tr")).toHaveCount(1);
    await expect(page.getByText(/CVE with "quoted" identifier/)).toBeVisible();
  });

  test("pagination state persists across a full page reload via URL", async ({ page }) => {
    await page.goto(`${BASE}/#/admin/security-findings`);
    await expect(page.locator("table tbody tr")).toHaveCount(25);

    // Advance to page 2.
    await page.getByRole("link", { name: "2" }).click();
    await expect
      .poll(() => new URL(page.url()).hash, { timeout: 2000 })
      .toContain("page=2");
    await expect(page.locator("table tbody tr")).toHaveCount(15); // 40 - 25

    // Reload — URL is the persistence layer, view must be identical.
    await page.reload();
    await expect(page.locator("table tbody tr")).toHaveCount(15);
    expect(new URL(page.url()).hash).toContain("page=2");
  });

  test("CSV export column order and escaping match the contract", async ({ page }) => {
    await page.goto(`${BASE}/#/admin/security-findings`);
    await expect(page.locator("table tbody tr").first()).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("export-csv").click(),
    ]);
    const path = await download.path();
    expect(path).toBeTruthy();
    const fs = await import("node:fs/promises");
    const csv = await fs.readFile(path!, "utf8");

    const rows = parseCsv(csv);
    // Header: exact contract, no extra columns.
    expect(rows[0]).toEqual([...EXPECTED_COLUMNS]);

    // Body: 40 synthetic rows.
    expect(rows.length - 1).toBe(40);

    // Every data row has exactly the contract's column count.
    for (const r of rows.slice(1)) expect(r.length).toBe(EXPECTED_COLUMNS.length);

    // Find the crafted rows by id and verify escaping preserved the raw payload.
    const byId = new Map<string, string[]>();
    for (const r of rows.slice(1)) byId.set(r[0], r);

    const f1 = byId.get("F-001")!;
    // Column indexes match EXPECTED_COLUMNS: 5=resource, 6=owner.
    expect(f1[5]).toBe("aws://s3/public-assets\nsecond-line");
    // Formula-injection guard prefixes '=' payloads with a single quote.
    expect(f1[6]).toBe("'=cmd|calc");

    const f2 = byId.get("F-002")!;
    // Quotes inside the field round-trip via RFC-4180 doubling.
    expect(f2[2]).toBe('CVE with "quoted" identifier');
  });
});
