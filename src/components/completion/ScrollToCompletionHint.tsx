"use client";

import { ChevronDown } from "lucide-react";

/** טקסט מדויק כפי שהתבקש — שם נגיש (aria-label) שדורס את הטקסט הנראה */
const ACCESSIBLE_LABEL = "מעבר למסך סיום המסלול";
/* הטקסט הנראה — לא נשמר מילה במילה בעקבות דחיסת השיחה (ראו הערה דומה
   ב-CompletionCelebration.tsx); נוסח בהתאמה לטון האתר, קל לעדכן כאן. */
const VISIBLE_TEXT = "סיימת את כל השלבים! גללי למטה כדי לחגוג";

/**
 * רמז גלילה קטן ונגיש, מוצג מיד אחרי הצ'קליסט כשכל השלבים הושלמו — לפני
 * מסך הסיום החגיגי עצמו (CompletionCelebration), כדי שהמעבר אליו לא יהיה
 * מפתיע. כפתור אמיתי (לא div עם onClick) לנגישות מקלדת/פוקוס טבעית; החץ
 * המונפש משתמש ב-animate-bounce הקיים של Tailwind (כמו ב-IntroScreen),
 * עם motion-reduce:animate-none כדי לכבד prefers-reduced-motion.
 */
export default function ScrollToCompletionHint() {
  return (
    <div className="no-print mt-6 flex justify-center sm:mt-8">
      <button
        type="button"
        aria-label={ACCESSIBLE_LABEL}
        onClick={() => {
          document.getElementById("completion-celebration")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="inline-flex flex-col items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-bold text-teal-700 transition-colors hover:text-teal-800"
      >
        <span>{VISIBLE_TEXT}</span>
        <ChevronDown className="h-5 w-5 motion-reduce:animate-none animate-bounce" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
}
