// ============================================================
// mivaQuiz — Core Data Model (Step 08 contract)
// All structures the app stores. JSON-first, portable.
// ============================================================

export type PatternTag =
  | "definition-fill"
  | "not-except"
  | "all-of"
  | "scenario"
  | "code-trace"
  | "blank-fill";

export type Difficulty = "easy" | "medium" | "hard";

export interface QuestionSource {
  file: string;
  slide?: number;
}

/** Core entity — lives in the bank JSON files */
export interface Question {
  id: string; // COS102-W12-Q007 — stable, never reused
  course: string;
  week: number;
  topic: string;
  type: "mcq";
  patternTag: PatternTag;
  difficulty: Difficulty;
  stem: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0-based
  explanation: string;
  source: QuestionSource;
  origin: "real" | "generated";
  mivaHints?: string;
}

export interface CourseWeek {
  week: number;
  topic: string;
}

/** The bank file shape (public/mock-data/courses/*.json) */
export interface CourseBank {
  course: string;
  title: string;
  weeks: CourseWeek[];
  questions: Question[];
}

export type QuizMode = "exam" | "practice" | "missed-retry";

export interface QuizConfig {
  weeks: number[]; // empty array = all weeks
  count: number; // 0 = all questions in scope
  mode: QuizMode;
  timerMinutes: number; // 0 = untimed
  topic?: string; // optional topic focus (practice drills)
  questionIds?: string[]; // explicit ids (missed-retry)
}

export interface AttemptScore {
  correct: number;
  total: number;
  percent: number;
}

/** One per quiz submission — persisted attempt history */
export interface Attempt {
  attemptId: string;
  mode: QuizMode;
  scope: { weeks: number[]; count: number; topic?: string };
  questionIds: string[];
  answers: Record<string, number>; // questionId -> selected option index
  score: AttemptScore;
  timeTakenSec: number;
  startedAt: string;
  submittedAt: string;
  completedBy: "manual" | "timer-expiry";
  focusTopics: string[];
}

export type MasteryStatus = "revisit" | "mastered";

/** Per-question learning progress — the missed-list engine */
export interface MasteryState {
  questionId: string;
  correctStreak: number; // 0 -> 1 -> 2 (mastered at 2)
  wrongCount: number;
  masteryLevel: 0 | 1 | 2; // red / amber / green
  lastAnsweredAt: string;
  status: MasteryStatus;
}

export type MasteryMap = Record<string, MasteryState>;

/** User preferences — device-local */
export interface Settings {
  userName: string;
  course: string; // active course id (see lib/courses.ts registry)
  defaultTimerOn: boolean;
  defaultTimerMinutes: number;
  defaultCount: number;
  examDate: string; // ISO date string
  showSourceRefs: boolean;
}

// ---- Derived stats (never persisted — Step 08 rule) ----

export interface WeekStat {
  week: number;
  topic: string;
  total: number;
  real: number;
  generated: number;
  mastered: number;
  answered: number;
  correct: number;
}

export interface BankStats {
  total: number;
  real: number;
  generated: number;
  mastered: number;
  masteryPercent: number;
  perWeek: WeekStat[];
}

export interface TopicStat {
  topic: string;
  week: number;
  answered: number;
  correct: number;
  accuracy: number; // 0..1
}
