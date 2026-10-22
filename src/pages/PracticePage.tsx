// ============================================================
// PracticePage — design screen 8 (Build Your Practice Quiz)
// Weak-area targeting (< 60% accuracy) + custom builder.
// ============================================================

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBank } from "@/context/BankContext";
import { useProgress } from "@/context/ProgressContext";
import { computeImprovement, courseOfAttempt, getWeakTopics } from "@/lib/engines/statsEngine";
import StartQuizSheet from "@/components/StartQuizSheet";
import EmptyState from "@/components/EmptyState";
import type { QuizConfig } from "@/lib/types";

export default function PracticePage() {
  const navigate = useNavigate();
  const { questions, bank } = useBank();
  const { attempts } = useProgress();
  const [customOpen, setCustomOpen] = useState(false);

  // Weak areas and improvement history belong to the active course only
  const courseAttempts = useMemo(
    () => attempts.filter((a) => courseOfAttempt(a) === bank?.course),
    [attempts, bank?.course]
  );

  const weakTopics = useMemo(() => getWeakTopics(courseAttempts, questions), [courseAttempts, questions]);

  const lastPractice = useMemo(() => {
    const prior = courseAttempts
      .filter((a) => a.mode === "practice" || a.mode === "missed-retry")
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return prior[0] ?? null;
  }, [courseAttempts]);

  const improvement = useMemo(
    () => (lastPractice ? computeImprovement(courseAttempts, lastPractice) : null),
    [courseAttempts, lastPractice]
  );

  const drillTopic = (topic: string) => {
    const config: QuizConfig = { weeks: [], count: 10, mode: "practice", timerMinutes: 0, topic };
    navigate("/quiz", { state: config });
  };

  const beginCustom = (config: QuizConfig) => navigate("/quiz", { state: config });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice Mode</h1>
        <p className="mt-1 text-sm text-muted-foreground">Build your practice quiz — instant feedback.</p>
      </div>

      {/* Last practice improvement (9) */}
      {lastPractice && improvement !== null && (
        <Card className="rounded-3xl border-emerald-200 bg-emerald-50/60">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-emerald-800">
                {improvement > 0
                  ? `You improved by ${improvement}% last session!`
                  : `Last score: ${lastPractice.score.percent}%`}
              </p>
              <p className="text-xs text-emerald-700/80">
                Weak areas mastered: keep drilling to keep climbing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weak areas */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
          <Target className="h-4 w-4 text-primary" /> Your Weak Areas
        </h2>

        {weakTopics.length === 0 ? (
          <EmptyState
            emoji="🌱"
            title="No weak areas yet"
            description="Take a few quizzes or practices — topics below 60% accuracy will show up here for targeted drilling."
          />
        ) : (
          <div className="space-y-3">
            {weakTopics.map((t, i) => (
              <motion.div
                key={t.topic}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="rounded-2xl">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{t.topic}</p>
                        <p className="text-sm font-bold text-red-500">{Math.round(t.accuracy * 100)}%</p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-red-400"
                          style={{ width: `${Math.round(t.accuracy * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Week {t.week} · {t.correct}/{t.answered} correct so far
                      </p>
                    </div>
                    <Button size="sm" className="shrink-0 rounded-xl" onClick={() => drillTopic(t.topic)}>
                      Drill
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Custom builder */}
      <section className="rounded-3xl border border-dashed border-primary/40 bg-card p-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Plus className="h-5 w-5" />
        </span>
        <h3 className="mt-3 font-bold">or Create Custom</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick your own weeks, question count, and timer.
        </p>
        <Button className="mt-4 rounded-2xl" onClick={() => setCustomOpen(true)}>
          <Zap className="mr-2 h-4 w-4" /> Build Custom Quiz
        </Button>
      </section>

      <StartQuizSheet
        open={customOpen}
        onOpenChange={setCustomOpen}
        mode="practice"
        bank={bank}
        questions={questions}
        onBegin={beginCustom}
      />
    </div>
  );
}
