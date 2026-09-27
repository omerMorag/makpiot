import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

/**
 * הגבלת קצב לפעולות סיפורים — מעל אותו לקוח Redis הקיים (redis.ts),
 * אך תחת namespace נפרד לגמרי ("ratelimit:*" דרך ה-prefix) כדי שלא
 * ליצור שום התנגשות עם מפתחות ההתקדמות האישית הקיימים ("progress:*").
 * המפתח הוא תמיד session.user.id (לא IP) — שתי הפעולות דורשות התחברות
 * ממילא, כך שאין סיכון של IP משותף/NAT שפוגע במשתמשות תמימות.
 */
export const storySubmitLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "24 h"),
  prefix: "ratelimit:story-submit",
  analytics: false,
});

export const storyReportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "ratelimit:story-report",
  analytics: false,
});

/** טופס "צרי קשר" — פתוח גם בלי התחברות, ולכן לפי IP (מגבלה נדיבה) */
export const contactLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "ratelimit:contact",
  analytics: false,
});
