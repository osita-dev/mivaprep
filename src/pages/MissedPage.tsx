// ============================================================
// MissedPage — design screen 13 (My Missed) + 16 (all mastered)
// The spaced-repair drill list (Flow D).
// ============================================================

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBank } from "@/context/BankContext";
import { useProgress } from "@/context/ProgressContext";
import { countMastered, getMissedQuestions } from "@/lib/engines/masteryEngine";
import MasteryBadge from "@/components/MasteryBadge";
import EmptyState from "@/components/EmptyState";

export default function MissedPage() {
  const navigate = useNavigate();
  const { questions } = useBank();
  const { mastery } = useProgress();

  const missed = useMemo(() => getMissedQuestions(mastery, questions), [mastery, questions]);
  const masteredCount = countMastered(mastery);

  const retry = () =>
    navigate("/quiz", {
      state: {
        weeks: [],
        count: 0,
        mode: "missed-retry",
        timerMinutes: 0,
        questionIds: missed.map((q) => q.id),
      },
    });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Flame className="h-6 w-6 text-primary" /> Questions to Revisit
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer correctly twice in a row to master a question and remove it from this list.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-xl font-bold text-emerald-700">{masteredCount}</p>
          <p className="text-[11px] text-emerald-700/80">Mastered</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-xl font-bold text-amber-700">{missed.length}</p>
          <p className="text-[11px] text-amber-700/80">To Revisit</p>
        </div>
      </div>

      {missed.length === 0 ? (
        <EmptyState
          emoji="🎉"
          title="Amazing! All questions mastered"
          description="You've answered every attempted question correctly twice in a row. Nothing left to revisit — keep a fresh quiz going!"
          actionLabel="Start a Quiz"
          onAction={() => navigate("/")}
        />
      ) : (
        <>
          <div className="space-y-3">
            {missed.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Week {q.week} · {q.topic}
                  </p>
                  <MasteryBadge state={mastery[q.id]} />
                </div>
                <p className="text-sm leading-snug">{q.stem}</p>
              </motion.div>
            ))}
          </div>

          <Button size="lg" className="w-full rounded-2xl py-6" onClick={retry}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry Wrong ({missed.length})
          </Button>
        </>
      )}
    </div>
  );
}
