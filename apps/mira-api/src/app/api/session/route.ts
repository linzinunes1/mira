import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

// In-memory store — replace with KV/DB in production
const sessions = new Map<
  string,
  { id: string; createdAt: string; analysisCount: number }
>();

export async function POST(_req: NextRequest) {
  const id = randomUUID();
  const session = { id, createdAt: new Date().toISOString(), analysisCount: 0 };
  sessions.set(id, session);
  return Response.json({ session });
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("id");
  if (!sessionId) {
    return Response.json({ error: "id param required" }, { status: 400 });
  }
  const session = sessions.get(sessionId);
  if (!session) {
    return Response.json({ error: "session not found" }, { status: 404 });
  }
  return Response.json({ session });
}
