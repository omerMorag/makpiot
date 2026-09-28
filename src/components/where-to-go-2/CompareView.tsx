"use client";

import { forwardRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { routeName, selfPayRoute, type CareRoute, type CareUnit } from "@/data/careUnits";
import {
  chosenFundRoute,
  doctorText,
  fundPrice,
  mainRoute,
  medsText,
  selfPayPrice,
  storageText,
  toCheck,
  type FlowState,
} from "./placeFlow";

interface Row {
  key: string;
  label: string;
  render: (u: CareUnit) => ReactNode;
}

function Src({ route }: { route?: CareRoute }) {
  if (!route?.source) return <span className="block text-[11px] text-ink/45">מקור: לא אותר מקור רשמי</span>;
  return (
    <span className="block text-[11px] text-ink/50">
      מקור:{" "}
      <a href={route.source.url} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 hover:underline">
        {route.source.label}
      </a>
      {route.verifiedAt && ` · ${route.verifiedAt}`}
    </span>
  );
}

function rows(s: FlowState): Row[] {
  return [
    { key: "loc", label: "מיקום", render: (u) => [u.city, u.region].filter(Boolean).join(" · ") },
    { key: "type", label: "סוג היחידה", render: (u) => (u.setting === "private" ? "יחידה פרטית" : "בית חולים ציבורי") },
    {
      key: "routes",
      label: "מסלולי תשלום",
      render: (u) => (
        <ul className="space-y-0.5">
          {u.routes.map((r) => (
            <li key={r.id}>
              {routeName(r)}
              {r.verificationStatus !== "verified" && <span className="text-ink/50"> (בבירור)</span>}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "price",
      label: "מחיר מאומת",
      render: (u) => {
        const self = selfPayRoute(u);
        const sp = selfPayPrice(self);
        const fr = chosenFundRoute(u, s);
        const fp = fr && s.plan !== "no" ? fundPrice(fr, s.plan) : null;
        return (
          <div className="space-y-2">
            {fp && fr && (
              <div>
                <span className="font-semibold text-ink">{routeName(fr)}: </span>
                {fp.amount && (fp.kind === "verified" || fp.kind === "conditional") ? `${fp.amount} ${fr.priceBasis ?? ""}, ${fp.label}` : fp.label}
                {fr.verificationStatus !== "verified" && <span className="block text-xs text-ink/55">ההסדר ביחידה דורש אישור מול הקופה</span>}
                <Src route={fr} />
              </div>
            )}
            <div>
              <span className="font-semibold text-ink">{u.setting === "private" ? "תשלום פרטי" : "תשלום עצמי"}: </span>
              {sp.amount ? `${sp.amount} ${sp.basis ?? ""}` : "מחיר בבירור"}
              {sp.amount && <Src route={self} />}
            </div>
          </div>
        );
      },
    },
    ...(s.path === "fund" && s.fund
      ? [
          {
            key: "elig",
            label: "זכאות",
            render: (u: CareUnit) => {
              const fr = chosenFundRoute(u, s);
              if (!fr) return `לא נמצא הסדר עם ${s.fund}`;
              return (
                <>
                  {fr.eligibilityNote ?? "לברר מול הקופה"}
                  <Src route={fr} />
                </>
              );
            },
          },
        ]
      : []),
    { key: "doctor", label: "בחירת רופא/ה", render: (u) => doctorText(mainRoute(u, s)) },
    { key: "meds", label: "תרופות", render: (u) => medsText(mainRoute(u, s)) },
    { key: "storage", label: "אחסון", render: (u) => storageText(mainRoute(u, s)) },
    {
      key: "missing",
      label: "מידע חסר",
      render: (u) => {
        const list = toCheck(u, mainRoute(u, s), s);
        return list.length ? list.join(" · ") : "-";
      },
    },
  ];
}

interface CompareViewProps {
  units: CareUnit[];
  state: FlowState;
  onRemove: (unitId: string) => void;
  onClose: () => void;
}

/**
 * השוואה בין 2–3 מקומות. בלי דירוג ובלי "הכי טוב" — רק מה שידוע, מאיפה,
 * ומה חסר. מסלולי תשלום מוצגים בנפרד, לעולם לא ממוזגים לסכום אחד.
 */
const CompareView = forwardRef<HTMLHeadingElement, CompareViewProps>(function CompareView({ units, state, onRemove, onClose }, ref) {
  const R = rows(state);
  return (
    <section
      aria-labelledby="compare-title"
      className="scroll-mt-24 rounded-2xl border-2 border-teal-100 bg-white p-4 shadow-card sm:p-6"
      data-testid="compare-view"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="compare-title" ref={ref} tabIndex={-1} className="scroll-mt-24 text-lg font-bold text-ink outline-none">
            השוואת המקומות
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-ink/55">
            ההשוואה לא מדרגת מקומות, מחיר נמוך יותר לא אומר שהמקום מתאים לך יותר. ״לא אומת״ = לא מצאנו את זה במקור רשמי.
          </p>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-ink/55 hover:bg-mist-100">
          סגירה
        </button>
      </div>

      <div className="mt-4 hidden md:block">
        <table className="w-full table-fixed border-collapse text-right text-sm">
          <thead>
            <tr>
              <th className="w-28 px-2 py-2" />
              {units.map((u) => (
                <th key={u.id} scope="col" className="px-3 py-2 align-top">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-ink">{u.name}</span>
                    <RemoveBtn name={u.name} onClick={() => onRemove(u.id)} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {R.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? "bg-mist-50/60" : undefined} data-row={row.key}>
                <th scope="row" className="px-2 py-2.5 align-top text-xs font-semibold text-ink/55">
                  {row.label}
                </th>
                {units.map((u) => (
                  <td key={u.id} className="px-3 py-2.5 align-top leading-relaxed text-ink/80">
                    {row.render(u)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {units.map((u) => (
          <div key={u.id} className="rounded-xl border-2 border-mist-200 p-3.5" data-testid="compare-mobile-item">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-ink">{u.name}</h3>
              <RemoveBtn name={u.name} onClick={() => onRemove(u.id)} />
            </div>
            <dl className="mt-2 divide-y divide-mist-100 text-[13px]">
              {R.map((row) => (
                <div key={row.key} className="flex gap-3 py-1.5">
                  <dt className="w-24 shrink-0 font-semibold text-ink/50">{row.label}</dt>
                  <dd className="min-w-0 leading-relaxed text-ink/80">{row.render(u)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
});

export default CompareView;

function RemoveBtn({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`הסרת ${name} מההשוואה`}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-mist-100 hover:text-ink/70"
    >
      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
    </button>
  );
}
