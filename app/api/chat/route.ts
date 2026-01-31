import { enforceGuardrails } from "../../../lib/guardrails"; // correct the path if your folders differ

export async function POST(req: Request) {
  const body = await req.json();
  const message = typeof body?.message === "string" ? body.message : "";

  const { allowed, reason, systemPreamble } = enforceGuardrails({
    message,
    caseType: body.caseType ?? "family",
  });

  // use allowed, reason, systemPreamble as needed
}

