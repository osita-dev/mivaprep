// ============================================================
// ResultsPage — design screens 6 (results) + 7 (review answers)
// + 9 improvement callout for practice runs.
// Runs outside the AppShell (own terminal screen — 05 Flow A).
// ============================================================

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  Home,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBank } from "@/context/BankContext";
import { useProgress } from "@/context/ProgressContext";
import { useSettings } from "@/context/SettingsContext";
import { computeImprovement } from "@/lib/engines/statsEngine";
import { formatTime, resultBadge, MODE_LABELS } from "@/lib/engines/quizEngine";
import OptionList from "@/components/OptionList";
import SourceLine from "@/components/SourceLine";
import type { Question } from "@/lib/types";

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { questions } = useBank();
  const { attempts, getAttempt } = useProgress();
  const { settings } = useSettings();
  const [showReview, setShowReview] = useState(false);

  const attempt = attemptId ? getAttempt(attemptId) : undefined;
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const session: Question[] = useMemo(
    () => (attempt ? attempt.questionIds.map((id) => byId.get(id)).filter((q): q is Question => !!q) : []),
    [attempt, byId]
  );

  const improvement = useMemo(
    () => (attempt ? computeImprovement(attempts, attempt) : null),
    [attempt, attempts]
  );

  if (!attempt) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <p className="mb-4 text-sm text-muted-foreground">Attempt not found.</p>
        <Button onClick={() => navigate("/")}>
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    );
  }

  const { score } = attempt;
  const badge = resultBadge(score.percent);
  const wrongIds = attempt.questionIds.filter((id) => attempt.answers[id] !== byId.get(id)?.correctIndex);
  const wasTimedOut = attempt.completedBy === "timer-expiry";

  const retake = () => {
    if (attempt.mode === "missed-retry") {
      navigate("/missed");
      return;
    }
    navigate("/quiz", {
      state: {
        weeks: attempt.scope.weeks,
        count: attempt.scope.count,
        mode: attempt.mode,
        timerMinutes: settings.defaultTimerOn ? settings.defaultTimerMinutes : 0,
        topic: attempt.scope.topic,
      },
    });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pt-5 pb-10">
      <button
        onClick={() => navigate("/")}
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      {wasTimedOut && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <Clock className="h-4 w-4 shrink-0" /> Time expired — your answers were auto-submitted.
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-5xl">{badge.emoji}</p>
        <h1 className="mt-2 text-2xl font-bold">
          {attempt.mode === "practice" ? "Practice Complete!" : "Quiz Complete!"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{MODE_LABELS[attempt.mode]}</p>

        {/* Score circle */}
        <div className="relative mx-auto mt-6 flex h-36 w-36 items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" strokeWidth="9" className="stroke-muted" />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              className="stroke-primary"
              strokeDasharray={2 * Math.PI * 44}
              initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - score.percent / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div>
            <p className="text-3xl font-bold">
              {score.correct}/{score.total}
            </p>
            <p className="text-sm font-semibold text-primary">{score.percent}% Score</p>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
          {badge.label}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Card className="rounded-2xl">
            <CardContent className="py-3.5 text-center">
              <p className="text-lg font-bold">{formatTime(attempt.timeTakenSec)}</p>
              <p className="text-[11px] text-muted-foreground">Time Taken</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="py-3.5 text-center">
              <p className="text-lg font-bold text-red-500">{wrongIds.length}</p>
              <p className="text-[11px] text-muted-foreground">To Review</p>
            </CardContent>
          </Card>
        </div>

        {/* Practice improvement (9) */}
        {attempt.mode !== "exam" && improvement !== null && improvement > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
          >
            <TrendingUp className="h-4 w-4" /> Improved by {improvement}% since your last practice!
          </motion.div>
        )}
      </motion.div>

      {/* Actions */}
      <div className="mt-6 space-y-2.5">
        <Button className="w-full rounded-2xl py-5" onClick={() => setShowReview((s) => !s)}>
          <CheckCircle2 className="mr-2 h-4 w-4" /> Review Answers
          <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showReview ? "rotate-180" : ""}`} />
        </Button>
        {wrongIds.length > 0 && (
          <Button
            variant="secondary"
            className="w-full rounded-2xl"
            onClick={() =>
              navigate("/quiz", {
                state: {
                  weeks: [],
                  count: 0,
                  mode: "missed-retry",
                  timerMinutes: 0,
                  questionIds: wrongIds,
                },
              })
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Drill the {wrongIds.length} you missed
          </Button>
        )}
        <Button variant="outline" className="w-full rounded-2xl" onClick={retake}>
          Retake Quiz
        </Button>
        <Button variant="ghost" className="w-full rounded-2xl" onClick={() => navigate("/")}>
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>

      {/* Review answers (7) */}
      {showReview && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          <h2 className="text-base font-bold">Review Answers</h2>
          {session.map((q, i) => {
            const selected = attempt.answers[q.id];
            const isCorrect = selected === q.correctIndex;
            return (
              <div key={q.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Q{i + 1} · Week {q.week} · {q.topic}
                  </p>
                  {isCorrect ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Correct
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-red-500">
                      <XCircle className="h-4 w-4" /> {selected === undefined ? "Skipped" : "Incorrect"}
                    </span>
                  )}
                </div>
                <p className="mb-3 text-sm font-semibold leading-relaxed">{q.stem}</p>
                <OptionList question={q} value={selected} revealed disabled />
                <div className="mt-3 rounded-xl bg-muted/60 p-3">
                  <p className="text-xs leading-relaxed text-foreground/80">
                    <span className="font-semibold">Explanation:</span> {q.explanation}
                  </p>
                  <SourceLine question={q} />
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
