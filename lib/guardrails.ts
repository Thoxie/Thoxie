// PATH: lib/guardrails.ts

export function enforceGuardrails(input: string) {
  const text = (input || "").toLowerCase();

  const blocked = [
    "how do i get away with",
    "plant evidence",
    "destroy evidence",
    "hide evidence",
    "forge",
    "fake",
    "blackmail",
    "extort",
  ];

  for (const b of blocked) {
    if (text.includes(b)) {
      throw new Error("Request blocked by guardrails.");
    }
  }
}

