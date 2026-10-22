// ============================================================
// SourceLine — the "source of truth" reference (Step 03 promise)
// Shows: 📘 Deck file · Slide N   (respecting the display setting)
// ============================================================

import { BookOpen } from "lucide-react";
import type { Question } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";

export default function SourceLine({ question }: { question: Question }) {
  const { settings } = useSettings();
  if (!settings.showSourceRefs) return null;

  const file = question.source.file.replace(/\.pdf$/i, "");
  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
      <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {file}
        {question.source.slide !== undefined ? ` · Slide ${question.source.slide}` : ""}
        {question.origin === "real" ? " · Past quiz question" : ""}
      </span>
    </p>
  );
}
