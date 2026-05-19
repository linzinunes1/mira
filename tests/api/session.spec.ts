import { test, expect } from "@playwright/test";

test.describe("POST /api/session — create", () => {
  test("creates a new session and returns an id", async ({ request }) => {
    const res = await request.post("/api/session");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.session).toBeDefined();
    expect(typeof body.session.id).toBe("string");
    expect(body.session.id).toHaveLength(36); // UUID
    expect(body.session.analysisCount).toBe(0);
    expect(body.session.createdAt).toBeDefined();
  });

  test("each POST creates a unique session id", async ({ request }) => {
    const res1 = await request.post("/api/session");
    const res2 = await request.post("/api/session");
    const id1 = (await res1.json()).session.id;
    const id2 = (await res2.json()).session.id;
    expect(id1).not.toBe(id2);
  });
});

test.describe("GET /api/session — retrieve", () => {
  test("retrieves an existing session by id", async ({ request }) => {
    const createRes = await request.post("/api/session");
    const { session } = await createRes.json();

    const getRes = await request.get(`/api/session?id=${session.id}`);
    expect(getRes.status()).toBe(200);
    const body = await getRes.json();
    expect(body.session.id).toBe(session.id);
  });

  test("returns 400 when id param is missing", async ({ request }) => {
    const res = await request.get("/api/session");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test("returns 404 for unknown session id", async ({ request }) => {
    const res = await request.get("/api/session?id=00000000-0000-0000-0000-000000000000");
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
