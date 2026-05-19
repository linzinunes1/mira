import { test, expect } from "@playwright/test";

test.describe("POST /api/analyze — contract tests", () => {
  test("returns 400 when image field is missing", async ({ request }) => {
    const res = await request.post("/api/analyze", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test("returns 400 when body is empty string image", async ({ request }) => {
    const res = await request.post("/api/analyze", {
      data: { image: "" },
    });
    // Empty string is falsy — should hit the missing-image branch
    expect(res.status()).toBe(400);
  });

  test("returns 5xx or analysis when image provided (key-dependent path)", async ({ request }) => {
    // Minimal 1x1 white JPEG in base64
    const minimalJpeg =
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVIP/2Q==";
    const res = await request.post("/api/analyze", {
      data: { image: minimalJpeg },
    });
    // Without GEMINI_API_KEY: 500; with key: 200
    expect([200, 500, 502]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty(res.status() === 200 ? "success" : "error");
  });

  test("response shape includes success flag when analysis works", async ({ request }) => {
    // Skip if no key configured — this test is informational only in CI
    test.skip(
      !process.env.GEMINI_API_KEY,
      "GEMINI_API_KEY not set — skipping live analyze test"
    );
    const minimalJpeg =
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVIP/2Q==";
    const res = await request.post("/api/analyze", {
      data: { image: minimalJpeg },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.analysis).toBeDefined();
    expect(body.model).toBeDefined();
  });
});
