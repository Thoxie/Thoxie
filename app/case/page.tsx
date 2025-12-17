"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Entry =
  | "thinking"
  | "preparing"
  | "open_case"
  | "lost_attorney"
  | "have_attorney";

type Step = "entry" | "rep" | "court" | "parties" | "issues" | "urgency" | "done";

const CASE_TYPES = [
  "Divorce (Dissolution)",
  "Legal Separation",
  "Parentage / Custody",
  "Support (Child / Spousal)",
  "Post-Judgment Enforcement",
  "Other",
] as const;

const HEARING_TYPES = [
  "Case Management / Status",
  "RFO Hearing",
  "Trial Setting / Trial",
  "Mediation",
  "DVRO / Restraining Order",
  "Other",
] as const;

export default function CasePage() {
  // Entry
  const [entry, setEntry] = useState<Entry | "">("");
  const [step, setStep] = useState<Step>("entry");

  // Step 1: Status & Representation
  const [activeCase, setActiveCase] = useState<"yes" | "no" | "">("");
  const [caseNumber, setCaseNumber] = useState("");
  const [caseType, setCaseType] = useState<(typeof CASE_TYPES)[number] | "">("");

  const [youHaveAttorneyNow, setYouHaveAttorneyNow] = useState<"yes" | "no" | "">("");
  const [youEverHadAttorney, setYouEverHadAttorney] = useState<"yes" | "no" | "">("");
  const [yourAttorneyName, setYourAttorneyName] = useState("");
  const [whenStopped, setWhenStopped] = useState("");

  const [otherHasAttorney, setOtherHasAttorney] = useState<"yes" | "no" | "not_sure" | "">("");
  const [otherAttorneyName, setOtherAttorneyName] = useState("");

  // Step 2: Court + Judge
  const [county, setCounty] = useState("");
  const [courtName, setCourtName] = useState("");
  const [courtAddress, setCourtAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [judgeName, setJudgeName] = useState("");

  const [nextHearingDate, setNextHearingDate] = useState(""); // YYYY-MM-DD
  const [hearingType, setHearingType] = useState<(typeof HEARING_TYPES)[number] | "">("");

  // Step 3: Parties & Basics
  const [yourFullName, setYourFullName] = useState("");
  const [otherFullName, setOtherFullName] = useState("");
  const [marriageDate, setMarriageDate] = useState("");
  const [separationDate, setSeparationDate] = useState("");
  const [hasChildren, setHasChildren] = useState<"yes" | "no" | "">("");
  const [childrenCount, setChildrenCount] = useState("");

  // Step 4: Issues & Stakes
  const [issues, setIssues] = useState<Record<string, boolean>>({
    custody: false,
    child_support: false,
    spousal_support: false,
    property: false,
    debt: false,
    fees: false,
    restraining: false,
    enforcement: false,
    other: false,
  });
  const [otherIssueText, setOtherIssueText] = useState("");
  const [winDefinition, setWinDefinition] = useState("");

  // Step 5: Urgency
  const [deadline30, setDeadline30] = useState<"yes" | "no" | "">("");
  const [criticalDate, setCriticalDate] = useState("");
  const [criticalWhat, setCriticalWhat] = useState("");
  const [needThisWeek, setNeedThisWeek] = useState("");

  const stepsOrder: Step[] = ["entry", "rep", "court", "parties", "issues", "urgency", "done"];
  const stepIndex = stepsOrder.indexOf(step);
  const progressPct = useMemo(() => {
    const denom = stepsOrder.length - 1;
    return denom <= 0 ? 0 : Math.round((stepIndex / denom) * 100);
  }, [stepIndex]);

  const selectedIssueLabels = useMemo(() => {
    const map: Record<string, string> = {
      custody: "Custody / visitation",
      child_support: "Child support",
      spousal_support: "Spousal support",
      property: "Property division",
      debt: "Debt",
      fees: "Attorney fees",
      restraining: "Restraining order / safety",
      enforcement: "Enforcement / contempt",
      other: "Other",
    };
    const chosen = Object.entries(issues)
      .filter(([, v]) => v)
      .map(([k]) => map[k] || k);
    if (issues.other && otherIssueText.trim()) chosen[chosen.length - 1] = `Other: ${otherIssueText.trim()}`;
    return chosen;
  }, [issues, otherIssueText]);

  function go(to: Step) {
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() {
    const i = stepsOrder.indexOf(step);
    if (i < stepsOrder.length - 1) go(stepsOrder[i + 1]);
  }

  function back() {
    const i = stepsOrder.indexOf(step);
    if (i > 0) go(stepsOrder[i - 1]);
  }

  function jumpPreset(preset: "case_number" | "litigation" | "lost_attorney") {
    if (preset === "lost_attorney") {
      setEntry("lost_attorney");
      setActiveCase("yes");
      setYouHaveAttorneyNow("no");
      setYouEverHadAttorney("yes");
    }
    if (preset === "case_number") setActiveCase("yes");
    if (preset === "litigation") setActiveCase("yes");
    go("rep");
  }

  const repOk =
    (activeCase === "no" && county.trim().length > 0) ||
    (activeCase === "yes" && caseNumber.trim().length > 0);

  const courtOk = county.trim().length > 0 && courtName.trim().length > 0;

  function aiCheckpointText() {
    if (step === "rep") {
      const mode =
        activeCase === "yes"
          ? `Active case${caseNumber.trim() ? ` (${caseNumber.trim()})` : ""}`
          : `Not filed yet`;
      const rep =
        youHaveAttorneyNow === "yes"
          ? "You have counsel now."
          : youEverHadAttorney === "yes"
          ? "You previously had counsel and are now self-represented."
          : "You are self-represented.";
      const other =
        otherHasAttorney === "yes"
          ? `Other party has an attorney${otherAttorneyName.trim() ? ` (${otherAttorneyName.trim()})` : ""}.`
          : otherHasAttorney === "no"
          ? "Other party appears self-represented."
          : otherHasAttorney === "not_sure"
          ? "Other party attorney status is unclear."
          : "";
      return `${mode}. ${rep} ${other}`.trim();
    }

    if (step === "court") {
      const judge = judgeName.trim() ? `Judge: ${judgeName.trim()}. ` : "";
      const dept = department.trim() ? `Dept: ${department.trim()}. ` : "";
      const hearing =
        nextHearingDate && hearingType
          ? `Next: ${hearingType} on ${nextHearingDate}.`
          : nextHearingDate
          ? `Next hearing on ${nextHearingDate}.`
          : "";
      return `${county.trim() ? `${county.trim()} County.` : ""} ${courtName.trim() ? `${courtName.trim()}.` : ""} ${judge}${dept}${hearing}`.trim();
    }

    if (step === "issues") {
      const top = selectedIssueLabels.length ? selectedIssueLabels.slice(0, 3).join(", ") : "Not selected yet";
      return `Primary issues: ${top}. Define “win” in one sentence so THOXIE can prioritize your next steps.`;
    }

    if (step === "urgency") {
      if (deadline30 === "yes" && criticalDate) {
        return `You have a time pressure: ${criticalWhat.trim() || "deadline"} on ${criticalDate}. THOXIE will prioritize prep around that date.`;
      }
      return `No immediate 30-day deadline flagged. THOXIE will focus on building momentum and closing gaps.`;
    }

    return "";
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Case Intake</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Engaging intake first. We’ll drill deeper later. (Not legal advice.)
          </p>
        </div>

        <div className="text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="h-2 w-40 rounded-full bg-zinc-200">
              <div
                className="h-2 rounded-full bg-zinc-950"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span>{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* Jump shortcuts */}
      {step !== "done" && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => jumpPreset("case_number")}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Skip → I have a case number
          </button>
          <button
            onClick={() => jumpPreset("litigation")}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Skip → I’m already in litigation
          </button>
          <button
            onClick={() => jumpPreset("lost_attorney")}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Skip → I lost my attorney
          </button>
        </div>
      )}

      {/* Card */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        {/* ENTRY */}
        {step === "entry" && (
          <div className="space-y-5">
            <div className="text-sm font-semibold text-zinc-950">
              Where are you in the process?
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["thinking", "I’m thinking about divorce"],
                ["preparing", "I’m preparing to file"],
                ["open_case", "I already have an open case"],
                ["lost_attorney", "I had an attorney but I’m now self-represented"],
                ["have_attorney", "I have an attorney right now"],
              ].map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => {
                    const val = v as Entry;
                    setEntry(val);

                    // preset logic
                    if (val === "thinking" || val === "preparing") setActiveCase("no");
                    if (val === "open_case" || val === "lost_attorney" || val === "have_attorney") setActiveCase("yes");

                    if (val === "have_attorney") setYouHaveAttorneyNow("yes");
                    if (val === "lost_attorney") {
                      setYouHaveAttorneyNow("no");
                      setYouEverHadAttorney("yes");
                    }

                    go("rep");
                  }}
                  className="rounded-2xl border border-zinc-200 p-4 text-left hover:bg-zinc-50"
                >
                  <div className="text-sm font-semibold text-zinc-950">{label}</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    We’ll ask only what matters first. You can add details later.
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* STEP 1: REP */}
        {step === "rep" && (
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-zinc-950">Step 1 — Status & representation</div>
              <div className="mt-1 text-xs text-zinc-600">
                This lets THOXIE tailor the flow (pre-file vs active case, pro se vs attorney).
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 p-4">
                <div className="text-xs font-semibold text-zinc-700">Are you already in an active divorce case?</div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setActiveCase("yes")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      activeCase === "yes" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setActiveCase("no")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      activeCase === "no" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    No
                  </button>
                </div>

                {activeCase === "yes" && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-zinc-700">Case number (required)</label>
                    <input
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      placeholder="Example: 24FL000123"
                      className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                    />
                  </div>
                )}

                {activeCase === "no" && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-zinc-700">County you will file in (required)</label>
                    <input
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      placeholder="Example: San Mateo"
                      className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-zinc-200 p-4">
                <label className="text-xs font-semibold text-zinc-700">Case type</label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value as any)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                >
                  <option value="">Select…</option>
                  {CASE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-zinc-700">Do you have an attorney right now?</div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setYouHaveAttorneyNow("yes")}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          youHaveAttorneyNow === "yes" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setYouHaveAttorneyNow("no")}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          youHaveAttorneyNow === "no" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-zinc-700">Have you ever had an attorney in this matter?</div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setYouEverHadAttorney("yes")}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          youEverHadAttorney === "yes" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setYouEverHadAttorney("no")}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          youEverHadAttorney === "no" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        No
                      </button>
                    </div>

                    {youEverHadAttorney === "yes" && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">Attorney name (optional)</label>
                          <input
                            value={yourAttorneyName}
                            onChange={(e) => setYourAttorneyName(e.target.value)}
                            placeholder="Name"
                            className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">When did representation stop? (optional)</label>
                          <input
                            value={whenStopped}
                            onChange={(e) => setWhenStopped(e.target.value)}
                            placeholder="Example: Nov 2025"
                            className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <div className="text-xs font-semibold text-zinc-700">Does the other party have an attorney?</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        ["yes", "Yes"],
                        ["no", "No"],
                        ["not_sure", "Not sure"],
                      ].map(([v, label]) => (
                        <button
                          key={v}
                          onClick={() => setOtherHasAttorney(v as any)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            otherHasAttorney === v ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {otherHasAttorney === "yes" && (
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-zinc-700">Other party’s attorney name (optional)</label>
                        <input
                          value={otherAttorneyName}
                          onChange={(e) => setOtherAttorneyName(e.target.value)}
                          placeholder="Name"
                          className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI checkpoint */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800">
              <div className="text-xs font-semibold text-zinc-950">AI checkpoint (organization only)</div>
              <div className="mt-2 text-sm text-zinc-700">{aiCheckpointText() || "Answer a few items above…"}</div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={back}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  // If active case: we can still ask county later; if not filed: county already required
                  next();
                }}
                disabled={!repOk}
                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: COURT */}
        {step === "court" && (
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-zinc-950">Step 2 — Court & judge</div>
              <div className="mt-1 text-xs text-zinc-600">
                Judge + department helps THOXIE tailor prep patterns over time.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-zinc-700">County (required)</label>
                <input
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  placeholder="Example: San Mateo"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Court name (required)</label>
                <input
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  placeholder="Example: San Mateo County Superior Court"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-700">Court address (optional)</label>
                <input
                  value={courtAddress}
                  onChange={(e) => setCourtAddress(e.target.value)}
                  placeholder="Street, City, CA"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Department (optional)</label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Example: Dept 3"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Judge name (recommended)</label>
                <input
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  placeholder="Example: Judge Smith"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Next hearing date (optional)</label>
                <input
                  value={nextHearingDate}
                  onChange={(e) => setNextHearingDate(e.target.value)}
                  type="date"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Hearing type (optional)</label>
                <select
                  value={hearingType}
                  onChange={(e) => setHearingType(e.target.value as any)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                >
                  <option value="">Select…</option>
                  {HEARING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800">
              <div className="text-xs font-semibold text-zinc-950">AI checkpoint (organization only)</div>
              <div className="mt-2 text-sm text-zinc-700">{aiCheckpointText() || "Add court + county…"}</div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={back}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={!courtOk}
                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PARTIES */}
        {step === "parties" && (
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-zinc-950">Step 3 — Parties & basics</div>
              <div className="mt-1 text-xs text-zinc-600">Enough to personalize outputs and prep forms later.</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Your full legal name</label>
                <input
                  value={yourFullName}
                  onChange={(e) => setYourFullName(e.target.value)}
                  placeholder="First Last"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700">Other party full name</label>
                <input
                  value={otherFullName}
                  onChange={(e) => setOtherFullName(e.target.value)}
                  placeholder="First Last"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Date of marriage (optional)</label>
                <input
                  value={marriageDate}
                  onChange={(e) => setMarriageDate(e.target.value)}
                  type="date"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700">Date of separation (optional)</label>
                <input
                  value={separationDate}
                  onChange={(e) => setSeparationDate(e.target.value)}
                  type="date"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 sm:col-span-2">
                <div className="text-xs font-semibold text-zinc-700">Children?</div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setHasChildren("yes")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      hasChildren === "yes" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setHasChildren("no")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      hasChildren === "no" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    No
                  </button>
                </div>

                {hasChildren === "yes" && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-zinc-700">How many? (optional)</label>
                    <input
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(e.target.value)}
                      placeholder="Example: 2"
                      className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={back}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Back
              </button>
              <button
                onClick={next}
                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ISSUES */}
        {step === "issues" && (
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-zinc-950">Step 4 — Issues & what “win” means</div>
              <div className="mt-1 text-xs text-zinc-600">
                Pick what matters most. You can add details later.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Custody / visitation" v={issues.custody} onChange={(v) => setIssues({ ...issues, custody: v })} />
              <Toggle label="Child support" v={issues.child_support} onChange={(v) => setIssues({ ...issues, child_support: v })} />
              <Toggle label="Spousal support" v={issues.spousal_support} onChange={(v) => setIssues({ ...issues, spousal_support: v })} />
              <Toggle label="Property division" v={issues.property} onChange={(v) => setIssues({ ...issues, property: v })} />
              <Toggle label="Debt" v={issues.debt} onChange={(v) => setIssues({ ...issues, debt: v })} />
              <Toggle label="Attorney fees" v={issues.fees} onChange={(v) => setIssues({ ...issues, fees: v })} />
              <Toggle label="Restraining order / safety" v={issues.restraining} onChange={(v) => setIssues({ ...issues, restraining: v })} />
              <Toggle label="Enforcement / contempt" v={issues.enforcement} onChange={(v) => setIssues({ ...issues, enforcement: v })} />
              <Toggle label="Other" v={issues.other} onChange={(v) => setIssues({ ...issues, other: v })} />
            </div>

            {issues.other && (
              <div>
                <label className="text-xs font-semibold text-zinc-700">Other (short)</label>
                <input
                  value={otherIssueText}
                  onChange={(e) => setOtherIssueText(e.target.value)}
                  placeholder="Example: move-out order, reimbursement, discovery"
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-zinc-700">In one sentence: what would a “win” look like?</label>
              <textarea
                value={winDefinition}
                onChange={(e) => setWinDefinition(e.target.value)}
                placeholder="Example: stable custody schedule + fair support + protect core assets"
                className="mt-2 min-h-[110px] w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800">
              <div className="text-xs font-semibold text-zinc-950">AI checkpoint (organization only)</div>
              <div className="mt-2 text-sm text-zinc-700">{aiCheckpointText()}</div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={back}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Back
              </button>
              <button
                onClick={next}
                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: URGENCY */}
        {step === "urgency" && (
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-zinc-950">Step 5 — Urgency & what you need this week</div>
              <div className="mt-1 text-xs text-zinc-600">
                This is where THOXIE becomes immediately useful.
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="text-xs font-semibold text-zinc-700">
                Do you have a hearing or deadline in the next 30 days?
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setDeadline30("yes")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    deadline30 === "yes" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setDeadline30("no")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    deadline30 === "no" ? "bg-zinc-950 text-white" : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  No
                </button>
              </div>

              {deadline30 === "yes" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">Date</label>
                    <input
                      value={criticalDate}
                      onChange={(e) => setCriticalDate(e.target.value)}
                      type="date"
                      className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">What is it?</label>
                    <input
                      value={criticalWhat}
                      onChange={(e) => setCriticalWhat(e.target.value)}
                      placeholder="Example: RFO response, hearing, disclosure"
                      className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">What do you need help with this week?</label>
              <textarea
                value={needThisWeek}
                onChange={(e) => setNeedThisWeek(e.target.value)}
                placeholder="Example: prepare for hearing, organize evidence, draft a declaration outline"
                className="mt-2 min-h-[120px] w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800">
              <div className="text-xs font-semibold text-zinc-950">AI checkpoint (organization only)</div>
              <div className="mt-2 text-sm text-zinc-700">{aiCheckpointText()}</div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={back}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Back
              </button>
              <button
                onClick={() => go("done")}
                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div className="space-y-6">
            <div className="text-sm font-semibold text-zinc-950">Intake captured (demo)</div>
            <div className="text-sm text-zinc-700">
              Next: we save this intake to storage, generate a clean case summary, and start producing outputs.
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800">
              <div className="text-xs font-semibold text-zinc-950">Snapshot</div>
              <div className="mt-2 space-y-1 text-sm text-zinc-700">
                <div><span className="font-semibold">Process:</span> {entry || "—"}</div>
                <div><span className="font-semibold">Active case:</span> {activeCase || "—"} {caseNumber.trim() ? `(${caseNumber.trim()})` : ""}</div>
                <div><span className="font-semibold">Court:</span> {county || "—"} · {courtName || "—"}</div>
                <div><span className="font-semibold">Judge:</span> {judgeName || "—"} {department ? `· ${department}` : ""}</div>
                <div><span className="font-semibold">You have attorney now:</span> {youHaveAttorneyNow || "—"}</div>
                <div><span className="font-semibold">Other party has attorney:</span> {otherHasAttorney || "—"}</div>
                <div><span className="font-semibold">Issues:</span> {selectedIssueLabels.length ? selectedIssueLabels.join(", ") : "—"}</div>
                <div><span className="font-semibold">Win:</span> {winDefinition.trim() || "—"}</div>
                <div><span className="font-semibold">This week:</span> {needThisWeek.trim() || "—"}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => go("rep")}
                className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Edit intake
              </button>
              <button
                onClick={() => go("entry")}
                className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Start new intake
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="mt-6 flex items-center justify-between text-xs text-zinc-600">
        <div>Route: /case</div>
        <div className="flex gap-3">
          <Link href="/terms" className="underline hover:text-zinc-950">Terms</Link>
          <Link href="/contact" className="underline hover:text-zinc-950">Contact</Link>
        </div>
      </div>
    </main>
  );
}

function Toggle({
  label,
  v,
  onChange,
}: {
  label: string;
  v: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!v)}
      className={`rounded-2xl border p-4 text-left hover:bg-zinc-50 ${
        v ? "border-zinc-950" : "border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-950">{label}</div>
        <div
          className={`h-5 w-9 rounded-full p-0.5 ${
            v ? "bg-zinc-950" : "bg-zinc-200"
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full bg-white transition ${
              v ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
      </div>
      <div className="mt-1 text-xs text-zinc-600">
        {v ? "Selected" : "Tap to select"}
      </div>
    </button>
  );
}

