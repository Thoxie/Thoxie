// PATH: app/components/CaseTypeSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CASE_TYPES,
  DEFAULT_CASE_TYPE,
  type CaseTypeId,
  loadCaseType,
  saveCaseType,
} from "@/lib/caseTypes";

type Props = {
  variant?: "desktop" | "mobile";
};

function routeForCaseType(caseType: CaseTypeId) {
  switch (caseType) {
    case "dvro":
      return "/dvro";
    case "family_law":
      return "/case";
    // placeholders for future case types (we’ll build these one-by-one)
    case "ud":
    case "small_claims":
    case "limited_civil":
    default:
      return "/case";
  }
}

export default function CaseTypeSelector({ variant = "desktop" }: Props) {
  const router = useRouter();
  const [caseType, setCaseType] = useState<CaseTypeId>(DEFAULT_CASE_TYPE);

  useEffect(() => {
    setCaseType(loadCaseType());
  }, []);

  function onChange(next: CaseTypeId) {
    setCaseType(next);
    saveCaseType(next);
    router.push(routeForCaseType(next));
  }

  const wrapClass =
    variant === "mobile"
      ? "flex w-full items-center gap-2"
      : "hidden items-center gap-2 md:flex";

  const selectClass =
    variant === "mobile"
      ? "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
      : "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900";

  return (
    <div className={wrapClass}>
      <span className="text-xs font-medium text-zinc-600 whitespace-nowrap">
        Case:
      </span>
      <select
        className={selectClass}
        value={caseType}
        onChange={(e) => onChange(e.target.value as CaseTypeId)}
        aria-label="Select case type"
      >
        {CASE_TYPES.map((ct) => (
          <option key={ct.id} value={ct.id}>
            {ct.label}
          </option>
        ))}
      </select>
    </div>
  );
}
