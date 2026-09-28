"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  NotebookPen,
  Package,
  Plus,
  X,
} from "lucide-react";
import { testItems } from "@/data/tests";
import type { TestItem, TestSubItemPriceInfo } from "@/data/types";
import TestPriceInfoModal from "./TestPriceInfoModal";

interface TestChecklistProps {
  completedTests: Set<number>;
  onToggle: (id: number) => void;
  /** מפתחות "testId:subIndex" — אילו רכיבים במיני-הצ'קליסט של כל בדיקה כבר סומנו */
  completedTestSubItems: Set<string>;
  onToggleSubItem: (testId: number, subIndex: number) => void;
  /** מפתח: `testId` (תאריך משותף לקבוצה) או `testId:subIndex` (תאריך נפרד
   *  לרכיב ספציפי) — ערך: תאריך ביצוע (YYYY-MM-DD) שהוזן ידנית */
  testDates: Record<string, string>;
  onUpdateDate: (key: string, date: string) => void;
}

type RecordedTone = "recorded" | "empty" | "valid" | "expired";

interface RecordedStatus {
  label: string;
  tone: RecordedTone;
}

/**
 * מחשבת מה להציג ליד תאריך הביצוע. ברירת המחדל — ואצל כל תשע הקבוצות נכון
 * לעכשיו, ר' tests.ts — היא הצגה נטולת-ניחוש: יש תאריך -> הערה עדינה לבדוק
 * מול היחידה אם צריך לחדש (לא קביעת "בתוקף/פג תוקף" מטעה שמבוססת על כלל
 * גורף); אין תאריך -> הזמנה עדינה להזין למעקב אישי בלבד, בלי לרמוז שהזנה
 * "תגלה" את התוקף. test.validityDays נשאר מנגנון זמין לעתיד, למקרה שתתווסף
 * דרישת תוקף שאומתה בפועל מול יחידה ספציפית — אף קבוצה לא משתמשת בו כרגע.
 */
function getRecordedStatus(test: TestItem, dateStr: string | undefined): RecordedStatus {
  if (!dateStr) {
    return { label: "הזיני תאריך ביצוע למעקב אישי", tone: "empty" };
  }
  const performedDate = new Date(dateStr);
  if (Number.isNaN(performedDate.getTime())) {
    return { label: "תאריך לא תקין", tone: "empty" };
  }
  if (!test.validityDays) {
    const formattedDate = performedDate.toLocaleDateString("he-IL");
    return { label: `בוצע ב-${formattedDate}. בדקי מול היחידה אם צריך לחדש.`, tone: "recorded" };
  }
  const expiryDate = new Date(performedDate);
  expiryDate.setDate(expiryDate.getDate() + test.validityDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formattedExpiry = expiryDate.toLocaleDateString("he-IL");
  if (expiryDate >= today) {
    return { label: `בתוקף עד ${formattedExpiry}`, tone: "valid" };
  }
  return { label: `פג תוקף (מ-${formattedExpiry})`, tone: "expired" };
}

const STATUS_STYLES: Record<RecordedTone, string> = {
  valid: "bg-teal-50 text-teal-700 ring-teal-200/60",
  expired: "bg-red-50 text-red-700 ring-red-200/60",
  recorded: "bg-mist-50 text-ink/60 ring-mist-200/60",
  empty: "bg-mist-50 text-ink/45 ring-mist-200/60",
};

const STATUS_ICONS: Record<RecordedTone, typeof CheckCircle2> = {
  valid: CheckCircle2,
  expired: AlertTriangle,
  recorded: HelpCircle,
  empty: Calendar,
};

/**
 * צ'קליסט הבדיקות. כל בדיקה מוצגת ככרטיס Accordion בפני עצמו: במצב סגור
 * רואים כותרת + סטטוס (הושלם / לא הושלם) + מיני-צ'קליסט של הרכיבים בתוך
 * הבדיקה עצמה (למשל AMH בתוך "פרופיל הורמונלי") שניתן לסמן אחד-אחד; בפתיחה
 * מתגלה גם טקסט ההנחיה המלא (detail) בלי שינוי. הבדיקה כולה מסומנת
 * כ"הושלמה" אוטומטית רק כשכל הרכיבים שלה מסומנים — הסימון ה"ראשי" בראש
 * הכרטיס נשאר קיים כקיצור דרך שמסמן/מבטל את כל הרכיבים יחד.
 *
 * "תאריך ביצוע" הוא שדה משותף לכל הקבוצה כברירת מחדל (כמו קודם), אבל כשיש
 * יותר מרכיב אחד בקבוצה אפשר גם לתת תאריך נפרד לרכיב ספציפי (למשל AMH ביום
 * אחר מ-FSH/אסטרדיול) — ר' renderSubItems: לחיצה על "תאריך נפרד" ליד רכיב
 * פותחת שדה תאריך קומפקטי רק בשבילו, כדי לא להציג את כל שדות התאריך
 * הנפרדים בבת אחת כברירת מחדל. רכיב שכבר יש לו תאריך נפרד שמור מוצג פתוח
 * מיד (כדי לא "להסתיר" נתון קיים מאחורי לחיצה).
 *
 * "הנחיות מיוחדות" / "מה לבדוק מול היחידה" / "מה להביא" מוצגים כל אחד רק
 * כשיש בו תוכן ממשי (test.prepNote / test.unitCheckNote / test.whatToBring)
 * — קבוצה בלי הכנה מיוחדת לא מציגה שדה ריק. "בתוקף/פג תוקף" הוחלף בהערה
 * נטולת-ניחוש (getRecordedStatus) שלא קובעת תוקף מבלי שהוא אומת בפועל.
 */
export default function TestChecklist({
  completedTests,
  onToggle,
  completedTestSubItems,
  onToggleSubItem,
  testDates,
  onUpdateDate,
}: TestChecklistProps) {
  const [openTestId, setOpenTestId] = useState<number | null>(null);
  // מפתחות "testId:subIndex" ששדה התאריך הנפרד שלהם נפתח ידנית (בלי שיש
  // עדיין ערך שמור) — נשמר כאן, לא ב-progress, כי זה מצב UI זמני גרידא
  const [expandedDateKeys, setExpandedDateKeys] = useState<Set<string>>(new Set());
  // תוכן חלונית "איפה אפשר לבצע וכמה זה עולה?" הפתוחה כרגע, או null כשאין
  // חלונית פתוחה — state UI זמני גרידא, לא חלק מ-progress (ר' TestPriceInfoModal.tsx)
  const [activePriceInfo, setActivePriceInfo] = useState<TestSubItemPriceInfo | null>(null);

  const toggleOpen = (id: number) => {
    setOpenTestId((prev) => (prev === id ? null : id));
  };

  const toggleDateExpanded = (key: string) => {
    setExpandedDateKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
    <div>
      <p className="mb-4 text-sm leading-relaxed text-ink/60">
        סמני מה כבר עשית, ואז השווי לרשימה הרשמית של היחידה שבחרת.
      </p>
      <p className="-mt-2 mb-4 flex items-center gap-1.5 text-xs font-semibold text-teal-700 sm:text-sm" data-testid="separate-date-legend">
        להוספת תאריך נפרד לבדיקה, לחצי על<span className="sr-only"> הפלוס</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 ring-1 ring-inset ring-teal-200" aria-hidden="true">
          <Plus className="h-3 w-3" strokeWidth={2.75} />
        </span>
      </p>

      <ul className="flex flex-col gap-2.5 sm:gap-3">
        {testItems.map((test) => {
          const Icon = test.icon;
          const isDone = completedTests.has(test.id);
          const isOpen = openTestId === test.id;
          const checkboxId = `test-checkbox-${test.id}`;
          const panelId = `test-detail-${test.id}`;
          const hasMultipleSubItems = (test.subItems?.length ?? 0) > 1;
          const groupDateKey = String(test.id);
          const groupDateValue = testDates[groupDateKey] ?? "";
          const status = getRecordedStatus(test, groupDateValue || undefined);
          const StatusIcon = STATUS_ICONS[status.tone];

          return (
            <li
              key={test.id}
              className={`overflow-hidden rounded-2xl border-2 bg-white shadow-card transition-colors duration-300 ${
                isDone ? "border-teal-200 bg-teal-50/30" : "border-mist-200"
              }`}
            >
              <div className="flex items-start gap-3 p-4 sm:p-5">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggle(test.id)}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-teal-600"
                />
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                    isDone ? "bg-teal-100 text-teal-700" : "bg-mist-100 text-deep"
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>

                <div className="min-w-0 flex-1">
                  <label htmlFor={checkboxId} className="flex flex-wrap items-center gap-2 cursor-pointer">
                    <span className="text-sm font-semibold text-ink sm:text-base">{test.title}</span>
                    {isDone && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-700 ring-1 ring-inset ring-teal-200/60">
                        <Check className="h-3 w-3" strokeWidth={3} />
                        הושלם
                      </span>
                    )}
                  </label>

                  <button
                    type="button"
                    onClick={() => toggleOpen(test.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-teal-700 transition-colors hover:text-teal-800 sm:text-sm"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      strokeWidth={2.5}
                    />
                    {isOpen ? "הסתרת פרטים נוספים" : "פרטים נוספים"}
                  </button>
                </div>
              </div>

              {/* "פרטים נוספים" (test.detail) — ממוקם ישירות מתחת לכפתור שפותח
                  אותו, לפני מיני-הצ'קליסט וטבלת התאריך/הנחיות שמתחתיו
                  (שניהם גלויים תמיד ולא חלק מהפתיחה/סגירה). קודם זה היה
                  הפריט האחרון בכרטיס, כך שהטקסט "נפתח" למטה, מתחת לכל תוכן
                  הכרטיס, לא מתחת לכפתור עצמו כמו שמצופה מ-accordion. */}
              <div
                id={panelId}
                role="region"
                aria-hidden={!isOpen}
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className={`min-h-0 overflow-hidden ${isOpen ? "border-t border-mist-100" : ""}`}>
                  <p className="px-4 py-4 text-xs leading-relaxed text-ink/60 sm:px-5 sm:text-sm">
                    {test.detail}
                  </p>
                </div>
              </div>

              {test.subItems && test.subItems.length > 0 && (
                <ul className="flex flex-col gap-2 border-t border-mist-100 px-4 py-3 sm:px-5">
                  {test.subItems.map((item, index) => {
                    const subKey = `${test.id}:${index}`;
                    const isSubDone = completedTestSubItems.has(subKey);
                    const subCheckboxId = `test-subitem-${test.id}-${index}`;
                    const subDateValue = testDates[subKey] ?? "";
                    const isDateExpanded = expandedDateKeys.has(subKey) || Boolean(subDateValue);
                    return (
                      <li key={subKey} className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <input
                            id={subCheckboxId}
                            type="checkbox"
                            checked={isSubDone}
                            onChange={() => onToggleSubItem(test.id, index)}
                            className="h-4 w-4 shrink-0 cursor-pointer accent-teal-600"
                          />
                          <label
                            htmlFor={subCheckboxId}
                            className={`cursor-pointer text-xs sm:text-sm ${
                              isSubDone ? "text-ink/40 line-through" : "text-ink/75"
                            }`}
                          >
                            {item.label}
                          </label>
                          {hasMultipleSubItems && !isDateExpanded && (
                            <button
                              type="button"
                              onClick={() => toggleDateExpanded(subKey)}
                              aria-label={`הוספת תאריך נפרד: ${item.label}`}
                              title="הוספת תאריך נפרד"
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200 transition-colors hover:bg-teal-100 hover:text-teal-800"
                              data-testid="separate-date-plus"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={2.75} aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        {item.note && (
                          <p className="pr-6 text-[11px] leading-snug text-ink/50 sm:text-xs">{item.note}</p>
                        )}

                        {item.secondaryNote && (
                          <p className="pr-6 text-[11px] leading-snug text-ink/50 sm:text-xs">
                            {item.secondaryNote}
                          </p>
                        )}

                        {item.priceInfo && (
                          <button
                            type="button"
                            onClick={() => setActivePriceInfo(item.priceInfo!)}
                            className="w-fit pr-6 text-[11px] font-semibold text-teal-700/90 underline decoration-teal-300 underline-offset-2 transition-colors hover:text-teal-800 sm:text-xs"
                          >
                            {item.priceInfo.linkLabel}
                          </button>
                        )}

                        {hasMultipleSubItems && isDateExpanded && (
                          <div className="flex items-center gap-1.5 pr-6">
                            <input
                              type="date"
                              value={subDateValue}
                              onChange={(e) => onUpdateDate(subKey, e.target.value)}
                              aria-label={`תאריך ביצוע נפרד: ${item.label}`}
                              className="rounded-lg border border-mist-200 bg-white px-2 py-1 text-[11px] text-ink/80 transition-colors focus:border-teal-400 sm:text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateDate(subKey, "");
                                setExpandedDateKeys((prev) => {
                                  const next = new Set(prev);
                                  next.delete(subKey);
                                  return next;
                                });
                              }}
                              aria-label={`הסרת תאריך נפרד: ${item.label}`}
                              className="text-ink/35 transition-colors hover:text-ink/60"
                            >
                              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="flex flex-col gap-3 border-t border-mist-100 px-4 py-3 sm:px-5">
                <div>
                  <label
                    htmlFor={`test-date-${test.id}`}
                    className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-ink/55 sm:text-xs"
                  >
                    <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                    תאריך ביצוע
                  </label>
                  <input
                    id={`test-date-${test.id}`}
                    type="date"
                    value={groupDateValue}
                    onChange={(e) => onUpdateDate(groupDateKey, e.target.value)}
                    aria-label={`תאריך ביצוע: ${test.title}`}
                    className="w-full max-w-[220px] rounded-lg border border-mist-200 bg-white px-2 py-1.5 text-xs text-ink/80 transition-colors focus:border-teal-400 sm:text-sm"
                  />
                </div>

                {test.prepNote && (
                  <div className="rounded-xl bg-mist-50/70 p-2.5">
                    <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-ink/55 sm:text-xs">
                      <NotebookPen className="h-3.5 w-3.5" strokeWidth={2} />
                      הנחיות מיוחדות
                    </p>
                    <p className="text-xs leading-relaxed text-ink/65 sm:text-sm">{test.prepNote}</p>
                  </div>
                )}

                {test.unitCheckNote && (
                  <div className="rounded-xl bg-mist-50/70 p-2.5">
                    <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-ink/55 sm:text-xs">
                      <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
                      מה לבדוק מול היחידה
                    </p>
                    <p className="text-xs leading-relaxed text-ink/65 sm:text-sm">{test.unitCheckNote}</p>
                  </div>
                )}

                {test.whatToBring && (
                  <div className="rounded-xl bg-mist-50/70 p-2.5">
                    <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-ink/55 sm:text-xs">
                      <Package className="h-3.5 w-3.5" strokeWidth={2} />
                      מה להביא
                    </p>
                    <p className="text-xs leading-relaxed text-ink/65 sm:text-sm">{test.whatToBring}</p>
                  </div>
                )}

                <p
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ring-1 ring-inset sm:text-xs ${STATUS_STYLES[status.tone]}`}
                >
                  <StatusIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                  {status.label}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-mist-50 p-3.5 text-xs leading-relaxed text-ink/60 sm:text-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-deep/50" strokeWidth={2} />
        <p>
          חשוב לדעת: זו רשימה כללית בלבד. סוג הבדיקות, התזמון והתוקף משתנים בין רופאים
          ויחידות.
        </p>
      </div>
    </div>

    <TestPriceInfoModal info={activePriceInfo} onClose={() => setActivePriceInfo(null)} />
    </>
  );
}
