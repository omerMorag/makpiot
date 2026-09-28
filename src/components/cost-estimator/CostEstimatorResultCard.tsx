"use client";

import { AlertTriangle, Calendar, CheckCircle2, HelpCircle, Wallet } from "lucide-react";
import DisclaimerNote from "@/components/shared/DisclaimerNote";
import type { EstimateResult, LineItemSource } from "./costEstimatorModel";

function formatILS(amount: number): string {
  return `${amount.toLocaleString("he-IL")} ₪`;
}

function StatTile({ label, min, max }: { label: string; min: number; max: number }) {
  return (
    <div className="rounded-2xl border-2 border-mist-200 bg-white p-4 shadow-card sm:p-5">
      <p className="text-xs font-medium text-ink/50">{label}</p>
      <p className="mt-2 font-sans text-xl font-extrabold text-ink sm:text-2xl" dir="ltr">
        {min === max ? formatILS(min) : `${formatILS(min)} עד ${formatILS(max)}`}
      </p>
    </div>
  );
}

const SOURCE_STYLES: Record<LineItemSource, string> = {
  estimated: "bg-teal-50 text-teal-700 ring-teal-200/60",
  manual: "bg-warm-100 text-deep ring-warm-300/60",
  unpriced: "bg-mist-50 text-ink/45 ring-mist-200/60",
};

const SOURCE_ICONS: Record<LineItemSource, typeof CheckCircle2> = {
  estimated: CheckCircle2,
  manual: Wallet,
  unpriced: HelpCircle,
};

const SOURCE_LABELS: Record<LineItemSource, string> = {
  estimated: "הערכה",
  manual: "הוזן ידנית",
  unpriced: "טרם עודכן",
};

interface CostEstimatorResultCardProps {
  result: EstimateResult;
  priceLastUpdatedAt: string | null;
}

export default function CostEstimatorResultCard({ result, priceLastUpdatedAt }: CostEstimatorResultCardProps) {
  const {
    lineItems,
    perCycleMin,
    perCycleMax,
    oneTimeMin,
    oneTimeMax,
    annualMin,
    annualMax,
    totalMin,
    totalMax,
    cyclesCount,
    hasUnpricedItems,
  } = result;

  const lastUpdatedLabel = priceLastUpdatedAt
    ? new Date(priceLastUpdatedAt).toLocaleDateString("he-IL")
    : null;

  return (
    <div className="rounded-2xl border-2 border-teal-200 bg-teal-50/40 p-5 shadow-card sm:p-7">
      <h3 className="text-lg font-bold text-ink sm:text-xl">הערכת העלות שלך</h3>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="עלות משוערת מינימלית" min={totalMin} max={totalMin} />
        <StatTile label="עלות משוערת מקסימלית" min={totalMax} max={totalMax} />
        <StatTile label={`עלות לסבב (מתוך ${cyclesCount})`} min={perCycleMin} max={perCycleMax} />
        <StatTile label="עלות כוללת לכל הסבבים" min={totalMin} max={totalMax} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatTile label="עלות חד־פעמית" min={oneTimeMin} max={oneTimeMax} />
        <StatTile label="עלות שנתית מתמשכת (למשל אחסון)" min={annualMin} max={annualMax} />
      </div>

      {lineItems.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold text-ink/50">פירוט לפי קטגוריות</p>
          <ul className="flex flex-col gap-2">
            {lineItems.map((item) => {
              const Icon = SOURCE_ICONS[item.source];
              return (
                <li
                  key={item.key}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-sm"
                >
                  <span className="text-sm font-semibold text-ink">{item.label}</span>
                  <span className="flex items-center gap-2">
                    {item.source !== "unpriced" && (
                      <span className="text-sm font-bold text-ink" dir="ltr">
                        {item.min === item.max ? formatILS(item.min ?? 0) : `${formatILS(item.min ?? 0)} עד ${formatILS(item.max ?? 0)}`}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${SOURCE_STYLES[item.source]}`}
                    >
                      <Icon className="h-3 w-3" strokeWidth={2.5} />
                      {SOURCE_LABELS[item.source]}
                    </span>
                  </span>
                  {item.note && <p className="w-full text-xs text-ink/50">{item.note}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {hasUnpricedItems && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-deep">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
          חלק מהפריטים לא נכללו בסכום כי המחיר עבורם טרם עודכן, ניתן להזין עבורם סכום ידני בשלבים למעלה.
        </p>
      )}

      <DisclaimerNote icon={Calendar} className="mt-5">
        <p className="font-semibold text-ink/75">
          המחירים הם הערכה בלבד ועשויים להשתנות. מומלץ לאמת אותם מול קופת החולים והמרפאה.
        </p>
        {lastUpdatedLabel && <p className="mt-1">מחירי הבסיס עודכנו לאחרונה ב-{lastUpdatedLabel}.</p>}
        <p className="mt-1">זהו כלי כספי בלבד ואינו כלי רפואי, אין להסתמך עליו כייעוץ רפואי.</p>
      </DisclaimerNote>
    </div>
  );
}
