// ============================================================
// MasteryBadge — per-question progress dot (design screen 13)
// level 0 = red (revisit), 1 = amber (1 correct streak), 2 = green (mastered)
// ============================================================

import type { MasteryState } from "@/lib/types";

export default function MasteryBadge({ state }: { state: MasteryState | undefined }) {
  const level = state?.masteryLevel ?? 0;

  const config =
    level >= 2
      ? { dot: "bg-emerald-500", label: "Mastered", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" }
      : level === 1
        ? { dot: "bg-amber-500", label: "1 streak", cls: "text-amber-700 bg-amber-50 border-amber-200" }
        : { dot: "bg-red-500", label: "Revisit", cls: "text-red-700 bg-red-50 border-red-200" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
