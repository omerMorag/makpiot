"use client";

import type { JourneyProgress } from "@/lib/useJourneyProgress";
import HenIllustration from "@/components/hens/HenIllustration";
import WhereToDoTool from "@/components/where-to-go-2/WhereToDoTool";
import PrivateDoctorTeaser from "@/components/where-to-go-2/PrivateDoctorTeaser";

interface WhereToGoSectionProps {
  progress: JourneyProgress;
}

const OFFICIAL_SOURCES: { label: string; url: string }[] = [
  { label: "משרד הבריאות: שמירת ביציות", url: "https://www.gov.il/he/service/oocyte-cryopreservation" },
  { label: "מכבי: שימור מסיבות רפואיות", url: "https://www.maccabi4u.co.il/eligibilites/1834/" },
  { label: "מכבי: שימור מסיבות שאינן רפואיות (מכבי שלי)", url: "https://www.maccabi4u.co.il/eligibilites/117173/" },
  {
    label: "כללית מושלם: שימור פוריות",
    url: "https://mushlam.clalit.co.il/he/content_worlds/pregnancy-and-childbirth/Pages/Fertility-preservation.aspx",
  },
  { label: "כללית: זכויות שימור פריון", url: "https://www.clalit.co.il/he/myrights/fertility/Pages/fertility-preservation.aspx" },
  {
    label: "תקנון מאוחדת שיא, ספטמבר 2026",
    url: "https://www.meuhedet.co.il/media/8952/%D7%A9%D7%99%D7%90-%D7%A1%D7%A4%D7%98%D7%9E%D7%91%D7%A8-2026.pdf",
  },
  {
    label: "לאומית: הקפאת ביציות מסיבות לא רפואיות",
    url: "https://www.leumit.co.il/lobby-rights/rightspage/zakautpage/?sid=849&zid=116675",
  },
  {
    label: "לאומית: עדכון לאומית זהב וכסף, יולי 2026",
    url: "https://www.leumit.co.il/insurance-policies/leumit-silver-and-gold/leumit-gold-and-silver-update/",
  },
];

/**
 * "איפה כדאי לעשות?" — מסלול אחד ברור (עדכון 23.9.2026): כרטיסיית הסבר
 * עדינה ← מחשבון מסלול שקובע אילו מקומות ומחירים מוצגים ← כרטיסי מקומות ←
 * השוואה. כל המקומות והמחירים מגיעים ממקור אחד (careUnits.ts). התוכן
 * ההסברתי הישן והטבלאות הישנות (hospitalPrices.ts וכו') הוצאו מהעמוד כי
 * הציגו רשימת מחירים מקבילה שמתחרה בנתונים המעודכנים; הקבצים נשארו בקוד.
 */
export default function WhereToGoSection({ progress }: WhereToGoSectionProps) {
  return (
    <div className="print-stack animate-fadeUp">
      <section className="lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0">
          <h1 className="font-sans text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
            איפה כדאי לי לעשות?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">
            בחרי מסלול ואזור, ונציג את המקומות שמתאימים לך. מחיר מופיע רק כשפורסם במקור רשמי, ואפשר להשוות בין
            שניים או שלושה מקומות.
          </p>
        </div>
        <div className="mt-4 flex justify-center lg:mt-0 lg:shrink-0 lg:justify-end">
          <HenIllustration name="choose-clinic" blob="cream" />
        </div>
      </section>

      <div className="mt-6 sm:mt-8">
        <WhereToDoTool progress={progress} />
      </div>

      <section className="mt-8 rounded-2xl border-2 border-mist-200 bg-mist-50/60 p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-ink/70">
          <span className="font-semibold text-ink">חשוב:</span> מחירים והסדרים משתנים. המידע כאן נועד להשוואה
          ראשונית, ואינו הצעת מחיר של בית חולים או של קופה. לפני שקובעות תור או משלמות, כדאי לוודא מול היחידה
          והקופה מה המחיר העדכני, מה כלול בו, מה הזכאות ומה תנאי הביטול.
        </p>
      </section>

      <section className="mt-6 text-xs leading-relaxed text-ink/55">
        <p className="font-semibold text-ink/60">מקורות רשמיים עיקריים (נבדקו ב־23-25.9.2026):</p>
        <p className="mt-0.5">המקור של כל מחיר מופיע בכרטיס המקום, תחת ״פרטים ומקורות״.</p>
        <ul className="mt-2 space-y-1">
          {OFFICIAL_SOURCES.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-dotted underline-offset-2 hover:text-teal-700"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <PrivateDoctorTeaser />
    </div>
  );
}
