"use client";

import { ArrowLeft, ListTodo, FlaskConical, TrendingUp, PartyPopper } from "lucide-react";
import type { JourneyProgress } from "@/lib/useJourneyProgress";

interface SummaryCardsProps {
  progress: JourneyProgress;
  onOpenNextStep: (id: number) => void;
}

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`animate-fadeUp rounded-2xl border-2 border-mist-200 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-cardHover sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export default function SummaryCards({ progress, onOpenNextStep }: SummaryCardsProps) {
  const {
    nextStep,
    allStepsCompleted,
    progressPercent,
    doneStepsCount,
    totalSteps,
    doneTestsCount,
    totalTests,
  } = progress;

  const dots = Array.from({ length: totalSteps + totalTests }, (_, i) => {
    const isStepDot = i < totalSteps;
    const isDone = isStepDot ? i < doneStepsCount : i - totalSteps < doneTestsCount;
    return { isDone, isStepDot };
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* השלב הבא */}
      <CardShell>
        {allStepsCompleted ? (
          <div className="flex h-full flex-col justify-center gap-2 text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <PartyPopper className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="text-sm font-semibold text-ink">
              כל השלבים סומנו כהושלמו. כל הכבוד!
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-ink/50">השלב הבא שלך</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-teal-600 px-1.5 text-xs font-bold text-white">
                  {nextStep?.id}
                </span>
                <h3 className="text-base font-semibold leading-snug text-ink">{nextStep?.title}</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => nextStep && onOpenNextStep(nextStep.id)}
              className="group inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100"
            >
              לפתיחת השלב
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                strokeWidth={2.5}
              />
            </button>
          </div>
        )}
      </CardShell>

      {/* התקדמות כוללת */}
      <CardShell>
        <div className="flex h-full flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink/50">התקדמות כוללת</p>
            <TrendingUp className="h-4 w-4 text-teal-500" strokeWidth={2} />
          </div>
          <p className="font-sans text-3xl font-extrabold text-ink" dir="ltr">
            {progressPercent}
            <span className="text-lg font-semibold text-ink/40">%</span>
          </p>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-mist-200"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="אחוז התקדמות כולל"
          >
            <div
              className="h-full rounded-full bg-gradient-to-l from-teal-500 to-teal-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1" aria-hidden="true">
            {dots.map((dot, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                  dot.isDone
                    ? dot.isStepDot
                      ? "bg-teal-500"
                      : "bg-deep"
                    : "bg-mist-200"
                }`}
              />
            ))}
          </div>
        </div>
      </CardShell>

      {/* שלבים שהושלמו */}
      <CardShell>
        <div className="flex h-full flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink/50">שלבים שהושלמו</p>
            <ListTodo className="h-4 w-4 text-teal-500" strokeWidth={2} />
          </div>
          <p className="font-sans text-3xl font-extrabold text-ink" dir="ltr">
            {doneStepsCount}
            <span className="text-lg font-semibold text-ink/40"> / {totalSteps}</span>
          </p>
          <p className="text-xs leading-relaxed text-ink/50">מתוך המסלול האישי המלא</p>
        </div>
      </CardShell>

      {/* בדיקות שסומנו */}
      <CardShell>
        <div className="flex h-full flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink/50">בדיקות שסומנו</p>
            <FlaskConical className="h-4 w-4 text-teal-500" strokeWidth={2} />
          </div>
          <p className="font-sans text-3xl font-extrabold text-ink" dir="ltr">
            {doneTestsCount}
            <span className="text-lg font-semibold text-ink/40"> / {totalTests}</span>
          </p>
          <p className="text-xs leading-relaxed text-ink/50">מתוך צ׳קליסט הבדיקות הנפוצות</p>
        </div>
      </CardShell>
    </div>
  );
}
