export type GuardrailsResult = {
  allowed: boolean;
  reason?: string;
  systemPreamble?: string;
};

export type EnforceGuardrailsParams = {
  message: string;
  caseType?: string;
};

export function enforceGuardrails(params: EnforceGuardrailsParams): GuardrailsResult {
  const { message = "", caseType = "family" } = params;

  // Example check: Block if message is empty
  if (!message || message.trim().length === 0) {
    return { allowed: false, reason: "Message is empty" };
  }

  // Example check: Block specific words
  const blocked = ["badword1", "badword2"].find(w => message.toLowerCase().includes(w));
  if (blocked) {
    return { allowed: false, reason: `Blocked word: ${blocked}` };
  }

  const systemPreamble =
    caseType === "family"
      ? "You are a compassionate assistant providing family-oriented advice."
      : "You are a helpful assistant.";

  return { allowed: true, systemPreamble };
}
