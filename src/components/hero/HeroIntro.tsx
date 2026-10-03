"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface HeroIntroProps {
  /** true כש-prefers-reduced-motion פעיל — מבטל את אנימציית הכניסה העדינה
   *  בלבד (התוכן פשוט מופיע ישר, בלי fade/rise). שום שינוי מבני אחר. */
  reducedMotion: boolean;
  /** נקראת בלחיצה על כפתור ה-CTA — גוללת למקטע ההיכרות האישי (לא למסלול!
   *  ר' AppShell.tsx: scrollToPersonalIntro). הרכיב הזה לא יודע כלום על
   *  "מה קורה אז" מעבר לזה. */
  onCtaClick: () => void;
}

/**
 * מסך הכניסה ("Hero"): כרזה עריכתית מינימלית — התרנגולת הראשית הקיימת של
 * המותג (public/brand/hen-full.png), הוורדמארק "מקפיאות", משפט הסבר קצר,
 * וכפתור CTA. אין כאן cards/gradients/כפתור ענק — רק טיפוגרפיה, קומפוזיציה
 * ומרווח.
 *
 * פריסה: מ-lg ומעלה שתי עמודות זו-לצד-זו — התרנגולת בצד שמאל, התוכן
 * (כותרת/טקסט/כפתור) בצד ימין. מתחת ל-lg הכול נערם אנכית, תרנגולת למעלה.
 * מושג ב-DOM אחד (content קודם, hen אחריו) + flex-col-reverse עם
 * lg:flex-row: ב-RTL, flex-row מציב את איבר ה-DOM הראשון (content) בקצה
 * ה"התחלה" (ימין) ואת השני (hen) ב"סוף" (שמאל) — בלי צורך ב-order/ריוורס
 * נפרד; column-reverse במובייל הופך את אותו סדר DOM כך שה-hen (אחרון ב-DOM)
 * מוצג ראשון (למעלה) והתוכן (ראשון ב-DOM) מוצג אחריו (למטה).
 *
 * תוכן זרימה רגיל לגמרי — לא pinned ולא scroll-scrubbed. גלילה (גלגלת/
 * מגע) תמיד מגיבה מיד ומעבירה טבעית למקטע הבא (<PersonalIntroSection/>,
 * ואז המסלול); שום דבר כאן לא "תופס" את הגלילה. האנימציה היחידה היא כניסה
 * עדינה חד-פעמית ב-mount (fade+rise קצר מאוד, ~150ms, הזזה זעירה) — לא
 * קשורה לסקרול בכלל, ולא משאירה את המסך ריק (המצב ההתחלתי הוא רק opacity
 * מעט מוחלש, לא תוכן חסר).
 *
 * כפתור ה-CTA תמיד "להיכרות קצרה" (לא משתנה לפי ביקור חוזר) — הוא גולל
 * למקטע ההיכרות האישי מתחתיו, לא למסלול (ר' AppShell.tsx). כדי שהגלילה
 * הזאת תרגיש טבעית ולא כמו "עמוד סגור לגמרי", הגובה בדסקטופ (lg ומעלה)
 * מעט נמוך מ-100% (h-hero-safe, ר' globals.css) כך שקצה מקטע ההיכרות
 * "מציץ" בתחתית המסך; במובייל הגובה נשאר מלא (בלי דחיסת תוכן) — שם רמז
 * הגלילה העדין בתחתית המסך ("ממשיכים למטה" + חץ) הוא שמסמן שיש עוד.
 */
export default function HeroIntro({ reducedMotion, onCtaClick }: HeroIntroProps) {
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    // פריים אחד אחרי ה-mount, כדי שהדפדפן יספיק לצייר את המצב ההתחלתי
    // (opacity:0) לפני שה-transition מתחיל — אחרת אין מה להנפיש.
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [reducedMotion]);

  return (
    <section
      aria-label="מקפיאות: מסך פתיחה"
      className="h-hero-safe relative flex items-center justify-center px-4 sm:px-6"
    >
      <div
        className="flex w-full max-w-5xl flex-col-reverse items-center gap-7 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none sm:gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-16"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
        }}
      >
        {/* עמודת התוכן — ראשונה ב-DOM: ב-lg יושבת מימין (RTL start), במובייל
            מוצגת שנייה (למטה) בזכות column-reverse. */}
        <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:gap-6 lg:text-right">
          <h1
            className="text-ink"
            style={{
              fontWeight: 300,
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            <span className="block text-[2.75rem] sm:text-[3.25rem] lg:text-[4.5rem]">מקפיאות</span>
          </h1>

          <p className="max-w-xs text-lg text-ink/70 sm:max-w-sm sm:text-xl lg:max-w-md">
            עושות סדר בדרך להקפאת ביציות.
          </p>

          <button
            type="button"
            onClick={onCtaClick}
            className="group mt-1 inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-6 py-2.5 text-sm font-bold text-ink shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-cardHover active:translate-y-0"
          >
            להיכרות קצרה
            <ChevronDown
              className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
              strokeWidth={2.5}
            />
          </button>
        </div>

        {/* התרנגולת — שנייה ב-DOM: ב-lg יושבת משמאל (RTL end), במובייל
            מוצגת ראשונה (למעלה) בזכות column-reverse. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/hen-full.png"
          alt="מקפיאות: תרנגולת המותג"
          className="hen-breathe h-auto w-36 max-w-full shrink-0 object-contain sm:w-44 lg:w-[280px]"
          style={{ filter: "drop-shadow(0 16px 28px rgba(36, 22, 25, 0.14))" }}
        />
      </div>

      {/* רמז גלילה עדין — "יש עוד למטה". קבוע בתחתית המסך (לא חלק מהעמודה
          הממורכזת מעליו), כדי שיישאר גלוי גם בדסקטופ (שם הגובה כבר מקוצר
          קצת, ר' h-hero-safe) וגם במובייל (שם זה הרמז החזותי היחיד לכך
          שאפשר להמשיך לגלול, הגובה שם נשאר מלא ולא נדחס). aria-hidden כי
          זה רמז חזותי גרידא, לא תוכן/פעולה. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 text-ink/40 transition-opacity duration-300 sm:bottom-5 lg:bottom-7"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      >
        <span className="text-xs font-medium tracking-wide">ממשיכים למטה</span>
        <ChevronDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" strokeWidth={2.5} />
      </div>
    </section>
  );
}
