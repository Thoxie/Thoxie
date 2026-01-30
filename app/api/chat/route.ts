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

type ChatBody = {
  message?: string;
  context?: Record<string, any>;
  history?: HistoryItem[];
};

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          reply:
            "LIVE-AI: Server missing OPENAI_API_KEY. Add it in Vercel → Settings → Environment Variables.",
          timestamp: new Date().toISOString(),
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

    const message = asString(body.message).trim();
    const historyRaw = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json(
        { reply: "LIVE-AI: Missing message.", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    // Family-law only restore target: enforce guardrails without DVRO module routing.
    enforceGuardrails(message, { module: "family" });

    const history: HistoryItem[] = historyRaw
      .filter((h) => h && typeof h === "object")
      .map((h: any) => ({
        role: h.role,
        content: asString(h.content),
      }))
      .filter(
        (h) =>
          (h.role === "user" || h.role === "assistant" || h.role === "system") &&
          h.content.trim().length > 0
      );

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are THOXIE. Provide structured, neutral legal decision-support guidance. Do not claim to be a lawyer, and do not provide legal representation.",
      },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
    });

    const content =
      completion.choices?.[0]?.message?.content?.trim() || "(no response)";

    const reply = content.startsWith("LIVE-AI:") ? content : `LIVE-AI: ${content}`;

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        reply: `LIVE-AI: Server error: ${err?.message ?? String(err)}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


