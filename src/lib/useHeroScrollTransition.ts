"use client";

import { useCallback, useLayoutEffect, useState } from "react";

export interface HeroScrollTransition {
  /** האם לרנדר <HeroIntro/> + <PersonalIntroSection/> כלל */
  showHero: boolean;
  /** האם Sidebar/MobileHeader גלויים */
  chromeVisible: boolean;
  /** prefers-reduced-motion, נבדק ב-mount ומעודכן אם המשתמשת משנה את ההעדפה */
  reducedMotion: boolean;
  /** נקראת כשהמסלול "הושג" בפועל — גם בלחיצה על אחד מכפתורי ה-CTA וגם
   *  בהגעה בפועל לראש המסלול בגלילה טבעית (ר' AppShell.tsx). לא מסתירה את
   *  ה-Hero/מקטע ההיכרות עצמם (הם נשארים mounted מעל המסלול בטעינת העמוד
   *  הנוכחית — אין יותר spacer מלאכותי שצריך "לפנות", ר' תיעוד showHero
   *  למטה) — רק חושפת את ה-Chrome. */
  revealChrome: () => void;
  /** מדלגת מיידית על כל חוויית הפתיחה — למשל כשמתברר, אחרי סנכרון מהשרת
   *  שהושלם רק אחרי ה-mount (מכשיר חדש למשתמשת מחוברת), שהיא כבר ראתה
   *  אותה במכשיר אחר. */
  skipHero: () => void;
  /** ללחיצה על הלוגו / קישור "להכיר את מקפיאות" — "חוזרת" למסך הפתיחה, גם
   *  אם hasSeenIntro כבר true (זו רק תצוגה חוזרת מודעת, לא "שוכחת" שהיא כבר ראתה). */
  resetHero: () => void;
}

/**
 * שולט רק ב"מתי" — מתי מוצגים ה-Hero + מקטע ההיכרות האישי (כתוכן זרימה
 * רגיל, לא pin/scrub) ומתי חוזרים לראות את ה-Sidebar/Header. אנימציות
 * הכניסה העדינות (fade/rise קצר) חיות בתוך HeroIntro.tsx/PersonalIntroSection.tsx
 * עצמם; ה-hook הזה לא יודע כלום על GSAP או על scroll-trigger כלשהו —
 * הגלילה עצמה תמיד נשארת גלילה טבעית רגילה של הדפדפן.
 *
 * showHero מוכרעת **פעם אחת** ב-mount: כניסה לכתובת הראשית (בלי hash)
 * תמיד מציגה את מסך הפתיחה — גם בביקור חוזר (בקשת המשתמשת, 27.9.2026);
 * רק hash מפורש (#tests וכו') מדלג עליו. אחרי זה היא נשארת true לכל
 * אורך הביקור הנוכחי — כשה-Hero+מקטע ההיכרות הם תוכן זרימה רגיל (לא
 * pinned), אין סיבה "להסיר" אותם אחרי שהמשתמשת עברה אותם; הם פשוט נשארים
 * למעלה כמו כל תוכן אחר שגוללים מעליו.
 */
export function useHeroScrollTransition(): HeroScrollTransition {
  const [showHero, setShowHero] = useState(true);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // בדיקה ראשונית — רק hash מפורש בכתובת (כניסה ישירה ל-#tests וכו') מדלג
  // על ה-Hero. useLayoutEffect כדי שההחלטה תקרה לפני הציור הראשון.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) {
      setShowHero(false);
      setChromeVisible(true);
      return;
    }
    // כניסה לכתובת הראשית (בלי hash) — תמיד מתחילים בראש מסך הפתיחה (הלוגו),
    // גם בביקור חוזר, ומשם גוללים להיכרות. הדפדפן לא "משחזר" גלילה ישנה.
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    function handleChange(e: MediaQueryListEvent) {
      setReducedMotion(e.matches);
    }
    mq.addEventListener?.("change", handleChange);
    return () => mq.removeEventListener?.("change", handleChange);
  }, []);

  const revealChrome = useCallback(() => {
    setChromeVisible(true);
  }, []);

  const skipHero = useCallback(() => {
    setShowHero(false);
    setChromeVisible(true);
  }, []);

  const resetHero = useCallback(() => {
    setShowHero(true);
    setChromeVisible(false);
    if (typeof window !== "undefined") {
      // behavior: "instant" בכוונה, לא ברירת המחדל — globals.css מגדיר
      // `html { scroll-behavior: smooth }` גלובלית, וגלילה "רכה" כאן הייתה
      // מתנגשת עם החזרה המיידית לראש המסך שמצופה מלחיצה על הלוגו/הקישור.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return { showHero, chromeVisible, reducedMotion, revealChrome, skipHero, resetHero };
}
