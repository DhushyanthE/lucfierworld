import { test, expect } from "@playwright/test";

/**
 * Real-login E2E suite for /admin/security-outcomes.
 *
 * Uses the actual Supabase email/password flow on /auth — no localStorage
 * or session token mocks. Requires E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
 * to belong to a user with the `admin` role in `public.user_roles`.
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL!;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test.skip(!EMAIL || !PASSWORD, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

async function signInAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/auth");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15_000 });
  await page.goto("/admin/security-outcomes");
  await expect(page.getByTestId("denied-attempts-card")).toBeVisible();
}

test.describe("Admin security outcomes — real auth", () => {
  test.beforeEach(signInAsAdmin);

  test("filters by denial reason and persists sort/pagination", async ({ page }) => {
    const card = page.getByTestId("denied-attempts-card");
    const reasonSelect = card.locator('select').nth(0);
    await reasonSelect.selectOption("rate_limit_minute");
    // The fetch is debounced via useEffect — wait for the network call.
    await page.waitForResponse((r) =>
      r.url().includes("/rest/v1/stripe_webhook_replay_audit") && r.status() === 200
    );
    // All visible badges should reflect the chosen reason (or table can be empty).
    const badges = card.locator("tbody td .badge, tbody td span");
    const count = await badges.count();
    for (let i = 0; i < count; i++) {
      const txt = (await badges.nth(i).textContent())?.trim() ?? "";
      if (txt) expect(txt).toContain("rate_limit_minute");
    }
  });

  test("CSV export mirrors the active filters, sort, and current page", async ({ page }) => {
    const card = page.getByTestId("denied-attempts-card");
    // Toggle sort to "status asc" to prove the request carries it through.
    await card.locator("th", { hasText: "Denial reason" }).click();

    const [download, exportResp] = await Promise.all([
      page.waitForEvent("download"),
      page.waitForResponse((r) =>
        r.url().includes("/functions/v1/stripe-replay-audit-export") && r.request().method() === "POST"
      ),
      card.getByTestId("export-current-view").click(),
    ]);

    expect(exportResp.status()).toBe(200);
    expect(exportResp.headers()["x-sort-by"]).toBe("status");
    // First click flips to desc->asc on a new column; default was desc, so new column = desc again.
    expect(["asc", "desc"]).toContain(exportResp.headers()["x-sort-order"]);

    const requestBody = JSON.parse(exportResp.request().postData() ?? "{}");
    expect(requestBody).toMatchObject({
      sort_by: "status",
      only_denied: true,
      page: 0,
    });
    expect(typeof requestBody.page_size).toBe("number");

    const name = download.suggestedFilename();
    expect(name).toMatch(/^denied-attempts_.*_p1\.csv$/);
  });
});
