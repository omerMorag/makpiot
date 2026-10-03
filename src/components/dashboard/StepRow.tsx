"use client";

import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import type { JourneyStep } from "@/data/types";
import HenIllustration, { STEP_HEN } from "@/components/hens/HenIllustration";

/** גודל אחיד לכל תרנגולת שמופיעה בתוך כרטיס צ'קליסט — כ-70–85px במובייל,
 * כ-100–120px בדסקטופ, ללא תלות בגודל ברירת המחדל של אותה תרנגולת
 * במקומות אחרים באתר (כמו כותרת "איפה כדאי לעשות?"). */
const CHECKLIST_HEN_SIZE = "w-[78px] sm:w-24 lg:w-[112px]";

interface StepRowProps {
  step: JourneyStep;
  isExpanded: boolean;
  /** מפתחות "stepId:taskIndex" — אילו משימות בתוך השלב הזה (ובשאר השלבים) כבר סומנו */
  completedStepTasks: Set<string>;
  onToggleTask: (stepId: number, taskIndex: number) => void;
  onToggleExpand: (id: number) => void;
  setRowRef: (id: number, el: HTMLLIElement | null) => void;
  hideParallelBadge?: boolean;
  /** מפתח "stepId:taskIndex" של המשימה שיש להדגיש רגעית (הגעה מ-NextActionCard
   *  דרך CTA "להמשך") — null כשאין הדגשה פעילה. ראו RoadmapSection.tsx. */
  highlightedTaskKey?: string | null;
}

/**
 * כרטיס שלב ב"מסלול שלי" — Roadmap 2.0: כלי פעולה, לא טקסט להסבר. במצב
 * סגור מוצגים רק שם השלב, משפט קצר אחד, שורת "מתי?" ו-progress ("X מתוך Y
 * הושלמו") + פס התקדמות עדין. תתי-המשימות (עם checkbox נפרד לכל אחת) גלויות
 * רק בפתיחה. אין יותר checkbox ידני יחיד לשלב כולו — השלב מסומן כ"הושלם"
 * אוטומטית רק כשכל המשימות שלו מסומנות (isDone כאן הוא derived, מחושב
 * מלמעלה ב-useJourneyProgress.ts). כשהשלב הושלם, הכרטיס מתכווץ ומציג במקום
 * הטקסט הקצר/מתי/progress שורת סיום עדינה בלבד — לא gamified, בלי קונפטי.
 * ה-CTA למדריך קיים (step.readMoreHref) מוצג תמיד, גם במצב סגור, כדי שיהיה
 * נגיש בלי לפתוח את השלב — התוכן הארוך הישן (step.moreInfo) לא מוצג כאן
 * יותר בכלל (נשאר בנתונים בלבד, עדיין מוצג במפת המסלול במסך הפתיחה).
 */
export default function StepRow({
  step,
  isExpanded,
  completedStepTasks,
  onToggleTask,
  onToggleExpand,
  setRowRef,
  hideParallelBadge = false,
  highlightedTaskKey = null,
}: StepRowProps) {
  const panelId = `step-tasks-${step.id}`;
  const henName = STEP_HEN[step.id];

  const totalTasks = step.tasks.length;
  const doneTasks = step.tasks.reduce(
    (count, _task, index) => (completedStepTasks.has(`${step.id}:${index}`) ? count + 1 : count),
    0
  );
  const isDone = totalTasks > 0 && doneTasks === totalTasks;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  // שלב שהושלם: כרטיס בירוק-מנטה ותגית "השלמת את השלב" בולטת, כדי שיהיה ברור במבט אחד מה כבר מאחורייך.
  const doneCardClasses = "border-warm-300 bg-warm-100/70";
  const activeCardClasses = "border-mist-200 bg-white";

  return (
    <li
      ref={(el) => setRowRef(step.id, el)}
      className={`scroll-mt-28 rounded-2xl border-2 p-3.5 shadow-card transition-all duration-300 sm:p-4 ${
        isDone ? doneCardClasses : activeCardClasses
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        {henName && (
          <HenIllustration
            name={henName}
            blob="cream"
            sizeClassName={CHECKLIST_HEN_SIZE}
            activeRing={isExpanded}
            doneBadge={isDone}
            className="mt-0.5"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span
              className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${
                isDone ? "bg-warm-500 text-ink" : "bg-mist-100 text-deep"
              }`}
            >
              {step.id}
            </span>
            <span
              className="text-base font-semibold text-ink sm:text-lg"
            >
              {step.title}
            </span>
            {step.parallel && !hideParallelBadge && (
              <span className="inline-flex items-center rounded-full bg-warm-100 px-2.5 py-0.5 text-xs font-medium text-warm-500 ring-1 ring-inset ring-warm-300/60">
                אפשר במקביל
              </span>
            )}
          </div>

          {isDone ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warm-500 px-3 py-1 text-sm font-bold text-ink shadow-sm">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
              השלמת את השלב
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm leading-relaxed text-ink/60">{step.shortDescription}</p>
              <p className="mt-1.5 text-xs font-medium text-ink/45 sm:text-sm">
                <span className="font-semibold text-ink/55">מתי? </span>
                {step.whenLabel}
              </p>

              <div className="mt-2.5 flex items-center gap-2.5">
                <div
                  className="h-1.5 min-w-[64px] flex-1 overflow-hidden rounded-full bg-mist-200 sm:max-w-[160px]"
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`התקדמות בשלב ${step.title}`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-teal-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs font-semibold text-ink/55 sm:text-sm">
                  {doneTasks} מתוך {totalTasks} הושלמו
                </span>
              </div>
            </>
          )}

          {!(isDone && !isExpanded) && (
            <button
              type="button"
              onClick={() => onToggleExpand(step.id)}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              className="no-print mt-2.5 inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                strokeWidth={2.5}
              />
              {isExpanded ? "הסתרת המשימות" : "המשימות שלי"}
            </button>
          )}

          <div
            id={panelId}
            role="region"
            aria-label={`המשימות של שלב ${step.title}`}
            className={`grid transition-all duration-300 ease-in-out ${
              isExpanded ? "mt-2.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <ul className="flex flex-col gap-1 rounded-xl bg-mist-50 p-2 sm:p-2.5">
                {step.tasks.map((task, index) => {
                  const taskKey = `${step.id}:${index}`;
                  const isTaskDone = completedStepTasks.has(taskKey);
                  const taskCheckboxId = `step-task-${step.id}-${index}`;
                  const isHighlighted = highlightedTaskKey === taskKey;
                  return (
                    <li key={taskKey} id={`step-task-row-${step.id}-${index}`}>
                      <label
                        htmlFor={taskCheckboxId}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition-colors duration-700 motion-reduce:transition-none sm:py-2.5 ${
                          isHighlighted ? "bg-warm-100 ring-2 ring-warm-300" : "hover:bg-white"
                        }`}
                      >
                        <input
                          id={taskCheckboxId}
                          type="checkbox"
                          checked={isTaskDone}
                          onChange={() => onToggleTask(step.id, index)}
                          className="h-5 w-5 shrink-0 cursor-pointer accent-teal-600"
                        />
                        <span
                          className={`text-sm sm:text-[15px] ${
                            isTaskDone ? "text-ink/40 line-through" : "text-ink/80"
                          }`}
                        >
                          {task}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {step.readMoreHref && (!isDone || isExpanded) && (
            <div className="no-print mt-3">
              {step.ctaPrompt && (
                <p className="mb-1 text-xs font-medium text-ink/50 sm:text-sm">{step.ctaPrompt}</p>
              )}
              <a
                href={step.readMoreHref}
                className="group/link inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3.5 py-1.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100"
              >
                {step.readMoreLabel ?? "קרא עוד"}
                <ArrowLeft
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:-translate-x-1"
                  strokeWidth={2.5}
                />
              </a>
            </div>
          )}
        </div>
      </div>

      {isDone && !isExpanded && (
        <div className="no-print -mb-1 mt-1 flex justify-end">
          <button
            type="button"
            onClick={() => onToggleExpand(step.id)}
            aria-expanded={false}
            aria-controls={panelId}
            className="text-[11px] text-ink/40 underline decoration-ink/15 underline-offset-2 transition-colors hover:text-ink/65 sm:text-xs"
          >
            רגע, שכחתי משימה
          </button>
        </div>
      )}
    </li>
  );
}
