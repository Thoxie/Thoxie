// PATH: lib/dvroStore.ts

export type DvroRole = "Petitioner" | "Respondent" | "Not sure";

export type DvroStage =
  | "considering"
  | "filed_waiting"
  | "tro_granted"
  | "tro_denied"
  | "served"
  | "response_filed"
  | "hearing_scheduled"
  | "after_hearing"
  | "not_sure";

export type DvroRequest =
  | "personal_conduct"
  | "stay_away"
  | "move_out"
  | "no_contact"
  | "firearms"
  | "custody_visitation"
  | "child_support"
  | "property_control"
  | "other";

export type DvroIntake = {
  id: string;
  createdAtIso: string;

  county: string;

  role: DvroRole;
  stage: DvroStage;

  hasChildrenInCommon: "yes" | "no" | "";
  hearingDateIso?: string;

  incidentSummary?: string;
  incidentDateIso?: string;

  requests: DvroRequest[];
  requestOtherText?: string;
};

const STORAGE_KEY = "thoxie_dvro_v1";

export function newId(prefix = "dvro") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function loadDvro(): DvroIntake | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DvroIntake) : null;
  } catch {
    return null;
  }
}

export function saveDvro(data: DvroIntake) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
