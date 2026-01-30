// app/api/chat/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = (body?.messages || []) as ChatMessage[];

    // Minimal placeholder route (older version). Prevents runtime errors without adding DVRO logic.
    // If you want the OpenAI-backed version restored later, tell me and I’ll give the next batch accordingly.
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    return NextResponse.json({
      ok: true,
      reply: `Received: ${lastUser}`.slice(0, 800),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 400 });
  }
}
