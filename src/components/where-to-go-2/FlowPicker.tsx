"use client";

import { Building2, Check, Globe2, HeartHandshake, MapPin, Stethoscope } from "lucide-react";
import { FUND_PLANS, type HealthFund } from "@/data/careUnits";
import { FUNDS, type FlowState, type PlacePath, type PlanAnswer, type RegionFilter } from "./placeFlow";

const PATHS: { value: PlacePath; title: string; text: string; Icon: typeof Stethoscope }[] = [
  {
    value: "private",
    title: "אני רוצה מסלול פרטי עם רופא/ה לבחירתי",
    text: "נציג יחידות IVF פרטיות ונסביר ממה בדרך כלל מורכבת העלות במסלול פרטי.",
    Icon: Stethoscope,
  },
  {
    value: "fund",
    title: "אני רוצה לעבור דרך ההטבה של קופת החולים שלי",
    text: "נציג את המקומות שמופיעים בהסדר של הקופה, ואת מה שצריך לוודא לגבי הזכאות.",
    Icon: HeartHandshake,
  },
  {
    value: "public",
    title: "אני מעדיפה בית חולים ציבורי, בלי לסנן לפי הקופה שלי",
    text: "נציג בתי חולים ציבוריים, עם המחיר בתשלום עצמי כשהוא פורסם במקור רשמי.",
    Icon: Building2,
  },
  {
    value: "all",
    title: "אני רוצה לראות את כל המקומות האפשריים",
    text: "כל המקומות, וכל מסלולי התשלום שמצאנו בכל אחד מהם.",
    Icon: Globe2,
  },
];

const REGIONS: { value: RegionFilter; label: string }[] = [
  { value: "all", label: "כל הארץ" },
  { value: "מרכז", label: "מרכז" },
  { value: "ירושלים", label: "ירושלים" },
  { value: "צפון", label: "צפון" },
  { value: "דרום", label: "דרום" },
];

function chip(active: boolean) {
  return `inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
    active ? "bg-teal-600 text-ink shadow-sm" : "bg-white text-ink/70 ring-1 ring-inset ring-mist-200 hover:bg-mist-50"
  }`;
}

interface FlowPickerProps {
  state: FlowState;
  onChange: (next: FlowState) => void;
}

/** שלב 1: מסלול (ואם צריך — קופה ורובד). שלב 2: אזור. */
export default function FlowPicker({ state, onChange }: FlowPickerProps) {
  const set = (patch: Partial<FlowState>) => onChange({ ...state, ...patch });

  return (
    <div className="space-y-5">
      <section aria-labelledby="path-title" data-testid="path-picker">
        <h2 id="path-title" className="text-base font-bold text-ink sm:text-lg">
          <span className="ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-extrabold text-teal-700">1</span>
          איזה מסלול מתאים לך?
        </h2>
        <p className="mt-1 text-xs text-ink/55">אפשר לבחור אפשרות אחת ולשנות אותה בכל רגע.</p>
        <div role="radiogroup" aria-labelledby="path-title" className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {PATHS.map(({ value, title, text, Icon }) => {
            const active = state.path === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set({ path: value })}
                className={`flex items-start gap-3 rounded-2xl border-2 p-3.5 text-right transition-colors sm:p-4 ${
                  active ? "border-teal-400 bg-teal-50/70 shadow-sm" : "border-mist-200 bg-white hover:border-teal-200"
                }`}
                data-testid={`path-${value}`}
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    active ? "bg-teal-600 text-ink" : "bg-mist-100 text-ink/60"
                  }`}
                  aria-hidden="true"
                >
                  {active ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" strokeWidth={2} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-snug text-ink sm:text-[15px]">{title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink/60 sm:text-[13px]">{text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {state.path === "fund" && <FundPicker state={state} set={set} />}

      {state.path && (
        <section aria-labelledby="region-title" data-testid="region-picker">
          <h2 id="region-title" className="text-base font-bold text-ink sm:text-lg">
            <span className="ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-extrabold text-teal-700">2</span>
            באיזה אזור?
          </h2>
          <div role="radiogroup" aria-labelledby="region-title" className="mt-3 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={state.region === r.value}
                onClick={() => set({ region: r.value })}
                className={chip(state.region === r.value)}
                data-testid={`region-${r.value}`}
              >
                {r.value !== "all" && <MapPin className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />}
                {r.label}
              </button>
            ))}
          </div>
          {state.region === "מרכז" && (
            <p className="mt-2 text-xs text-ink/55">
              בתי החולים בירושלים מופיעים בנפרד.{" "}
              <button type="button" onClick={() => set({ region: "ירושלים" })} className="font-semibold text-teal-700 hover:underline">
                להצגת ירושלים
              </button>
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function FundPicker({ state, set }: { state: FlowState; set: (p: Partial<FlowState>) => void }) {
  const plan = state.fund ? FUND_PLANS[state.fund] : null;
  const PLAN_OPTIONS: { value: Exclude<PlanAnswer, null>; label: string }[] = plan
    ? [
        { value: "yes", label: `כן, יש לי ${plan}` },
        { value: "no", label: `אין לי ${plan}` },
        { value: "unsure", label: "לא בטוחה" },
      ]
    : [];

  return (
    <section className="rounded-2xl border-2 border-teal-100 bg-teal-50/40 p-4 sm:p-5" data-testid="fund-picker">
      <h3 id="fund-title" className="text-sm font-bold text-ink">
        מה הקופה שלך?
      </h3>
      <div role="radiogroup" aria-labelledby="fund-title" className="mt-2 flex flex-wrap gap-2">
        {FUNDS.map((f: HealthFund) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={state.fund === f}
            onClick={() => set({ fund: f, plan: state.fund === f ? state.plan : null })}
            className={chip(state.fund === f)}
            data-testid={`fund-${f}`}
          >
            {f}
          </button>
        ))}
      </div>

      {plan && (
        <div className="mt-4">
          <h3 id="plan-title" className="text-sm font-bold text-ink">
            יש לך {plan}?
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-ink/60">
            ב{state.fund}, ההטבה להקפאת ביציות מבחירה קיימת בביטוח המשלים {plan}. אפשר לבדוק באזור האישי באתר הקופה.
          </p>
          <div role="radiogroup" aria-labelledby="plan-title" className="mt-2 flex flex-wrap gap-2">
            {PLAN_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={state.plan === o.value}
                onClick={() => set({ plan: o.value })}
                className={chip(state.plan === o.value)}
                data-testid={`plan-${o.value}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {state.plan === "no" && (
            <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-xs leading-relaxed text-ink/70">
              בלי {plan} ההטבה לא חלה. אפשר לבדוק את המקומות בתשלום עצמי, הם מוצגים למטה.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
