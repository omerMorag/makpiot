"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import ChanceSliderField from "@/components/chances/ChanceSliderField";
import ChanceResult from "@/components/chances/ChanceResult";
import ReturnRateAccordion from "@/components/chances/ReturnRateAccordion";
import ScenarioComparison from "@/components/chances/ScenarioComparison";
import ChanceChart from "@/components/chances/ChanceChart";
import LowReserveCard from "@/components/chances/LowReserveCard";
import PreCalculatorInfoCard from "@/components/chances/PreCalculatorInfoCard";
import InfoTooltip from "@/components/shared/InfoTooltip";
import { MIN_AGE, MAX_AGE, MIN_EGGS, MAX_EGGS } from "@/data/chanceModel";
import { ageInfoText, familyGoalOptions, miiTooltipText } from "@/data/chanceContent";

const DEFAULT_AGE = 32;
const DEFAULT_EGGS = 15;

function pillClass(active: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
    active ? "bg-teal-600 text-ink shadow-sm" : "bg-mist-100 text-ink/60 hover:bg-mist-200"
  }`;
}

export default function ChanceCalculator() {
  const [age, setAge] = useState(DEFAULT_AGE);
  const [eggs, setEggs] = useState(DEFAULT_EGGS);
  const [familyGoalValue, setFamilyGoalValue] = useState<1 | 2 | 3>(1);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [showAgeInfo, setShowAgeInfo] = useState(false);

  const familyGoal = familyGoalOptions.find((opt) => opt.value === familyGoalValue) ?? familyGoalOptions[0];

  const handleReset = () => {
    setAge(DEFAULT_AGE);
    setEggs(DEFAULT_EGGS);
    setFamilyGoalValue(1);
    setHasCalculated(false);
  };

  return (
    <div id="calculator" className="scroll-mt-24 rounded-2xl border-2 border-mist-200 bg-white p-5 shadow-card sm:p-7">
      <h2 className="text-center font-sans text-xl font-bold tracking-tight text-ink sm:text-2xl">
        בואי נסתכל על הנתונים
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-ink/60">
        אם כבר הקפאת, אפשר להזין את הנתונים מסיכום השאיבה. אם עוד לא, אפשר לבדוק גיל ומספר ביציות שאת
        שוקלת, ולראות מה המודל מעריך.
      </p>

      <div className="mt-5">
        <PreCalculatorInfoCard />
      </div>

      <div className="mt-1 flex flex-col gap-6">
        <div>
          <ChanceSliderField
            id="chance-age"
            label="גיל בזמן ההקפאה"
            helperText="אם עוד לא הקפאת, הגיל שבו את מתכננת להקפיא."
            value={age}
            min={MIN_AGE}
            max={MAX_AGE}
            onChange={setAge}
          />
          <button
            type="button"
            onClick={() => setShowAgeInfo((v) => !v)}
            aria-expanded={showAgeInfo}
            aria-controls="age-info-panel"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-700 transition-colors hover:text-teal-800"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${showAgeInfo ? "rotate-180" : ""}`}
              strokeWidth={2.5}
            />
            למה מחשבים לפי הגיל בזמן ההקפאה?
          </button>
          <div
            id="age-info-panel"
            className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
              showAgeInfo ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0">
              <p className="rounded-xl bg-mist-50 p-3 text-xs leading-relaxed text-ink/65">
                {ageInfoText}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <ChanceSliderField
              id="chance-eggs"
              label="מספר ביציות בשלות"
              value={eggs}
              min={MIN_EGGS}
              max={MAX_EGGS}
              onChange={setEggs}
              helperText="בסיכום השאיבה זה מופיע כמספר הביציות הבשלות או כ־MII. אפשר גם לנסות מספרים אחרים."
            />
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink/50">
            <span>מה זה MII?</span>
            <InfoTooltip label="הסבר על המונח MII" text={miiTooltipText} />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">לבדוק את ההערכה עבור…</p>
          <p className="mt-0.5 text-xs text-ink/50">במודל: לידת חי אחת, שתיים או שלוש לפחות.</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {familyGoalOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFamilyGoalValue(opt.value)}
                className={pillClass(familyGoalValue === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => setHasCalculated(true)}
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-8 py-3.5 text-sm font-bold tracking-wide text-ink shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-cardHover active:translate-y-0"
          >
            הצגת ההערכה לפי הנתונים
          </button>
          {hasCalculated && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-ink/50 transition-colors hover:text-teal-700"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} />
              איפוס החישוב
            </button>
          )}
        </div>
      </div>

      {hasCalculated && (
        <div className="mt-8 border-t border-mist-100 pt-6">
          <ChanceResult age={age} eggs={eggs} familyGoal={familyGoal} />

          <ReturnRateAccordion />

          <LowReserveCard />

          <ScenarioComparison age={age} eggs={eggs} familyGoal={familyGoal} />

          <div className="mt-8">
            <h3 className="text-center font-sans text-base font-bold tracking-tight text-ink sm:text-lg">
              הערכת המודל לפי מספר הביציות, בגיל {age}
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-center text-sm leading-relaxed text-ink/60">
              הקו מראה את הערכת המודל ל{familyGoal.outcome} עבור 1 עד 70 ביציות בשלות, בגיל שבחרת. עם יותר
              ביציות ההערכה עולה, אבל היא אף פעם לא הופכת לוודאות.
            </p>
            <div className="mt-4">
              <ChanceChart age={age} eggs={eggs} familyGoal={familyGoal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
