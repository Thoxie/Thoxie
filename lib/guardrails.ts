// PATH: lib/guardrails.ts

export type GuardrailContext = {
  module?: "family" | string;
};

const BANNED_SUBSTRINGS = [
  // Minimal, obvious threat/violence indicators.
  "kill",
  "shoot",
  "stab",
  "bomb",
  "i will hurt",
  "i’m going to hurt",
  "i'm going to hurt",
  "threaten to",
];

function includesAny(haystack: string, needles: string[]) {
  const t = haystack.toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

/**
 * Lightweight safety guardrails.
 * Blocks obvious threats/violent intent.
 */
export function enforceGuardrails(input: string, _ctx?: GuardrailContext) {
  const text = (input || "").trim();
  if (!text) return;

  if (includesAny(text, BANNED_SUBSTRINGS)) {
    throw new Error(
      "Unsafe content detected. Please remove threats or violence and rephrase as factual description."
    );
  }
}

