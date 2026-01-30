// PATH: lib/caseStore.ts
export type IntakeTask =
  | "start_divorce"
  | "respond_papers"
  | "prepare_hearing"
  | "explain_your_side"
  | "help_me_figure_it_out";

export type EducationLevel =
  | "hs"
  | "some_college"
  | "ba_bs"
  | "masters"
  | "jd"
  | "phd"
  | "other";

export type EmploymentStatus = "w2" | "self" | "unemployed" | "retired" | "other";

export type IncomeRange =
  | "lt_50"
  | "50_100"
  | "100_200"
  | "200_400"
  | "gt_400"
  | "unknown";

export type FamilyLawRole = "petitioner" | "respondent" | "not_sure";

export type EvidenceKind = "email" | "text" | "pdf" | "photo" | "video" | "other";
export type EvidenceSide = "me" | "them";

export type EvidenceItem = {
  id: string;
  name: string;
  kind: EvidenceKind;
  side: EvidenceSide;
  note?: string;
  createdAt: string;
};

export type CaseIntake = {
  id: string;
  createdAt: string;
  task: IntakeTask;
  county: string;
  role: FamilyLawRole;
  education: EducationLevel;
  employment: EmploymentStatus;
  income: IncomeRange;
  notes?: string;
  evidence: EvidenceItem[];
};

const KEY = "thoxie_case_v1";

export function newId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function saveCase(payload: CaseIntake) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadCase(): CaseIntake | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CaseIntake;
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}


