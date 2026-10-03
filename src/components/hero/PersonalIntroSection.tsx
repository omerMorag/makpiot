"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

interface PersonalIntroSectionProps {
  /** ראו HeroIntro.tsx — אותו הסבר בדיוק, שום לוגיקה מקומית */
  reducedMotion: boolean;
  onCtaClick: () => void;
}

/**
 * מקטע היכרות אישי וקצר, בין מסך הפתיחה (<HeroIntro/>) לתחילת המסלול —
 * חלק רגיל מזרימת העמוד (לא modal/פופ-אפ), בלי שאלון/בחירת מסלול/דרישת
 * התחברות. הפוגה קצרה ונעימה: טיפוגרפיה קריאה, הרבה אוויר, חתימה עדינה,
 * ותרנגולת המותג בגודל קטן. המקטע תופס לפחות גובה מסך מלא (min-h-screen-safe)
 * עם ריווח נדיב למעלה ולמטה והתוכן ממורכז אנכית — כך שהוא מרגיש כ"שקופית"
 * עצמאית ולא חולף מהר מדי בגלילה.
 *
 * אנימציית הכניסה: fade+rise עדין וקצר מאוד (~150ms, הזזה זעירה) שמופעל כשהמקטע נכנס
 * בפועל לתצוגה (IntersectionObserver) — לא ב-mount כמו ב-Hero, כי המקטע
 * הזה מתחיל מתחת לקפל. חד-פעמי (לא נטען מחדש בגלילה הפוכה) ולא חוסם/מעכב
 * את הגלילה הטבעית בשום צורה — היא ממשיכה להגיב מיד לגלגלת/מגע.
 */
export default function PersonalIntroSection({ reducedMotion, onCtaClick }: PersonalIntroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} aria-label="היכרות קצרה עם מקפיאות" className="min-h-screen-safe flex items-center justify-center px-4 py-24 sm:py-32 lg:py-40">
      <div
        className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none sm:gap-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/hen-full.png"
          alt=""
          aria-hidden="true"
          className="h-12 w-auto opacity-90 sm:h-14"
        />

        <h2 className="text-2xl font-bold text-ink sm:text-3xl">טוב שהגעת</h2>

        <div className="flex flex-col gap-4 text-base leading-relaxed text-ink/75 sm:text-lg">
          <p>
            בין אם את כאן כי את חושבת על העתיד שלך, ובין אם הגעת בעקבות סיבה רפואית, הדרך להקפאת
            ביציות יכולה להעלות הרבה שאלות. גם אני מכירה את התחושה הזאת: מאיפה מתחילים, מה צריך
            לבדוק, ואיך יודעים מה השלב הבא?
          </p>
          <p>
            בדיוק בשביל זה יצרתי את מקפיאות. מקום שעושה סדר בבדיקות, באפשרויות ובשלבים, ומאפשר לך
            להתקדם צעד אחר צעד. את לא צריכה להבין הכול בבת אחת.
          </p>
        </div>

        <button
          type="button"
          onClick={onCtaClick}
          className="group mt-1 inline-flex items-center gap-2 rounded-full bg-teal-600 px-7 py-3 text-sm font-bold text-ink shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-cardHover active:translate-y-0"
        >
          מתחילה את המסלול
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
            strokeWidth={2.5}
          />
        </button>
      </div>
    </section>
  );
}
