"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { journeySteps } from "@/data/steps";
import { testItems } from "@/data/tests";
import { fetchServerProgress, pushServerProgress } from "@/lib/syncProgress";

const STORAGE_KEY = "egg-freezing-journey:progress:v1";

export interface StoredProgress {
  /** נשמר לצורכי תאימות לאחור בלבד — נגזר כעת מ-stepTasks, ראו migration ב-load */
  steps: number[];
  /** מפתחות בפורמט "stepId:taskIndex" — כל משימה בתוך כל שלב במסלול (Roadmap 2.0) */
  stepTasks: string[];
  /** נשמר לצורכי תאימות לאחור בלבד — נגזר כעת מ-testSubItems, ראו migration ב-load */
  tests: number[];
  /** מפתחות בפורמט "testId:subIndex" — כל רכיב במיני-הצ'קליסט של כל בדיקה */
  testSubItems: string[];
  /** מפתח: `testId` (תאריך משותף לכל הקבוצה) או `testId:subIndex` (תאריך נפרד
   *  לרכיב ספציפי בתוך הקבוצה, למשל AMH בנפרד מ-FSH/אסטרדיול) — ערך: תאריך
   *  ביצוע (YYYY-MM-DD) שהוזן ידנית. הרחבה תואמת-לאחור בלבד של אותו מבנה
   *  מפתחות שהיה קיים תמיד בפועל (מפתחות עצם JS הם תמיד מחרוזות) — נתונים
   *  ישנים עם מפתחות "1", "2" וכו' ממשיכים להתפרש בדיוק כמו קודם, בלי מיגרציה. */
  testDates: Record<string, string>;
  /** היחידה שנבחרה בכלי "איפה כדאי לעשות?" (WHERE TO DO 2.0) — null = לא נבחרה/בוטלה בחירה.
   *  שדה חדש (לא שינוי מבנה קיים) — נתונים ישנים ב-localStorage/Redis פשוט לא כוללים אותו,
   *  ו-readStorage למטה מתייחס לחסרונו כ-null, בלי צורך במיגרציה אמיתית. */
  selectedCareUnit: { id: string; name: string } | null;
  /** האם המשתמשת כבר "סיימה לצפות" בחוויית הפתיחה (מסך הפתיחה + מקטע ההיכרות
   *  האישי) — פעם אחת true, נשאר true לצמיתות (לא מתאפס לעולם, גם לא ב-reset()).
   *  שדה חדש נוסף באותו האופן בדיוק כמו selectedCareUnit למעלה — חסרונו בנתונים
   *  ישנים מתפרש כ-false (עדיין לא נצפתה), בלי מיגרציה. ר' useHeroScrollTransition.ts. */
  hasSeenIntro: boolean;
}

function emptyProgress(): StoredProgress {
  return {
    steps: [],
    stepTasks: [],
    tests: [],
    testSubItems: [],
    testDates: {},
    selectedCareUnit: null,
    hasSeenIntro: false,
  };
}

/** "הדבר הבא שלך" — נגזר תמיד מ-completedStepTasks, אין state ידני נפרד
 *  של "השלב הנוכחי" (כדי שלא ייווצר מצב שבו משימות מסומנות אבל ה-Next
 *  Action לא מתעדכן). null רק כששני התנאים מתקיימים: כל תתי-המשימות בכל
 *  השלבים מסומנות — כלומר המסלול כולו הושלם. */
export interface NextAction {
  stepId: number;
  stepTitle: string;
  /** כינוי קצר לשלב, לשורת ההקשר הקומפקטית (step.shortLabel) */
  shortLabel: string;
  taskIndex: number;
  /** ניסוח ממוקד-פעולה של המשימה הבאה (step.taskActions[taskIndex]) */
  actionLabel: string;
  doneInStep: number;
  totalInStep: number;
  readMoreHref?: string;
  readMoreLabel?: string;
}

/** מוצאת את השלב הראשון שעדיין לא הושלם, ובתוכו את תת-המשימה הראשונה
 *  שעדיין לא סומנה — בדיוק החוק שהתבקש: "מצאי את השלב הראשון שלא הושלם,
 *  ובתוכו את תת-המשימה הראשונה שלא סומנה". */
function computeNextAction(completedStepTasks: Set<string>): NextAction | null {
  for (const step of journeySteps) {
    const total = step.tasks.length;
    let doneInStep = 0;
    let firstUndoneIndex = -1;
    for (let i = 0; i < total; i += 1) {
      if (completedStepTasks.has(`${step.id}:${i}`)) {
        doneInStep += 1;
      } else if (firstUndoneIndex === -1) {
        firstUndoneIndex = i;
      }
    }
    if (firstUndoneIndex !== -1) {
      return {
        stepId: step.id,
        stepTitle: step.title,
        shortLabel: step.shortLabel,
        taskIndex: firstUndoneIndex,
        actionLabel: step.taskActions[firstUndoneIndex] ?? step.tasks[firstUndoneIndex],
        doneInStep,
        totalInStep: total,
        readMoreHref: step.readMoreHref,
        readMoreLabel: step.readMoreLabel,
      };
    }
  }
  return null;
}

function readStorage(): StoredProgress {
  if (typeof window === "undefined") {
    return emptyProgress();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<StoredProgress> & {
      // תאימות לאחור: גרסה קודמת שמרה כאן { date, instructions } לכל בדיקה
      testNotes?: Record<number, { date?: string }>;
    };
    const testDates: Record<string, string> = {};
    if (parsed.testDates && typeof parsed.testDates === "object") {
      Object.assign(testDates, parsed.testDates);
    } else if (parsed.testNotes && typeof parsed.testNotes === "object") {
      // מיגרציה מהמבנה הקודם (testNotes.date) לפני שהוסר שדה ההנחיות החופשי
      Object.entries(parsed.testNotes).forEach(([testId, note]) => {
        if (note?.date) testDates[testId] = note.date;
      });
    }
    const selectedCareUnit =
      parsed.selectedCareUnit &&
      typeof parsed.selectedCareUnit === "object" &&
      typeof parsed.selectedCareUnit.id === "string" &&
      typeof parsed.selectedCareUnit.name === "string"
        ? { id: parsed.selectedCareUnit.id, name: parsed.selectedCareUnit.name }
        : null;

    return {
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      stepTasks: Array.isArray(parsed.stepTasks) ? parsed.stepTasks : [],
      tests: Array.isArray(parsed.tests) ? parsed.tests : [],
      testSubItems: Array.isArray(parsed.testSubItems) ? parsed.testSubItems : [],
      testDates,
      selectedCareUnit,
      hasSeenIntro: parsed.hasSeenIntro === true,
    };
  } catch {
    return emptyProgress();
  }
}

function writeStorage(data: StoredProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable (private mode / quota) — fail silently
  }
}

/** קריאה חד-פעמית וסינכרונית (לא ממתינה ל-hydration של ה-hook) של דגל
 *  hasSeenIntro בלבד — נחוצה ל-useHeroScrollTransition כדי להחליט *לפני*
 *  הציור הראשון של הדפדפן (useLayoutEffect) אם להציג את מסך הפתיחה בכלל,
 *  בלי לצמד את שני ה-hooks זה לזה או לחכות למחזור הטעינה המלא של useJourneyProgress. */
export function hasSeenIntroInStorage(): boolean {
  return readStorage().hasSeenIntro;
}

/** מספר הרכיבים הניתנים לסימון בתוך בדיקה נתונה — לפחות 1 (fallback לבדיקה בלי subItems מוגדרים) */
function subItemCount(testId: number): number {
  const test = testItems.find((t) => t.id === testId);
  return test?.subItems && test.subItems.length > 0 ? test.subItems.length : 1;
}

/** אינדקסי הרכיבים ה"נדרשים" בתוך בדיקה — כל תתי-הרכיבים, פרט לאלה
 *  שמסומנים optional (כרגע רק AMH, ר' tests.ts) — משמש הן לחישוב מתי
 *  בדיקה שלמה נחשבת "הושלמה" (isTestDone) והן לקיצור הדרך "סמני/בטלי
 *  הכול" (toggleTest), כדי ששני המקומות האלה לעולם לא יסתרו זה את זה.
 *  אם כל הרכיבים בקבוצה סומנו (בטעות) כ-optional, חוזרים לדרוש את כולם —
 *  כדי לא ליצור קבוצה שתמיד "הושלמה" מבלי לסמן דבר. */
function requiredSubIndexes(testId: number): number[] {
  const test = testItems.find((t) => t.id === testId);
  if (!test?.subItems || test.subItems.length === 0) return [0];
  const required = test.subItems.reduce<number[]>((acc, sub, index) => {
    if (!sub.optional) acc.push(index);
    return acc;
  }, []);
  return required.length > 0 ? required : test.subItems.map((_, index) => index);
}

/** האם בדיקה נתונה נחשבת "הושלמה" — כל הרכיבים הנדרשים שלה (לא כולל
 *  רכיבי optional כמו AMH) מסומנים ב-subItemsSet. מקור אמת יחיד, נעשה בו
 *  שימוש הן ב-completedTests (המקומי) והן במיזוג נתוני השרת למטה, כדי
 *  שהשניים לא יתבדרו. */
function isTestDone(testId: number, subItemsSet: Set<string>): boolean {
  return requiredSubIndexes(testId).every((index) => subItemsSet.has(`${testId}:${index}`));
}

/** מספר המשימות בתוך שלב נתון במסלול — לפחות 1 (fallback לשלב בלי tasks מוגדרות) */
function stepTaskCount(stepId: number): number {
  const step = journeySteps.find((s) => s.id === stepId);
  return step?.tasks && step.tasks.length > 0 ? step.tasks.length : 1;
}

/** כל מפתחות המשימות במסלול שעוד לא סומנו ("stepId:taskIndex"). משמש
 *  לזיהוי הרגע שבו המשתמשת מסמנת בעצמה את המשימה האחרונה (JourneyFinale). */
export function missingStepTaskKeys(completedStepTasks: Set<string>): string[] {
  const missing: string[] = [];
  journeySteps.forEach((step) => {
    const count = stepTaskCount(step.id);
    for (let i = 0; i < count; i += 1) {
      const key = `${step.id}:${i}`;
      if (!completedStepTasks.has(key)) missing.push(key);
    }
  });
  return missing;
}

/** בהינתן קבוצת מפתחות "stepId:taskIndex" שסומנו — אילו מזהי שלבים שלמים (כל המשימות שלהם מסומנות) */
function deriveCompletedSteps(completedStepTasks: Set<string>): Set<number> {
  const done = new Set<number>();
  journeySteps.forEach((step) => {
    const count = stepTaskCount(step.id);
    let allChecked = true;
    for (let i = 0; i < count; i += 1) {
      if (!completedStepTasks.has(`${step.id}:${i}`)) {
        allChecked = false;
        break;
      }
    }
    if (allChecked) done.add(step.id);
  });
  return done;
}

/** מוסיפה למערך מפתחות "stepId:taskIndex" את כל המשימות של שלב נתון (migration משלב "הושלם" ישן) */
function addAllStepTasks(target: Set<string>, stepId: number) {
  const count = stepTaskCount(stepId);
  for (let i = 0; i < count; i += 1) target.add(`${stepId}:${i}`);
}

export function useJourneyProgress() {
  const [hydrated, setHydrated] = useState(false);
  // מפתח כל איבר: `${stepId}:${taskIndex}` — מקור האמת היחיד להתקדמות בשלבי המסלול
  const [completedStepTasks, setCompletedStepTasks] = useState<Set<string>>(new Set());
  // מפתח כל איבר: `${testId}:${subIndex}` — מקור האמת היחיד להתקדמות בבדיקות
  const [completedTestSubItems, setCompletedTestSubItems] = useState<Set<string>>(new Set());
  // מפתח: testId (משותף) או testId:subIndex (נפרד לרכיב) — ר' StoredProgress.testDates
  const [testDates, setTestDates] = useState<Record<string, string>>({});
  // היחידה שנבחרה בכלי "איפה כדאי לעשות?" — ראו StoredProgress.selectedCareUnit
  const [selectedCareUnit, setSelectedCareUnit] = useState<{ id: string; name: string } | null>(null);
  // ראו StoredProgress.hasSeenIntro — ברירת המחדל false נכונה גם לפני
  // hydration (useHeroScrollTransition כבר קרא את הדגל בעצמו, סינכרונית, לפני
  // הציור הראשון; ה-state כאן משמש רק את markIntroSeen/הסנכרון לשרת).
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  // טעינה חד-פעמית מה-localStorage בצד הלקוח
  useEffect(() => {
    const stored = readStorage();
    setTestDates(stored.testDates);
    setSelectedCareUnit(stored.selectedCareUnit);
    setHasSeenIntro(stored.hasSeenIntro);

    // מיגרציה: נתוני התקדמות ישנים (מלפני תתי-המשימות של Roadmap 2.0) שמרו
    // רק אילו שלבים "הושלמו" כמקשה אחת ב-steps, דרך checkbox ידני יחיד לכל
    // שלב. כדי לא לאבד את זה, כל שלב שהיה מסומן כהושלם הופך כעת לשלב שכל
    // המשימות שלו מסומנות.
    const stepTaskSet = new Set(stored.stepTasks);
    stored.steps.forEach((stepId) => addAllStepTasks(stepTaskSet, stepId));
    setCompletedStepTasks(stepTaskSet);

    // אותה מיגרציה בדיוק, למבנה הישן של הבדיקות (tests -> testSubItems)
    const subItemSet = new Set(stored.testSubItems);
    stored.tests.forEach((testId) => {
      const count = subItemCount(testId);
      for (let i = 0; i < count; i += 1) subItemSet.add(`${testId}:${i}`);
    });
    setCompletedTestSubItems(subItemSet);

    setHydrated(true);
  }, []);

  const completedSteps = useMemo(
    () => deriveCompletedSteps(completedStepTasks),
    [completedStepTasks]
  );

  const completedTests = useMemo(() => {
    const done = new Set<number>();
    testItems.forEach((test) => {
      if (isTestDone(test.id, completedTestSubItems)) done.add(test.id);
    });
    return done;
  }, [completedTestSubItems]);

  // שמירה בכל שינוי, רק אחרי שהושלמה הטעינה הראשונית
  useEffect(() => {
    if (!hydrated) return;
    writeStorage({
      steps: Array.from(completedSteps),
      stepTasks: Array.from(completedStepTasks),
      tests: Array.from(completedTests),
      testSubItems: Array.from(completedTestSubItems),
      testDates,
      selectedCareUnit,
      hasSeenIntro,
    });
  }, [
    completedSteps,
    completedStepTasks,
    completedTests,
    completedTestSubItems,
    testDates,
    selectedCareUnit,
    hasSeenIntro,
    hydrated,
  ]);

  // --- סנכרון ענן אופציונלי (Google + Upstash Redis) ---
  // מצב אורחת (לא מחוברת) ממשיך לעבוד בדיוק כמו קודם — כל הלוגיקה כאן פועלת
  // רק כש-status === "authenticated", ולעולם לא חוסמת/מעכבת את הטעינה מ-localStorage.
  const { data: session, status } = useSession();
  const userId =
    status === "authenticated"
      ? ((session?.user as { id?: string } | undefined)?.id ?? null)
      : null;

  // מזהה המשתמש/ת שעבורו/ה כבר בוצע מיזוג חד-פעמי בכניסה הנוכחית; מתאפס ביציאה
  const mergedForUserIdRef = useRef<string | null>(null);
  const pushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // איפוס דגל המיזוג ביציאה, כדי שכניסה הבאה (גם לאותו חשבון) תמזג מחדש
  useEffect(() => {
    if (status === "unauthenticated") {
      mergedForUserIdRef.current = null;
    }
  }, [status]);

  // מיזוג חד-פעמי בכניסה: לוקח את מה שיש בשרת, מאחד עם המקומי (union), ודוחף את
  // התוצאה המאוחדת גם למקומי וגם בחזרה לשרת. פעם אחת בלבד לכל כניסה (per userId).
  useEffect(() => {
    if (!hydrated || !userId) return;
    if (mergedForUserIdRef.current === userId) return;
    mergedForUserIdRef.current = userId;

    let cancelled = false;
    (async () => {
      const serverData = await fetchServerProgress();
      if (cancelled) return;

      if (!serverData) {
        // לשרת אין נתונים עדיין — מעלים את המקומי כמות שהוא
        await pushServerProgress({
          steps: Array.from(completedSteps),
          stepTasks: Array.from(completedStepTasks),
          tests: Array.from(completedTests),
          testSubItems: Array.from(completedTestSubItems),
          testDates,
          selectedCareUnit,
          hasSeenIntro,
        });
        return;
      }

      // מיזוג איחוד: סימון לעולם לא "מתבטל" בטעות. גם נתוני שרת ישנים
      // (steps/tests בפורמט הישן, מלפני שהיה בהם stepTasks/testSubItems —
      // למשל התקדמות שסונכרנה ממכשיר אחר לפני שדרוג Roadmap 2.0) עוברים
      // כאן אותה מיגרציה כמו בטעינה המקומית, כדי לא לאבד אותם.
      const mergedStepTasks = new Set(completedStepTasks);
      (serverData.stepTasks ?? []).forEach((key) => mergedStepTasks.add(key));
      (serverData.steps ?? []).forEach((stepId) => addAllStepTasks(mergedStepTasks, stepId));

      const mergedSubItems = new Set(completedTestSubItems);
      (serverData.testSubItems ?? []).forEach((key) => mergedSubItems.add(key));

      const mergedDates: Record<string, string> = { ...testDates };
      Object.entries(serverData.testDates ?? {}).forEach(([key, date]) => {
        if (date) mergedDates[key] = date;
      });

      // בחירת יחידה: כמו testDates, נתוני השרת גוברים אם קיימים (ערך אחרון-שנבחר), אחרת נשאר המקומי
      const mergedSelectedCareUnit = serverData.selectedCareUnit ?? selectedCareUnit;
      // hasSeenIntro: איחוד "או" — בדיוק כמו סימוני משימות/בדיקות, פעם אחת
      // true בכל מכשיר/חשבון אמורה להישאר true בכולם, לעולם לא "מתבטלת" במיזוג.
      const mergedHasSeenIntro = hasSeenIntro || serverData.hasSeenIntro === true;

      if (cancelled) return;
      setCompletedStepTasks(mergedStepTasks);
      setCompletedTestSubItems(mergedSubItems);
      setTestDates(mergedDates);
      setSelectedCareUnit(mergedSelectedCareUnit);
      setHasSeenIntro(mergedHasSeenIntro);

      const mergedSteps = Array.from(deriveCompletedSteps(mergedStepTasks));

      const mergedTests: number[] = [];
      testItems.forEach((test) => {
        if (isTestDone(test.id, mergedSubItems)) mergedTests.push(test.id);
      });

      await pushServerProgress({
        steps: mergedSteps,
        stepTasks: Array.from(mergedStepTasks),
        tests: mergedTests,
        testSubItems: Array.from(mergedSubItems),
        testDates: mergedDates,
        selectedCareUnit: mergedSelectedCareUnit,
        hasSeenIntro: mergedHasSeenIntro,
      });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, userId]);

  // דחיפה מדוד (debounced) לשרת בכל שינוי מקומי, רק כשמחוברת וכבר בוצע המיזוג
  // הראשוני — כדי לא לדרוס את נתוני השרת לפני שהמיזוג הספיק לרוץ.
  useEffect(() => {
    if (!hydrated || !userId) return;
    if (mergedForUserIdRef.current !== userId) return;

    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    pushTimeoutRef.current = setTimeout(() => {
      pushServerProgress({
        steps: Array.from(completedSteps),
        stepTasks: Array.from(completedStepTasks),
        tests: Array.from(completedTests),
        testSubItems: Array.from(completedTestSubItems),
        testDates,
        selectedCareUnit,
        hasSeenIntro,
      });
    }, 1500);

    return () => {
      if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    };
  }, [
    completedSteps,
    completedStepTasks,
    completedTests,
    completedTestSubItems,
    testDates,
    selectedCareUnit,
    hasSeenIntro,
    hydrated,
    userId,
  ]);

  /** מסמנת/מבטלת משימה בודדת בתוך שלב במסלול (Roadmap 2.0). השלב עצמו
   *  מחושב כ"הושלם" אוטומטית (derived) כשכל המשימות שלו מסומנות — אין יותר
   *  checkbox ידני נפרד לשלב כולו. */
  const toggleStepTask = useCallback((stepId: number, taskIndex: number) => {
    setCompletedStepTasks((prev) => {
      const next = new Set(prev);
      const key = `${stepId}:${taskIndex}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  /** מסמנת/מבטלת רכיב בודד במיני-הצ'קליסט של בדיקה (למשל AMH בתוך "פרופיל הורמונלי") */
  const toggleTestSubItem = useCallback((testId: number, subIndex: number) => {
    setCompletedTestSubItems((prev) => {
      const next = new Set(prev);
      const key = `${testId}:${subIndex}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  /** קיצור דרך על כל הבדיקה: אם לא כל הרכיבים ה*נדרשים* מסומנים — מסמנת
   *  אותם; אם כולם כבר מסומנים — מבטלת אותם. נוגעת רק ברכיבים הנדרשים
   *  (requiredSubIndexes) — לעולם לא ברכיבי optional כמו AMH, כדי שאישה
   *  שלא נדרשה לבצע AMH תוכל להשלים את הבדיקה כולה דרך הקיצור הזה בלי
   *  שהוא יסמן עבורה בטעות שביצעה אותו. */
  const toggleTest = useCallback((testId: number) => {
    const indexes = requiredSubIndexes(testId);
    setCompletedTestSubItems((prev) => {
      const next = new Set(prev);
      const allChecked = indexes.every((index) => next.has(`${testId}:${index}`));
      indexes.forEach((index) => {
        const key = `${testId}:${index}`;
        if (allChecked) next.delete(key);
        else next.add(key);
      });
      return next;
    });
  }, []);

  /** מעדכנת את תאריך הביצוע שהוזן ידנית לבדיקה/לרכיב נתון (מחרוזת ריקה = ניקוי).
   *  key הוא `testId` (תאריך משותף לקבוצה) או `testId:subIndex` (תאריך נפרד
   *  לרכיב ספציפי) — ר' StoredProgress.testDates. */
  const updateTestDate = useCallback((key: string, date: string) => {
    setTestDates((prev) => {
      if (!date) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: date };
    });
  }, []);

  /** נבחרת יחידה בכלי "איפה כדאי לעשות?" (WHERE TO DO 2.0, §12). מסמנת גם
   *  אוטומטית ואידמפוטנטית את משימה 4 בשלב 2 ("בחרתי איפה לעבור את
   *  התהליך" — steps.ts, journeySteps[1].tasks[4]) אם היא עדיין לא
   *  מסומנת. בחירה חוזרת/שינוי בחירה לא מבטלת סימון קיים. */
  const selectCareUnit = useCallback((id: string, name: string) => {
    setSelectedCareUnit({ id, name });
    setCompletedStepTasks((prev) => {
      const key = "2:4";
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  /** מנקה את הבחירה בלבד — לא מבטלת את סימון המשימה שכבר נעשה (החלטת עיצוב מכוונת, ר' תוכנית WHERE TO DO 2.0) */
  const clearCareUnitSelection = useCallback(() => {
    setSelectedCareUnit(null);
  }, []);

  /** מסמנת שהמשתמשת סיימה לצפות בחוויית הפתיחה — נקראת רק כשהיא לחצה על
   *  כפתור ההתחלה או הגיעה בפועל לראש המסלול בגלילה טבעית (ר' AppShell.tsx),
   *  לעולם לא רק כי עמוד הבית נטען. אידמפוטנטית ולא הפיכה: ברגע שהיא true
   *  נשארת true גם אחרי reset() של שאר ההתקדמות (זו לא "התקדמות במסלול",
   *  אלא רק "כבר ראתה את המסך הזה"). */
  const markIntroSeen = useCallback(() => {
    setHasSeenIntro((prev) => (prev ? prev : true));
  }, []);

  const reset = useCallback(() => {
    setCompletedStepTasks(new Set());
    setCompletedTestSubItems(new Set());
    setTestDates({});
    setSelectedCareUnit(null);
  }, []);

  const totalSteps = journeySteps.length;
  const totalTests = testItems.length;

  const doneStepsCount = completedSteps.size;
  const doneTestsCount = completedTests.size;

  // סך כל המשימות בכל שלבי המסלול, וכמה מהן מסומנות — משמש לחישוב
  // "progress הכללי" של המסלול לפי משימות בפועל (Roadmap 2.0), לא רק לפי
  // מספר השלבים שהושלמו במלואם.
  const totalStepTasksCount = useMemo(
    () => journeySteps.reduce((sum, step) => sum + stepTaskCount(step.id), 0),
    []
  );
  const doneStepTasksCount = completedStepTasks.size;

  const nextStep = useMemo(
    () => journeySteps.find((step) => !completedSteps.has(step.id)) ?? null,
    [completedSteps]
  );

  // "הדבר הבא שלך" (NextActionCard) — נגזר ישירות מ-completedStepTasks,
  // באותו האופן בדיוק כמו completedSteps/completedTests למעלה. null =
  // המסלול כולו הושלם (כל תתי-המשימות בכל השלבים מסומנות).
  const nextAction = useMemo(() => computeNextAction(completedStepTasks), [completedStepTasks]);

  const progressPercent = useMemo(() => {
    const total = totalSteps + totalTests;
    if (total === 0) return 0;
    return Math.round(((doneStepsCount + doneTestsCount) / total) * 100);
  }, [doneStepsCount, doneTestsCount, totalSteps, totalTests]);

  const allStepsCompleted = doneStepsCount === totalSteps;
  const hasAnyProgress = doneStepsCount > 0 || doneTestsCount > 0;

  return {
    hydrated,
    completedSteps,
    completedStepTasks,
    completedTests,
    completedTestSubItems,
    testDates,
    selectedCareUnit,
    hasSeenIntro,
    toggleStepTask,
    toggleTest,
    toggleTestSubItem,
    updateTestDate,
    selectCareUnit,
    clearCareUnitSelection,
    markIntroSeen,
    reset,
    totalSteps,
    totalTests,
    doneStepsCount,
    doneTestsCount,
    totalStepTasksCount,
    doneStepTasksCount,
    nextStep,
    nextAction,
    progressPercent,
    allStepsCompleted,
    hasAnyProgress,
  };
}

export type JourneyProgress = ReturnType<typeof useJourneyProgress>;
