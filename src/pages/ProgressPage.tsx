// ============================================================
// ProgressPage — design screen 14 (Bank Stats)
// Total · real-vs-generated filter pills · per-week progress
// ============================================================

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useBank } from "@/context/BankContext";
import { useProgress } from "@/context/ProgressContext";
import { deriveBankStats } from "@/lib/engines/statsEngine";

type Filter = "all" | "real" | "generated";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "real", label: "Past Questions" },
  { key: "generated", label: "Pattern-Generated" },
];

export default function ProgressPage() {
  const { questions, bank } = useBank();
  const { mastery } = useProgress();
  const [filter, setFilter] = useState<Filter>("all");

  const stats = useMemo(() => deriveBankStats(questions, mastery), [questions, mastery]);

  const visibleTotal =
    filter === "all" ? stats.total : filter === "real" ? stats.real : stats.generated;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Database className="h-6 w-6 text-primary" /> Question Bank
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {bank?.title ?? "Introduction to Problem Solving"} · {bank?.course ?? "COS102"}
        </p>
      </div>

      {/* Total + mastery */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-3xl">
          <CardContent className="py-5 text-center">
            <p className="text-3xl font-bold text-primary">{visibleTotal}</p>
            <p className="text-[11px] text-muted-foreground">
              {filter === "all" ? "Total Questions" : filter === "real" ? "Past Questions" : "Generated"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="py-5 text-center">
            <p className="text-3xl font-bold text-emerald-600">{stats.masteryPercent}%</p>
            <p className="text-[11px] text-muted-foreground">
              Mastered ({stats.mastered}/{stats.total})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key ? "border-primary bg-primary text-white" : "border-border bg-card"
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-70">
              {f.key === "all" ? stats.total : f.key === "real" ? stats.real : stats.generated}
            </span>
          </button>
        ))}
      </div>

      {/* Per-week progress bars */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
          <BarChart3 className="h-4 w-4 text-primary" /> Progress by Week
        </h2>
        <div className="space-y-3">
          {stats.perWeek.map((w, i) => {
            const pct = w.total === 0 ? 0 : Math.round((w.mastered / w.total) * 100);
            const count = filter === "all" ? w.total : filter === "real" ? w.real : w.generated;
            return (
              <motion.div
                key={w.week}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.5) }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold">
                    <span className="mr-1.5 text-muted-foreground">W{w.week}</span>
                    {w.topic}
                  </p>
                  <p className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {count} q · {w.mastered}/{w.total} mastered
                  </p>
                </div>
                <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
