// ============================================================
// StartQuizSheet — design screen 3 (bottom sheet setup)
// Subject · Weeks · Number of questions · Time limit · Begin
// Empty-scope guard = design screen 15.
// ============================================================

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Inbox, Timer, Zap } from "lucide-react";
import type { CourseBank, Question, QuizConfig, QuizMode } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: QuizMode;
  bank: CourseBank | null;
  questions: Question[];
  onBegin: (config: QuizConfig) => void;
}

const COUNT_OPTIONS = [10, 25, 50, 0]; // 0 = All
const TIMER_OPTIONS = [15, 30, 0]; // 0 = Untimed

function Chip({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-card text-foreground hover:border-primary/40"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {children}
    </button>
  );
}

export default function StartQuizSheet({ open, onOpenChange, mode, bank, questions, onBegin }: Props) {
  const { settings } = useSettings();
  const [weeks, setWeeks] = useState<number[]>([]); // empty = all
  const [count, setCount] = useState<number>(settings.defaultCount);
  const [timerMinutes, setTimerMinutes] = useState<number>(
    settings.defaultTimerOn ? settings.defaultTimerMinutes : 0
  );

  // Reset to user defaults each time the sheet opens
  useEffect(() => {
    if (open) {
      setWeeks([]);
      setCount(settings.defaultCount);
      setTimerMinutes(settings.defaultTimerOn ? settings.defaultTimerMinutes : 0);
    }
  }, [open, settings]);

  const available = questions.filter(
    (q) => weeks.length === 0 || weeks.includes(q.week)
  ).length;
  const isEmptyScope = available === 0;

  const toggleWeek = (w: number) =>
    setWeeks((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w].sort((a, b) => a - b)));

  const begin = () => {
    onBegin({ weeks, count, mode, timerMinutes });
    onOpenChange(false);
  };

  const isExam = mode === "exam";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl">{isExam ? "Start Quiz" : "Build Your Practice Quiz"}</SheetTitle>
          <SheetDescription>
            {isExam
              ? "Timed and just like the real thing — answers revealed at the end."
              : "Instant feedback with explanations after every answer."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-6 pb-4">
          {/* Subject */}
          <div>
            <p className="mb-2 text-sm font-semibold">Subject</p>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Zap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {bank?.title ?? "Introduction to Problem Solving"}
                </p>
                <p className="text-xs text-muted-foreground">{bank?.course ?? "COS102"} · MIVA Open University</p>
              </div>
              <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-primary" />
            </div>
          </div>

          {/* Weeks */}
          <div>
            <p className="mb-2 text-sm font-semibold">Weeks</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={weeks.length === 0} onClick={() => setWeeks([])}>
                All weeks
              </Chip>
              {(bank?.weeks ?? []).map((w) => (
                <Chip key={w.week} active={weeks.includes(w.week)} onClick={() => toggleWeek(w.week)}>
                  W{w.week}
                </Chip>
              ))}
            </div>
          </div>

          {/* Number of questions */}
          <div>
            <p className="mb-2 text-sm font-semibold">Number of Questions</p>
            <div className="flex flex-wrap gap-2">
              {COUNT_OPTIONS.map((c) => (
                <Chip key={c} active={count === c} onClick={() => setCount(c)}>
                  {c === 0 ? "All" : c}
                </Chip>
              ))}
            </div>
          </div>

          {/* Time limit */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Timer className="h-4 w-4" /> Time Limit
            </p>
            <div className="flex flex-wrap gap-2">
              {TIMER_OPTIONS.map((t) => (
                <Chip key={t} active={timerMinutes === t} onClick={() => setTimerMinutes(t)}>
                  {t === 0 ? "Untimed" : `${t} min`}
                </Chip>
              ))}
            </div>
          </div>

          {/* Scope status — empty scope guard (screen 15) */}
          {isEmptyScope ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <Inbox className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-amber-800">
                No questions available in the selected range. Choose a different week.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{available}</span> questions in scope
              {count > 0 && count < available ? ` · ${count} will be picked at random` : ""}
            </p>
          )}

          <Button size="lg" className="w-full rounded-2xl" disabled={isEmptyScope} onClick={begin}>
            {isExam ? "Begin Quiz" : "Start Practice"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
