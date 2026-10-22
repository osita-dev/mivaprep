// ============================================================
// EmptyState — screens 15 (No Questions) & 16 (All mastered)
// ============================================================

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  emoji: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export default function EmptyState({ emoji, title, description, actionLabel, onAction, children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="text-5xl">{emoji}</span>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-2xl">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
