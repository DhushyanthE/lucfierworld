import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the QuantumSynapse admin E2E suite.
 *
 * Required env (provide as GitHub Actions secrets, never commit):
 *   E2E_BASE_URL        - URL of the running app (e.g. http://localhost:8080 or a preview URL)
 *   E2E_ADMIN_EMAIL     - email of a real Supabase user with the `admin` role
 *   E2E_ADMIN_PASSWORD  - password for that user
 *
 * Flake-reduction strategy:
 *   - 2 retries on CI to absorb transient network blips against Supabase.
 *   - 1 worker on CI to make request-ordering deterministic for the audit table.
 *   - Generous action/navigation timeouts because auth + RLS queries are I/O bound.
 *   - Traces/screenshots/videos retained on failure for fast diagnosis from the
 *     uploaded `playwright-report` artifact.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
