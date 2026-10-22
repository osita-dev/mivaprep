// ============================================================
// OptionList — the A–D answer options (design screens 4 & 7)
// Handles selection, exam privacy, and practice instant
// feedback (correct green / wrong red + explanation target).
// ============================================================

import { Check, X } from "lucide-react";
import type { Question } from "@/lib/types";
import { OPTION_LETTERS } from "@/lib/engines/quizEngine";

interface Props {
  question: Question;
  value: number | undefined;
  onChange?: (index: number) => void;
  /** Practice mode: reveal correctness immediately */
  revealed?: boolean;
  disabled?: boolean;
}

export default function OptionList({ question, value, onChange, revealed = false, disabled = false }: Props) {
  return (
    <div className="space-y-2.5">
      {question.options.map((option, i) => {
        const isSelected = value === i;
        const isCorrect = i === question.correctIndex;
        const showAsCorrect = revealed && isCorrect;
        const showAsWrong = revealed && isSelected && !isCorrect;

        let stateClass =
          "border-border bg-card hover:border-primary/40";
        if (!revealed && isSelected) stateClass = "border-primary bg-primary/5";
        if (showAsCorrect) stateClass = "border-emerald-500 bg-emerald-50";
        if (showAsWrong) stateClass = "border-red-500 bg-red-50";

        return (
          <button
            key={i}
            type="button"
            disabled={disabled || revealed}
            onClick={() => onChange?.(i)}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-colors ${stateClass} ${
              disabled || revealed ? "cursor-default" : ""
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                showAsCorrect
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : showAsWrong
                    ? "border-red-500 bg-red-500 text-white"
                    : isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border text-muted-foreground"
              }`}
            >
              {showAsCorrect ? <Check className="h-4 w-4" /> : showAsWrong ? <X className="h-4 w-4" /> : OPTION_LETTERS[i]}
            </span>
            <span className={`text-sm leading-snug ${isSelected || showAsCorrect ? "font-medium" : ""}`}>
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}
