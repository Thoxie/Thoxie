// PATH: app/api/chat/route.ts

import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime for SDK

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { reply: "Server is missing OPENAI_API_KEY. Add it to .env.local / Vercel env vars." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const message =
      body?.message && typeof body.message === "string" ? body.message.trim() : "";

    const context = body?.context ?? {};

    if (!message) {
      return NextResponse.json({
        reply:
          "Tell me what you’re preparing right now (first divorce filing, hearing prep, or declaration drafting) and which California county you’re in.",
      });
    }

    const instructions =
      "You are THOXIE, a legal decision-support assistant for California family law. " +
      "You are not a law firm and you do not provide legal advice. " +
      "Focus on strategy options, preparation steps, and what information the user should gather next. " +
      "Be concise, direct, and action-oriented. If something depends on a court order or local rules, say so.";

    const input =
      `User message:\n${message}\n\n` +
      `Context (JSON):\n${JSON.stringify(context, null, 2)}\n\n` +
      `Respond with:\n` +
      `1) A short, direct answer\n` +
      `2) 3-6 next-step questions (bulleted)\n` +
      `3) A suggested action checklist (bulleted)\n`;

    const resp = await client.responses.create({
      model: "gpt-5", // or whichever model you’re using for THOXIE
      instructions,
      input,
    });

    return NextResponse.json({
      reply: resp.output_text?.trim() || "No response text returned.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { reply: `Chat error: ${err?.message ?? "Unknown error"}` },
      { status: 500 }
    );
  }
}
