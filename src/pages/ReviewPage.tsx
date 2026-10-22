// ============================================================
// ReviewPage — design screens 10 (browse) · 11 (card list) ·
// 12 (card revealed). Flashcard-style study, no scoring (07-E).
// ============================================================

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBank } from "@/context/BankContext";
import { useProgress } from "@/context/ProgressContext";
import MasteryBadge from "@/components/MasteryBadge";
import SourceLine from "@/components/SourceLine";
import EmptyState from "@/components/EmptyState";
import { OPTION_LETTERS } from "@/lib/engines/quizEngine";
import type { Question } from "@/lib/types";

interface TopicGroup {
  topic: string;
  week: number;
  cards: Question[];
  mastered: number;
}

export default function ReviewPage() {
  const { questions, bank } = useBank();
  const { mastery } = useProgress();
  const [weekFilter, setWeekFilter] = useState<number | null>(null); // null = all
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);

  const groups = useMemo<TopicGroup[]>(() => {
    const filtered = questions.filter((q) => weekFilter === null || q.week === weekFilter);
    const byTopic = new Map<string, TopicGroup>();
    for (const q of filtered) {
      const g = byTopic.get(q.topic) ?? { topic: q.topic, week: q.week, cards: [], mastered: 0 };
      g.cards.push(q);
      if (mastery[q.id]?.status === "mastered") g.mastered++;
      byTopic.set(q.topic, g);
    }
    return Array.from(byTopic.values()).sort((a, b) => a.week - b.week || a.topic.localeCompare(b.topic));
  }, [questions, weekFilter, mastery]);

  const activeGroup = openTopic ? groups.find((g) => g.topic === openTopic) ?? null : null;
  const activeCard = activeGroup && cardIndex !== null ? activeGroup.cards[cardIndex] : null;

  const openCard = (i: number) => {
    setCardIndex(i);
    setFlipped(false);
  };

  const moveCard = (dir: number) => {
    if (!activeGroup || cardIndex === null) return;
    const next = cardIndex + dir;
    if (next >= 0 && next < activeGroup.cards.length) {
      setCardIndex(next);
      setFlipped(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Layers className="h-6 w-6 text-primary" /> Review Mode
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse flashcards — tap a card to reveal the answer.</p>
      </div>

      {/* Week filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setWeekFilter(null);
            setOpenTopic(null);
          }}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            weekFilter === null ? "border-primary bg-primary text-white" : "border-border bg-card"
          }`}
        >
          All
        </button>
        {(bank?.weeks ?? []).map((w) => (
          <button
            key={w.week}
            onClick={() => {
              setWeekFilter(w.week);
              setOpenTopic(null);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              weekFilter === w.week ? "border-primary bg-primary text-white" : "border-border bg-card"
            }`}
          >
            W{w.week}
          </button>
        ))}
      </div>

      {/* Topic list (10) or card list (11) */}
      {!activeGroup ? (
        <div className="space-y-3">
          {groups.length === 0 && (
            <EmptyState emoji="🗂️" title="Nothing to review" description="No cards match this filter yet." />
          )}
          {groups.map((g, i) => (
            <motion.button
              key={g.topic}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => {
                setOpenTopic(g.topic);
                setCardIndex(null);
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Layers className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{g.topic}</p>
                <p className="text-xs text-muted-foreground">
                  Week {g.week} · {g.cards.length} cards · {g.mastered} mastered
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              setOpenTopic(null);
              setCardIndex(null);
            }}
            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> All topics
          </button>
          <p className="mb-3 text-sm font-bold">
            {activeGroup.topic} · {activeGroup.cards.length} cards
          </p>
          <div className="space-y-3">
            {activeGroup.cards.map((q, i) => (
              <button
                key={q.id}
                onClick={() => openCard(i)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <p className="line-clamp-2 min-w-0 flex-1 text-sm">{q.stem}</p>
                <MasteryBadge state={mastery[q.id]} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card revealed modal (12) — tap to flip */}
      {activeGroup && activeCard && cardIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6" onClick={() => setCardIndex(null)}>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between text-white">
              <p className="text-sm font-semibold">
                Card {cardIndex + 1} of {activeGroup.cards.length}
              </p>
              <button onClick={() => setCardIndex(null)} aria-label="Close card">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="[perspective:1200px]">
              <motion.div
                className="relative min-h-[340px] w-full cursor-pointer [transform-style:preserve-3d]"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => setFlipped((f) => !f)}
              >
                {/* Front — question */}
                <div className="absolute inset-0 flex flex-col justify-center rounded-3xl bg-card p-6 shadow-xl [backface-visibility:hidden]">
                  <p className="text-[11px] font-semibold text-muted-foreground">QUESTION</p>
                  <p className="mt-3 text-base font-semibold leading-relaxed">{activeCard.stem}</p>
                  <p className="mt-auto pt-4 text-center text-xs text-muted-foreground">Tap to reveal answer ↻</p>
                </div>

                {/* Back — answer */}
                <div className="absolute inset-0 flex flex-col rounded-3xl bg-emerald-50 p-6 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <p className="text-[11px] font-semibold text-emerald-700">ANSWER</p>
                  <p className="mt-3 text-lg font-bold text-emerald-800">
                    {OPTION_LETTERS[activeCard.correctIndex]}. {activeCard.options[activeCard.correctIndex]}
                  </p>
                  <div className="mt-4 border-t border-emerald-200 pt-3">
                    <p className="text-sm leading-relaxed text-foreground/80">{activeCard.explanation}</p>
                    <SourceLine question={activeCard} />
                  </div>
                  <p className="mt-auto pt-4 text-center text-xs text-muted-foreground">Tap to see question ↻</p>
                </div>
              </motion.div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                disabled={cardIndex === 0}
                onClick={() => moveCard(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-white/90">← swipe with arrows →</span>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                disabled={cardIndex === activeGroup.cards.length - 1}
                onClick={() => moveCard(1)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
