"use client";

import { navSections, type SectionId } from "@/data/navSections";

/**
 * ספירת צפיות ב-Umami לכל אזור באתר. המעברים בין האזורים הם שינויי hash
 * (#tests, #injections...), ש-Umami לא סופר לבד — לכן הסקריפט נטען עם
 * data-auto-track="false", וכל צפייה נשלחת מכאן עם כתובת קריאה: "/injections".
 * נשלח רק מזהה האזור ושמו — לעולם לא נתונים שהמשתמשת מזינה.
 */

type UmamiPayload = Record<string, unknown>;
interface UmamiApi {
  track: (arg?: string | ((props: UmamiPayload) => UmamiPayload), data?: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    umami?: UmamiApi;
  }
}

const EXTRA_TITLES: Partial<Record<SectionId, string>> = {
  "cost-estimator": "כמה יעלה לי?",
  "admin-stories": "באקלוג",
};

function titleFor(section: SectionId): string {
  return navSections.find((s) => s.id === section)?.label ?? EXTRA_TITLES[section] ?? section;
}

let pending: (() => void) | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let debounce: ReturnType<typeof setTimeout> | null = null;

/** הסקריפט נטען אחרי שהעמוד אינטראקטיבי — אם עוד לא מוכן, מחכים לו (עד 10 שניות) */
function whenReady(fn: () => void) {
  if (typeof window === "undefined") return;
  if (window.umami) return fn();
  pending = fn; // רק הצפייה האחרונה רלוונטית
  if (timer) return;
  let tries = 0;
  timer = setInterval(() => {
    tries += 1;
    if (window.umami || tries > 40) {
      if (timer) clearInterval(timer);
      timer = null;
      if (window.umami && pending) pending();
      pending = null;
    }
  }, 250);
}

/**
 * פרמטרי UTM מהכניסה לאתר (למשל ?utm_source=facebook) — מצורפים רק לצפייה
 * הראשונה, כדי ש-Umami ידע מאיפה הגיעה. שאר הפרמטרים (למשל fbclid) לא נשלחים.
 */
let entryUtm: string | null = null;
function takeEntryUtm(): string {
  if (entryUtm !== null) return "";
  const params = new URLSearchParams(window.location.search);
  const keep = new URLSearchParams();
  params.forEach((v, k) => {
    if (k.startsWith("utm_")) keep.set(k, v.slice(0, 100));
  });
  entryUtm = keep.toString();
  return entryUtm ? `?${entryUtm}` : "";
}

/** צפייה באזור. isHome = כניסה לכתובת הראשית (מסך הפתיחה) */
export function trackSectionView(section: SectionId, isHome = false) {
  const base = isHome ? "/" : `/${section}`;
  const title = isHome ? "מסך הפתיחה" : titleFor(section);
  // השהיה קצרה: בטעינה, האזור מתחיל כ"המסלול שלי" ומתעדכן מיד לפי ה-hash —
  // סופרים רק את האזור שנשאר
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    debounce = null;
    const url = base + takeEntryUtm();
    whenReady(() => window.umami?.track((props) => ({ ...props, url, title })));
  }, 300);
}
