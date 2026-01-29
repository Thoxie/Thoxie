"use client";

// PATH: components/CaseTypeSelector.tsx

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

type CaseType = "family" | "dvro";

function guessCaseType(pathname: string): CaseType {
  if (pathname.startsWith("/dvro")) return "dvro";
  if (pathname.startsWith("/case")) return "family";
  return "family";
}

export default function CaseTypeSelector({
  compact = false,
}: {
  compact?: boolean;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const value = useMemo(() => guessCaseType(pathname), [pathname]);

  return (
    <label
      className={
        "flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-sm" +
        (compact ? " w-full justify-between" : "")
      }
    >
      <span className={compact ? "" : "hidden lg:inline"}>Case Type</span>
      <select
        className="bg-transparent text-sm font-medium text-zinc-900 outline-none"
        value={value}
        onChange={(e) => {
          const v = e.target.value as CaseType;
          router.push(v === "dvro" ? "/dvro" : "/case");
        }}
        aria-label="Select case type"
      >
        <option value="family">Family Law</option>
        <option value="dvro">DVRO (Domestic Violence)</option>
      </select>
    </label>
  );
}

