import { formatChancePercent, probabilityAtLeastK } from "@/data/chanceModel";
import type { FamilyGoalOption } from "@/data/chanceContent";

interface ScenarioComparisonProps {
  age: number;
  eggs: number;
  familyGoal: FamilyGoalOption;
}

export default function ScenarioComparison({ age, eggs, familyGoal }: ScenarioComparisonProps) {
  const lowerEggs = eggs > 5 ? eggs - 5 : 1;
  const higherEggs = eggs + 5;
  const scenarios = [
    { eggs: lowerEggs, label: "5 ביציות פחות", emphasize: false },
    { eggs, label: "המספר שהוזן", emphasize: true },
    { eggs: higherEggs, label: "5 ביציות יותר", emphasize: false },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-center font-sans text-base font-bold tracking-tight text-ink sm:text-lg">
        אותו גיל, מספר ביציות אחר
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {scenarios.map((scenario) => {
          const probability = probabilityAtLeastK(age, scenario.eggs, familyGoal.value);
          return (
            <div
              key={scenario.label}
              className={`rounded-2xl border-2 p-4 text-center transition-transform duration-300 ${
                scenario.emphasize
                  ? "scale-[1.03] border-teal-300 bg-white shadow-cardHover"
                  : "border-mist-200 bg-white/70 shadow-card"
              }`}
            >
              <p className="text-xs font-semibold text-ink/50">{scenario.label}</p>
              <p dir="ltr" className="mt-2 font-sans text-2xl font-extrabold text-ink">
                {formatChancePercent(probability)}
              </p>
              <p className="mt-1 text-xs text-ink/55">
                {scenario.eggs} ביציות · גיל {age}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-ink/50">
        הערכת המודל ל{familyGoal.outcome} עם 5 ביציות פחות או יותר. זו השוואה בתוך המודל בלבד, ולא
        המלצה רפואית לעבור שאיבה נוספת.
      </p>
    </div>
  );
}
