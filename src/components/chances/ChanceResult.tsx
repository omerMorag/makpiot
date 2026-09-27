import { formatChancePercent, probabilityAtLeastK } from "@/data/chanceModel";
import { Info, MessageCircleQuestion } from "lucide-react";
import {
  dataLimits,
  doctorQuestions,
  goldmanModelLabel,
  groupDataNote,
  measureExplanation,
  resultDisclaimerText,
  resultTiers,
  type FamilyGoalOption,
} from "@/data/chanceContent";

interface ChanceResultProps {
  age: number;
  eggs: number;
  familyGoal: FamilyGoalOption;
}

const RADIUS = 62;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ChanceResult({ age, eggs, familyGoal }: ChanceResultProps) {
  const probability = probabilityAtLeastK(age, eggs, familyGoal.value);
  const percentLabel = formatChancePercent(probability);
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(probability, 0.99));
  const tier = resultTiers.find((t) => probability < t.max) ?? resultTiers[resultTiers.length - 1];

  return (
    <div className="animate-fadeUp rounded-2xl border-2 border-teal-200 bg-teal-50/50 p-5 sm:p-7">
      <h3 className="text-center font-sans text-lg font-bold tracking-tight text-ink sm:text-xl">
        מה אפשר ללמוד מהנתונים
      </h3>

      <div className="mt-5 flex flex-col items-center">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90">
            <circle
              cx="75"
              cy="75"
              r={RADIUS}
              fill="none"
              stroke="#EEDDD6"
              strokeWidth={STROKE}
            />
            <circle
              cx="75"
              cy="75"
              r={RADIUS}
              fill="none"
              stroke="#C13655"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span dir="ltr" className="font-sans text-3xl font-extrabold tracking-tight text-ink">
              {percentLabel}
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-sm font-semibold text-ink/70">{familyGoal.resultLabel}</p>
        <span className="mt-1.5 inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
          {goldmanModelLabel}
        </span>
        <p className="mt-2 text-center text-xs leading-relaxed text-ink/50">{resultDisclaimerText}</p>
      </div>

      <div className="mx-auto mt-5 max-w-lg rounded-xl bg-white/80 p-3.5 text-sm leading-relaxed text-ink/75 ring-1 ring-inset ring-teal-100" data-testid="measure-explanation">
        <p>
          <span className="font-semibold text-ink">מה האחוז מודד? </span>
          {measureExplanation(age, eggs, familyGoal.outcome)}
        </p>
        <p className="mt-2 font-semibold text-ink" data-testid="group-note">
          {groupDataNote}
        </p>
      </div>

      <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-relaxed text-ink/65">{tier.text}</p>

      <div className="mx-auto mt-5 grid max-w-2xl gap-3 text-right sm:grid-cols-2">
        <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-mist-200" data-testid="data-limits">
          <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Info className="h-4 w-4 text-teal-700" strokeWidth={2.25} aria-hidden="true" />
            מה חשוב לדעת על הנתונים
          </p>
          <ul className="mt-2 list-disc space-y-1 pr-4 text-xs leading-relaxed text-ink/70 sm:text-[13px]">
            {dataLimits.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => document.getElementById("chance-sources")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="mt-2 text-xs font-semibold text-teal-700 underline decoration-dotted underline-offset-2 hover:text-teal-800"
          >
            למקורות ולהסבר המלא
          </button>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-mist-200" data-testid="doctor-questions">
          <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <MessageCircleQuestion className="h-4 w-4 text-teal-700" strokeWidth={2.25} aria-hidden="true" />
            שאלות שכדאי לקחת לשיחה עם הרופא/ה
          </p>
          <ul className="mt-2 list-disc space-y-1 pr-4 text-xs leading-relaxed text-ink/70 sm:text-[13px]">
            {doctorQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
