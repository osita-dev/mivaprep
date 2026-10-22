// ============================================================
// Mastery engine — the spaced-repetition learning rule (07-C)
// Wrong -> [0] -> Correct -> [1] -> Correct -> MASTERED
//                    ^___ wrong again resets streak to 0 ___|
// ============================================================

import type { MasteryMap, MasteryState, Question } from "../types";

export const MASTER_STREAK = 2; // correct answers in a row to master

export function getMastery(mastery: MasteryMap, questionId: string): MasteryState | undefined {
  return mastery[questionId];
}

export function masteryLevelOf(streak: number): 0 | 1 | 2 {
  return streak >= MASTER_STREAK ? 2 : streak === 1 ? 1 : 0;
}

/**
 * Pure: apply one graded session to the mastery map.
 * Returns a NEW map (batch update — single save, 09-E).
 */
export function applyResults(
  mastery: MasteryMap,
  questions: Question[],
  answers: Record<string, number>,
  answeredAtISO: string = new Date().toISOString()
): MasteryMap {
  const next: MasteryMap = { ...mastery };

  for (const q of questions) {
    const selected = answers[q.id];
    const prev = next[q.id] ?? {
      questionId: q.id,
      correctStreak: 0,
      wrongCount: 0,
      masteryLevel: 0 as const,
      lastAnsweredAt: "",
      status: "revisit" as const,
    };

    const correct = selected === q.correctIndex;
    const correctStreak = correct ? prev.correctStreak + 1 : 0; // wrong resets
    const wrongCount = prev.wrongCount + (correct ? 0 : 1);
    const masteryLevel = masteryLevelOf(correctStreak);

    next[q.id] = {
      questionId: q.id,
      correctStreak,
      wrongCount,
      masteryLevel,
      lastAnsweredAt: answeredAtISO,
      status: masteryLevel >= MASTER_STREAK ? "mastered" : "revisit",
    };
  }

  return next;
}

/** Missed list = every bank question not yet mastered, oldest-answered first (09-E) */
export function getMissedQuestions(mastery: MasteryMap, questions: Question[]): Question[] {
  return questions
    .filter((q) => (mastery[q.id]?.status ?? "revisit") !== "mastered")
    .filter((q) => mastery[q.id] !== undefined) // only questions actually answered
    .sort((a, b) => {
      const ta = mastery[a.id]?.lastAnsweredAt ?? "";
      const tb = mastery[b.id]?.lastAnsweredAt ?? "";
      return ta.localeCompare(tb);
    });
}

/** Questions the user has never answered (for coverage stats) */
export function countAnswered(mastery: MasteryMap): number {
  return Object.keys(mastery).length;
}

export function countMastered(mastery: MasteryMap): number {
  return Object.values(mastery).filter((m) => m.status === "mastered").length;
}
