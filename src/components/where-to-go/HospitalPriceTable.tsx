"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, ChevronDown, CircleAlert, MapPin } from "lucide-react";
import type { HospitalPriceRow } from "@/data/types";
import { comparisonGuideSource } from "@/data/hospitalPrices";

const REGIONS = ["הכול", "מרכז", "ירושלים", "צפון", "דרום"] as const;
const STATUS_OPTIONS = [
  { value: "all", label: "הכול" },
  { value: "verified", label: "מאומת" },
  { value: "needs-verification", label: "דורש אימות" },
] as const;

function pillClass(active: boolean) {
  return `rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
    active
      ? "bg-teal-600 text-ink shadow-sm"
      : "bg-mist-100 text-ink/60 hover:bg-mist-200"
  }`;
}

interface HospitalPriceTableProps {
  rows: HospitalPriceRow[];
}

export default function HospitalPriceTable({ rows }: HospitalPriceTableProps) {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("הכול");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (region !== "הכול" && row.region !== region) return false;
        if (status !== "all" && row.verification !== status) return false;
        return true;
      }),
    [rows, region, status]
  );

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink/50">
          <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
          אזור:
        </span>
        {REGIONS.map((r) => (
          <button key={r} type="button" onClick={() => setRegion(r)} className={pillClass(region === r)}>
            {r}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink/50">
          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
          סטטוס מחיר:
        </span>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(s.value)}
            className={pillClass(status === s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs text-ink/45">
        מציגה {filtered.length} מתוך {rows.length} בתי חולים
      </p>

      <div className="flex flex-col gap-2.5">
        {filtered.map((row) => {
          const isOpen = expanded.has(row.name);
          const panelId = `hospital-info-${row.name}`;
          return (
            <div
              key={row.name}
              className="overflow-hidden rounded-2xl border-2 border-mist-200 bg-white shadow-card"
            >
              <button
                type="button"
                onClick={() => toggle(row.name)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-start justify-between gap-3 p-4 text-right sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="font-sans text-base font-bold text-ink sm:text-lg">{row.name}</h3>
                    <span className="text-xs text-ink/40">· {row.region}</span>
                    {row.verification === "verified" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warm-100 px-2 py-0.5 text-[11px] font-semibold text-warm-500 ring-1 ring-inset ring-warm-300/60">
                        <BadgeCheck className="h-3 w-3" strokeWidth={2.5} />
                        מאומת
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-mist-100 px-2 py-0.5 text-[11px] font-semibold text-ink/50 ring-1 ring-inset ring-mist-200">
                        <CircleAlert className="h-3 w-3" strokeWidth={2.5} />
                        דורש אימות
                      </span>
                    )}
                    {row.fundArrangements?.map((fund) => (
                      <span
                        key={fund}
                        className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-inset ring-teal-100"
                      >
                        בהסדר עם {fund}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-ink/70">
                    סבב ראשון: {row.cycle1Price}
                    {row.cycle2Price && <> · שני סבבים: {row.cycle2Price}</>}
                  </p>
                </div>
                <ChevronDown
                  className={`mt-1 h-4 w-4 shrink-0 text-ink/40 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </button>

              {isOpen && (
                <div id={panelId} className="border-t border-mist-100 bg-mist-50/60 p-4 sm:p-5">
                  <dl className="grid gap-2.5 text-sm leading-relaxed text-ink/70 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold text-ink/45">מה ידוע שכלול</dt>
                      <dd className="mt-0.5">{row.whatsIncluded ?? "לא פורסם, יש לברר מול היחידה"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-ink/45">טלפון וזמני המתנה</dt>
                      <dd className="mt-0.5">לא זמין באתר, יש לברר מול היחידה</dd>
                    </div>
                    {row.needsVerify && (
                      <div>
                        <dt className="text-xs font-semibold text-ink/45">מה צריך לאמת</dt>
                        <dd className="mt-0.5">{row.needsVerify}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs font-semibold text-ink/45">מקור המחיר</dt>
                      <dd className="mt-0.5">
                        {row.source ? (
                          <a
                            href={row.source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-teal-700 underline-offset-4 hover:text-teal-800 hover:underline"
                          >
                            {row.source.label}
                          </a>
                        ) : (
                          <a
                            href={comparisonGuideSource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-teal-700 underline-offset-4 hover:text-teal-800 hover:underline"
                          >
                            {comparisonGuideSource.label}
                          </a>
                        )}
                      </dd>
                    </div>
                  </dl>

                  {row.caveat && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-deep/10 p-3 text-sm leading-relaxed text-ink/70">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-deep" strokeWidth={2} />
                      <p>
                        <span className="font-semibold text-ink">שימי לב:</span> {row.caveat}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-mist-200 p-6 text-center text-sm text-ink/50">
            אין בתי חולים שמתאימים לסינון הזה.
          </p>
        )}
      </div>
    </div>
  );
}
