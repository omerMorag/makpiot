"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { CONSENT_TEXT } from "@/lib/validation/storySchemas";

const AGE_RANGES = ["<30", "30-34", "35-37", "38-40", "41+"];
const HMOS: [string, string][] = [
  ["clalit", "כללית"],
  ["maccabi", "מכבי"],
  ["meuhedet", "מאוחדת"],
  ["leumit", "לאומית"],
  ["none", "ללא קופה"],
  ["other", "אחר"],
];
const TREATMENT_ROUTES: [string, string][] = [
  ["public", "ציבורי"],
  ["private", "פרטי"],
  ["not_specified", "מעדיפה לא לציין"],
];

export interface ShareStoryFormValues {
  isAnonymous: boolean;
  displayName: string;
  title: string;
  storyText: string;
  personalTip: string;
  ageRange: string;
  hmo: string;
  clinic: string;
  region: string;
  treatmentRoute: string;
  cyclesCount: string;
  retrievedCount: string;
  frozenCount: string;
}

const MIN_TITLE_LENGTH = 2;
const MIN_STORY_LENGTH = 20;

const EMPTY_VALUES: ShareStoryFormValues = {
  isAnonymous: false,
  displayName: "",
  title: "",
  storyText: "",
  personalTip: "",
  ageRange: "",
  hmo: "",
  clinic: "",
  region: "",
  treatmentRoute: "",
  cyclesCount: "",
  retrievedCount: "",
  frozenCount: "",
};

function inputClass() {
  return "w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-ink/80 transition-colors focus:border-teal-400";
}

function buildPayload(values: ShareStoryFormValues) {
  return {
    isAnonymous: values.isAnonymous,
    displayName: values.isAnonymous ? undefined : values.displayName.trim() || undefined,
    title: values.title.trim(),
    storyText: values.storyText.trim(),
    personalTip: values.personalTip.trim() || undefined,
    ageRange: values.ageRange || undefined,
    hmo: values.hmo || undefined,
    clinic: values.clinic.trim() || undefined,
    region: values.region || undefined,
    treatmentRoute: values.treatmentRoute || undefined,
    cyclesCount: values.cyclesCount ? Number(values.cyclesCount) : undefined,
    retrievedCount: values.retrievedCount ? Number(values.retrievedCount) : undefined,
    frozenCount: values.frozenCount ? Number(values.frozenCount) : undefined,
  };
}

interface ShareStoryFormProps {
  mode: "create" | "edit";
  storyId?: string;
  initialValues?: Partial<ShareStoryFormValues>;
  onSuccess: () => void;
  onCancel?: () => void;
}

/**
 * טופס שיתוף/עריכת סיפור — משמש גם ליצירה (mode="create", POST /api/stories,
 * דורש אישור הסכמה) וגם לעריכה (mode="edit", PATCH /api/stories/mine/[id],
 * בלי צ'קבוקס הסכמה מחדש — הסכמה כבר ניתנה ביצירה). אותה סכימת שדות בדיוק
 * כמו בשרת (storyInputSchema/storyEditSchema).
 */
export default function ShareStoryForm({ mode, storyId, initialValues, onSuccess, onCancel }: ShareStoryFormProps) {
  const [values, setValues] = useState<ShareStoryFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [consent, setConsent] = useState(mode === "edit");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const update = <K extends keyof ShareStoryFormValues>(key: K, value: ShareStoryFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const titleLength = values.title.trim().length;
  const storyLength = values.storyText.trim().length;
  const titleTooShort = titleLength > 0 && titleLength < MIN_TITLE_LENGTH;
  const storyTooShort = storyLength > 0 && storyLength < MIN_STORY_LENGTH;
  const canSubmit = titleLength >= MIN_TITLE_LENGTH && storyLength >= MIN_STORY_LENGTH && consent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      // כפתור השליחה עלול להיות disabled גם כש-consent חסר — כאן מציגים סיבה
      // ממוקדת כשהחסימה היא אורך הטקסט, כדי שלא יישאר בלי שום הסבר (§ באג
      // שדווח: "לא נותן לפרסם" בלי שום אינדיקציה מדוע).
      if (titleLength < MIN_TITLE_LENGTH) {
        setErrorMessage(`הכותרת קצרה מדי. נדרשים לפחות ${MIN_TITLE_LENGTH} תווים.`);
      } else if (storyLength < MIN_STORY_LENGTH) {
        setErrorMessage(`הסיפור קצר מדי. נדרשים לפחות ${MIN_STORY_LENGTH} תווים (יש כרגע ${storyLength}).`);
      } else if (!consent) {
        setErrorMessage("יש לאשר את הסכמת הפרסום לפני השליחה.");
      }
      return;
    }
    setSubmitState("submitting");
    setErrorMessage(null);

    try {
      const payload = buildPayload(values);
      const res = await fetch(mode === "create" ? "/api/stories" : `/api/stories/mine/${storyId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "create" ? { ...payload, consent: true } : payload),
      });

      if (!res.ok) {
        setSubmitState("error");
        setErrorMessage("השליחה נכשלה. בדקי שהכותרת והסיפור מלאים כנדרש ונסי שוב.");
        return;
      }

      if (mode === "create") {
        setSubmitState("done");
      } else {
        onSuccess();
      }
    } catch {
      setSubmitState("error");
      setErrorMessage("השליחה נכשלה. נסי שוב.");
    }
  };

  if (submitState === "done") {
    return (
      <div className="rounded-2xl border-2 border-warm-300 bg-warm-100/40 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-warm-500" strokeWidth={2} />
        <p className="mt-3 text-sm font-semibold text-ink">
          תודה ששיתפת. הסיפור שלך נשלח לבדיקה ויפורסם לאחר אישור.
        </p>
        <button
          type="button"
          onClick={onSuccess}
          className="mt-4 rounded-full border-2 border-mist-300 bg-white px-4 py-2 text-sm font-semibold text-ink/70 transition-colors hover:border-teal-300 hover:text-teal-700"
        >
          סגירה
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          id="isAnonymous"
          type="checkbox"
          checked={values.isAnonymous}
          onChange={(e) => update("isAnonymous", e.target.checked)}
          className="h-4 w-4 accent-teal-600"
        />
        <label htmlFor="isAnonymous" className="text-sm text-ink/70">
          לפרסם בעילום שם
        </label>
      </div>

      {!values.isAnonymous && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/55">שם תצוגה (אופציונלי)</label>
          <input
            type="text"
            value={values.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            maxLength={60}
            className={inputClass()}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/55">כותרת *</label>
        <input
          type="text"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          maxLength={150}
          required
          className={inputClass()}
        />
        {titleTooShort && (
          <p className="mt-1 text-xs font-semibold text-deep">
            נדרשים לפחות {MIN_TITLE_LENGTH} תווים (יש כרגע {titleLength}).
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/55">טווח גיל (אופציונלי)</label>
          <select value={values.ageRange} onChange={(e) => update("ageRange", e.target.value)} className={inputClass()}>
            <option value="">מעדיפה לא לציין</option>
            {AGE_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/55">קופת חולים (אופציונלי)</label>
          <select value={values.hmo} onChange={(e) => update("hmo", e.target.value)} className={inputClass()}>
            <option value="">מעדיפה לא לציין</option>
            {HMOS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/55">מרפאה/בית חולים (אופציונלי)</label>
          <input type="text" value={values.clinic} onChange={(e) => update("clinic", e.target.value)} maxLength={200} className={inputClass()} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/55">מסלול (אופציונלי)</label>
          <select
            value={values.treatmentRoute}
            onChange={(e) => update("treatmentRoute", e.target.value)}
            className={inputClass()}
          >
            <option value="">מעדיפה לא לציין</option>
            {TREATMENT_ROUTES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/55">מספר סבבים (אופציונלי)</label>
          <input
            type="number"
            min={0}
            max={50}
            dir="ltr"
            value={values.cyclesCount}
            onChange={(e) => update("cyclesCount", e.target.value)}
            className={inputClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/55">ביציות שנשאבו (אופציונלי)</label>
          <input
            type="number"
            min={0}
            max={200}
            dir="ltr"
            value={values.retrievedCount}
            onChange={(e) => update("retrievedCount", e.target.value)}
            className={inputClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/55">ביציות שהוקפאו (אופציונלי)</label>
          <input
            type="number"
            min={0}
            max={200}
            dir="ltr"
            value={values.frozenCount}
            onChange={(e) => update("frozenCount", e.target.value)}
            className={inputClass()}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/55">הסיפור שלך *</label>
        <textarea
          value={values.storyText}
          onChange={(e) => update("storyText", e.target.value)}
          rows={8}
          maxLength={8000}
          required
          className={inputClass()}
        />
        {/* מונה תווים חי + סף מינימום — לפני התיקון הכפתור היה פשוט disabled
            בלי שום הסבר כשהסיפור קצר מ-20 תווים (הבאג שדווח). מוצג תמיד
            (לא רק כשקצר מדי) כדי שהדרישה תהיה גלויה מראש, לא רק אחרי כישלון. */}
        <p className={`mt-1 text-xs ${storyTooShort ? "font-semibold text-deep" : "text-ink/40"}`}>
          {storyLength} תווים
          {storyTooShort
            ? `, נדרשים לפחות ${MIN_STORY_LENGTH} (עוד ${MIN_STORY_LENGTH - storyLength})`
            : ` (מינימום ${MIN_STORY_LENGTH})`}
        </p>
      </div>

      {mode === "create" && (
        <div className="flex items-start gap-2 rounded-xl border-2 border-mist-200 bg-mist-50/60 p-3">
          <input
            id="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 accent-teal-600"
          />
          <label htmlFor="consent" className="text-xs leading-relaxed text-ink/70">
            {CONSENT_TEXT}
          </label>
        </div>
      )}

      {errorMessage && <p className="text-xs font-semibold text-deep">{errorMessage}</p>}

      <div className="flex items-center gap-2.5">
        <button
          type="submit"
          disabled={!canSubmit || submitState === "submitting"}
          className="rounded-full bg-teal-600 px-6 py-2.5 text-sm font-bold text-ink shadow-card transition-colors hover:bg-teal-500 disabled:opacity-50"
        >
          {submitState === "submitting" ? "שולחת..." : mode === "create" ? "שליחת הסיפור" : "שמירת שינויים"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:text-ink/80"
          >
            ביטול
          </button>
        )}
      </div>
    </form>
  );
}
