"use client";

import { useEffect, useId, useState } from "react";
import { BookOpen, Check, Copy, Pencil, Plus, Stethoscope, Syringe, X } from "lucide-react";
import { findGuideForName, injectionGuides, medicationNameSuggestions } from "@/data/injectionGuides";
import {
  PRESET_TESTS,
  dayNumber,
  doseText,
  findPresetValue,
  formatDateLong,
  getDay,
  newId,
  nowHHMM,
  previousMedsDay,
  saveDayMeds,
  seriesInfo,
  seriesRemaining,
  type DayMedRow,
  setDayMonitoring,
  setMedDone,
  type BloodValue,
  type JournalCycle,
  type MedEntry,
  type MonitoringResult,
} from "@/lib/injectionJournal";
import { VideoButton } from "./GuidesLibrary";

interface DayCardProps {
  cycle: JournalCycle;
  date: string;
  today: string;
  onUpdateCycle: (update: (c: JournalCycle) => JournalCycle) => void;
  onOpenGuide: (guideId: string | null) => void;
  /** יום שנוסף ידנית ועוד ריק — פותח ישר את עריכת הזריקות */
  startEditing?: boolean;
}

const inputCls =
  "block w-full rounded-xl border border-mist-200 bg-white px-3 py-2.5 text-base text-ink focus:border-teal-400 focus:outline-none sm:text-sm";

/**
 * כרטיס יום ביומן: שתי מסגרות — "הזריקות שלי" ו"המעקב שלי". במצב רגיל מוצג
 * רק מה שהוזן בפועל. עריכת זריקות = שם + מינון (כולל יחידה) לכל שורה, בלי
 * שעה/הערות/תסמינים. מעקב נפתח רק בלחיצה על "היה לי מעקב", עם שלוש בדיקות
 * שהשמות שלהן כבר כתובים — ממלאים רק ערכים. אין שום פרשנות לערכים.
 */
export default function DayCard({ cycle, date, today, onUpdateCycle, onOpenGuide, startEditing }: DayCardProps) {
  const day = getDay(cycle, date);
  const n = dayNumber(cycle, date);
  const [editMeds, setEditMeds] = useState(!!startEditing && day.meds.length === 0);
  const [editMon, setEditMon] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(null), 2600);
    return () => clearTimeout(t);
  }, [saved]);

  const isToday = date === today;

  return (
    <article
      className="scroll-mt-24 rounded-3xl border-2 border-mist-200 bg-white p-4 shadow-card sm:p-5 lg:scroll-mt-8"
      data-testid="day-card"
      data-date={date}
      aria-labelledby={`day-${date}-title`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 id={`day-${date}-title`} className="text-lg font-extrabold text-ink sm:text-xl">
          {n >= 1 ? `יום ${n} בסבב` : "לפני תחילת הסבב"}
          {isToday && (
            <span className="mr-2 rounded-full bg-teal-100 px-2 py-0.5 align-middle text-[11px] font-bold text-teal-700">היום</span>
          )}
        </h3>
        <p className="text-sm text-ink/60">{formatDateLong(date)}</p>
      </header>

      <p className="sr-only" aria-live="polite">
        {saved ?? ""}
      </p>
      {saved && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warm-100 px-3 py-1 text-xs font-bold text-ink" data-testid="saved-toast">
          <Check className="h-3.5 w-3.5 text-warm-500" strokeWidth={3} aria-hidden="true" />
          {saved}
        </p>
      )}

      {/* הזריקות שלי */}
      <section className="mt-3 rounded-2xl border border-mist-200 bg-mist-50/50 p-3.5" data-testid="meds-frame">
        <h4 className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <Syringe className="h-4 w-4 text-teal-700" strokeWidth={2} aria-hidden="true" />
          הזריקות שלי
        </h4>
        {editMeds ? (
          <MedsEditor
            cycle={cycle}
            date={date}
            meds={day.meds}
            onCancel={() => setEditMeds(false)}
            onSave={(rows) => {
              onUpdateCycle((c) => saveDayMeds(c, date, rows));
              setEditMeds(false);
              setSaved("הזריקות נשמרו");
            }}
          />
        ) : day.meds.length > 0 ? (
          <>
            <ul className="mt-2 space-y-2">
              {day.meds.map((m) => (
                <MedLine
                  key={m.id}
                  med={m}
                  series={seriesInfo(cycle, date, m.seriesId)}
                  onToggle={(done) => onUpdateCycle((c) => setMedDone(c, date, m.id, done, done ? nowHHMM() : undefined))}
                  onOpenGuide={() => onOpenGuide(m.guideId ?? null)}
                />
              ))}
            </ul>
            <button type="button" onClick={() => setEditMeds(true)} className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-ink/60 hover:text-ink">
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              עריכת הזריקות
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditMeds(true)}
            className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 hover:bg-teal-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            הוספת זריקות
          </button>
        )}
      </section>

      {/* המעקב שלי */}
      <section className="mt-3 rounded-2xl border border-mist-200 bg-mist-50/50 p-3.5" data-testid="monitoring-frame">
        <h4 className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <Stethoscope className="h-4 w-4 text-teal-700" strokeWidth={2} aria-hidden="true" />
          המעקב שלי
        </h4>
        {editMon ? (
          <MonitoringEditor
            cycle={cycle}
            date={date}
            initial={day.monitoring}
            onCancel={() => setEditMon(false)}
            onSave={(result) => {
              onUpdateCycle((c) => setDayMonitoring(c, date, result));
              setEditMon(false);
              setSaved(result ? "המעקב נשמר" : "המעקב נמחק");
            }}
          />
        ) : day.monitoring ? (
          <>
            <MonitoringSummary result={day.monitoring} />
            <button type="button" onClick={() => setEditMon(true)} className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-ink/60 hover:text-ink">
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              עריכת המעקב
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditMon(true)}
            className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 hover:bg-teal-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            {isToday ? "היה לי מעקב היום" : "היה לי מעקב ביום הזה"}
          </button>
        )}
      </section>

      {day.note && <p className="mt-3 whitespace-pre-line rounded-xl bg-mist-50 px-3 py-2 text-sm text-ink/70">{day.note}</p>}
    </article>
  );
}

/* ---------------------------- זריקות ---------------------------- */

function MedLine({
  med,
  series,
  onToggle,
  onOpenGuide,
}: {
  med: MedEntry;
  series?: { index: number; total: number };
  onToggle: (done: boolean) => void;
  onOpenGuide: () => void;
}) {
  const guide = med.guideId ? injectionGuides.find((g) => g.id === med.guideId) : undefined;
  const dose = doseText(med);
  return (
    <li className="rounded-xl bg-white p-2.5 ring-1 ring-inset ring-mist-200" data-testid="med-line" data-med={med.name}>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onToggle(!med.done)}
          aria-pressed={med.done}
          aria-label={`${med.done ? "ביטול סימון" : "סימון הזרקתי"}: ${med.name}`}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            med.done ? "border-teal-600 bg-teal-600 text-ink" : "border-mist-300 bg-white text-transparent hover:border-teal-400"
          }`}
        >
          <Check className="h-5 w-5" strokeWidth={3} />
        </button>
        <p className="min-w-0 flex-1">
          <span className="font-bold text-ink">{med.name}</span>
          {dose && (
            <>
              {" · "}
              <bdi dir="ltr" className="font-semibold text-ink/80" data-testid="med-dose">
                {dose}
              </bdi>
            </>
          )}
          {series && (
            <span className="mr-2 inline-block rounded-full bg-warm-100 px-2 py-0.5 align-middle text-[11px] font-semibold text-ink/70" data-testid="series-chip">
              יום {series.index} מתוך {series.total}
            </span>
          )}
          {/* פרטים ישנים מוצגים רק אם הוזנו בעבר */}
          {(med.plannedTime || (med.done && med.doneTime)) && (
            <span className="block text-xs text-ink/55">
              {med.done && med.doneTime ? `הוזרק ב־${med.doneTime}` : `מתוכנן ל־${med.plannedTime}`}
            </span>
          )}
        </p>
      </div>
      {med.note && <p className="mt-1.5 whitespace-pre-line pr-11 text-xs text-ink/65">{med.note}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 pr-11">
        {guide?.videos[0] && <VideoButton url={guide.videos[0].url} label="סרטון הזרקה" detail={guide.videos[0].detail} size="sm" />}
        <button type="button" onClick={onOpenGuide} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">
          <BookOpen className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          {guide ? "עלון" : "מדריכי הזרקה"}
        </button>
      </div>
    </li>
  );
}

interface DraftRow {
  key: string;
  /** מזהה רשומה קיימת — כדי לשמור עליה (סימון "הזרקתי", הערות ישנות) */
  id?: string;
  name: string;
  dose: string;
  days: number;
}

function MedsEditor({
  cycle,
  date,
  meds,
  onSave,
  onCancel,
}: {
  cycle: JournalCycle;
  date: string;
  meds: MedEntry[];
  onSave: (rows: DayMedRow[]) => void;
  onCancel: () => void;
}) {
  const uid = useId();
  const [rows, setRows] = useState<DraftRow[]>(() =>
    meds.length
      ? meds.map((m) => ({ key: m.id, id: m.id, name: m.name, dose: doseText(m), days: seriesRemaining(cycle, date, m.seriesId) }))
      : [{ key: newId(), name: "", dose: "", days: 1 }]
  );
  const prevDay = previousMedsDay(cycle, date);

  const update = (key: string, patch: Partial<DraftRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const copyPrevious = () => {
    if (!prevDay) return;
    // העתקה רק של שם ומינון — בלי סימון "הזרקתי"
    const copied = cycle.days[prevDay].meds.map((m) => ({ key: newId(), name: m.name, dose: doseText(m), days: 1 }));
    setRows((rs) => [...rs.filter((r) => r.name.trim() || r.dose.trim()), ...copied]);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const byId = new Map(meds.map((m) => [m.id, m]));
    const out: DayMedRow[] = [];
    for (const r of rows) {
      const name = r.name.trim();
      const dose = r.dose.trim();
      if (!name) continue;
      const existing = r.id ? byId.get(r.id) : undefined;
      if (existing) {
        const sameDose = dose === doseText(existing);
        out.push({
          entry: {
            ...existing,
            name,
            guideId: findGuideForName(name)?.id,
            dose: sameDose ? existing.dose : dose || undefined,
            unit: sameDose ? existing.unit : undefined,
          },
          days: r.days,
        });
      } else {
        out.push({ entry: { id: newId(), name, guideId: findGuideForName(name)?.id, dose: dose || undefined, kind: "daily", done: false }, days: r.days });
      }
    }
    onSave(out);
  };

  return (
    <form onSubmit={save} className="mt-2.5 space-y-2" data-testid="meds-editor">
      <datalist id={`${uid}-names`}>
        {medicationNameSuggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      {rows.map((r, i) => (
        <div key={r.key} className="grid grid-cols-[minmax(0,1fr)_6.5rem_auto] items-end gap-2 rounded-xl bg-white/60 p-2 ring-1 ring-inset ring-mist-200 sm:grid-cols-[minmax(0,1fr)_8.5rem_6.5rem_auto] sm:bg-transparent sm:p-0 sm:ring-0" data-testid="med-row-edit">
          <label className="col-span-3 text-xs font-semibold text-ink/65 sm:col-span-1">
            <span className={i === 0 ? "" : "sm:sr-only"}>שם התרופה</span>
            <input
              className={`${inputCls} mt-1`}
              value={r.name}
              onChange={(e) => update(r.key, { name: e.target.value })}
              list={`${uid}-names`}
              autoComplete="off"
              placeholder="למשל גונאל-אף"
              aria-label={`שם התרופה ${i + 1}`}
            />
          </label>
          <label className="text-xs font-semibold text-ink/65">
            <span className={i === 0 ? "" : "sm:sr-only"}>מינון (כולל יחידה)</span>
            <input
              className={`${inputCls} mt-1`}
              value={r.dose}
              onChange={(e) => update(r.key, { dose: e.target.value })}
              placeholder="150 IU"
              dir="ltr"
              aria-label={`מינון כולל יחידה ${i + 1}`}
            />
          </label>
          <label className="text-xs font-semibold text-ink/65">
            <span className={i === 0 ? "" : "sm:sr-only"}>כמה ימים</span>
            <select
              className={`${inputCls} mt-1 px-2`}
              value={r.days}
              onChange={(e) => update(r.key, { days: Number(e.target.value) })}
              aria-label={`כמה ימים ${i + 1}`}
            >
              {dayOptions(r.days).map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "רק היום" : `${n} ימים`}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : [{ key: newId(), name: "", dose: "", days: 1 }]))}
            aria-label={`הסרת השורה ${i + 1}`}
            className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-full text-ink/40 hover:bg-mist-100 hover:text-ink/70"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-sm">
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { key: newId(), name: "", dose: "", days: 1 }])}
          className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          עוד תרופה
        </button>
        {prevDay && (
          <button type="button" onClick={copyPrevious} className="inline-flex items-center gap-1 font-semibold text-ink/60 hover:text-ink">
            <Copy className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            העתקה מהיום הקודם
          </button>
        )}
      </div>
      {rows.some((r) => r.days > 1) && (
        <p className="text-xs text-ink/55" data-testid="days-hint">
          נוסיף את הזריקה גם לימים הבאים ביומן, עם אותו מינון. אם המינון ישתנה, אפשר לעדכן כל יום בנפרד.
        </p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" className="min-h-[42px] rounded-full bg-teal-600 px-6 text-sm font-bold text-ink hover:bg-teal-500">
          שמירה
        </button>
        <button type="button" onClick={onCancel} className="min-h-[42px] rounded-full px-4 text-sm font-semibold text-ink/60 hover:bg-mist-100">
          ביטול
        </button>
      </div>
    </form>
  );
}

function dayOptions(current: number): number[] {
  const base = Array.from({ length: 14 }, (_, i) => i + 1);
  return current > 14 ? [...base, current] : base;
}

/* ---------------------------- מעקב ---------------------------- */

/** היחידה האחרונה שנבחרה לכל בדיקה בסבב — כדי לא לבחור אותה כל פעם מחדש */
function lastUnits(cycle: JournalCycle): Record<string, string> {
  const out: Record<string, string> = {};
  const dates = Object.keys(cycle.days).sort();
  for (const d of dates) {
    const vals = cycle.days[d].monitoring?.bloodValues ?? [];
    for (const p of PRESET_TESTS) {
      const v = findPresetValue(vals, p);
      if (v?.unit) out[p.id] = v.unit;
    }
  }
  return out;
}

function MonitoringEditor({
  cycle,
  date,
  initial,
  onSave,
  onCancel,
}: {
  cycle: JournalCycle;
  date: string;
  initial?: MonitoringResult;
  onSave: (result: MonitoringResult | undefined) => void;
  onCancel: () => void;
}) {
  const existing = initial?.bloodValues ?? [];
  const remembered = lastUnits(cycle);
  const [values, setValues] = useState<Record<string, { value: string; unit: string }>>(() => {
    const init: Record<string, { value: string; unit: string }> = {};
    for (const p of PRESET_TESTS) {
      const v = findPresetValue(existing, p);
      init[p.id] = { value: v?.value ?? "", unit: v?.unit || remembered[p.id] || "" };
    }
    return init;
  });
  const presetMatches = new Set(PRESET_TESTS.map((p) => findPresetValue(existing, p)).filter(Boolean) as BloodValue[]);
  // ערכים ישנים בשמות אחרים — נשמרים כפי שהם
  const others = existing.filter((v) => !presetMatches.has(v));
  const [more, setMore] = useState(!!(initial?.ultrasound || initial?.nextInstructions));
  const [ultrasound, setUltrasound] = useState(initial?.ultrasound ?? "");
  const [next, setNext] = useState(initial?.nextInstructions ?? "");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const bloodValues: BloodValue[] = [];
    for (const p of PRESET_TESTS) {
      const { value, unit } = values[p.id];
      if (value.trim()) bloodValues.push({ id: p.id, name: p.name, value: value.trim(), unit: unit.trim() });
    }
    bloodValues.push(...others);
    const result: MonitoringResult = {
      bloodValues,
      ultrasound: ultrasound.trim() || undefined,
      nextInstructions: next.trim() || undefined,
    };
    const empty = !bloodValues.length && !result.ultrasound && !result.nextInstructions;
    onSave(empty ? undefined : result);
  };

  return (
    <form onSubmit={save} className="mt-2.5 space-y-2.5" data-testid="monitoring-editor">
      <p className="text-xs text-ink/55">ממלאים רק מה שקיבלת. אפשר להשאיר שדות ריקים.</p>
      {PRESET_TESTS.map((p) => (
        <div key={p.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)_6.5rem] items-center gap-2 sm:grid-cols-[8rem_10rem_7rem]">
          <label htmlFor={`${date}-${p.id}`} className="text-sm font-semibold text-ink">
            {p.name}
          </label>
          <input
            id={`${date}-${p.id}`}
            className={inputCls}
            value={values[p.id].value}
            onChange={(e) => setValues((v) => ({ ...v, [p.id]: { ...v[p.id], value: e.target.value } }))}
            inputMode="decimal"
            dir="ltr"
            data-testid={`mon-${p.id}`}
          />
          <select
            aria-label={`יחידה: ${p.name}`}
            value={values[p.id].unit}
            onChange={(e) => setValues((v) => ({ ...v, [p.id]: { ...v[p.id], unit: e.target.value } }))}
            className="rounded-xl border border-mist-200 bg-white px-2 py-2.5 text-sm text-ink/80"
            dir="ltr"
          >
            <option value="">יחידה</option>
            {p.units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
            {values[p.id].unit && !(p.units as readonly string[]).includes(values[p.id].unit) && (
              <option value={values[p.id].unit}>{values[p.id].unit}</option>
            )}
          </select>
        </div>
      ))}
      {others.length > 0 && (
        <p className="text-xs text-ink/55">
          נשמרו גם:{" "}
          {others.map((o) => (
            <bdi key={o.id} dir="auto" className="ml-2">
              {o.name} {o.value} {o.unit}
            </bdi>
          ))}
        </p>
      )}

      {more ? (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-ink/65">
            ממצאי אולטרסאונד (אם תרצי)
            <textarea className={`${inputCls} mt-1 min-h-[56px]`} value={ultrasound} onChange={(e) => setUltrasound(e.target.value)} />
          </label>
          <label className="block text-xs font-semibold text-ink/65">
            הנחיות שקיבלת
            <textarea className={`${inputCls} mt-1 min-h-[56px]`} value={next} onChange={(e) => setNext(e.target.value)} />
          </label>
        </div>
      ) : (
        <button type="button" onClick={() => setMore(true)} className="text-xs font-semibold text-ink/55 hover:text-ink">
          + פרטים נוספים
        </button>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" className="min-h-[42px] rounded-full bg-teal-600 px-6 text-sm font-bold text-ink hover:bg-teal-500">
          שמירה
        </button>
        <button type="button" onClick={onCancel} className="min-h-[42px] rounded-full px-4 text-sm font-semibold text-ink/60 hover:bg-mist-100">
          ביטול
        </button>
        {initial && (
          <button type="button" onClick={() => onSave(undefined)} className="min-h-[42px] px-2 text-xs font-semibold text-ink/45 hover:text-ink/75">
            מחיקת המעקב
          </button>
        )}
      </div>
    </form>
  );
}

function MonitoringSummary({ result }: { result: MonitoringResult }) {
  return (
    <div className="mt-2 space-y-1.5 text-sm text-ink/80" data-testid="monitoring-summary">
      {result.bloodValues.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {result.bloodValues.map((b) => (
            <li key={b.id} className="rounded-lg bg-white px-2.5 py-1 text-xs ring-1 ring-inset ring-mist-200" data-testid="mon-value">
              <span className="font-semibold text-ink">{b.name}</span>{" "}
              <bdi dir="ltr">
                {b.value}
                {b.unit ? ` ${b.unit}` : ""}
              </bdi>
            </li>
          ))}
        </ul>
      )}
      {result.ultrasound && (
        <p className="whitespace-pre-line text-xs">
          <span className="font-semibold text-ink">אולטרסאונד: </span>
          {result.ultrasound}
        </p>
      )}
      {result.nextInstructions && (
        <p className="whitespace-pre-line text-xs">
          <span className="font-semibold text-ink">הנחיות: </span>
          {result.nextInstructions}
        </p>
      )}
    </div>
  );
}
