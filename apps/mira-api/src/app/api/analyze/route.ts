import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body as { image?: string };

    if (!image) {
      return Response.json({ error: "image field required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Strip data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: "You are a professional makeup artist and beauty advisor. Analyze this face image and provide:\n1. Current skin tone and undertone\n2. Face shape\n3. Recommended makeup looks for today\n4. Top 3 product suggestions\n\nRespond as JSON with keys: skinTone, undertone, faceShape, recommendedLooks (array), productSuggestions (array).",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json(
        { error: "AI service error", detail: err },
        { status: 502 }
      );
    }

    const aiResult = await response.json();
    const rawText =
      aiResult.content?.[0]?.text ?? "{}";

    let parsed: unknown;
    try {
      // Extract JSON from possible markdown code block
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) ??
        rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] ?? jsonMatch[0] : rawText);
    } catch {
      parsed = { raw: rawText };
    }

    return Response.json({
      success: true,
      analysis: parsed,
      model: aiResult.model,
      usage: aiResult.usage,
    });
  } catch (err) {
    return Response.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 }
    );
  }
}
