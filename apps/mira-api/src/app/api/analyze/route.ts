import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body as { image?: string };

    if (!image) {
      return Response.json({ error: "image field required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Strip data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Data,
                  },
                },
                {
                  text: "You are a professional makeup artist and beauty advisor. Analyze this face image and provide:\n1. Current skin tone and undertone\n2. Face shape\n3. Recommended makeup looks for today\n4. Top 3 product suggestions\n\nRespond ONLY with valid JSON (no markdown, no code blocks) with keys: skinTone, undertone, faceShape, recommendedLooks (array of strings), productSuggestions (array of strings).",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return Response.json(
        { error: "AI service error", detail: err },
        { status: 502 }
      );
    }

    const aiResult = await response.json();
    const rawText =
      aiResult.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed: unknown;
    try {
      const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { raw: rawText };
    }

    return Response.json({
      success: true,
      analysis: parsed,
      model: "gemini-1.5-flash",
    });
  } catch (err) {
    return Response.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 }
    );
  }
}
