"use client";

import { ChevronDown, FileText, Play } from "lucide-react";
import { MOH_DRUG_INDEX_URL, injectionGuides, type InjectionGuide } from "@/data/injectionGuides";

interface GuidesLibraryProps {
  /** מדריכים של תרופות שהוזנו ביומן — מוצגים ראשונים */
  myGuideIds: string[];
  openGuideId: string | null;
  onToggleGuide: (id: string) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
}

/**
 * "איך מזריקים?" — ספריית מדריכים שמטרתה לזהות את התכשיר ולהגיע להוראות
 * הרשמיות. אין כאן הוראות הכנה, הזרקה, אחסון או מינון. כפתור סרטון מוצג רק
 * כשנמצא סרטון רשמי שמתאים לאותו תכשיר (ר' injectionGuides.ts).
 */
export default function GuidesLibrary({ myGuideIds, openGuideId, onToggleGuide, showAll, onToggleShowAll }: GuidesLibraryProps) {
  const mine = myGuideIds
    .map((id) => injectionGuides.find((g) => g.id === id))
    .filter((g): g is InjectionGuide => !!g);
  const rest = injectionGuides.filter((g) => !myGuideIds.includes(g.id));

  return (
    <section id="injection-guides" aria-labelledby="guides-title" className="scroll-mt-24 lg:scroll-mt-8" data-testid="guides-library">
      <h2 id="guides-title" className="font-sans text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
        איך מזריקים?
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink/65">
        סרטוני הדרכה בעברית מבתי חולים ומהיצרנים בישראל, והעלון הרשמי של כל תרופה. ודאי שהתכשיר בסרטון זהה לשלך.
        ההוראות הקובעות הן העלון וההדרכה ביחידה. שאלה על שינוי בהנחיות או על זריקה שלא בוצעה בזמן, פני ליחידה המטפלת.
      </p>

      {mine.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-teal-700">התרופות שלך</h3>
          <div className="mt-2 space-y-2.5">
            {mine.map((g) => (
              <GuideCard key={g.id} guide={g} open={openGuideId === g.id} onToggle={() => onToggleGuide(g.id)} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        {mine.length > 0 ? (
          <button
            type="button"
            onClick={onToggleShowAll}
            aria-expanded={showAll}
            aria-controls="all-guides"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/70 hover:text-ink"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} strokeWidth={2.5} />
            כל המדריכים
          </button>
        ) : (
          <h3 className="text-sm font-bold text-ink/70">כל המדריכים</h3>
        )}
        <div id="all-guides" hidden={mine.length > 0 && !showAll} className="mt-2 space-y-2.5">
          {rest.map((g) => (
            <GuideCard key={g.id} guide={g} open={openGuideId === g.id} onToggle={() => onToggleGuide(g.id)} />
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink/55">
        תרופה שלא מופיעה כאן? את העלון שלה אפשר למצוא ב
        <a href={MOH_DRUG_INDEX_URL} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 hover:underline">
          מאגר התרופות של משרד הבריאות
        </a>
        .
      </p>
    </section>
  );
}

export function VideoButton({ url, label, detail, size = "md" }: { url: string; label: string; detail?: string; size?: "sm" | "md" }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-full bg-warm-500 font-bold text-ink shadow-sm transition-colors hover:bg-warm-300 ${
        size === "sm" ? "min-h-[34px] px-3 text-xs" : "min-h-[44px] px-4 text-sm"
      }`}
      data-testid="video-button"
      title={detail}
    >
      <span className={`flex items-center justify-center rounded-full bg-white/90 ${size === "sm" ? "h-5 w-5" : "h-7 w-7"}`} aria-hidden="true">
        <Play className={`fill-current text-warm-500 ${size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}`} strokeWidth={2.5} />
      </span>
      {label}
    </a>
  );
}

/**
 * כרטיס מדריך מצומצם: שם התרופה, כפתור סרטון ירוק ובולט (הדבר שמחפשים),
 * וקישור לעלון לצרכן של משרד הבריאות. בלי פרטים טכניים — הם בעלון.
 */
function GuideCard({ guide, open }: { guide: InjectionGuide; open: boolean; onToggle: () => void }) {
  return (
    <div
      id={`guide-${guide.id}`}
      className={`scroll-mt-24 rounded-2xl border-2 bg-white p-4 lg:scroll-mt-8 ${open ? "border-warm-500" : "border-mist-200"}`}
      data-testid="guide-card"
      data-guide={guide.id}
    >
      <p className="font-bold text-ink">
        {guide.name} <span className="font-semibold text-ink/50">({guide.latinName})</span>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {guide.videos.map((v) => (
          <span key={v.url} className="inline-flex flex-col items-start gap-0.5">
            <VideoButton url={v.url} label={v.label} />
            {v.detail && <span className="pr-2 text-[11px] text-ink/50">{v.detail}</span>}
          </span>
        ))}
      </div>
      <a
        href={guide.leaflet.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline"
      >
        <FileText className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        עלון לצרכן (משרד הבריאות)
      </a>
    </div>
  );
}
