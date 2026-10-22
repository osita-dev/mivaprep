// ============================================================
// Progress provider — the ONLY write-points: attempts + mastery
// Batched, atomic per submission (09-D / 09-E).
// ============================================================

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Attempt, MasteryMap, Question, QuizMode } from "@/lib/types";
import { loadAttempts, loadMastery, saveAttempts, saveMastery } from "@/lib/storage";
import { applyResults } from "@/lib/engines/masteryEngine";
import { gradeSession } from "@/lib/engines/quizEngine";

interface SubmitArgs {
  questions: Question[];
  answers: Record<string, number>;
  mode: QuizMode;
  scope: { weeks: number[]; count: number; topic?: string };
  startedAt: string;
  timeTakenSec: number;
  completedBy: "manual" | "timer-expiry";
}

interface ProgressContextValue {
  attempts: Attempt[];
  mastery: MasteryMap;
  submitQuiz: (args: SubmitArgs) => Attempt;
  getAttempt: (attemptId: string) => Attempt | undefined;
  clearProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts());
  const [mastery, setMastery] = useState<MasteryMap>(() => loadMastery());

  const submitQuiz = useCallback<ProgressContextValue["submitQuiz"]>(
    ({ questions, answers, mode, scope, startedAt, timeTakenSec, completedBy }) => {
      const score = gradeSession(questions, answers);
      const submittedAt = new Date().toISOString();
      const attempt: Attempt = {
        attemptId: makeId(),
        mode,
        scope,
        questionIds: questions.map((q) => q.id),
        answers,
        score,
        timeTakenSec,
        startedAt,
        submittedAt,
        completedBy,
        focusTopics: Array.from(new Set(questions.map((q) => q.topic))),
      };

      // Batched write: attempt + mastery in one step (09-E)
      const nextMastery = applyResults(mastery, questions, answers, submittedAt);
      const nextAttempts = [...attempts, attempt];
      setMastery(nextMastery);
      setAttempts(nextAttempts);
      saveMastery(nextMastery);
      saveAttempts(nextAttempts);

      return attempt;
    },
    [attempts, mastery]
  );

  const getAttempt = useCallback(
    (attemptId: string) => attempts.find((a) => a.attemptId === attemptId),
    [attempts]
  );

  const clearProgress = useCallback(() => {
    setAttempts([]);
    setMastery({});
    saveAttempts([]);
    saveMastery({});
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({ attempts, mastery, submitQuiz, getAttempt, clearProgress }),
    [attempts, mastery, submitQuiz, getAttempt, clearProgress]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
