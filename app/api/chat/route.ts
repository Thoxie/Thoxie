// PATH: app/api/chat/route.ts
/**
 * THOXIE Chat API (LIVE OpenAI)
 * Returns { reply, timestamp }
 * Reply always starts with "LIVE-AI:" so you can verify it’s not the stub.
 */

import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = (body?.message ?? "").toString().trim();

    if (!message) {
      return NextResponse.json(
        { reply: "LIVE-AI: Please type a message.", timestamp: Date.now() },
        { status: 200 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are THOXIE, a family-law decision-support assistant. You are not a law firm. Provide practical next steps, neutral phrasing, and options. Avoid giving legal advice. Ask clarifying questions when needed.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.2,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "LIVE-AI: I couldn’t generate a response. Please try again.";

    return NextResponse.json({ reply: `LIVE-AI: ${reply}`, timestamp: Date.now() });
  } catch (err: any) {
    return NextResponse.json(
      {
        reply:
          "LIVE-AI: Server error. Check OPENAI_API_KEY and try again.",
        timestamp: Date.now(),
        error: err?.message || "unknown_error",
      },
      { status: 500 }
    );
  }
}
