import { test, expect } from "@playwright/test";

/**
 * Verifies that admin sign-in fails with a wrong password and that the UI
 * surfaces an inline error without navigating away from /auth. Uses the real
 * Supabase email/password flow on /auth (no mocks).
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@example.com";

test.describe("Admin login — wrong password", () => {
  test("shows an error and stays on /auth", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/auth");

    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password/i).first().fill("definitely-not-the-real-password-xyz");

    // Wait deterministically for the Supabase auth POST instead of a fixed sleep.
    const [authResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/auth/v1/token") && r.request().method() === "POST",
        { timeout: 15_000 },
      ),
      page.getByRole("button", { name: /sign in|log in/i }).click(),
    ]);

    expect(authResponse.status()).toBeGreaterThanOrEqual(400);

    // We must remain on the auth page.
    await expect(page).toHaveURL(/\/auth/);

    // Sonner toasts render with role="status"; assert a visible error surface.
    const toast = page.locator('[data-sonner-toast], [role="status"], [role="alert"]').filter({
      hasText: /invalid|incorrect|wrong|credentials|failed/i,
    });
    await expect(toast.first()).toBeVisible({ timeout: 10_000 });
  });
});
