// PATH: app/api/chat/route.ts
/**
 * THOXIE Chat API (LIVE OpenAI)
 * Returns { reply, timestamp }
 * Reply always starts with "LIVE-AI:" so you can verify it’s not the stub.
 */

import OpenAI from "openai";
import { NextResponse } from "next/server";
import { enforceGuardrails } from "@/lib/guardrails";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type HistoryItem = {
  role: "user" | "assistant" | "system";
  content: string;
};

type Body = {
  message?: string;
  history?: HistoryItem[];
  caseType?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const message = (body.message ?? "").toString().trim();
    if (!message) {
      return NextResponse.json(
        { error: "Missing message" },
        { status: 400 },
      );
    }

    // Guardrails (DVRO / Family-law safety, etc.)
    const { allowed, reason, systemPreamble } = enforceGuardrails({
      message,
      caseType: body.caseType ?? "family",
    });

    if (!allowed) {
      return NextResponse.json(
        {
          reply: `LIVE-AI: ${reason ?? "Request blocked by guardrails."}`,
          timestamp: new Date().toISOString(),
        },
        { status: 200 },
      );
    }

    const history = Array.isArray(body.history) ? body.history : [];

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          systemPreamble ??
          "You are THOXIE, a legal decision-support assistant. Provide structured, neutral guidance and do not provide legal representation.",
      },
      ...history.map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ??
      "LIVE-AI: (no response)";

    return NextResponse.json({
      reply: reply.startsWith("LIVE-AI:") ? reply : `LIVE-AI: ${reply}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Server error",
        details: err?.message ?? String(err),
      },
      { status: 500 },
    );
  }
}

