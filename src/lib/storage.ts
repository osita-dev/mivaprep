// ============================================================
// Storage layer — the ONLY three write-points (Step 09-H)
// attempts.json · mastery.json · settings.json  (device-local)
// Bank files are read-only and fetched at runtime.
// ============================================================

import type { Attempt, MasteryMap, Settings } from "./types";
import { DEFAULT_COURSE_ID } from "./courses";

const KEYS = {
  attempts: "mivav1.attempts",
  mastery: "mivav1.mastery",
  settings: "mivav1.settings",
  bankCache: "mivav1.bankCache",
} as const;

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full/unavailable — never crash the app (07-G)
  }
}

// ---- Attempts ----
export const loadAttempts = (): Attempt[] => safeRead<Attempt[]>(KEYS.attempts, []);
export const saveAttempts = (attempts: Attempt[]): void => safeWrite(KEYS.attempts, attempts);

// ---- Mastery ----
export const loadMastery = (): MasteryMap => safeRead<MasteryMap>(KEYS.mastery, {});
export const saveMastery = (mastery: MasteryMap): void => safeWrite(KEYS.mastery, mastery);

// ---- Settings ----
/** The real MIVA exam date the user confirmed: 5 December 2026 */
export const DEFAULT_EXAM_DATE = "2026-12-05";
const EXAM_MIGRATION_KEY = "mivav1.examDateV2";

export const defaultSettings = (): Settings => ({
  userName: "Student",
  course: DEFAULT_COURSE_ID,
  defaultTimerOn: true,
  defaultTimerMinutes: 30,
  defaultCount: 10,
  examDate: DEFAULT_EXAM_DATE,
  showSourceRefs: true,
});

export const loadSettings = (): Settings => {
  const merged = { ...defaultSettings(), ...safeRead<Partial<Settings>>(KEYS.settings, {}) };
  // One-time migration: replace the old placeholder countdown (first run + 12
  // days) with the real exam date. Runs once; later manual changes stick.
  try {
    if (!window.localStorage.getItem(EXAM_MIGRATION_KEY)) {
      if (merged.examDate !== DEFAULT_EXAM_DATE) merged.examDate = DEFAULT_EXAM_DATE;
      window.localStorage.setItem(EXAM_MIGRATION_KEY, "1");
    }
  } catch {
    /* storage unavailable — the new default already applies */
  }
  return merged;
};
export const saveSettings = (settings: Settings): void => safeWrite(KEYS.settings, settings);

// ---- Bank cache (last-good bank fallback, 07-G) ----
// Keyed per course so switching courses never resurfaces the wrong bank.
// The legacy single-key cache only ever held the default course.
const bankCacheKey = (course: string) => `${KEYS.bankCache}.${course}`;

export const loadBankCache = (course: string): unknown =>
  safeRead<unknown>(
    bankCacheKey(course),
    course === DEFAULT_COURSE_ID ? safeRead<unknown>(KEYS.bankCache, null) : null
  );
export const saveBankCache = (course: string, bank: unknown): void =>
  safeWrite(bankCacheKey(course), bank);
