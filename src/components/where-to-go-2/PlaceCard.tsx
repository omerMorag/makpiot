"use client";

import { useId, useState } from "react";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";
import {
  FUND_ELIGIBILITY_LINKS,
  formatShekel,
  routeName,
  selfPayRoute,
  type CareRoute,
  type CareUnit,
} from "@/data/careUnits";
import {
  chosenFundRoute,
  fundPrice,
  includedText,
  mainRoute,
  medsText,
  selfPayPrice,
  storageText,
  toCheck,
  type FlowState,
  type PriceView,
} from "./placeFlow";

interface PlaceCardProps {
  unit: CareUnit;
  state: FlowState;
  /** כרטיס מתוך "מקומות נוספים" — לא מתאים למסלול שנבחר */
  other?: boolean;
  isCompared: boolean;
  compareFull: boolean;
  onToggleCompare: () => void;
  isSelected: boolean;
  onSelect: () => void;
  onClearSelection: () => void;
}

/**
 * כרטיס מקום. מסלולי תשלום מוצגים תמיד בקופסאות נפרדות — תשלום עצמי/פרטי
 * לחוד והטבת קופה לחוד — כדי שמחיר של הטבה לא ייראה כמחיר של מי שבוחרת
 * רופא/ה פרטי/ת. מחיר מוצג רק כשפורסם במקור רשמי; אחרת "מחיר בבירור".
 */
export default function PlaceCard({
  unit,
  state,
  other,
  isCompared,
  compareFull,
  onToggleCompare,
  isSelected,
  onSelect,
  onClearSelection,
}: PlaceCardProps) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const self = selfPayRoute(unit);
  const fundRoute = chosenFundRoute(unit, state);
  const main = mainRoute(unit, state);
  const fundRoutes = unit.routes.filter(
    (r) => r.fundingType === "healthFundArrangement",
  );
  const isPrivate = unit.setting === "private";
  const selfTitle = isPrivate ? "תשלום פרטי" : "תשלום עצמי";
  const checks = toCheck(unit, main, state);

  const fundFirst = state.path === "fund" && fundRoute && state.plan !== "no";

  const selfBox = (
    <PayBox
      key="self"
      title={selfTitle}
      price={selfPayPrice(self)}
      route={self}
      testId="pay-self"
    >
      {isPrivate && state.path === "private" && (
        <p className="mt-1 text-xs text-ink/55">
          מחיר היחידה בלבד. תשלום לרופא/ה ותרופות — בנפרד, לפי מה שתסכמי.
        </p>
      )}
    </PayBox>
  );

  const fundBox = fundRoute && state.plan !== "no" && (
    <PayBox
      key="fund"
      title={`דרך ${routeName(fundRoute)}`}
      price={fundPrice(fundRoute, state.plan)}
      route={fundRoute}
      tone="fund"
      testId="pay-fund"
    >
      {fundRoute.verificationStatus !== "verified" && (
        <p className="mt-1 text-xs font-semibold text-ink/70">
          ההסדר עם היחידה הזו עוד לא אומת במקור רשמי — יש לאשר מול{" "}
          {fundRoute.healthFund}.
        </p>
      )}
      {fundRoute.eligibilityNote && (
        <p className="mt-1 text-xs leading-relaxed text-ink/60">
          {fundRoute.eligibilityNote}
        </p>
      )}
      {isPrivate && (
        <p className="mt-1 text-xs leading-relaxed text-ink/55">
          לא אומת שבחירת רופא/ה פרטי/ת או ליווי אישי כלולים במחיר ההטבה.
        </p>
      )}
    </PayBox>
  );

  // מחוץ למסלול הקופה: הטבות הקופות כאפשרות נפרדת, בניסוח מותנה
  const fundList = !fundFirst &&
    state.path !== "fund" &&
    fundRoutes.length > 0 && (
      <div
        className="rounded-xl bg-teal-50/50 p-3 ring-1 ring-inset ring-teal-100"
        data-testid="pay-fund-list"
      >
        <p className="text-[11px] font-bold text-ink/60">
          דרך הקופה, למי שעומדת בתנאי הזכאות
        </p>
        <ul className="mt-1.5 space-y-1 text-xs">
          {fundRoutes.map((r) => {
            const p = fundPrice(r, "unsure");
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5"
              >
                <VerifyMark route={r} />
                <span className="font-semibold text-ink">{routeName(r)}</span>
                <span className="text-ink/60">
                  ·{" "}
                  {p.amount
                    ? `${p.amount} — מחיר אפשרי בכפוף לבדיקת זכאות`
                    : "מחיר בבירור"}
                </span>
                {r.verificationStatus !== "verified" && (
                  <span className="text-ink/50">· ההסדר דורש בירור</span>
                )}
              </li>
            );
          })}
        </ul>
        {isPrivate && (
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink/55">
            זה מסלול תשלום נפרד מהמסלול הפרטי: לא אומת שבחירת רופא/ה לבחירתך
            כלולה בו.
          </p>
        )}
      </div>
    );

  return (
    <article
      className={`flex flex-col rounded-2xl border-2 bg-white p-4 shadow-card sm:p-5 ${isCompared ? "border-teal-300" : "border-mist-200"}`}
      data-testid="place-card"
      data-unit={unit.name}
    >
      <div className="flex items-start gap-3">
        <UnitMark unit={unit} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-base font-bold text-ink sm:text-lg">
              {unit.name}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isPrivate ? "bg-warm-100 text-ink/75" : "bg-mist-100 text-ink/65"}`}
            >
              {isPrivate ? "פרטי" : "ציבורי"}
            </span>
            {isSelected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-ink">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                בחרתי
              </span>
            )}
          </div>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink/55">
            <MapPin
              className="h-3.5 w-3.5"
              strokeWidth={2}
              aria-hidden="true"
            />
            {[unit.city, unit.region].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <FitLine unit={unit} state={state} other={other} />

      <div className="mt-3 space-y-2">
        {fundFirst ? [fundBox, selfBox] : [selfBox]}
        {fundList}
      </div>

      <dl className="mt-3 grid gap-1 text-xs leading-snug text-ink/70">
        <Fact label="מה כלול">{includedText(main)}</Fact>
        <Fact label="תרופות">{medsText(main)}</Fact>
        <Fact label="אחסון">{storageText(main)}</Fact>
      </dl>

      {checks.length > 0 && (
        <div className="mt-3" data-testid="to-check">
          <p className="inline-flex items-center gap-1 text-[11px] font-bold text-ink/60">
            <CircleAlert
              className="h-3.5 w-3.5"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            מה צריך לברר
          </p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {checks.map((c) => (
              <li
                key={c}
                className="rounded-full border border-dashed border-mist-300 bg-mist-50 px-2 py-0.5 text-[11px] font-semibold text-ink/65"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleCompare}
          disabled={!isCompared && compareFull}
          aria-pressed={isCompared}
          title={
            !isCompared && compareFull
              ? "אפשר להשוות עד שלושה מקומות"
              : undefined
          }
          className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            isCompared
              ? "bg-teal-50 text-teal-700 ring-2 ring-inset ring-teal-300"
              : "bg-teal-600 text-ink shadow-sm hover:bg-teal-500"
          }`}
          data-testid="compare-toggle"
        >
          {isCompared ? null : (
            <Plus className="h-4 w-4" strokeWidth={2.75} aria-hidden="true" />
          )}
          {isCompared ? "נוסף להשוואה ✓" : "הוספה להשוואה"}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={detailsId}
          className="inline-flex min-h-[42px] items-center gap-1 rounded-full px-3 text-sm font-semibold text-ink/65 hover:bg-mist-100 hover:text-ink"
          data-testid="details-toggle"
        >
          פרטים ומקורות
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        id={detailsId}
        hidden={!open}
        className="mt-3 space-y-3 border-t border-mist-100 pt-3 text-xs leading-relaxed text-ink/70 sm:text-[13px]"
        data-testid="details"
      >
        {sortRoutes(unit.routes, main).map((r) => (
          <RouteDetails key={r.id} route={r} />
        ))}

        <div>
          <p className="font-semibold text-ink">פרטי קשר</p>
          {unit.phone ? (
            <p className="mt-0.5 inline-flex flex-wrap items-center gap-1">
              <Phone
                className="h-3.5 w-3.5"
                strokeWidth={2}
                aria-hidden="true"
              />
              <a
                href={`tel:${unit.phone.number}`}
                className="font-semibold text-teal-700"
                dir="ltr"
              >
                {unit.phone.number}
              </a>
              <span className="text-ink/45">
                (לפי {unit.phone.sourceLabel})
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-ink/55">לא אומתו פרטי קשר.</p>
          )}
          {unit.website && (
            <a
              href={unit.website.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline"
            >
              לאתר היחידה
              <ExternalLink
                className="h-3 w-3"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </a>
          )}
        </div>

        <div>
          {isSelected ? (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs font-semibold text-ink/55 hover:underline"
            >
              ביטול הבחירה במקום הזה
            </button>
          ) : (
            <button
              type="button"
              onClick={onSelect}
              className="min-h-[36px] rounded-full bg-mist-100 px-4 text-sm font-bold text-ink hover:bg-mist-200"
            >
              בחרתי במקום הזה
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** ראשי תיבות לסמל: שתי האותיות הראשונות של המילה הראשונה בשם */
function initials(name: string): string {
  const first = name.replace(/[״"׳']/g, "").split(/[\s–-]+/)[0] ?? "";
  return first.slice(0, 2);
}

/**
 * סמל המקום בכרטיס: הלוגו הרשמי אם נוסף (unit.logo), אחרת ראשי תיבות בצבע
 * לפי סוג היחידה. דקורטיבי בלבד — השם המלא תמיד מופיע כטקסט לידו.
 */
function UnitMark({ unit }: { unit: CareUnit }) {
  const isPrivate = unit.setting === "private";
  if (unit.logo) {
    return (
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-inset ring-mist-200"
        data-testid="unit-mark"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={unit.logo.src}
          alt=""
          className="max-h-full max-w-full object-contain"
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold ${
        isPrivate
          ? "bg-warm-100 text-ink/80 ring-1 ring-inset ring-warm-300/60"
          : "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100"
      }`}
      data-testid="unit-mark"
    >
      {initials(unit.name)}
    </span>
  );
}

function FitLine({
  unit,
  state,
  other,
}: {
  unit: CareUnit;
  state: FlowState;
  other?: boolean;
}) {
  let text = "";
  let good = !other;
  const fr = chosenFundRoute(unit, state);
  switch (state.path) {
    case "private":
      text = other
        ? "בית חולים ציבורי — לא מסלול פרטי"
        : "יחידה פרטית · בחירת רופא/ה — לברר מול היחידה";
      break;
    case "public":
      text = other ? "יחידה פרטית — לא בית חולים ציבורי" : "בית חולים ציבורי";
      break;
    case "fund":
      if (!state.fund) text = "בחרי קופה כדי לראות התאמה";
      else if (state.plan === "no") text = "בלי הרובד המתאים — מוצג תשלום עצמי";
      else if (fr) {
        text =
          fr.verificationStatus === "verified"
            ? `מופיע בהסדר ${routeName(fr)}`
            : `ייתכן הסדר ${routeName(fr)} — דורש אישור מול הקופה`;
        good = fr.verificationStatus === "verified";
      } else {
        text = `לא מצאנו מקור שמקשר את המקום ל${state.fund}`;
        good = false;
      }
      break;
    default:
      text = "";
  }
  if (!text) return null;
  return (
    <p
      className={`mt-2 inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold ${good ? "bg-teal-50 text-teal-700" : "bg-mist-100 text-ink/60"}`}
      data-testid="fit-line"
    >
      {good ? (
        <BadgeCheck
          className="h-3.5 w-3.5"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      ) : (
        <CircleAlert
          className="h-3.5 w-3.5"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      )}
      {text}
    </p>
  );
}

function PayBox({
  title,
  price,
  route,
  tone = "self",
  testId,
  children,
}: {
  title: string;
  price: PriceView;
  route?: CareRoute;
  tone?: "self" | "fund";
  testId: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${tone === "fund" ? "bg-teal-50/70 ring-1 ring-inset ring-teal-100" : "bg-mist-50 ring-1 ring-inset ring-mist-200"}`}
      data-testid={testId}
    >
      <p className="text-[11px] font-bold text-ink/60">{title}</p>
      {price.amount &&
      (price.kind === "verified" || price.kind === "conditional") ? (
        <>
          <p
            className="mt-0.5 text-lg font-extrabold text-ink"
            data-testid="price"
          >
            {price.amount}
            {price.basis && (
              <span className="mr-1 text-xs font-semibold text-ink/55">
                {price.basis}
              </span>
            )}
          </p>
          <p className="text-[11px] font-semibold text-ink/60">{price.label}</p>
          {route?.source && (
            <p className="mt-0.5 text-[11px] text-ink/50">
              מקור:{" "}
              <a
                href={route.source.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-teal-700 hover:underline"
              >
                {route.source.label}
              </a>
              {route.verifiedAt && ` · נבדק ${route.verifiedAt}`}
            </p>
          )}
        </>
      ) : (
        <p
          className={`mt-0.5 font-bold ${price.kind === "pending" ? "text-base text-ink/75" : "text-sm text-ink/65"}`}
          data-testid="price"
        >
          {price.label}
        </p>
      )}
      {children}
    </div>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-1.5">
      <dt className="shrink-0 font-semibold text-ink/50">{label}:</dt>
      <dd>{children}</dd>
    </div>
  );
}

function VerifyMark({ route }: { route: CareRoute }) {
  return route.verificationStatus === "verified" ? (
    <BadgeCheck
      className="h-3.5 w-3.5 text-teal-700"
      strokeWidth={2.5}
      aria-label="אומת"
    />
  ) : (
    <CircleAlert
      className="h-3.5 w-3.5 text-ink/45"
      strokeWidth={2.5}
      aria-label="דורש בירור"
    />
  );
}

function sortRoutes(
  routes: CareRoute[],
  main: CareRoute | undefined,
): CareRoute[] {
  return [...routes].sort((a, b) =>
    a.id === main?.id ? -1 : b.id === main?.id ? 1 : 0,
  );
}

/** פירוט מלא של מסלול תשלום אחד — כל מסלול לחוד, לעולם לא ממוזג */
function RouteDetails({ route }: { route: CareRoute }) {
  const isFund = route.fundingType === "healthFundArrangement";
  const priceOk =
    route.priceAmount != null &&
    (isFund || route.verificationStatus === "verified");
  return (
    <div
      className="rounded-xl bg-mist-50/70 p-3 ring-1 ring-inset ring-mist-200"
      data-testid="route-details"
    >
      <p className="flex flex-wrap items-center gap-1.5 font-bold text-ink">
        <VerifyMark route={route} />
        {isFund ? `הטבת ${routeName(route)}` : "תשלום עצמי"}
        {route.verificationStatus !== "verified" && (
          <span className="text-[11px] font-semibold text-ink/50">
            · דורש בירור
          </span>
        )}
      </p>
      <p className="mt-1">
        <span className="font-semibold text-ink">מחיר: </span>
        {priceOk ? (
          <>
            {formatShekel(route.priceAmount!, route.priceApprox)}{" "}
            {route.priceBasis}
            {isFund && " — בכפוף לזכאות"}
          </>
        ) : (
          "מחיר בבירור"
        )}
      </p>
      {!priceOk && route.pricePerCycle && (
        <p className="text-ink/55">
          פורסם בעבר או ממקור לא רשמי (לא אומת): {route.pricePerCycle}
        </p>
      )}
      {route.priceExtra && <p>{route.priceExtra}</p>}
      {route.included && (
        <p>
          <span className="font-semibold text-ink">כלול לפי המקור: </span>
          {route.included}
        </p>
      )}
      {route.notIncluded && (
        <p>
          <span className="font-semibold text-ink">לא כלול: </span>
          {route.notIncluded}
        </p>
      )}
      {route.eligibilityNote && (
        <p>
          <span className="font-semibold text-ink">זכאות: </span>
          {route.eligibilityNote}
        </p>
      )}
      {route.approvalNote && (
        <p>
          <span className="font-semibold text-ink">אישור: </span>
          {route.approvalNote}
        </p>
      )}
      {route.numberOfCycles && (
        <p>
          <span className="font-semibold text-ink">
            {isFund ? "מכסת כיסוי: " : "סבבים: "}
          </span>
          {route.numberOfCycles}
        </p>
      )}
      {route.caveat && (
        <p className="mt-1 rounded-lg bg-white px-2.5 py-1.5">{route.caveat}</p>
      )}
      <p className="mt-1 text-ink/50">
        מקור:{" "}
        {route.source ? (
          <a
            href={route.source.url}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-teal-700 hover:underline"
          >
            {route.source.label}
          </a>
        ) : (
          "לא אותר מקור רשמי"
        )}
        {route.verifiedAt && ` · נבדק ${route.verifiedAt}`}
      </p>
      {isFund && route.healthFund && (
        <a
          href={FUND_ELIGIBILITY_LINKS[route.healthFund].url}
          target="_blank"
          rel="noreferrer"
          className="mt-0.5 inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline"
        >
          תנאי הזכאות ב{route.healthFund}
          <ExternalLink
            className="h-3 w-3"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </a>
      )}
    </div>
  );
}
