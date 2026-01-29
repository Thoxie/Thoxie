// PATH: app/signup/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CA_COUNTIES, countyToCourtFinderUrl } from "../../lib/caCounties";
import {
  CaseIntake,
  EducationLevel,
  EmploymentStatus,
  EvidenceItem,
  EvidenceKind,
  EvidenceSide,
  FamilyLawRole,
  IncomeRange,
  IntakeTask,
  loadCase,
  newId,
  saveCase,
} from "../../lib/caseStore";
import { DEFAULT_CASE_TYPE } from "../../lib/caseTypes";
import { loadDvro } from "../../lib/dvroStore";

// ---------- IndexedDB (files) ----------
const DB_NAME = "thoxie_evidence";
const STORE_NAME = "files";

type DbFileRecord = {
  id: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPutFile(rec: DbFileRecord): Promise<string> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(rec);
    tx.oncomplete = () => resolve(rec.id);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetFile(id: string): Promise<DbFileRecord | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as DbFileRecord) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function dbDeleteFile(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- UI ----------
const ISSUE_OPTIONS = [
  "Property / real estate",
  "Support (spousal/child)",
  "Custody / visitation",
  "Restraining order allegations",
  "Financial disclosure",
  "Attorney fees",
  "Sale of jointly-owned property",
  "Enforcement / contempt",
];

export default function SignupPage() {
  // If the DVRO module already has data, we keep it separate.
  // This page is for the family-law intake, but both can coexist.
  const existingDvro = useMemo(() => (typeof window !== "undefined" ? loadDvro() : null), []);

  const [caseData, setCaseData] = useState<CaseIntake | null>(null);
  const [step, setStep] = useState<number>(1);

  // Form state
  const [task, setTask] = useState<IntakeTask>("triage");
  const [county, setCounty] = useState<string>("San Mateo");
  const [role, setRole] = useState<FamilyLawRole>("Respondent");

  const [hasHearing, setHasHearing] = useState<boolean>(false);
  const [hearingDateIso, setHearingDateIso] = useState<string>("");

  const [helpSummary, setHelpSummary] = useState<string>("");

  const [education, setEducation] = useState<EducationLevel | "">("");
  const [employment, setEmployment] = useState<EmploymentStatus | "">("");
  const [income, setIncome] = useState<IncomeRange | "">("");

  const [issues, setIssues] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const existing = loadCase();
    if (existing) {
      setCaseData(existing);
      setTask(existing.task);
      setCounty(existing.county);
      setRole(existing.role);
      setHasHearing(existing.hasHearing);
      setHearingDateIso(existing.hearingDateIso ?? "");
      setHelpSummary(existing.helpSummary ?? "");
      setEducation((existing.education ?? "") as any);
      setEmployment((existing.employment ?? "") as any);
      setIncome((existing.income ?? "") as any);
      setIssues(existing.issues ?? []);
      setEvidence(existing.evidence ?? []);
    } else {
      const fresh: CaseIntake = {
        id: newId("case"),
        createdAtIso: new Date().toISOString(),
        task: "triage",
        county: "San Mateo",
        role: "Respondent",
        hasHearing: false,
        evidence: [],
      };
      setCaseData(fresh);
    }
  }, []);

  useEffect(() => {
    if (!caseData) return;

    const updated: CaseIntake = {
      ...caseData,
      task,
      county,
      role,
      hasHearing,
      hearingDateIso: hasHearing ? hearingDateIso || undefined : undefined,
      helpSummary: helpSummary || undefined,
      education: (education || undefined) as any,
      employment: (employment || undefined) as any,
      income: (income || undefined) as any,
      issues: issues.length ? issues : undefined,
      evidence,
    };

    setCaseData(updated);
    saveCase(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, county, role, hasHearing, hearingDateIso, helpSummary, education, employment, income, issues, evidence]);

  function toggleIssue(label: string) {
    setIssues((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]));
  }

  async function onAddFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const added: EvidenceItem[] = [];
    for (const file of Array.from(files)) {
      const id = newId("file");
      const dbKey = id;

      await dbPutFile({
        id: dbKey,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        data: file,
      });

      added.push({
        id: newId("ev"),
        side: "mine",
        kind: "file",
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        dbKey,
        createdAtIso: new Date().toISOString(),
      });
    }

    setEvidence((prev) => [...added, ...prev]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onRemoveEvidence(item: EvidenceItem) {
    if (item.kind === "file" && item.dbKey) {
      await dbDeleteFile(item.dbKey);
    }
    setEvidence((prev) => prev.filter((x) => x.id !== item.id));
  }

  async function onPreviewFile(item: EvidenceItem) {
    if (!item.dbKey) return;
    const rec = await dbGetFile(item.dbKey);
    if (!rec) return;

    const url = URL.createObjectURL(rec.data);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const courtLink = useMemo(() => countyToCourtFinderUrl(county), [county]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">THOXIE Intake</h1>
            <p className="mt-1 text-sm text-gray-600">
              Save your info as you go. This is a decision-support intake (not legal advice).
            </p>
          </div>

          <div className="text-right text-sm text-gray-600">
            <div>Case type: <span className="font-medium">{DEFAULT_CASE_TYPE}</span></div>
            {existingDvro ? <div className="mt-1">DVRO: saved intake exists</div> : null}
          </div>
        </div>

        <div className="mt-6 flex gap-2 text-sm">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setStep(n)}
              className={`rounded px-3 py-2 ${
                step === n ? "bg-black text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              Step {n}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">1) What do you need help with?</h2>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="text-sm">
                  Task
                  <select
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    value={task}
                    onChange={(e) => setTask(e.target.value as IntakeTask)}
                  >
                    <option value="triage">Help me figure it out (triage)</option>
                    <option value="start_divorce">Start a divorce</option>
                    <option value="respond_papers">Respond to papers</option>
                    <option value="prepare_hearing">Prepare for a hearing</option>
                    <option value="written_statement">Write / organize my side</option>
                  </select>
                </label>

                <label className="text-sm">
                  County
                  <select
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                  >
                    {CA_COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 text-xs">
                    <a className="underline" href={courtLink} target="_blank" rel="noreferrer">
                      Find the court for {county}
                    </a>
                  </div>
                </label>

                <label className="text-sm">
                  Your role
                  <select
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    value={role}
                    onChange={(e) => setRole(e.target.value as FamilyLawRole)}
                  >
                    <option>Respondent</option>
                    <option>Petitioner</option>
                    <option>Other/Not sure</option>
                  </select>
                </label>

                <label className="text-sm">
                  Do you have a hearing scheduled?
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={hasHearing}
                      onChange={(e) => setHasHearing(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </div>

                  {hasHearing && (
                    <input
                      className="mt-2 w-full rounded border border-gray-300 px-3 py-2"
                      type="date"
                      value={hearingDateIso}
                      onChange={(e) => setHearingDateIso(e.target.value)}
                    />
                  )}
                </label>
              </div>

              <label className="text-sm">
                One-sentence goal (optional)
                <textarea
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  rows={3}
                  value={helpSummary}
                  onChange={(e) => setHelpSummary(e.target.value)}
                  placeholder="What are you trying to accomplish?"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">2) Basic profile (for tone + guidance)</h2>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="text-sm">
                  Education
                  <select
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    value={education}
                    onChange={(e) => setEducation(e.target.value as any)}
                  >
                    <option value="">Select</option>
                    <option>Less than high school</option>
                    <option>High school / GED</option>
                    <option>Some college</option>
                    <option>College degree</option>
                    <option>Graduate degree</option>
                  </select>
                </label>

                <label className="text-sm">
                  Employment
                  <select
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    value={employment}
                    onChange={(e) => setEmployment(e.target.value as any)}
                  >
                    <option value="">Select</option>
                    <option>Employed (office / professional)</option>
                    <option>Employed (hourly / shift-based)</option>
                    <option>Self-employed</option>
                    <option>Not currently working</option>
                    <option>Retired</option>
                  </select>
                </label>

                <label className="text-sm">
                  Income (optional)
                  <select
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    value={income}
                    onChange={(e) => setIncome(e.target.value as any)}
                  >
                    <option value="">Select</option>
                    <option>Under $50,000</option>
                    <option>$50,000–$100,000</option>
                    <option>$100,000–$200,000</option>
                    <option>Over $200,000</option>
                    <option>Prefer not to say</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">3) Issues</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {ISSUE_OPTIONS.map((label) => (
                  <label key={label} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={issues.includes(label)}
                      onChange={() => toggleIssue(label)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">4) Evidence</h2>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-700">
                    Upload files or add text notes. Stored locally in your browser for now.
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => onAddFiles(e.target.files)}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {evidence.length === 0 ? (
                    <div className="text-sm text-gray-500">No evidence added yet.</div>
                  ) : (
                    evidence.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 px-3 py-2 text-sm"
                      >
                        <div className="min-w-[220px]">
                          <div className="font-medium">
                            {item.kind === "file" ? item.fileName : item.textTitle || "Text note"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.kind === "file"
                              ? `${item.fileType || "file"} • ${Math.round((item.fileSize || 0) / 1024)} KB`
                              : "text"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.kind === "file" ? (
                            <button
                              className="rounded bg-gray-100 px-3 py-1"
                              onClick={() => onPreviewFile(item)}
                            >
                              Preview
                            </button>
                          ) : null}

                          <button
                            className="rounded bg-gray-100 px-3 py-1"
                            onClick={() => onRemoveEvidence(item)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <Link className="underline" href="/">
                  Back to home
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Note: You can build the OpenAI hookup later. This intake is stored in localStorage + IndexedDB.
        </div>
      </div>
    </div>
  );
}



