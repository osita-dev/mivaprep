// ============================================================
// Quiz engine — pure functions, no React (Step 10)
// buildSession · gradeSession · formatting
// ============================================================

import type { AttemptScore, Question, QuizConfig } from "../types";

/** Fisher–Yates shuffle for re-quiz variety (09-B) */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build the ordered question list for a session (09-B).
 * Returns [] when the scope is empty — caller shows Empty Scope screen (15).
 */
export function buildSession(questions: Question[], config: QuizConfig): Question[] {
  let pool: Question[];

  if (config.questionIds && config.questionIds.length > 0) {
    const wanted = new Set(config.questionIds);
    pool = questions.filter((q) => wanted.has(q.id));
  } else {
    pool = questions.filter(
      (q) =>
        (config.weeks.length === 0 || config.weeks.includes(q.week)) &&
        (config.topic === undefined || q.topic === config.topic)
    );
  }

  const shuffled = shuffle(pool);
  return config.count > 0 ? shuffled.slice(0, config.count) : shuffled;
}

/** Binary scoring — no partial credit (07-B) */
export function gradeSession(
  session: Question[],
  answers: Record<string, number>
): AttemptScore {
  let correct = 0;
  for (const q of session) {
    if (answers[q.id] === q.correctIndex) correct++;
  }
  const total = session.length;
  return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100) };
}

/** "MM:SS" for the quiz timer */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/** Option letters A-D */
export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

/** Human-readable mode labels */
export const MODE_LABELS: Record<string, string> = {
  exam: "Exam Mode",
  practice: "Practice Mode",
  "missed-retry": "Repair Drill",
};

/** Result badge per score (design screen 6) */
export function resultBadge(percent: number): { label: string; emoji: string } {
  if (percent >= 80) return { label: "Excellent Work", emoji: "🏆" };
  if (percent >= 60) return { label: "Good Effort", emoji: "👍" };
  return { label: "Keep Practicing", emoji: "💪" };
}
