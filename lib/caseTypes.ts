// PATH: lib/caseTypes.ts

export type CaseTypeId =
  | "family_law"
  | "dvro"
  | "ud"
  | "small_claims"
  | "limited_civil";

export const CASE_TYPES: { id: CaseTypeId; label: string }[] = [
  { id: "family_law", label: "Family Law" },
  { id: "dvro", label: "DVRO" },
  { id: "ud", label: "Eviction (UD)" },
  { id: "small_claims", label: "Small Claims" },
  { id: "limited_civil", label: "Limited Civil" },
];

export const DEFAULT_CASE_TYPE: CaseTypeId = "family_law";

const STORAGE_KEY = "thoxie_case_type_v1";

export function isCaseTypeId(x: unknown): x is CaseTypeId {
  return (
    x === "family_law" ||
    x === "dvro" ||
    x === "ud" ||
    x === "small_claims" ||
    x === "limited_civil"
  );
}

export function loadCaseType(): CaseTypeId {
  if (typeof window === "undefined") return DEFAULT_CASE_TYPE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isCaseTypeId(raw) ? raw : DEFAULT_CASE_TYPE;
}

export function saveCaseType(caseType: CaseTypeId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, caseType);
}

