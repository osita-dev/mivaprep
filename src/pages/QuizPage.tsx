// ============================================================
// QuizPage — design screens 4 (quiz) + 5 (time expired) + 15
// Runs OUTSIDE the AppShell (fullscreen focus, no bottom nav).
// Session lives in memory only — lost on refresh (rule 07-F).
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Flag,
  Hourglass,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useBank } from "@/context/BankContext";
import { useProgress } from "@/context/ProgressContext";
import { buildSession, formatTime, MODE_LABELS } from "@/lib/engines/quizEngine";
import OptionList from "@/components/OptionList";
import SourceLine from "@/components/SourceLine";
import EmptyState from "@/components/EmptyState";
import type { QuizConfig } from "@/lib/types";

export default function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions, loading } = useBank();
  const { submitQuiz } = useProgress();

  const config = location.state as QuizConfig | null;

  // Session — built once per mount (retake = fresh remount = new shuffle)
  const session = useMemo(
    () => (config && !loading ? buildSession(questions, config) : []),
    [config, questions, loading]
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    config && config.timerMinutes > 0 ? config.timerMinutes * 60 : null
  );
  const [expiredOpen, setExpiredOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  const startedAtRef = useRef<string>(new Date().toISOString());
  const submittedRef = useRef(false);
  const resultIdRef = useRef<string | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const isExam = config?.mode === "exam";
  const total = session.length;
  const current = session[index];

  // ---- Submit (single write — 09-D) ----
  const submit = useCallback(
    (completedBy: "manual" | "timer-expiry") => {
      if (submittedRef.current || !config || session.length === 0) return;
      submittedRef.current = true;
      const timeTakenSec = Math.max(
        0,
        Math.round((Date.now() - new Date(startedAtRef.current).getTime()) / 1000)
      );
      const attempt = submitQuiz({
        questions: session,
        answers: answersRef.current,
        mode: config.mode,
        scope: { weeks: config.weeks, count: config.count, topic: config.topic },
        startedAt: startedAtRef.current,
        timeTakenSec,
        completedBy,
      });
      resultIdRef.current = attempt.attemptId;
    },
    [config, session, submitQuiz]
  );

  // ---- Timer (global, keeps running across questions — 07-A) ----
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      // Time expiry → auto-submit → Time Expired dialog (5)
      submit("timer-expiry");
      setExpiredOpen(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, submit]);

  // Guard: bank/config without questions
  if (!config) return <Navigate to="/" replace />;
  if (!loading && total === 0) {
    return (
      <div className="mx-auto max-w-md px-4 pt-10">
        <EmptyState
          emoji="📭"
          title="No Questions Available"
          description="There are no questions in the selected range. Choose a different week."
          actionLabel="Back Home"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }
  if (loading || total === 0) return null;

  const goToResults = () => {
    if (resultIdRef.current) navigate(`/results/${resultIdRef.current}`, { replace: true });
    else navigate("/");
  };

  const selectAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
  };

  const toggleFlag = () => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const isLast = index === total - 1;
  const revealed = !isExam; // practice/repair: instant feedback
  const progressPct = ((index + 1) / total) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5 pb-8">
      {/* Header — question counter, mode, timer */}
      <div className="mb-1 flex items-center justify-between">
        <button
          onClick={() => setConfirmExitOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Exit quiz"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold">
            Question {index + 1} of {total}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {MODE_LABELS[config.mode]} · Week {current.week} · {current.topic}
          </p>
        </div>
        {secondsLeft !== null ? (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums ${
              secondsLeft <= 60 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <Timer className="h-3.5 w-3.5" /> {formatTime(secondsLeft)}
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Hourglass className="h-3 w-3" /> Untimed
          </span>
        )}
      </div>

      <Progress value={progressPct} className="mb-5 h-1.5" />

      {/* Question + options */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
          className="flex-1"
        >
          <div className="mb-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[15px] font-semibold leading-relaxed">{current.stem}</p>
          </div>

          <OptionList
            question={current}
            value={answers[current.id]}
            onChange={selectAnswer}
            revealed={revealed}
          />

          {/* Practice instant feedback (7) */}
          {revealed && answers[current.id] !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-2xl border p-4 ${
                answers[current.id] === current.correctIndex
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  answers[current.id] === current.correctIndex ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {answers[current.id] === current.correctIndex ? "✅ Correct!" : "❌ Not quite"}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{current.explanation}</p>
              <SourceLine question={current} />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="mt-6 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-2xl"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {isExam && (
          <Button
            variant={flags.has(current.id) ? "default" : "outline"}
            className="shrink-0 rounded-2xl px-3"
            onClick={toggleFlag}
          >
            <Flag className="mr-1.5 h-4 w-4" /> {flags.has(current.id) ? "Flagged" : "Flag"}
          </Button>
        )}

        {isLast ? (
          <Button
            className="flex-1 rounded-2xl"
            onClick={() => {
              submit("manual");
              goToResults();
            }}
          >
            {isExam ? `Submit Quiz (${answeredCount}/${total})` : "Finish Practice"}
          </Button>
        ) : (
          <Button
            className="flex-1 rounded-2xl"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          >
            Next <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        )}

        {isExam && !isLast && (
          <Button
            variant="secondary"
            className="shrink-0 rounded-2xl px-3"
            onClick={() => setConfirmSubmitOpen(true)}
          >
            Submit
          </Button>
        )}
      </div>

      {/* Confirm submit (exam) */}
      <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You've answered {answeredCount} of {total} questions. Unanswered questions count as
              wrong. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                submit("manual");
                goToResults();
              }}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit confirm — progress lost (07-F) */}
      <AlertDialog open={confirmExitOpen} onOpenChange={setConfirmExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit quiz?</AlertDialogTitle>
            <AlertDialogDescription>Your progress in this quiz will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue quiz</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/")}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time expired (5) */}
      <AlertDialog open={expiredOpen} onOpenChange={() => undefined}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Time's Up!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your quiz has been automatically submitted with your current answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={goToResults}>View Results</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
