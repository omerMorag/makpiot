"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, GitCompareArrows } from "lucide-react";
import type { JourneyProgress } from "@/lib/useJourneyProgress";
import { careUnits, FUND_PLANS, type CareUnit } from "@/data/careUnits";
import BeforeChoosingCard from "./BeforeChoosingCard";
import FlowPicker from "./FlowPicker";
import PrivateRouteExplainer from "./PrivateRouteExplainer";
import PlaceCard from "./PlaceCard";
import CompareBar from "./CompareBar";
import CompareView from "./CompareView";
import { splitUnits, type FlowState } from "./placeFlow";

const MAX_COMPARISON = 3;

const PATH_TITLES: Record<NonNullable<FlowState["path"]>, string> = {
  private: "יחידות פרטיות",
  fund: "מקומות בהסדר הקופה",
  public: "בתי חולים ציבוריים",
  all: "כל המקומות",
};

/**
 * "איפה כדאי לי לעשות?" — זרימה פשוטה: מסלול ← אזור ← כרטיסי מקומות
 * מתאימים (ומתחתם "מקומות נוספים"), והשוואה של עד שלושה מקומות.
 * אין מחשבון ואין חישוב עלות אישית. הכול עובד בלי התחברות.
 */
export default function WhereToDoTool({ progress }: { progress: JourneyProgress }) {
  const [state, setState] = useState<FlowState>({ path: null, fund: null, plan: null, region: "all" });
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const compareRef = useRef<HTMLHeadingElement>(null);

  const { matched, others } = useMemo(() => splitUnits(careUnits, state), [state]);
  const compared = compare.map((id) => careUnits.find((u) => u.id === id)).filter((u): u is CareUnit => !!u);

  const updateCompare = (next: string[]) => {
    setCompare(next);
    if (next.length < 2) setCompareOpen(false);
  };
  const toggleCompare = (id: string) => {
    if (compare.includes(id)) updateCompare(compare.filter((c) => c !== id));
    else if (compare.length < MAX_COMPARISON) updateCompare([...compare, id]);
  };
  const openCompare = () => {
    setCompareOpen(true);
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      compareRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      compareRef.current?.focus({ preventScroll: true });
    });
  };

  const card = (u: CareUnit, other = false) => (
    <PlaceCard
      key={u.id}
      unit={u}
      state={state}
      other={other}
      isCompared={compare.includes(u.id)}
      compareFull={compare.length >= MAX_COMPARISON}
      onToggleCompare={() => toggleCompare(u.id)}
      isSelected={progress.selectedCareUnit?.id === u.id}
      onSelect={() => progress.selectCareUnit(u.id, u.name)}
      onClearSelection={progress.clearCareUnitSelection}
    />
  );

  const regionText = state.region === "all" ? "בכל הארץ" : `באזור ${state.region}`;
  const fundWaiting = state.path === "fund" && !state.fund;

  return (
    <div className="space-y-6">
      <BeforeChoosingCard />

      <FlowPicker
        state={state}
        onChange={(next) => {
          setState(next);
          setShowOthers(false);
        }}
      />

      {state.path === "private" && <PrivateRouteExplainer />}

      {state.path && !fundWaiting && (
        <section aria-labelledby="places-title" data-testid="places">
          <h2 id="places-title" className="text-base font-bold text-ink sm:text-lg">
            {state.path === "fund" && state.fund && state.plan !== "no" ? `מקומות בהסדר ${FUND_PLANS[state.fund]}` : PATH_TITLES[state.path]}{" "}
            <span className="text-sm font-semibold text-ink/50">
              · {matched.length} {regionText}
            </span>
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/65" data-testid="compare-hint">
            <GitCompareArrows className="h-4 w-4 shrink-0 text-teal-700" strokeWidth={2.25} aria-hidden="true" />
            מתלבטת בין מקומות? בחרי שניים או שלושה והשווי ביניהם
          </p>

          {matched.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2" data-testid="matched">
              {matched.map((u) => card(u))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-mist-200 p-5 text-sm leading-relaxed text-ink/65" data-testid="no-results">
              {state.path === "fund" && state.fund
                ? `לא מצאנו ${regionText} מקום שמופיע במקור רשמי בהסדר של ${state.fund}. זה לא אומר שאין, כדאי לשאול את הקופה.`
                : `לא מצאנו ${regionText} מקומות שמתאימים למסלול הזה.`}{" "}
              {state.region !== "all" && (
                <button
                  type="button"
                  onClick={() => setState({ ...state, region: "all" })}
                  className="font-semibold text-teal-700 hover:underline"
                >
                  להציג את כל הארץ
                </button>
              )}
            </div>
          )}

          {others.length > 0 && (
            <div className="mt-6" data-testid="others">
              <button
                type="button"
                onClick={() => setShowOthers((v) => !v)}
                aria-expanded={showOthers || matched.length === 0}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/70 hover:text-ink"
                data-testid="others-toggle"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showOthers || matched.length === 0 ? "rotate-180" : ""}`}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                מקומות נוספים {regionText} ({others.length})
              </button>
              {(showOthers || matched.length === 0) && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">{others.map((u) => card(u, true))}</div>
              )}
            </div>
          )}
        </section>
      )}

      {!state.path && (
        <p className="rounded-2xl bg-mist-50 px-4 py-3 text-sm text-ink/60" data-testid="choose-first">
          בחרי מסלול למעלה, ונציג את המקומות שמתאימים לו.
        </p>
      )}

      {compareOpen && compared.length >= 2 && (
        <CompareView ref={compareRef} units={compared} state={state} onRemove={(id) => updateCompare(compare.filter((c) => c !== id))} onClose={() => setCompareOpen(false)} />
      )}

      {compare.length > 0 && <div className="h-28" aria-hidden="true" />}
      <CompareBar units={compared} max={MAX_COMPARISON} onCompare={openCompare} onRemove={(id) => updateCompare(compare.filter((c) => c !== id))} />
    </div>
  );
}
