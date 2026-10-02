import { ExternalLink, Info, Users } from "lucide-react";
import { groupCategories, type GroupPlatform } from "@/data/groups";

const PLATFORM_LABEL: Record<GroupPlatform, string> = {
  facebook: "פייסבוק",
  whatsapp: "וואטסאפ",
  telegram: "טלגרם",
  other: "קישור",
};

/** "קבוצות חשובות": רשימת קבוצות לפי קטגוריה. התוכן עצמו נמצא ב-data/groups.ts. */
export default function GroupsSection() {
  const categories = groupCategories.filter((c) => c.groups.length > 0);

  return (
    <div className="print-stack animate-fadeUp">
      <section>
        <h1 className="font-sans text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">קבוצות חשובות</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">
          קבוצות שכדאי להכיר בדרך: לשאלות, לתמיכה ולמסירת תרופות שנשארו.
        </p>
      </section>

      {categories.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-mist-50 px-4 py-3 text-sm text-ink/60" data-testid="groups-empty">
          הקבוצות יתווספו כאן בקרוב.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {categories.map((cat) => (
            <section key={cat.id} aria-labelledby={`groups-${cat.id}`} data-testid={`groups-${cat.id}`}>
              <h2 id={`groups-${cat.id}`} className="text-lg font-bold text-ink">
                {cat.title}
              </h2>
              {cat.intro && <p className="mt-1 text-sm text-ink/60">{cat.intro}</p>}

              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {cat.groups.map((g) => (
                  <li key={g.url}>
                    <a
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full items-start gap-3 rounded-2xl border-2 border-mist-200 bg-white p-4 shadow-card transition-colors hover:border-teal-200"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700" aria-hidden="true">
                        <Users className="h-4 w-4" strokeWidth={2.25} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold leading-snug text-ink">{g.name}</span>
                        {g.description && <span className="mt-0.5 block text-sm leading-relaxed text-ink/65">{g.description}</span>}
                        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                          {PLATFORM_LABEL[g.platform]}
                          <ExternalLink className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              {cat.note && (
                <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-mist-50 px-3 py-2 text-xs leading-relaxed text-ink/65 sm:text-sm">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                  {cat.note}
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
