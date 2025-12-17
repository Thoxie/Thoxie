// lib/caseStore.ts

export type IntakePack = "first_filing" | "hearing_prep" | "declaration_draft";

export type FamilyLawRole = "Petitioner" | "Respondent" | "Other/Not sure";

export type EvidenceSide = "mine" | "other_party";
export type EvidenceKind = "file" | "text";

export type EvidenceItem = {
  id: string;

  // Helps users keep things straight
  side: EvidenceSide;
  kind: EvidenceKind;

  // If kind === "file"
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  dbKey?: string; // IndexedDB key

  // If kind === "text"
  textTitle?: string;
  textBody?: string;

  notes?: string;
  issueTags?: string[]; // e.g., ["custody", "support"]
  createdAtIso: string;
};

export type CaseIntake = {
  id: string;
  createdAtIso: string;

  // What they are preparing
  pack: IntakePack;

  // Core case info
  county: string;
  role: FamilyLawRole;

  // Hearing info
  hasHearing: boolean;
  hearingDateIso?: string;

  // Optional “one sentence objective”
  helpSummary?: string;

  // Evidence list (metadata + text, files stored in IndexedDB)
  evidence: EvidenceItem[];
};

const STORAGE_KEY = "thoxie_case_v1";

export function loadCase(): CaseIntake | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CaseIntake) : null;
  } catch {
    return null;
  }
}

export function saveCase(caseData: CaseIntake) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(caseData));
}

export function newId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

