// ============================================================
// Bank provider — read-only question bank (fetch + cache)
// Bank files: public/mock-data/courses/<course>.json (registry
// in lib/courses.ts). The active course comes from Settings.
// Fetched at runtime (N4 portability) with last-good cache
// fallback so a missing/corrupt bank never crashes (07-G).
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CourseBank, Question } from "@/lib/types";
import { loadBankCache, saveBankCache } from "@/lib/storage";
import { resolveCourse } from "@/lib/courses";
import { useSettings } from "@/context/SettingsContext";

interface BankContextValue {
  questions: Question[];
  bank: CourseBank | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  reload: () => void;
}

const BankContext = createContext<BankContextValue | null>(null);

function isValidBank(data: unknown): data is CourseBank {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Partial<CourseBank>;
  return (
    typeof d.course === "string" &&
    typeof d.title === "string" &&
    Array.isArray(d.weeks) &&
    Array.isArray(d.questions) &&
    d.questions.length > 0 &&
    d.questions.every(
      (q) =>
        typeof q.id === "string" &&
        typeof q.stem === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctIndex === "number"
    )
  );
}

export function BankProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const course = resolveCourse(settings.course);
  const courseId = course.id;
  const [bank, setBank] = useState<CourseBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const bankUrl = `${import.meta.env.BASE_URL}mock-data/courses/${course.file}`;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(bankUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        // A valid bank that actually belongs to the selected course
        if (!isValidBank(data) || data.course !== courseId) throw new Error("Invalid bank format");
        if (cancelled) return;
        setBank(data);
        setFromCache(false);
        saveBankCache(courseId, data); // remember last-good bank for this course
      } catch {
        // Fall back to last-good cached bank for this course (07-G)
        const cached = loadBankCache(courseId);
        if (!cancelled && isValidBank(cached) && cached.course === courseId) {
          setBank(cached);
          setFromCache(true);
          setError("Question bank file unavailable — showing your last saved copy.");
        } else if (!cancelled) {
          setBank(null);
          setError(`Could not load the ${courseId} question bank. Check that the bank file exists.`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [courseId, course.file, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const value = useMemo<BankContextValue>(
    () => ({
      questions: bank?.questions ?? [],
      bank,
      loading,
      error,
      fromCache,
      reload,
    }),
    [bank, loading, error, fromCache, reload]
  );

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank(): BankContextValue {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBank must be used within BankProvider");
  return ctx;
}
