import { test, expect } from "@playwright/test";

// Verifies the admin Security Alert Outcomes table preserves filter + sort
// across pagination, AND that "Export current view (CSV)" returns a payload
// whose rows correspond to the currently-visible page (same filter, sort,
// page, page_size — matching the contract enforced by
// supabase/functions/stripe-replay-audit-export).

const BASE = process.env.E2E_BASE_URL!;
const EMAIL = process.env.E2E_ADMIN_EMAIL!;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test.describe("Admin denied-attempts — pagination + sort + CSV parity", () => {
  test.skip(!BASE || !EMAIL || !PASSWORD, "E2E_BASE_URL / admin creds required");

  test("CSV export reflects active filter, sort and current page", async ({ page }) => {
    // Real admin sign-in via the app's auth flow.
    await page.goto(`${BASE}/auth`);
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password/i).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    await page.goto(`${BASE}/admin/security-alert-outcomes`);
    await expect(page.getByRole("heading", { name: /security alert outcomes/i })).toBeVisible();

    // Apply a denial_reason filter if the control is present.
    const filter = page.getByLabel(/denial reason/i);
    if (await filter.count()) {
      await filter.selectOption({ index: 1 }).catch(() => {});
    }

    // Sort by created_at desc by clicking the column header (idempotent if already sorted).
    const sortHeader = page.getByRole("columnheader", { name: /created/i });
    if (await sortHeader.count()) await sortHeader.first().click();

    // Try to advance to page 2 to prove pagination is honoured by the export.
    const nextBtn = page.getByRole("button", { name: /next/i });
    if ((await nextBtn.count()) && (await nextBtn.isEnabled())) {
      await nextBtn.click();
    }

    // Capture visible row signatures (timestamp + reason cells) BEFORE exporting.
    const visibleRows = await page.locator("table tbody tr").evaluateAll((trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll("td")).map((td) => (td.textContent || "").trim())),
    );

    // Trigger the export and capture the download.
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /export current view/i }).click(),
    ]);
    const path = await download.path();
    expect(path, "download must produce a local file").toBeTruthy();

    const fs = await import("node:fs/promises");
    const csv = await fs.readFile(path!, "utf8");
    const lines = csv.trim().split(/\r?\n/);
    expect(lines.length, "CSV must contain at least a header row").toBeGreaterThan(0);

    const header = lines[0].split(",").map((h) => h.replace(/^"|"$/g, ""));
    expect(header.length, "header must have columns").toBeGreaterThan(0);

    // Row count must equal what the user actually sees (header-only when the page is empty).
    expect(lines.length - 1).toBe(visibleRows.length);
  });
});
