"use client";

import { useId, useState } from "react";
import { ChevronDown, ExternalLink, Info } from "lucide-react";

const MOH_SOURCE = "https://www.gov.il/he/service/oocyte-cryopreservation";

/**
 * כרטיסיית ההסבר שבראש "איפה כדאי לעשות?". חלק רגיל מזרימת העמוד — לא
 * חלונית קופצת ולא שאלון. השורה הראשית (כולל תזכורת בדיקת הזכאות הרפואית)
 * גלויה תמיד; שאר ההסבר נפתח ונסגר בכפתור אמיתי (<button> עם aria-expanded),
 * ולכן עובד גם במקלדת (Enter/רווח).
 */
export default function BeforeChoosingCard() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section
      aria-labelledby={`${panelId}-title`}
      className="rounded-2xl border-2 border-teal-100 bg-teal-50/60 p-4 sm:p-5"
      data-testid="before-choosing-card"
    >
      <div className="flex gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700"
          aria-hidden="true"
        >
          <Info className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`${panelId}-title`} className="text-[15px] font-bold text-ink sm:text-base">
            לפני שבוחרות איפה להקפיא
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink/70">
            אם יש סיבה רפואית או חשד לרזרבה שחלתית ירודה, כדאי לברר תחילה אם קיימת זכאות לשימור פריון
            במסגרת סל הבריאות.
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="mt-2.5 inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-teal-700 shadow-sm ring-1 ring-inset ring-teal-100 transition-colors hover:bg-teal-50"
          >
            {open ? "סגירת ההסבר" : "עשי לי סדר במסלולים"}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div id={panelId} role="region" aria-labelledby={`${panelId}-title`} hidden={!open}>
        <div className="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-2">
          <Part title="קודם בודקות זכאות רפואית">
            <p>
              רזרבה שחלתית ירודה יכולה להיות אחת הסיבות לזכאות, לצד מצבים רפואיים נוספים. הזכאות נקבעת לפי
              תנאים רפואיים ובאישור הקופה, ובדיקת AMH נמוכה אחת לא מזכה באופן אוטומטי במימון מלא.
            </p>
            <p className="mt-1.5">
              לפני שמתחייבות למסלול בתשלום, כדאי להתייעץ עם רופא/ת פריון ולברר מול הקופה.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <ExtLink href={MOH_SOURCE}>משרד הבריאות: שמירת ביציות</ExtLink>
              <ExtLink href="https://www.maccabi4u.co.il/eligibilites/1834/">מכבי: שימור מסיבות רפואיות</ExtLink>
              <ExtLink href="https://www.clalit.co.il/he/myrights/fertility/Pages/fertility-preservation.aspx">
                כללית: זכויות שימור פריון
              </ExtLink>
            </div>
          </Part>

          <Part title="אם מדובר בהקפאה מבחירה, מה האפשרויות?">
            <ol className="list-decimal space-y-1.5 pr-4">
              <li>
                <span className="font-semibold text-ink">דרך הביטוח המשלים של הקופה</span>: משלמים השתתפות
                עצמית, שתלויה בקופה, ברובד הביטוח, בגיל, בוותק וביחידות שבהסדר. את התרופות והעלויות הנוספות
                צריך לבדוק בנפרד.
              </li>
              <li>
                <span className="font-semibold text-ink">בתשלום עצמי ביחידה ציבורית</span>: משלמים לפי תעריף
                היחידה. כדאי לברר מה בדיוק כלול במחיר.
              </li>
              <li>
                <span className="font-semibold text-ink">בתשלום עצמי ביחידה פרטית</span>: אפשר לברר גם ליווי
                של רופא/ה פרטי/ת. חשוב להפריד בין התשלום לרופא/ה, התשלום ליחידה, התרופות והאחסון, ולוודא מי
                מבצע/ת בפועל את השאיבה.
              </li>
            </ol>
            <p className="mt-2 rounded-lg bg-white/70 px-2.5 py-1.5">
              ״דרך הקופה״ היא דרך מימון. יחידה שבהסדר יכולה להיות ציבורית או פרטית, ו״ציבורי״ לא אומר
              ״מסובסד״.
            </p>
          </Part>

          <Part title="כמה ביציות וסבבים אפשר לעשות?">
            <ul className="space-y-1.5">
              <li>
                <Tag>מגבלה ארצית</Tag> בהקפאה מבחירה (גיל 30-41): עד 6 שאיבות, או עד 25 ביציות לפני גיל 36 ועד
                35 ביציות מגיל 36 ועד לפני 41, לפי המוקדם. אם כבר בשאיבה הראשונה הגיעו למספר המרבי, אפשר לאשר
                שאיבה אחת נוספת. הנוסח המלא והחריגים מופיעים אצל{" "}
                <ExtLink href={MOH_SOURCE} inline>
                  משרד הבריאות
                </ExtLink>{" "}
                (עודכן 30.7.2026).
              </li>
              <li>
                <Tag>מכסת כיסוי של קופה</Tag> הביטוח המשלים מממן רק חלק מזה, ולכל קופה יש מכסה משלה (למשל מכבי
                שלי: עד 3 טיפולים או 25 ביציות). המכסה של כל מסלול מופיעה בכרטיס המקום.
              </li>
              <li>
                <Tag>בפועל</Tag> אין מספר ביציות מובטח באף בית חולים. מספר הביציות שמתקבלות תלוי בעיקר בגיל
                וברזרבה השחלתית.
              </li>
              <li>במסלול רפואי חלים תנאי זכאות אחרים, שנקבעים בסל הבריאות.</li>
            </ul>
          </Part>

          <Part title="מה כדאי לברר לפני שקובעות?">
            <ul className="list-disc space-y-1 pr-4">
              <li>מה כולל מחיר הסבב</li>
              <li>האם התרופות, ההרדמה והאחסון כלולים</li>
              <li>כמה עולה האחסון בהמשך</li>
              <li>איפה עושים את המעקב</li>
              <li>האם אפשר לבחור רופא/ה</li>
              <li>מה צריך כדי לקבל אישור מהקופה</li>
              <li>מה זמינות התורים</li>
            </ul>
          </Part>
        </div>
      </div>
    </section>
  );
}

function Part({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-3.5 text-[13px] leading-relaxed text-ink/70 shadow-sm sm:p-4 sm:text-sm">
      <h3 className="mb-1.5 text-sm font-bold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 inline-flex rounded-full bg-mist-100 px-1.5 py-0.5 text-[11px] font-bold text-ink/65">
      {children}
    </span>
  );
}

function ExtLink({ href, children, inline }: { href: string; children: React.ReactNode; inline?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${inline ? "" : "inline-flex items-center gap-1 "}font-semibold text-teal-700 underline-offset-4 hover:underline`}
    >
      {children}
      {!inline && <ExternalLink className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />}
    </a>
  );
}
