// ============================================================
// Storage layer — the ONLY three write-points (Step 09-H)
// attempts.json · mastery.json · settings.json  (device-local)
// Bank files are read-only and fetched at runtime.
// ============================================================

import type { Attempt, MasteryMap, Settings } from "./types";

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
export const defaultSettings = (): Settings => {
  const exam = new Date();
  exam.setDate(exam.getDate() + 12); // design placeholder: "12 days" countdown
  return {
    userName: "Student",
    defaultTimerOn: true,
    defaultTimerMinutes: 30,
    defaultCount: 10,
    examDate: exam.toISOString().slice(0, 10),
    showSourceRefs: true,
  };
};

export const loadSettings = (): Settings => ({
  ...defaultSettings(),
  ...safeRead<Partial<Settings>>(KEYS.settings, {}),
});
export const saveSettings = (settings: Settings): void => safeWrite(KEYS.settings, settings);

// ---- Bank cache (last-good bank fallback, 07-G) ----
export const loadBankCache = (): unknown => safeRead<unknown>(KEYS.bankCache, null);
export const saveBankCache = (bank: unknown): void => safeWrite(KEYS.bankCache, bank);
