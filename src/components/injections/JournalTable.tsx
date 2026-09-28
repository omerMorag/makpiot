"use client";

import { Check } from "lucide-react";
import {
  PRESET_TESTS,
  addDays,
  dayNumber,
  doseText,
  findPresetValue,
  formatDateShort,
  getDay,
  isValidISODate,
  type BloodValue,
  type JournalCycle,
} from "@/lib/injectionJournal";

/** טווח הטבלה: מיום ההתחלה (או הרשומה המוקדמת) ועד המאוחר מבין היום לרשומה האחרונה */
function tableDates(cycle: JournalCycle, today: string): string[] {
  const keys = Object.keys(cycle.days).filter(isValidISODate).sort();
  const first = keys[0] && keys[0] < cycle.startDate ? keys[0] : cycle.startDate;
  let last = today > cycle.startDate ? today : cycle.startDate;
  if (keys.length && keys[keys.length - 1] > last) last = keys[keys.length - 1];
  const out: string[] = [];
  for (let d = first; d <= last && out.length < 120; d = addDays(d, 1)) out.push(d);
  return out;
}

function isPreset(v: BloodValue, values: BloodValue[]) {
  return PRESET_TESTS.some((p) => findPresetValue(values, p) === v);
}

/**
 * כל התקופה בטבלה אחת: זריקות ותוצאות מעקב לפי יום. כל ערך מוצג עם היחידה
 * שלו, בלי חישובים, השוואות או פרשנות. לחיצה על שורה פותחת את כרטיס היום.
 */
export default function JournalTable({ cycle, today, onOpenDay }: { cycle: JournalCycle; today: string; onOpenDay: (d: string) => void }) {
  const dates = tableDates(cycle, today);
  const hasOthers = dates.some((d) => {
    const vals = getDay(cycle, d).monitoring?.bloodValues ?? [];
    return vals.some((v) => !isPreset(v, vals));
  });

  return (
    <div className="relative overflow-x-auto rounded-2xl border-2 border-mist-200 bg-white" data-testid="journal-table">
      <table className="w-full border-collapse sm:min-w-[600px] text-right text-sm">
        <thead>
          <tr className="border-b-2 border-mist-200 bg-mist-50 text-xs font-bold text-ink/65">
            <th scope="col" className="px-3 py-2.5">יום</th>
            <th scope="col" className="px-3 py-2.5">זריקות</th>
            <th scope="col" className="px-3 py-2.5 sm:hidden">מעקב</th>
            <th scope="col" className="hidden px-3 py-2.5 sm:table-cell">E2</th>
            <th scope="col" className="hidden px-3 py-2.5 sm:table-cell">פרוגסטרון</th>
            <th scope="col" className="hidden px-3 py-2.5 sm:table-cell">LH</th>
            {hasOthers && <th scope="col" className="hidden px-3 py-2.5 sm:table-cell">בדיקות נוספות</th>}
            <th scope="col" className="px-3 py-2.5"><span className="sr-only">פתיחה</span></th>
          </tr>
        </thead>
        <tbody>
          {dates.map((d) => {
            const day = getDay(cycle, d);
            const vals = day.monitoring?.bloodValues ?? [];
            const n = dayNumber(cycle, d);
            const isToday = d === today;
            const future = d > today;
            const empty = !day.meds.length && !day.monitoring;
            return (
              <tr
                key={d}
                className={`border-b border-mist-100 align-top last:border-0 ${isToday ? "bg-teal-50/60" : ""} ${future ? "text-ink/55" : ""}`}
                data-testid="table-row"
                data-date={d}
              >
                <th scope="row" className="whitespace-nowrap px-2 py-2.5 sm:px-3 font-semibold text-ink">
                  {n >= 1 ? `יום ${n}` : "לפני"}
                  <span className="block text-xs font-normal text-ink/50">
                    {formatDateShort(d)}
                    {isToday && " · היום"}
                  </span>
                </th>
                <td className="px-2 py-2.5 sm:px-3">
                  {day.meds.length ? (
                    <ul className="space-y-0.5">
                      {day.meds.map((m) => (
                        <li key={m.id} className="flex items-center gap-1">
                          {m.done && <Check className="h-3.5 w-3.5 shrink-0 text-warm-500" strokeWidth={3} aria-label="הוזרק" />}
                          <span>
                            {m.name}
                            {doseText(m) && (
                              <>
                                {" "}
                                <bdi dir="ltr" className="text-ink/65">
                                  {doseText(m)}
                                </bdi>
                              </>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-ink/30">-</span>
                  )}
                </td>
                <td className="px-2 py-2.5 text-xs sm:hidden" data-testid="cell-mobile-mon">
                  {vals.length ? (
                    vals.map((v) => (
                      <span key={v.id} className="block whitespace-nowrap">
                        <span className="font-semibold text-ink/70">{PRESET_TESTS.find((p) => findPresetValue(vals, p) === v)?.id === "e2" ? "E2" : v.name}</span>{" "}
                        <bdi dir="ltr">
                          {v.value}
                          {v.unit && <span className="text-ink/50"> {v.unit}</span>}
                        </bdi>
                      </span>
                    ))
                  ) : (
                    <span className="text-ink/30">-</span>
                  )}
                </td>
                {PRESET_TESTS.map((p) => {
                  const v = findPresetValue(vals, p);
                  return (
                    <td key={p.id} className="hidden whitespace-nowrap px-3 py-2.5 sm:table-cell" data-testid={`cell-${p.id}`}>
                      {v ? (
                        <bdi dir="ltr">
                          {v.value}
                          {v.unit && <span className="text-xs text-ink/50"> {v.unit}</span>}
                        </bdi>
                      ) : (
                        <span className="text-ink/30">-</span>
                      )}
                    </td>
                  );
                })}
                {hasOthers && (
                  <td className="hidden px-3 py-2.5 text-xs sm:table-cell">
                    {vals
                      .filter((v) => !isPreset(v, vals))
                      .map((v) => (
                        <bdi key={v.id} dir="auto" className="block">
                          {v.name} {v.value} {v.unit}
                        </bdi>
                      ))}
                  </td>
                )}
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => onOpenDay(d)}
                    className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                    aria-label={`${empty ? "תיעוד" : "פתיחה"}: ${n >= 1 ? `יום ${n}` : formatDateShort(d)}`}
                  >
                    {empty ? "תיעוד" : "פתיחה"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
