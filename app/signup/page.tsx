// PATH: app/signup/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CA_COUNTIES, countyToCourtFinderUrl } from "@/lib/caCounties";
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
} from "@/lib/caseStore";

// ---------- IndexedDB (files) ----------
const DB_NAME = "thoxie_evidence_db";
const DB_VERSION = 1;
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, value: any) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbGet(key: string) {
  const db = await openDb();
  const res = await new Promise<any>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return res;
}

async function idbDel(key: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

// ---------- UI helpers ----------
const TASKS: { id: IntakeTask; label: string; desc: string }[] = [
  { id: "start_divorce", label: "Start a divorce", desc: "You’re preparing to file." },
  { id: "respond_papers", label: "Respond to papers", desc: "You were served and need to respond." },
  { id: "prepare_hearing", label: "Prepare for a hearing", desc: "You have an upcoming court date." },
  { id: "explain_your_side", label: "Explain your side", desc: "You want to tell your story clearly and safely." },
  { id: "help_me_figure_it_out", label: "Help me figure it out", desc: "You’re not sure what to do next." },
];

const EDU_LEVELS: { id: EducationLevel; label: string }[] = [
  { id: "hs", label: "High School" },
  { id: "some_college", label: "Some College" },
  { id: "ba_bs", label: "BA/BS" },
  { id: "masters", label: "Masters" },
  { id: "jd", label: "JD" },
  { id: "phd", label: "PhD" },
  { id: "other", label: "Other" },
];

const EMPLOYMENT: { id: EmploymentStatus; label: string }[] = [
  { id: "w2", label: "W2 employee" },
  { id: "self", label: "Self-employed" },
  { id: "unemployed", label: "Unemployed" },
  { id: "retired", label: "Retired" },
  { id: "other", label: "Other" },
];

const INCOME: { id: IncomeRange; label: string }[] = [
  { id: "lt_50", label: "< $50k" },
  { id: "50_100", label: "$50k–$100k" },
  { id: "100_200", label: "$100k–$200k" },
  { id: "200_400", label: "$200k–$400k" },
  { id: "gt_400", label: "$400k+" },
  { id: "unknown", label: "Prefer not to say" },
];

const ROLE: { id: FamilyLawRole; label: string }[] = [
  { id: "petitioner", label: "I filed / will file" },
  { id: "respondent", label: "Other party filed" },
  { id: "not_sure", label: "Not sure" },
];

const EVIDENCE_KIND: { id: EvidenceKind; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "text", label: "Text message" },
  { id: "pdf", label: "PDF / document" },
  { id: "photo", label: "Photo" },
  { id: "video", label: "Video" },
  { id: "other", label: "Other" },
];

const EVIDENCE_SIDE: { id: EvidenceSide; label: string }[] = [
  { id: "me", label: "My evidence" },
  { id: "them", label: "Other side evidence" },
];

function clampStr(s: string, max = 4000) {
  const t = (s || "").trim();
  return t.length > max ? t.slice(0, max) : t;
}

export default function Signup() {
  const counties = useMemo(() => CA_COUNTIES, []);
  const [caseId, setCaseId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  // Intake
  const [task, setTask] = useState<IntakeTask>("start_divorce");
  const [county, setCounty] = useState<string>("San Mateo");
  const [role, setRole] = useState<FamilyLawRole>("not_sure");
  const [education, setEducation] = useState<EducationLevel>("ba_bs");
  const [employment, setEmployment] = useState<EmploymentStatus>("w2");
  const [income, setIncome] = useState<IncomeRange>("unknown");
  const [notes, setNotes] = useState<string>("");

  // Evidence items (metadata)
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Load latest saved case, else create new
    const existing = loadCase();
    if (existing?.id) {
      setCaseId(existing.id);
      setTask(existing.task);
      setCounty(existing.county);
      setRole(existing.role);
      setEducation(existing.education);
      setEmployment(existing.employment);
      setIncome(existing.income);
      setNotes(existing.notes || "");
      setEvidence(existing.evidence || []);
    } else {
      const id = newId();
      setCaseId(id);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const payload: CaseIntake = {
      id: caseId || newId(),
      createdAt: new Date().toISOString(),
      task,
      county,
      role,
      education,
      employment,
      income,
      notes: clampStr(notes, 8000),
      evidence,
    };
    saveCase(payload);
  }, [loaded, caseId, task, county, role, education, employment, income, notes, evidence]);

  async function addEvidence(files: FileList | null) {
    if (!files || files.length === 0) return;

    const next: EvidenceItem[] = [];
    for (const f of Array.from(files)) {
      const id = newId();
      const key = `${caseId}:${id}`;
      const buf = await f.arrayBuffer();

      await idbPut(key, {
        name: f.name,
        type: f.type || "application/octet-stream",
        size: f.size,
        data: buf,
      });

      next.push({
        id,
        name: f.name,
        kind: (inferKind(f) as EvidenceKind) || "other",
        side: "me",
        note: "",
        createdAt: new Date().toISOString(),
      });
    }

    setEvidence((prev) => [...next, ...prev]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function inferKind(f: File): EvidenceKind {
    const name = f.name.toLowerCase();
    const type = (f.type || "").toLowerCase();
    if (type.includes("pdf") || name.endsWith(".pdf")) return "pdf";
    if (type.startsWith("image/")) return "photo";
    if (type.startsWith("video/")) return "video";
    if (name.endsWith(".eml")) return "email";
    if (name.endsWith(".txt")) return "text";
    return "other";
  }

  async function removeEvidence(item: EvidenceItem) {
    const key = `${caseId}:${item.id}`;
    await idbDel(key);
    setEvidence((prev) => prev.filter((e) => e.id !== item.id));
  }

  function updateEvidence(itemId: string, patch: Partial<EvidenceItem>) {
    setEvidence((prev) =>
      prev.map((e) => (e.id === itemId ? { ...e, ...patch } : e))
    );
  }

  const courtFinder = useMemo(() => countyToCourtFinderUrl(county), [county]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-white p-10 text-zinc-900">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <section className="border-b border-zinc-200">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Start</h1>
              <p className="mt-2 text-zinc-700">
                Tell THOXIE what you’re doing. Upload evidence if you have it.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
            >
              Home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-12">
        {/* Left: Intake */}
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">What are you doing?</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TASKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTask(t.id)}
                  className={[
                    "rounded-xl border px-4 py-3 text-left text-sm",
                    task === t.id
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-300 bg-white hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <div className="font-semibold">{t.label}</div>
                  <div className={task === t.id ? "text-zinc-200" : "text-zinc-600"}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <div className="font-semibold">California county</div>
                <select
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                >
                  {counties.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-zinc-500">
                  Court finder:{" "}
                  <a className="underline" href={courtFinder} target="_blank" rel="noreferrer">
                    open
                  </a>
                </div>
              </label>

              <label className="text-sm">
                <div className="font-semibold">Your role</div>
                <select
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2"
                  value={role}
                  onChange={(e) => setRole(e.target.value as FamilyLawRole)}
                >
                  {ROLE.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="font-semibold">Education</div>
                <select
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2"
                  value={education}
                  onChange={(e) => setEducation(e.target.value as EducationLevel)}
                >
                  {EDU_LEVELS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="font-semibold">Employment</div>
                <select
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2"
                  value={employment}
                  onChange={(e) => setEmployment(e.target.value as EmploymentStatus)}
                >
                  {EMPLOYMENT.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="font-semibold">Income</div>
                <select
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2"
                  value={income}
                  onChange={(e) => setIncome(e.target.value as IncomeRange)}
                >
                  {INCOME.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-6 block text-sm">
              <div className="font-semibold">Notes (optional)</div>
              <textarea
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key facts, deadlines, what you want…"
              />
            </label>

            <div className="mt-6 text-xs text-zinc-500">
              THOXIE is not a law firm. No legal advice. Use for preparation and drafting support.
            </div>

            <div className="mt-8">
              <Link
                href="/case"
                className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Evidence */}
        <div className="md:col-span-5">
          <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Evidence (optional)</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Upload files so you can organize them later (prototype).
            </p>

            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="block w-full text-sm"
                onChange={(e) => addEvidence(e.target.files)}
              />
            </div>

            <div className="mt-6 space-y-3">
              {evidence.length === 0 ? (
                <div className="text-sm text-zinc-500">No evidence uploaded yet.</div>
              ) : (
                evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-zinc-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{ev.name}</div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {new Date(ev.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                        onClick={() => removeEvidence(ev)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="text-xs">
                        <div className="font-semibold">Type</div>
                        <select
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm"
                          value={ev.kind}
                          onChange={(e) =>
                            updateEvidence(ev.id, { kind: e.target.value as EvidenceKind })
                          }
                        >
                          {EVIDENCE_KIND.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs">
                        <div className="font-semibold">Whose evidence</div>
                        <select
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm"
                          value={ev.side}
                          onChange={(e) =>
                            updateEvidence(ev.id, { side: e.target.value as EvidenceSide })
                          }
                        >
                          {EVIDENCE_SIDE.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="mt-3 block text-xs">
                      <div className="font-semibold">Note</div>
                      <input
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm"
                        value={ev.note || ""}
                        onChange={(e) =>
                          updateEvidence(ev.id, { note: e.target.value })
                        }
                        placeholder="Why this matters / what it proves…"
                      />
                    </label>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 text-xs text-zinc-500">
              Files are stored locally in your browser (IndexedDB). Prototype only.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}




