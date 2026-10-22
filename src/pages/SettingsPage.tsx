// ============================================================
// SettingsPage — profile, quiz defaults, display, data controls
// ============================================================

import { useState } from "react";
import type { ReactNode } from "react";
import { CalendarClock, Eye, RotateCcw, Timer, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSettings } from "@/context/SettingsContext";
import { useProgress } from "@/context/ProgressContext";

const COUNT_OPTIONS = [10, 25, 50];
const TIMER_OPTIONS = [15, 30, 45];

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
        <span className="text-primary">{icon}</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { clearProgress, attempts } = useProgress();
  const [clearOpen, setClearOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your preferences stay on this device.</p>
      </div>

      <Section icon={<User className="h-4 w-4" />} title="Profile">
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            placeholder="Your name"
          />
        </div>
      </Section>

      <Section icon={<Zap className="h-4 w-4" />} title="Quiz Defaults">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Timer on by default</p>
            <p className="text-xs text-muted-foreground">Applies to new exam quizzes</p>
          </div>
          <Switch
            checked={settings.defaultTimerOn}
            onCheckedChange={(v) => updateSettings({ defaultTimerOn: v })}
          />
        </div>

        {settings.defaultTimerOn && (
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <Timer className="h-3.5 w-3.5" /> Default time limit
            </Label>
            <div className="flex gap-2">
              {TIMER_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => updateSettings({ defaultTimerMinutes: t })}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                    settings.defaultTimerMinutes === t
                      ? "border-primary bg-primary text-white"
                      : "border-border"
                  }`}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs">Default question count</Label>
          <div className="flex gap-2">
            {COUNT_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => updateSettings({ defaultCount: c })}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                  settings.defaultCount === c ? "border-primary bg-primary text-white" : "border-border"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section icon={<Eye className="h-4 w-4" />} title="Display">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Show source references</p>
            <p className="text-xs text-muted-foreground">Show the slide each answer comes from</p>
          </div>
          <Switch
            checked={settings.showSourceRefs}
            onCheckedChange={(v) => updateSettings({ showSourceRefs: v })}
          />
        </div>
      </Section>

      <Section icon={<CalendarClock className="h-4 w-4" />} title="Exam Countdown">
        <div className="space-y-1.5">
          <Label htmlFor="examDate">Exam date</Label>
          <Input
            id="examDate"
            type="date"
            value={settings.examDate}
            onChange={(e) => updateSettings({ examDate: e.target.value })}
          />
        </div>
      </Section>

      <section className="rounded-3xl border border-red-200 bg-red-50/50 p-5">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-red-700">
          <RotateCcw className="h-4 w-4" /> Data
        </h2>
        <p className="mb-3 text-xs text-red-600/80">
          {attempts.length} quiz attempts saved on this device. Clearing removes all attempt history and
          mastery progress — the question bank is not affected.
        </p>
        <Button
          variant="outline"
          className="rounded-2xl border-red-300 text-red-600 hover:bg-red-100"
          onClick={() => setClearOpen(true)}
        >
          Clear my progress
        </Button>
      </section>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your quiz history and mastery data on this device. The question
              bank stays untouched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => clearProgress()}
            >
              Clear everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
