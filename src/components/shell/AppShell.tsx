"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { useJourneyProgress } from "@/lib/useJourneyProgress";
import { useHashSection } from "@/lib/useHashSection";
import { useHeroScrollTransition } from "@/lib/useHeroScrollTransition";
import { trackSectionView } from "@/lib/analytics";
import DisclaimerFooter from "@/components/DisclaimerFooter";
import RoadmapSection from "@/components/sections/RoadmapSection";
import TestsSection from "@/components/sections/TestsSection";
import WhereToGoSection from "@/components/sections/WhereToGoSection";
import MyChancesSection from "@/components/sections/MyChancesSection";
import InjectionsSection from "@/components/sections/InjectionsSection";
import GuidesSection from "@/components/sections/GuidesSection";
import CostEstimatorSection from "@/components/sections/CostEstimatorSection";
import StoriesSection from "@/components/sections/StoriesSection";
import HeroIntro from "@/components/hero/HeroIntro";
import PersonalIntroSection from "@/components/hero/PersonalIntroSection";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";

// dynamic import + ssr:false — עמוד המודרציה לא נשלח כלל לכל מבקרת רגילה
// (רק כש-section === "admin-stories" בפועל, וגם אז רק אחרי useIsAdmin()).
const AdminStoriesSection = dynamic(() => import("@/components/sections/AdminStoriesSection"), {
  ssr: false,
});

/**
 * מעטפת האפליקציה כולה: בכניסה ראשונה (או אחרי לחיצה על "להכיר את
 * מקפיאות"/הלוגו), מוצגים ברצף רגיל של גלילה — Hero (HeroIntro) -> מקטע
 * היכרות אישי (PersonalIntroSection) -> תחילת המסלול (RoadmapSection).
 * זהו תוכן זרימה רגיל לגמרי — לא pin/scrub — כך שהגלילה עצמה תמיד מגיבה
 * מיד לגלגלת/מגע; ר' useHeroScrollTransition.ts + HeroIntro.tsx +
 * PersonalIntroSection.tsx לפירוט. זהו ה-App Shell היחיד של כל האתר;
 * העמודים הישנים (/dashboard, /where-to-go, /my-chances) רק מפנים לכאן.
 *
 * חשוב: Hero+מקטע ההיכרות מרונדרים **מחוץ** לעטיפה עם `lg:ml-[252px]`
 * (מרווח קבוע למקום ה-Sidebar) — כדי שיתפסו את כל רוחב המסך במרכז, בלי
 * להיות מוסטים ימינה בגלל מקום שמור לסיידבר שעדיין לא גלוי. RoadmapSection
 * עצמו נשאר תמיד mounted באותו מקום כמו היום (בתוך main, בתוך העטיפה
 * הממורווחת). Sidebar/MobileHeader מוסתרים בעזרת visibility (לא
 * display:none) + pointer-events כל עוד ה-Chrome עדיין לא נחשף, כדי שלא
 * יהיו נגישים/לחיצים "מבעד" למסך הפתיחה. החשיפה עצמה מונפשת (fade קצר,
 * ~200ms) במקום להופיע בבת אחת — כדי שהמעבר ממקטע ההיכרות האישי לתחילת
 * המסלול (שבו ה-Chrome נחשף) ירגיש ברור ורציף, לא כ"קפיצה" פתאומית.
 *
 * roadmapTopRef משמש שני תפקידים: (1) יעד גלילה מדויק לכפתור ה-CTA שבסוף
 * מקטע ההיכרות ("מתחילה את המסלול") — זה בדיוק התיקון לבאג שבו לחיצה נחתה
 * סמוך לסוף הצ'קליסט (הגלילה הישנה הסתמכה על מרחק ה-pin של ה-Hero, לא על
 * המיקום האמיתי של ראש המסלול); (2) IntersectionObserver שמזהה הגעה
 * בגלילה טבעית (בלי לחיצה על כפתור) לראש המסלול, כדי לחשוף את ה-Chrome
 * ולסמן hasSeenIntro גם במקרה הזה.
 *
 * personalIntroRef: יעד גלילה נפרד לכפתור ה-CTA הראשי שב-Hero ("להיכרות
 * קצרה") — הכפתור הזה **לא** מדלג ישר למסלול (זה היה הבאג: משתמשת חדשה
 * שלוחצת עליו מעולם לא ראתה את מקטע "טוב שהגעת"), אלא גולל בעדינות למקטע
 * ההיכרות האישי עצמו. רק הכפתור שבסוף אותו מקטע ("מתחילה את המסלול") ממשיך
 * הלאה ל-roadmapTopRef.
 */
export default function AppShell() {
  const progress = useJourneyProgress();
  const { section, navigate } = useHashSection();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openStepId, setOpenStepId] = useState<number | null>(null);
  const { showHero, chromeVisible, reducedMotion, revealChrome, resetHero } = useHeroScrollTransition();
  const roadmapTopRef = useRef<HTMLDivElement | null>(null);
  const personalIntroRef = useRef<HTMLDivElement | null>(null);

  // בכל מעבר בין אזורים, גוללים לראש התוכן — כמו מעבר בין "עמודים" אמיתי
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [section]);

  // סטטיסטיקה (Umami): צפייה אחת לכל כניסה לאזור — ר' lib/analytics.ts
  useEffect(() => {
    trackSectionView(section, section === "roadmap" && !window.location.hash);
  }, [section]);

  // --- "חזרה לצ'קליסט" ---
  // זוכרים איפה המשתמשת הייתה בצ'קליסט (גלילה), כדי שהכפתור יחזיר אותה
  // בדיוק לאותה נקודה ולא לראש העמוד. השלב שהיה פתוח נשמר ממילא (openStepId).
  const roadmapScrollRef = useRef(0);
  const pendingRestoreRef = useRef<number | null>(null);
  useEffect(() => {
    if (section !== "roadmap") return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        roadmapScrollRef.current = window.scrollY;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [section]);

  useEffect(() => {
    if (section !== "roadmap" || pendingRestoreRef.current == null) return;
    const y = pendingRestoreRef.current;
    pendingRestoreRef.current = null;
    // פעמיים: מיד אחרי הציור, ושוב אחרי שהתוכן (כרטיסים/התקדמות) סיים להתייצב
    const go = () => window.scrollTo({ top: y, left: 0, behavior: "instant" });
    requestAnimationFrame(go);
    setTimeout(go, 200);
  }, [section]);

  const handleBackToChecklist = useCallback(() => {
    pendingRestoreRef.current = roadmapScrollRef.current;
    navigate("roadmap");
  }, [navigate]);

  // --- לחיצה על הלוגו (§2, נפרד מ-handleGoHome/AboutLink למטה) ---
  // גוללת בדיוק לכותרת "המסלול האישי שלך" (#roadmap-title, ר' RoadmapSection.tsx)
  // ומעבירה לאזור "roadmap" אם צריך — בלי לאפס את מסך הפתיחה/מקטע ההיכרות
  // (לא קוראת ל-resetHero) ובלי לגעת בהתקדמות בכלל. pendingLogoScrollRef
  // פותר את המקרה שבו האזור עדיין לא "roadmap": navigate() רק מבקש שינוי
  // state (אסינכרוני מבחינת ה-DOM), כך שה-#roadmap-title עוד לא קיים
  // בפועל ברגע הלחיצה עצמה — הדגל מסמן "לגלול ברגע שהאזור יהפוך לroadmap",
  // וה-useEffect שלמטה (תלוי ב-section, אחרי effect הגלילה-לראש הרגיל
  // למעלה) מבצע את הגלילה המדויקת אחרי שהתוכן כבר מורנדר.
  const pendingLogoScrollRef = useRef(false);

  const scrollToRoadmapTitle = useCallback(() => {
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
    document.getElementById("roadmap-title")?.scrollIntoView({ behavior, block: "start" });
  }, [reducedMotion]);

  useEffect(() => {
    if (section === "roadmap" && pendingLogoScrollRef.current) {
      pendingLogoScrollRef.current = false;
      scrollToRoadmapTitle();
    }
  }, [section, scrollToRoadmapTitle]);

  const handleLogoClick = useCallback(() => {
    if (section === "roadmap") {
      scrollToRoadmapTitle();
    } else {
      pendingLogoScrollRef.current = true;
      navigate("roadmap");
    }
  }, [section, navigate, scrollToRoadmapTitle]);

  // "הושג המסלול" — גם בלחיצה על אחד מכפתורי ה-CTA וגם בהגעה בגלילה
  // טבעית: חושף את ה-Chrome ומסמנת hasSeenIntro (פעם אחת, אידמפוטנטית).
  // בכוונה **לא** קורה רק כי העמוד נטען — ר' דרישת "אל תסמן רק בגלל שעמוד
  // הבית נטען".
  const handleReachedRoadmap = useCallback(() => {
    revealChrome();
    progress.markIntroSeen();
    // progress.markIntroSeen עצמה יציבה (useCallback עם deps ריק בתוך
    // useJourneyProgress) — progress כאובייקט משתנה בכל render בכוונה
    // אינו נכלל, כדי שלא ליצור מחדש את ה-callback הזה (ואת ה-IntersectionObserver
    // שתלוי בו למטה) בכל רינדור.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealChrome, progress.markIntroSeen]);

  // כפתור ה-CTA שבסוף מקטע ההיכרות ("מתחילה את המסלול") — גלילה מדויקת
  // לראש המסלול בפועל (roadmapTopRef), לא להערכה/מרחק מחושב כלשהו. מכבדת
  // prefers-reduced-motion.
  const scrollToRoadmap = useCallback(() => {
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
    roadmapTopRef.current?.scrollIntoView({ behavior, block: "start" });
  }, [reducedMotion]);

  const handleStartJourney = useCallback(() => {
    handleReachedRoadmap();
    scrollToRoadmap();
  }, [handleReachedRoadmap, scrollToRoadmap]);

  // כפתור ה-CTA הראשי ב-Hero ("להיכרות קצרה") — גולל בעדינות למקטע ההיכרות
  // האישי עצמו, **לא** למסלול (זה התיקון לבאג: לחיצה כאן כבר לא מדלגת על
  // "טוב שהגעת"). לא נוגע ב-Chrome/hasSeenIntro — אלה נחשפים רק כשמגיעים
  // בפועל לראש המסלול (handleStartJourney/IntersectionObserver למטה).
  const scrollToPersonalIntro = useCallback(() => {
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
    personalIntroRef.current?.scrollIntoView({ behavior, block: "start" });
  }, [reducedMotion]);

  // הגעה לראש המסלול ע"י גלילה טבעית (בלי לחיצה על כפתור כלל) — פעיל רק
  // כל עוד ה-Hero מוצג וה-Chrome עדיין לא נחשף; מתנתק אוטומטית ברגע
  // שהמצב משתנה (cleanup בכל שינוי deps), כך שלא ממשיך "להאזין" לשווא.
  //
  // rootMargin שלילי בתחתית ("-60%") — לא threshold:0 סתם — כדי שהגעה
  // תיחשב רק כשראש המסלול נכנס בפועל לרבע העליון של המסך, לא כשהוא רק
  // "מציץ" בקצה התחתון. חשוב במיוחד עכשיו: מקטע ההיכרות (<PersonalIntroSection/>)
  // קצר יותר מגובה המסך במסכים גבוהים, כך שבלי המרווח הזה, עצם הנחיתה על
  // ראשו (בלחיצה על כפתור ה-Hero, ר' scrollToPersonalIntro) הייתה חושפת
  // מיד את ה-Chrome ומסמנת hasSeenIntro — עוד לפני שהמשתמשת קראה משהו או
  // לחצה על הכפתור של מקטע ההיכרות עצמו.
  useEffect(() => {
    if (!showHero || chromeVisible || section !== "roadmap") return;
    const el = roadmapTopRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) handleReachedRoadmap();
      },
      { threshold: 0, rootMargin: "0px 0px -60% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showHero, chromeVisible, section, handleReachedRoadmap]);

  const openStep = (id: number | null) => {
    setOpenStepId(id);
  };

  // קישור "להכיר את מקפיאות" (AboutLink) בלבד — "חוזר הביתה": גם חוזר
  // לאזור "המסלול שלי" וגם מפעיל מחדש את מסך הפתיחה + מקטע ההיכרות מעליו
  // (תצוגה חוזרת מודעת — לא "שוכחת" ש-hasSeenIntro כבר סומן). הלוגו עצמו
  // **לא** משתמש בזה יותר — ר' handleLogoClick למעלה, שגולל למסלול בלי
  // לאפס את מסך הפתיחה.
  const handleGoHome = () => {
    resetHero();
    navigate("roadmap");
  };

  return (
    <div className="min-h-screen bg-mist-50/40">
      <div
        className={`transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          chromeVisible ? "opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
        aria-hidden={!chromeVisible}
      >
        <Sidebar
          section={section}
          progress={progress}
          onNavigate={navigate}
          onLogoClick={handleLogoClick}
          onGoHome={handleGoHome}
        />
        <MobileHeader onMenuClick={() => setDrawerOpen(true)} onLogoClick={handleLogoClick} />
      </div>
      <MobileDrawer
        open={drawerOpen}
        section={section}
        progress={progress}
        onNavigate={navigate}
        onClose={() => setDrawerOpen(false)}
        onLogoClick={handleLogoClick}
        onGoHome={handleGoHome}
      />

      {/* Hero + מקטע ההיכרות — תוכן זרימה רגיל, full-bleed מחוץ למרווח
          הסיידבר (הוא ממילא מוסתר כל עוד showHero פעיל). מוצגים רק באזור
          "roadmap" — כניסה ישירה ל-#tests/#where-to-go/#guides וכו' מדלגת
          עליהם לגמרי (showHero כבר false במקרה הזה, ר' useHeroScrollTransition). */}
      {section === "roadmap" && showHero && (
        <>
          <HeroIntro reducedMotion={reducedMotion} onCtaClick={scrollToPersonalIntro} />
          <div ref={personalIntroRef}>
            <PersonalIntroSection reducedMotion={reducedMotion} onCtaClick={handleStartJourney} />
          </div>
        </>
      )}

      <div className="lg:mr-0 lg:ml-[252px]">
        {/* pt-[4.75rem]/sm:pt-[5.5rem] מפצים על ה-MobileHeader הקבוע (fixed,
            h-14/sm:h-16 = 3.5rem/4rem) שאינו תורם גובה לזרימת המסמך —
            בלעדיהם, תוכן שמתחיל ממש בראש main (למשל כותרת "הבדיקות שלי"
            בקישור hash ישיר) היה נכנס מתחת ל-header. מ-lg ומעלה ה-header
            מוסתר (lg:hidden) אז lg:py-12 חוזר לריפוד סימטרי רגיל. */}
        <main className="mx-auto max-w-4xl px-3.5 pb-6 pt-[4.75rem] sm:px-6 sm:pb-9 sm:pt-[5.5rem] lg:py-12">
          {section !== "roadmap" && (
            <button
              type="button"
              onClick={handleBackToChecklist}
              className="no-print mb-4 inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink/75 shadow-sm ring-1 ring-inset ring-mist-200 transition-colors hover:bg-mist-50 hover:text-ink sm:mb-5"
              data-testid="back-to-checklist"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              חזרה לצ׳קליסט שלי
            </button>
          )}
          {section === "roadmap" && (
            <div ref={roadmapTopRef}>
              <RoadmapSection progress={progress} openStepId={openStepId} onOpenStep={openStep} />
            </div>
          )}
          {section === "tests" && <TestsSection progress={progress} />}
          {section === "where-to-go" && <WhereToGoSection progress={progress} />}
          {section === "my-chances" && <MyChancesSection />}
          {section === "cost-estimator" && <CostEstimatorSection />}
          {section === "stories" && <StoriesSection />}
          {section === "admin-stories" && <AdminStoriesSection />}
          {section === "guides" && <GuidesSection />}
          {section === "injections" && <InjectionsSection />}
        </main>

        <DisclaimerFooter />
      </div>
    </div>
  );
}
