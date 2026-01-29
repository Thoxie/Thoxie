import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const message = body.message || "";

  return NextResponse.json({
    reply:
      "THOXIE (family-law mode): I can help explain options, timelines, and next steps. " +
      "Tell me your situation and your goal.",
  });
}

