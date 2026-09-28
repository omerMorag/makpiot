"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Check, Flag, X } from "lucide-react";
import { REPORT_REASON_LABELS, type CreateReportInput } from "@/lib/validation/reportSchemas";

const REASONS = Object.entries(REPORT_REASON_LABELS) as [CreateReportInput["reason"], string][];

/** כפתור "דיווח על תוכן" — מוצג על כל סיפור ציבורי. דורש התחברות. */
export default function ReportContentButton({ storyId }: { storyId: string }) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<CreateReportInput["reason"]>("inappropriate");
  const [details, setDetails] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");

  if (submitState === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-500">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        הדיווח נשלח, תודה
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => (status === "authenticated" ? setOpen(true) : signIn("google"))}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/40 transition-colors hover:text-deep"
      >
        <Flag className="h-3.5 w-3.5" strokeWidth={2.25} />
        דיווח על תוכן
      </button>
    );
  }

  const submit = async () => {
    setSubmitState("submitting");
    try {
      const res = await fetch("/api/story-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, reason, details: details.trim() || undefined }),
      });
      if (res.ok) {
        setSubmitState("done");
      } else {
        setSubmitState("error");
      }
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <div className="rounded-xl border-2 border-mist-200 bg-mist-50/60 p-3 text-xs">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink/70">מה הסיבה לדיווח?</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="ביטול">
          <X className="h-3.5 w-3.5 text-ink/40" strokeWidth={2.5} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {REASONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setReason(value)}
            className={`rounded-full px-2.5 py-1 font-semibold transition-colors ${
              reason === value ? "bg-teal-600 text-ink" : "bg-white text-ink/60 hover:bg-mist-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="פרטים נוספים (אופציונלי)"
        rows={2}
        className="mt-2 w-full rounded-lg border border-mist-200 bg-white p-2 text-xs text-ink/80 focus:border-teal-400"
      />
      {submitState === "error" && <p className="mt-1 text-deep">השליחה נכשלה. נסי שוב.</p>}
      <button
        type="button"
        onClick={submit}
        disabled={submitState === "submitting"}
        className="mt-2 rounded-full bg-teal-600 px-3 py-1.5 font-bold text-ink transition-colors hover:bg-teal-500 disabled:opacity-60"
      >
        {submitState === "submitting" ? "שולחת..." : "שליחת דיווח"}
      </button>
    </div>
  );
}
