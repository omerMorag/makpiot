"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Check, CloudUpload, LogIn, Pencil, RotateCcw, X } from "lucide-react";
import PrintButton from "@/components/dashboard/PrintButton";
import type { CostEstimator } from "./useCostEstimator";

function StartOverButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="no-print flex items-center gap-2 rounded-full border-2 border-warm-300 bg-warm-100/70 px-3 py-2 text-sm">
        <span className="text-ink/70">להתחיל את המחשבון מחדש?</span>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            setConfirming(false);
          }}
          className="inline-flex items-center gap-1 rounded-full bg-warm-500 px-2.5 py-1 font-semibold text-ink transition-colors hover:bg-warm-500/80"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          כן, מהתחלה
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-ink/60 transition-colors hover:bg-white/70"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          ביטול
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="no-print inline-flex items-center gap-2 rounded-full border-2 border-mist-300 bg-white px-4 py-2 text-sm font-semibold text-ink/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 hover:shadow-card"
    >
      <RotateCcw className="h-4 w-4" strokeWidth={2} />
      התחילי מחדש
    </button>
  );
}

function SaveEstimateButton({ estimator }: { estimator: CostEstimator }) {
  const { canSaveToCloud, saveStatus, saveToCloud } = estimator;

  if (!canSaveToCloud) {
    return (
      <button
        type="button"
        onClick={() => signIn("google")}
        className="no-print inline-flex items-center gap-2 rounded-full border-2 border-warm-300 bg-warm-100/70 px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-warm-100 hover:shadow-card"
      >
        <LogIn className="h-4 w-4" strokeWidth={2.25} />
        התחברי כדי לשמור את ההערכה בענן
      </button>
    );
  }

  const label =
    saveStatus === "saving"
      ? "שומרת..."
      : saveStatus === "saved"
        ? "נשמר!"
        : saveStatus === "error"
          ? "שמירה נכשלה. נסי שוב"
          : "שמרי את ההערכה";

  return (
    <button
      type="button"
      onClick={() => saveToCloud()}
      disabled={saveStatus === "saving"}
      className="no-print inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-ink shadow-card transition-colors hover:bg-teal-500 disabled:opacity-60"
    >
      <CloudUpload className="h-4 w-4" strokeWidth={2.25} />
      {label}
    </button>
  );
}

/**
 * שורת הפעולות מתחת לתוצאת המחשבון: שני את הבחירות / שמרי את ההערכה /
 * התחילי מחדש / הדפסה-שמירה כ-PDF — כפי שהתבקש. כפתור השמירה דורש התחברות
 * (מוצג כהזמנה להתחבר במקום שהוא מוסתר), שאר הפעולות עובדות במצב אורחת.
 */
export default function WizardActions({ estimator }: { estimator: CostEstimator }) {
  const { changeAnswers, reset } = estimator;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={changeAnswers}
        className="no-print inline-flex items-center gap-2 rounded-full border-2 border-mist-300 bg-white px-4 py-2 text-sm font-semibold text-ink/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 hover:shadow-card"
      >
        <Pencil className="h-4 w-4" strokeWidth={2} />
        שני את הבחירות
      </button>

      <SaveEstimateButton estimator={estimator} />

      <StartOverButton onConfirm={reset} />

      <PrintButton />
    </div>
  );
}
