// ============================================================
// Stats engine — derived data, never persisted (Step 08/09)
// Bank stats · performance overview · weak-area targeting
// ============================================================

import type { Attempt, BankStats, MasteryMap, Question, TopicStat, WeekStat } from "../types";

/** Bank Stats screen (14) + per-week progress bars */
export function deriveBankStats(questions: Question[], mastery: MasteryMap): BankStats {
  const weeks = Array.from(new Set(questions.map((q) => q.week))).sort((a, b) => a - b);

  const perWeek: WeekStat[] = weeks.map((week) => {
    const qs = questions.filter((q) => q.week === week);
    let mastered = 0;
    let answered = 0;
    let correct = 0;
    for (const q of qs) {
      const m = mastery[q.id];
      if (m) {
        answered++;
        if (m.status === "mastered") mastered++;
        correct += m.correctStreak > 0 ? Math.min(m.correctStreak, 2) : 0;
      }
    }
    return {
      week,
      topic: qs[0]?.topic ?? `Week ${week}`,
      total: qs.length,
      real: qs.filter((q) => q.origin === "real").length,
      generated: qs.filter((q) => q.origin === "generated").length,
      mastered,
      answered,
      correct,
    };
  });

  const mastered = Object.values(mastery).filter((m) => m.status === "mastered").length;
  const total = questions.length;

  return {
    total,
    real: questions.filter((q) => q.origin === "real").length,
    generated: questions.filter((q) => q.origin === "generated").length,
    mastered,
    masteryPercent: total === 0 ? 0 : Math.round((mastered / total) * 100),
    perWeek,
  };
}

/** Home performance overview (screen 2): accuracy, quizzes taken, questions answered */
export function computePerformance(attempts: Attempt[]): {
  accuracy: number;
  quizzesTaken: number;
  questionsAnswered: number;
} {
  const quizzesTaken = attempts.length;
  let correct = 0;
  let total = 0;
  for (const a of attempts) {
    correct += a.score.correct;
    total += a.score.total;
  }
  return {
    accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    quizzesTaken,
    questionsAnswered: total,
  };
}

/** Per-topic accuracy across all attempts (for weak areas + practice results) */
export function computeTopicStats(
  attempts: Attempt[],
  questions: Question[]
): TopicStat[] {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const acc: Record<string, { week: number; answered: number; correct: number }> = {};

  for (const a of attempts) {
    for (const qid of a.questionIds) {
      const q = byId.get(qid);
      if (!q) continue;
      const key = q.topic;
      const entry = (acc[key] ??= { week: q.week, answered: 0, correct: 0 });
      entry.answered++;
      if (a.answers[qid] === q.correctIndex) entry.correct++;
    }
  }

  return Object.entries(acc).map(([topic, e]) => ({
    topic,
    week: e.week,
    answered: e.answered,
    correct: e.correct,
    accuracy: e.answered === 0 ? 0 : e.correct / e.answered,
  }));
}

/** Practice Mode weak-area targeting (09-F): accuracy < 60%, decent sample */
export function getWeakTopics(attempts: Attempt[], questions: Question[]): TopicStat[] {
  return computeTopicStats(attempts, questions)
    .filter((t) => t.accuracy < 0.6 && t.answered >= 4)
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Practice Results improvement calc (screen 9): latest prior practice attempt delta */
export function computeImprovement(
  attempts: Attempt[],
  current: Attempt
): number | null {
  const prior = attempts
    .filter(
      (a) =>
        a.attemptId !== current.attemptId &&
        (a.mode === "practice" || a.mode === "missed-retry")
    )
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
  if (!prior) return null;
  return current.score.percent - prior.score.percent;
}

/** Course-level mastery for the Home course card */
export function courseMasteryPercent(
  questions: Question[],
  mastery: MasteryMap
): number {
  if (questions.length === 0) return 0;
  const mastered = questions.filter((q) => mastery[q.id]?.status === "mastered").length;
  return Math.round((mastered / questions.length) * 100);
}

/** Days remaining until the configured exam date */
export function daysUntil(examDateISO: string): number | null {
  const exam = new Date(examDateISO + "T00:00:00");
  if (Number.isNaN(exam.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((exam.getTime() - now.getTime()) / 86_400_000);
  return diff;
}
