"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function LowReserveCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-2xl border-2 border-warm-300/70 bg-warm-100/60 p-5 sm:p-6">
      <h3 className="font-sans text-base font-bold tracking-tight text-ink sm:text-lg">
        קיבלת מספר קטן ממה שקיווית? זה לא אומר שנכשלת
      </h3>

      <div className="mt-2.5 space-y-2.5 text-sm leading-relaxed text-ink/70 sm:text-[15px]">
        <p>
          נשים רבות עם רזרבה שחלתית נמוכה מקבלות מספר קטן יחסית של ביציות בכל שאיבה. רזרבה
          נמוכה מתארת בעיקר את כמות הביציות שהשחלות עשויות להפיק בתגובה לטיפול. היא אינה
          קובעת לבדה את איכות הביציות ואינה יכולה לנבא לבדה אם תהיה לידת חי.
        </p>
        <p>
          הגיל בזמן השאיבה הוא גורם מרכזי בהערכת הסיכוי של הביציות, וגם מספר קטן של ביציות
          בשלות הוא בעל משמעות. כל ביצית שהוקפאה היא אפשרות נוספת שלא הייתה קודם.
        </p>
        <p>
          לפעמים הדרך ליעד כוללת יותר מסבב אחד, ולפעמים מחליטים לעצור לפני שמגיעים למספר
          שתוכנן. אין מספר שמגדיר הצלחה, ואין תוצאה שאומרת משהו על הערך שלך, על הנשיות שלך
          או על העתיד שלך.
        </p>
      </div>

      <p className="mt-3 rounded-xl bg-white/70 p-3.5 text-sm font-semibold leading-relaxed text-ink">
        רזרבה נמוכה אינה שווה לאפס סיכוי, ומספר קטן אינו מספר חסר משמעות.
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="low-reserve-more"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
        קראי עוד על רזרבה שחלתית
      </button>

      <div
        id="low-reserve-more"
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <p className="rounded-xl bg-white/70 p-3.5 text-sm leading-relaxed text-ink/70">
            בדיקות כמו AMH וספירת זקיקים מסייעות בעיקר להעריך את התגובה הצפויה לגירוי ואת
            מספר הביציות שעשוי להתקבל. לפי ASRM, אין כיום מספיק ראיות לכך שבדיקות רזרבה
            שחלתית יכולות לנבא באופן עצמאי את הסיכוי ללידת חי לאחר הקפאת ביציות, ללא קשר
            לגיל.
          </p>
        </div>
      </div>
    </div>
  );
}
