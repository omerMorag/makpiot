"use client";

import type { JourneyProgress } from "@/lib/useJourneyProgress";
import TestChecklist from "@/components/dashboard/TestChecklist";
import DownloadTestsButton from "@/components/dashboard/DownloadTestsButton";
import HenIllustration from "@/components/hens/HenIllustration";

interface TestsSectionProps {
  progress: JourneyProgress;
}

/**
 * "הבדיקות שלי" — כל צ'קליסט הבדיקות הקיים (tests.ts), ללא שינוי בתוכן.
 * כפתור "הורדת קובץ הבדיקות" (DownloadTestsButton) נשאר ורוד ובסגנון
 * הכפתור המקורי, אך צר יותר וקומפקטי (לפי בקשת המשתמשת). בפועל הוא מפעיל
 * את דיאלוג ההדפסה של הדפדפן על הדף כפי שהוא נראה כרגע — כך שבמקום קובץ
 * PDF סטטי, מה שמופק משקף את המצב האמיתי (צ'ק-בוקסים מסומנים, תאריכים
 * שהוזנו, סטטוס תוקף) — ראו גם ה-@media print שנוסף ב-globals.css שפותח
 * את פאנל הפרטים המתקפל של כל בדיקה בזמן הדפסה.
 *
 * תגית ההתקדמות + כפתור ההורדה/הדפסה **אינם** בשורת הכותרת יותר (שם הם
 * ישבו צמודים ל-h1/לפסקה והרגישו "תלושים" למעלה, במיוחד במובייל שבו הם
 * נדחקו לשורה משלהם מיד מתחת לטקסט) — הם הוזזו לשורת כותרת נפרדת, ממש
 * מעל הצ'קליסט עצמו, באותו דפוס בדיוק שכבר קיים ב"המסלול שלי"
 * (RoadmapSection.tsx: תגית התקדמות + הדפסה/איפוס צמודים לכותרת הצ'קליסט,
 * לא לכותרת הראשית של העמוד).
 */
export default function TestsSection({ progress }: TestsSectionProps) {
  const { doneTestsCount, totalTests } = progress;

  return (
    <div className="print-stack animate-fadeUp">
      <section className="lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="flex-1">
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            הבדיקות שלי
          </h1>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink/60 sm:text-base">
            צ׳קליסט הבדיקות שרוב היחידות מבקשות בשלב המקדים, סמני מה כבר בוצע.
          </p>
        </div>

        {/* התרנגולת עם מבחנת הדם והצ'קליסט — במובייל מוצגת אחרי הכותרת, בדסקטופ מהצד הנגדי */}
        <div className="no-print mt-4 flex justify-center lg:mt-0 lg:shrink-0 lg:justify-end">
          <HenIllustration name="tests" blob="pink" />
        </div>
      </section>

      {/* כותרת הצ'קליסט — תגית ההתקדמות וכפתור ההורדה/הדפסה יושבים כאן, צמוד
          לצ'קליסט עצמו, לא לכותרת הראשית של העמוד */}
      <section className="mt-6 animate-fadeUp flex flex-wrap items-center justify-between gap-2 sm:mt-8">
        <span className="inline-flex shrink-0 items-center rounded-full bg-teal-50 px-3.5 py-1.5 text-sm font-bold text-teal-700 ring-1 ring-inset ring-teal-100">
          {doneTestsCount} מתוך {totalTests} בדיקות הושלמו
        </span>
        <div className="no-print">
          <DownloadTestsButton />
        </div>
      </section>

      <section className="mt-4 sm:mt-5">
        <TestChecklist
          completedTests={progress.completedTests}
          onToggle={progress.toggleTest}
          completedTestSubItems={progress.completedTestSubItems}
          onToggleSubItem={progress.toggleTestSubItem}
          testDates={progress.testDates}
          onUpdateDate={progress.updateTestDate}
        />
      </section>
    </div>
  );
}
