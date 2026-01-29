// PATH: app/api/chat/route.ts
import { NextResponse } from "next/server";

/**
 * Chat API — Phase 1 (Stub)
 *
 * Purpose:
 * - Proves frontend ↔ backend wiring
 * - Provides deterministic responses
 * - Allows seamless swap to OpenAI later
 *
 * This endpoint intentionally does NOT give legal advice.
 */
export async function POST(req: Request) {
  let body: any = null;

  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const userMessage =
    body?.message && typeof body.message === "string"
      ? body.message.trim()
      : "";

  let reply = "";

  if (!userMessage) {
    reply =
      "Tell me what you’re preparing right now (first divorce filing, hearing prep, or declaration drafting) and which California county you’re in.";
  } else {
    reply =
      "Got it. For now, I’m in offline mode (no OpenAI API). Tell me: (1) your county, (2) what you’re trying to file or respond to, and (3) your top 3 facts. I’ll generate a structured plan and draft outline.";
  }

  return NextResponse.json({ reply });
}
