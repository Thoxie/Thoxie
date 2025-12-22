// PATH: app/api/chat/route.ts
/**
 * THOXIE Chat API (OpenAI-backed)
 *
 * - Server-side only (API key never goes to the browser)
 * - Returns { reply: string }
 * - Avoids legal advice: decision-support + preparation steps only
 */

import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatBody = {
  message?: string;
  context?: Record<string, any>;
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          reply:
            "Server misconfiguration: OPENAI_API_KEY is missing. Add it to .env.local (local) and Vercel Environment Variables (production).",
        },
        { status: 500 }
      );
    }

    let body: ChatBody = {};
    try {
      body = (await req.json()) as ChatBody;
    } catch {
      body = {};
    }

    const userMessage =
      typeof body?.message === "string" ? body.message.trim() : "";

    const context =
      body?.context && typeof body.context === "object" ? body.context : {};

    if (!userMessage) {
      return NextResponse.json({
        reply:
          "Tell me what you’re preparing right now (first divorce filing, hearing prep, or declaration drafting) and which California county you’re in.",
      });
    }

    const instructions =
      "You are THOXIE, a legal decision-support assistant for California family law. " +
      "You are not a law firm and you do not provide legal advice. " +
      "You help users understand options, prepare documents, organize evidence, and plan next steps. " +
      "Be concise, direct, and action-oriented. " +
      "If something depends on a court order, local rules, or missing facts, say so and ask targeted questions. " +
      "Do not claim to be an attorney. Do not promise outcomes.";

    const input =
      `User message:\n${userMessage}\n\n` +
      `Context (JSON):\n${JSON.stringify(context, null, 2)}\n\n` +
      "Return a single message in this structure:\n" +
      "1) Short direct answer (2–6 sentences)\n" +
      "2) Next-step questions (3–6 bullets)\n" +
      "3) Action checklist (4–10 bullets)\n";

    const resp = await client.responses.create({
      model: "gpt-5",
      instructions,
      input,
    });

    const reply = (resp.output_text || "").trim();

    return NextResponse.json({
      reply: reply || "No response returned. Try again.",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { reply: `Chat error: ${err?.message ?? "Unknown error"}` },
      { status: 500 }
    );
  }
}
