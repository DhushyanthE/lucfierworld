import { test, expect } from "@playwright/test";

const backend = process.env.BBB8_E2E_BASE_URL ?? "http://127.0.0.1:8001";

test.describe("BBB8 standalone operator lab", () => {
  test("health identifies the repaired BBB8 service", async ({ request }) => {
    const response = await request.get(`${backend}/health`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("bbb8");
    expect(body.version).toBe("v21.0");
  });

  test("operator can run an approved research request from the lab", async ({ page }) => {
    await page.goto(`${backend}/lab`);
    await expect(
      page.getByRole("heading", { name: "QuantumSynapse BBB8 Research Lab" }),
    ).toBeVisible();

    const requestId = `playwright-${Date.now()}`;
    await page.locator("#req").fill(
      JSON.stringify(
        {
          request_id: requestId,
          quantum: {
            pairs: 4096,
            seed: 7,
            sample_fraction: 0.25,
            intercept_resend: false,
          },
          observation: {
            telemetry: [0.05, 0.1, 0.08],
            declared_risk: 0.05,
          },
          offline_cells: [],
        },
        null,
        2,
      ),
    );

    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/v1/fabric/run") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Run pipeline" }).click();
    const apiResponse = await responsePromise;
    expect(apiResponse.status()).toBe(200);

    const output = page.locator("#out");
    await expect(output).toContainText('"status": 200');
    await expect(output).toContainText('"outcome": "approve"');
    await expect(output).toContainText(requestId);
    expect(pageErrors).toEqual([]);
  });

  test("intercept-resend fails the channel gate and cannot commit", async ({ request }) => {
    const response = await request.post(`${backend}/v1/fabric/run`, {
      data: {
        request_id: `playwright-eve-${Date.now()}`,
        quantum: {
          pairs: 8192,
          seed: 7,
          sample_fraction: 0.25,
          intercept_resend: true,
        },
        observation: {
          telemetry: [0.01, 0.02],
          declared_risk: 0.0,
        },
        offline_cells: [],
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.qkd.passed).toBe(false);
    expect(body.qkd.iid_only).toBe(true);
    expect(body.qkd.finite_key_secure).toBe(false);
    expect(body.outcome).toBe("reject");
    expect(body.block).toBeNull();
  });

  test("checkpoint endpoint round-trips current head", async ({ request }) => {
    const current = await request.post(`${backend}/v1/fabric/checkpoint`, {
      data: {},
    });
    expect(current.ok()).toBeTruthy();
    const checkpoint = await current.json();

    const verify = await request.post(`${backend}/v1/fabric/checkpoint/verify`, {
      data: checkpoint,
    });
    expect(verify.ok()).toBeTruthy();
    expect((await verify.json()).valid).toBe(true);
  });
});
