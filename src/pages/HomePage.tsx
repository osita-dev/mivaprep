// ============================================================
// HomePage — design screen 2
// Welcome · exam countdown · performance overview ·
// course card · quick links · Start CTA → StartQuizSheet (3)
// ============================================================

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarClock,
  Check,
  ChevronDown,
  Flame,
  Layers,
  Play,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COURSES } from "@/lib/courses";
import { useBank } from "@/context/BankContext";
import { useProgress } from "@/context/ProgressContext";
import { useSettings } from "@/context/SettingsContext";
import {
  computePerformance,
  courseMasteryPercent,
  courseOfAttempt,
  daysUntil,
} from "@/lib/engines/statsEngine";
import { getMissedQuestions } from "@/lib/engines/masteryEngine";
import StartQuizSheet from "@/components/StartQuizSheet";
import type { QuizConfig } from "@/lib/types";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const navigate = useNavigate();
  const { questions, bank, loading, error, reload } = useBank();
  const { attempts, mastery } = useProgress();
  const { settings, updateSettings } = useSettings();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Stats shown on Home belong to the active course only
  const courseAttempts = useMemo(
    () => attempts.filter((a) => courseOfAttempt(a) === bank?.course),
    [attempts, bank?.course]
  );

  const performance = computePerformance(courseAttempts);
  const masteryPct = courseMasteryPercent(questions, mastery);
  const missed = getMissedQuestions(mastery, questions);
  const days = daysUntil(settings.examDate);

  const beginQuiz = (config: QuizConfig) => navigate("/quiz", { state: config });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-2/3 rounded-lg bg-muted" />
        <div className="h-24 rounded-3xl bg-muted" />
        <div className="h-32 rounded-3xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + countdown */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {greeting()}, {settings.userName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Ready to boost your score?</p>
        </div>
        {days !== null && days >= 0 && (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CalendarClock className="h-3.5 w-3.5" />
            {days} {days === 1 ? "day" : "days"}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}{" "}
          <button className="font-semibold underline" onClick={reload}>
            Retry
          </button>
        </div>
      )}

      {/* Performance overview */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
          <BarChart3 className="h-4 w-4 text-primary" /> Performance Overview
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Accuracy", value: `${performance.accuracy}%` },
            { label: "Quizzes Taken", value: performance.quizzesTaken },
            { label: "Questions Answered", value: performance.questionsAnswered },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-2xl">
              <CardContent className="px-3 py-4 text-center">
                <p className="text-xl font-bold text-primary">{stat.value}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Course card — tap to switch course */}
      <section>
        <h2 className="mb-3 text-base font-bold">Your Courses</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Switch course"
              className="flex w-full items-center gap-3 rounded-3xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Zap className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{bank?.title ?? "Introduction to Problem Solving"}</p>
                <p className="text-xs text-muted-foreground">
                  {bank?.course ?? "COS102"} · {bank?.weeks.length ?? 0} weeks ·{" "}
                  {questions.length} questions · Tap to switch
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${masteryPct}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-primary">{masteryPct}%</span>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Switch course</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {COURSES.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onSelect={() => updateSettings({ course: c.id })}
                className="flex items-center justify-between gap-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {c.id}
                    {settings.course === c.id ? " · active" : ""}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {bank?.course === c.id ? bank.title : c.title}
                  </span>
                </span>
                {settings.course === c.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { to: "/practice", Icon: Target, label: "Practice", tint: "bg-amber-100 text-amber-700", badge: 0 },
          { to: "/review", Icon: Layers, label: "Review", tint: "bg-sky-100 text-sky-700", badge: 0 },
          { to: "/missed", Icon: Flame, label: "My Missed", tint: "bg-red-100 text-red-700", badge: missed.length },
        ].map(({ to, Icon, label, tint, badge }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3.5 transition-colors hover:border-primary/40"
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium">{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Start CTA */}
      <Button
        size="lg"
        className="w-full rounded-2xl py-6 text-base shadow-lg shadow-primary/20"
        onClick={() => setSheetOpen(true)}
      >
        <Play className="mr-2 h-5 w-5" /> Start Quiz
      </Button>

      <StartQuizSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode="exam"
        bank={bank}
        questions={questions}
        onBegin={beginQuiz}
      />
    </div>
  );
}
