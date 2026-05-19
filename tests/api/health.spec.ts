import { test, expect } from "@playwright/test";

test.describe("GET /api/health", () => {
  test("returns 200 with status ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok", service: "mira-api" });
  });

  test("response is JSON content-type", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.headers()["content-type"]).toContain("application/json");
  });
});
