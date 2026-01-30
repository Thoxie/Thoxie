// PATH: components/CaseTypeSelector.tsx
"use client";

import { useRouter } from "next/navigation";

export default function CaseTypeSelector({
  compact = false,
}: {
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <div
      className={[
        "rounded-xl border border-zinc-200 bg-white",
        compact ? "p-3" : "p-6",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-zinc-900">Workflow</div>
          {!compact ? (
            <div className="mt-1 text-sm text-zinc-700">
              Family Law only (restored baseline).
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => router.push("/case")}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Open Family Law
        </button>
      </div>
    </div>
  );
}

