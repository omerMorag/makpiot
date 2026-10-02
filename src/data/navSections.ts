import { BookOpen, Egg, FlaskConical, Heart, ListChecks, Mail, MapPin, Syringe, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SectionId =
  | "roadmap"
  | "tests"
  | "where-to-go"
  | "my-chances"
  | "guides"
  | "injections"
  | "cost-estimator"
  | "stories"
  | "admin-stories"
  | "groups"
  | "contact";

export interface NavSectionDef {
  id: SectionId;
  label: string;
  icon: LucideIcon;
}

/**
 * חמשת אזורי התוכן של האפליקציה. זהו מקור האמת היחיד לניווט —
 * גם ה-Sidebar בדסקטופ וגם ה-Drawer במובייל בונים את הרשימה שלהם מכאן,
 * כדי שלא יהיו שני מקומות נפרדים שיכולים להתבדר זה מזה.
 */
export const navSections: NavSectionDef[] = [
  { id: "roadmap", label: "המסלול שלי", icon: ListChecks },
  { id: "tests", label: "הבדיקות שלי", icon: FlaskConical },
  { id: "where-to-go", label: "איפה כדאי לעשות?", icon: MapPin },
  { id: "my-chances", label: "כמה ביציות להקפיא?", icon: Egg },
  { id: "injections", label: "תקופת הזריקות", icon: Syringe },
  { id: "stories", label: "סיפורים מהמקפיא", icon: Heart },
  { id: "guides", label: "יום השאיבה", icon: BookOpen },
  { id: "groups", label: "קבוצות חשובות", icon: Users },
  { id: "contact", label: "צרי קשר", icon: Mail },
];

// "cost-estimator" ("כמה יעלה לי?") הוסתר זמנית לבקשת המשתמשת (24.9.2026):
// הוצא מהתפריט, ו-hash ישיר אליו נופל לברירת המחדל כי isSectionId בודק רק
// את navSections. הקוד עצמו (CostEstimatorSection וכו') נשאר — כדי להחזיר,
// מספיק להוסיף בחזרה את השורה:
//   { id: "cost-estimator", label: "כמה יעלה לי?", icon: Wallet },

// "admin-stories" נשאר מחוץ ל-navSections בכוונה: NavList.tsx המשותף לא
// מציג אותו כברירת מחדל. קישור הניווט שלו מתווסף ידנית ב-Sidebar/MobileDrawer
// (שלב 3 בתוכנית, עם המודרציה), מוצג רק כש-useIsAdmin() מחזיר true.

export const DEFAULT_SECTION: SectionId = "roadmap";

/**
 * בדיקת תקינות ל-hash שהגיע מה-URL. "admin-stories" נחשב תקין כבר עכשיו
 * (כדי שקישור ישיר ל-hash שלו לא ייפול ל-fallback), גם לפני שהוא מופיע
 * ב-navSections.
 */
export function isSectionId(value: string): value is SectionId {
  if (value === "admin-stories") return true;
  return navSections.some((s) => s.id === value);
}
