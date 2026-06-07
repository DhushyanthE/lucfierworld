import { test, expect, type Page } from "@playwright/test";

/**
 * Edge-case coverage for the CSV export on /admin/security-outcomes:
 *  - Empty result sets produce a header-only CSV (no stale rows leaked).
 *  - Page boundaries are honoured (page + page_size echoed in the request).
 *  - Changing the denial_reason filter triggers a fresh export, never stale data.
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL!;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test.skip(!EMAIL || !PASSWORD, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

async function signInAsAdmin(page: Page) {
  await page.goto("/auth");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15_000 }),
    page.getByRole("button", { name: /sign in|log in/i }).click(),
  ]);
  await page.goto("/admin/security-outcomes");
  await expect(page.getByTestId("denied-attempts-card")).toBeVisible();
}

test.describe("Admin CSV export — edge cases", () => {
  test.beforeEach(signInAsAdmin);

  test("empty result set returns a header-only CSV", async ({ page }) => {
    const card = page.getByTestId("denied-attempts-card");
    // Pick a reason that almost certainly has no matches in the test DB.
    await card.locator("select").nth(0).selectOption("event_id_invalid");
    await page.waitForResponse(
      (r) => r.url().includes("/rest/v1/stripe_webhook_replay_audit") && r.status() === 200,
    );

    const [download, exportResp] = await Promise.all([
      page.waitForEvent("download"),
      page.waitForResponse(
        (r) =>
          r.url().includes("/functions/v1/stripe-replay-audit-export") &&
          r.request().method() === "POST",
      ),
      card.getByTestId("export-current-view").click(),
    ]);

    expect(exportResp.status()).toBe(200);
    expect(exportResp.headers()["x-row-count"]).toBe("0");

    const path = await download.path();
    const fs = await import("node:fs/promises");
    const csv = await fs.readFile(path!, "utf8");
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    expect(lines.length).toBe(1); // header row only — no stale data leaked
    expect(lines[0]).toMatch(/(created_at|event_id|status|denial_reason)/i);
  });

  test("page + page_size from UI are honoured by the export request", async ({ page }) => {
    const card = page.getByTestId("denied-attempts-card");

    const [, exportResp] = await Promise.all([
      page.waitForEvent("download"),
      page.waitForResponse(
        (r) =>
          r.url().includes("/functions/v1/stripe-replay-audit-export") &&
          r.request().method() === "POST",
      ),
      card.getByTestId("export-current-view").click(),
    ]);

    const body = JSON.parse(exportResp.request().postData() ?? "{}");
    expect(body.page).toBe(0);
    expect(typeof body.page_size).toBe("number");
    expect(body.page_size).toBeGreaterThan(0);
    expect(body.page_size).toBeLessThanOrEqual(1000);
    expect(body.only_denied).toBe(true);
  });

  test("changing the filter triggers a fresh export — never stale data", async ({ page }) => {
    const card = page.getByTestId("denied-attempts-card");
    const reasonSelect = card.locator("select").nth(0);

    // First export with filter A.
    await reasonSelect.selectOption("rate_limit_minute");
    await page.waitForResponse(
      (r) => r.url().includes("/rest/v1/stripe_webhook_replay_audit") && r.status() === 200,
    );
    const [, firstResp] = await Promise.all([
      page.waitForEvent("download"),
      page.waitForResponse((r) => r.url().includes("/stripe-replay-audit-export")),
      card.getByTestId("export-current-view").click(),
    ]);
    const firstBody = JSON.parse(firstResp.request().postData() ?? "{}");
    expect(firstBody.denial_reason).toBe("rate_limit_minute");

    // Change filter and export again — payload must reflect the new filter.
    await reasonSelect.selectOption("csrf_xhr_missing");
    await page.waitForResponse(
      (r) => r.url().includes("/rest/v1/stripe_webhook_replay_audit") && r.status() === 200,
    );
    const [, secondResp] = await Promise.all([
      page.waitForEvent("download"),
      page.waitForResponse((r) => r.url().includes("/stripe-replay-audit-export")),
      card.getByTestId("export-current-view").click(),
    ]);
    const secondBody = JSON.parse(secondResp.request().postData() ?? "{}");
    expect(secondBody.denial_reason).toBe("csrf_xhr_missing");
    expect(secondBody.denial_reason).not.toBe(firstBody.denial_reason);
  });
});
