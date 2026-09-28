"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { CalendarDays, CalendarPlus, ChevronDown, Cloud, CloudOff, Info, LayoutList, LifeBuoy, Settings2, Table2 } from "lucide-react";
import HenIllustration from "@/components/hens/HenIllustration";
import DayCard from "@/components/injections/DayCard";
import GuidesLibrary from "@/components/injections/GuidesLibrary";
import JournalTable from "@/components/injections/JournalTable";
import { useInjectionJournal } from "@/lib/useInjectionJournal";
import {
  cycleMedGuideIds,
  dayNumber,
  formatDateLong,
  isValidISODate,
  recordedDates,
  todayISO,
  type JournalCycle,
} from "@/lib/injectionJournal";

const inputCls =
  "mt-1 block w-full rounded-xl border border-mist-200 bg-white px-3 py-2.5 text-base text-ink focus:border-teal-400 focus:outline-none sm:text-sm";

const VIEW_KEY = "makpiot:injection-journal:view";

/** שם אוטומטי לסבב — אפשר לשנות ב"אפשרויות נוספות" */
function autoLabel(existing: number): string {
  return existing === 0 ? "הסבב שלי" : `סבב ${existing + 1}`;
}

/**
 * "תקופת הזריקות" — יומן אישי לתקופת הזריקות, מחובר לשלב 6 במסלול (קישור
 * משם). נפרד לגמרי מהתקדמות המסלול. היומן מוצג ככרטיסי יום: למעלה היום,
 * מתחתיו ימים שתועדו (מהחדש לישן). הנתונים נשמרים דרך useInjectionJournal.
 */
export default function InjectionsSection() {
  const api = useInjectionJournal();
  const { ready, activeCycle, journal } = api;
  const [today, setToday] = useState<string>("");
  const [openGuideId, setOpenGuideId] = useState<string | null>(null);
  const [showAllGuides, setShowAllGuides] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [extraDate, setExtraDate] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [showFuture, setShowFuture] = useState(false);

  useEffect(() => {
    setToday(todayISO());
    try {
      if (localStorage.getItem(VIEW_KEY) === "table") setView("table");
    } catch {}
  }, []);
  const changeView = (v: "cards" | "table") => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };
  useEffect(() => setExtraDate(null), [activeCycle?.id]);

  const myGuideIds = useMemo(() => cycleMedGuideIds(activeCycle), [activeCycle]);

  const openGuide = (guideId: string | null) => {
    setGuidesOpen(true);
    if (guideId) {
      setOpenGuideId(guideId);
      if (!myGuideIds.includes(guideId)) setShowAllGuides(true);
    } else {
      setShowAllGuides(true);
    }
    // גלילה פנימית בלבד — בלי לשנות את ה-hash (שמשמש לניווט בין אזורי האתר)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const target = document.getElementById(guideId ? `guide-${guideId}` : "injection-help");
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }),
    );
  };

  // הכרטיס העליון: היום; לפני תחילת הסבב — יום ההתחלה
  const topDate = activeCycle && today ? (today < activeCycle.startDate ? activeCycle.startDate : today) : "";
  const otherDates = useMemo(() => {
    if (!activeCycle) return [];
    const list = recordedDates(activeCycle).filter((d) => d !== topDate);
    if (extraDate && extraDate !== topDate && !list.includes(extraDate)) list.push(extraDate);
    return list.sort((a, b) => b.localeCompare(a));
  }, [activeCycle, topDate, extraDate]);
  // ימים עתידיים (למשל אחרי "לכמה ימים") — מקופלים, מהקרוב לרחוק
  const futureDates = useMemo(() => otherDates.filter((d) => d > topDate).reverse(), [otherDates, topDate]);
  const pastDates = useMemo(() => otherDates.filter((d) => d < topDate), [otherDates, topDate]);

  const goToDay = (d: string) => {
    changeView("cards");
    setExtraDate(d);
    if (d > topDate) setShowFuture(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.querySelector(`[data-testid="day-card"][data-date="${d}"]`)?.scrollIntoView({ block: "start" }),
      ),
    );
  };

  const renderCard = (d: string) =>
    activeCycle && (
      <DayCard
        key={`${activeCycle.id}-${d}`}
        cycle={activeCycle}
        date={d}
        today={today}
        onUpdateCycle={api.updateActiveCycle}
        onOpenGuide={openGuide}
        startEditing={d === extraDate}
      />
    );

  return (
    <div className="print-stack animate-fadeUp">
      {/* 1. פתיחה */}
      <section className="lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1">
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">תקופת הזריקות</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink/65 sm:text-base">
            לא צריך לזכור הכול לבד. כאן אפשר לתעד בכמה שניות את הזריקות והמעקבים של כל יום.
          </p>
          <p className="mt-3 flex max-w-xl items-start gap-2 rounded-xl border-2 border-teal-100 bg-teal-50/70 px-3.5 py-2.5 text-sm leading-relaxed text-ink/80">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={2.25} aria-hidden="true" />
            את המינון, השעה ושינויי הטיפול קובעת היחידה המטפלת. היומן עוזר לך לתעד את ההנחיות שקיבלת.
          </p>
        </div>
        <div className="no-print mt-4 flex justify-center lg:mt-0 lg:shrink-0 lg:justify-end">
          <HenIllustration name="step-monitoring" blob="mint" sizeClassName="w-36 sm:w-40 lg:w-52" />
        </div>
      </section>

      <SyncNote api={api} />

      {!ready || !today ? (
        <p className="mt-8 text-sm text-ink/50">טוענת את היומן…</p>
      ) : !activeCycle ? (
        <CycleSetup onCreate={(d) => api.createCycle(d, autoLabel(journal.cycles.length))} defaultDate={today} />
      ) : (
        <>
          <CycleBar api={api} cycle={activeCycle} cycles={journal.cycles} />

          {/* 2. היומן — כרטיס לכל יום, או טבלה של כל התקופה */}
          <section aria-labelledby="journal-title" className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="journal-title" className="font-sans text-lg font-extrabold text-ink sm:text-xl">
                היומן שלי
              </h2>
              <div className="no-print flex gap-1 rounded-full bg-mist-100 p-1" role="group" aria-label="תצוגת היומן">
                {(
                  [
                    ["cards", "ימים", LayoutList],
                    ["table", "טבלה", Table2],
                  ] as const
                ).map(([v, text, Icon]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => changeView(v)}
                    className={`inline-flex min-h-[34px] items-center gap-1 rounded-full px-3 text-xs font-bold transition-colors ${
                      view === v ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink"
                    }`}
                    data-testid={`view-${v}`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
                    {text}
                  </button>
                ))}
              </div>
            </div>

            {view === "table" ? (
              <div className="mt-3">
                <JournalTable cycle={activeCycle} today={today} onOpenDay={goToDay} />
                <p className="mt-2 text-xs text-ink/50">כל ערך מוצג עם היחידה שהוזנה. לחיצה על ״פתיחה״ מעבירה לכרטיס של היום.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-4" data-testid="day-cards">
                {renderCard(topDate)}

                {futureDates.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowFuture((v) => !v)}
                      aria-expanded={showFuture}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-ink"
                      data-testid="future-toggle"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${showFuture ? "rotate-180" : ""}`} strokeWidth={2.5} aria-hidden="true" />
                      הימים הבאים ({futureDates.length})
                    </button>
                    {showFuture && <div className="mt-3 space-y-4">{futureDates.map(renderCard)}</div>}
                  </div>
                )}

                <AddDay cycle={activeCycle} taken={[topDate, ...otherDates]} onPick={goToDay} />

                {pastDates.length > 0 && <h3 className="pt-2 text-sm font-bold text-ink/60">ימים קודמים</h3>}
                {pastDates.map(renderCard)}
              </div>
            )}
          </section>
        </>
      )}

      {/* 3. עזרה בהזרקה — מכווץ כברירת מחדל */}
      <section id="injection-help" className="no-print mt-10 scroll-mt-24 lg:scroll-mt-8" data-testid="injection-help">
        <button
          type="button"
          onClick={() => setGuidesOpen((v) => !v)}
          aria-expanded={guidesOpen}
          aria-controls="injection-help-body"
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-mist-200 bg-white px-4 py-3.5 text-right shadow-sm transition-colors hover:border-warm-300"
          data-testid="injection-help-toggle"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-100 text-ink" aria-hidden="true">
            <LifeBuoy className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-ink">צריכה עזרה בהזרקה?</span>
            <span className="block text-xs text-ink/55">סרטוני הדרכה ועלונים רשמיים לכל תרופה</span>
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-ink/50 transition-transform ${guidesOpen ? "rotate-180" : ""}`} strokeWidth={2.25} aria-hidden="true" />
        </button>
        <div id="injection-help-body" hidden={!guidesOpen} className="mt-5">
          <GuidesLibrary
            myGuideIds={myGuideIds}
            openGuideId={openGuideId}
            onToggleGuide={(id) => setOpenGuideId((cur) => (cur === id ? null : id))}
            showAll={showAllGuides}
            onToggleShowAll={() => setShowAllGuides((v) => !v)}
          />
        </div>
      </section>
    </div>
  );
}

function AddDay({ cycle, taken, onPick }: { cycle: JournalCycle; taken: string[]; onPick: (d: string) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [err, setErr] = useState("");
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="no-print inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline"
        data-testid="add-day"
      >
        <CalendarPlus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        תיעוד של יום אחר
      </button>
    );
  }
  return (
    <form
      className="no-print flex flex-wrap items-end gap-2 rounded-2xl bg-mist-100/70 px-4 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isValidISODate(date)) return setErr("בחרי תאריך");
        setErr("");
        setOpen(false);
        setDate("");
        onPick(date);
      }}
      data-testid="add-day-form"
    >
      <label className="text-xs font-semibold text-ink/70">
        איזה יום?
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} w-44`} dir="ltr" />
      </label>
      <button type="submit" className="min-h-[42px] rounded-full bg-teal-600 px-4 text-sm font-bold text-ink hover:bg-teal-500">
        {date && taken.includes(date) ? "מעבר ליום" : "פתיחת היום"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="min-h-[42px] px-2 text-sm font-semibold text-ink/55">
        ביטול
      </button>
      {date && isValidISODate(date) && (
        <p className="w-full text-xs text-ink/55">
          {dayNumber(cycle, date) >= 1 ? `יום ${dayNumber(cycle, date)} בסבב` : "לפני תחילת הסבב"} · {formatDateLong(date)}
        </p>
      )}
      {err && <p className="w-full text-xs font-semibold text-teal-700">{err}</p>}
    </form>
  );
}

function SyncNote({ api }: { api: ReturnType<typeof useInjectionJournal> }) {
  if (!api.ready) return null;
  if (!api.isSignedIn) {
    return (
      <p className="no-print mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/55" data-testid="sync-note">
        <CloudOff className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        היומן נשמר רק בדפדפן הזה.
        <button type="button" onClick={() => signIn("google")} className="font-semibold text-teal-700 hover:underline">
          התחברי עם Google כדי לשמור אותו בחשבון
        </button>
      </p>
    );
  }
  const text =
    api.syncState === "offline"
      ? "אין כרגע חיבור לשמירה בחשבון, השינויים נשמרים בדפדפן ויישמרו בחשבון כשיחזור החיבור."
      : api.syncState === "saving" || api.syncState === "loading"
        ? "שומרת בחשבון…"
        : "היומן נשמר בחשבון שלך.";
  return (
    <p className="no-print mt-4 flex items-center gap-2 text-xs text-ink/55" data-testid="sync-note">
      {api.syncState === "offline" ? <CloudOff className="h-3.5 w-3.5" strokeWidth={2} /> : <Cloud className="h-3.5 w-3.5" strokeWidth={2} />}
      {text}
    </p>
  );
}

function CycleSetup({ onCreate, defaultDate, onCancel }: { onCreate: (startDate: string) => void; defaultDate: string; onCancel?: () => void }) {
  const [date, setDate] = useState(defaultDate);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (date) onCreate(date);
      }}
      className="mt-6 rounded-3xl border-2 border-mist-200 bg-white p-5 shadow-card sm:p-6"
      data-testid="cycle-setup"
    >
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
        <CalendarDays className="h-5 w-5 text-teal-700" strokeWidth={2} aria-hidden="true" />
        מתי מתחילות הזריקות?
      </h2>
      <p className="mt-1 text-sm text-ink/60">לפי התאריך הזה נספור ״יום 1״, ״יום 2״ וכן הלאה. אפשר לשנות אותו בהמשך.</p>
      <label className="mt-4 block max-w-xs text-xs font-semibold text-ink/70">
        יום הזריקה הראשון
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} dir="ltr" />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="submit" className="min-h-[44px] rounded-full bg-teal-600 px-6 text-sm font-bold text-ink hover:bg-teal-500">
          מתחילה מעקב
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="min-h-[44px] px-3 text-sm font-semibold text-ink/55">
            ביטול
          </button>
        )}
      </div>
    </form>
  );
}

function CycleBar({
  api,
  cycle,
  cycles,
}: {
  api: ReturnType<typeof useInjectionJournal>;
  cycle: JournalCycle;
  cycles: JournalCycle[];
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [date, setDate] = useState(cycle.startDate);
  const [label, setLabel] = useState(cycle.label);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setDate(cycle.startDate);
    setLabel(cycle.label);
    setConfirmDelete(false);
  }, [cycle.id, cycle.startDate, cycle.label]);

  if (creating) {
    return (
      <CycleSetup
        defaultDate={todayISO()}
        onCancel={() => setCreating(false)}
        onCreate={(d) => {
          api.createCycle(d, autoLabel(cycles.length));
          setCreating(false);
          setMoreOpen(false);
        }}
      />
    );
  }

  return (
    <div className="mt-6 rounded-2xl bg-mist-100/70 px-4 py-3 text-sm" data-testid="cycle-bar">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-bold text-ink">{cycle.label}</span>
        <span className="text-ink/60">התחלה: {formatDateLong(cycle.startDate)}</span>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="no-print inline-flex items-center gap-1 text-xs font-semibold text-ink/60 hover:text-ink sm:mr-auto"
          data-testid="more-options"
        >
          <Settings2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          אפשרויות נוספות
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>

      {moreOpen && (
        <div className="no-print mt-3 space-y-3 border-t border-mist-200 pt-3" data-testid="more-options-panel">
          {cycles.length > 1 && (
            <label className="block text-xs font-semibold text-ink/70">
              מעבר לסבב אחר
              <select
                value={cycle.id}
                onChange={(e) => api.setActiveCycle(e.target.value)}
                className="mt-1 block rounded-xl border border-mist-200 bg-white px-3 py-2 text-sm"
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!date) return;
              api.updateActiveCycle((c) => ({ ...c, startDate: date, label: label.trim() || c.label }));
              setSavedMsg(true);
              setTimeout(() => setSavedMsg(false), 2200);
            }}
          >
            <label className="text-xs font-semibold text-ink/70">
              שם הסבב
              <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} className={`${inputCls} w-44`} data-testid="cycle-label" />
            </label>
            <label className="text-xs font-semibold text-ink/70">
              יום הזריקה הראשון
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} w-44`} dir="ltr" />
            </label>
            <button type="submit" className="min-h-[42px] rounded-full bg-teal-600 px-4 text-xs font-bold text-ink">
              שמירה
            </button>
            {savedMsg && (
              <span className="self-center text-xs font-semibold text-warm-500" role="status">
                נשמר ✓
              </span>
            )}
          </form>
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <button type="button" onClick={() => setCreating(true)} className="text-teal-700 hover:underline">
              סבב חדש
            </button>
            {confirmDelete ? (
              <span className="inline-flex gap-2">
                <span className="text-ink/60">למחוק את כל הסבב?</span>
                <button type="button" onClick={() => api.deleteCycle(cycle.id)} className="font-bold text-teal-700 hover:underline">
                  כן
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-ink/55 hover:underline">
                  לא
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-ink/50 hover:text-ink/80">
                מחיקת הסבב
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
