import type { ElementType } from "react";
import LogoMark from "./LogoMark";

export type LogoVariant = "full" | "compact" | "icon";

interface LogoProps {
  variant: LogoVariant;
  /** כשמוגדר, הלוגו הופך לכפתור לחיץ שמחזירה לעמוד הראשי. */
  onClick?: () => void;
  /** גודל הסמל בפיקסלים. ברירת מחדל תלויה בוריאציה (ראו DEFAULT_MARK_SIZE). */
  markSize?: number;
  className?: string;
  /**
   * לשימוש כשהלוגו יושב במגירת ניווט נסתרת (translate-x-full ולא
   * display:none): מאפשר לנטרל מיקוד מקלדת כשהמגירה סגורה, באותו דפוס
   * שכבר קיים ב-MobileDrawer עבור כפתור הסגירה ו-NavList.
   */
  tabIndex?: number;
}

/** גובה הסמל בפיקסלים (התרנגולת גבוהה מרחבה — הרוחב נגזר אוטומטית ב-LogoMark). */
const DEFAULT_MARK_SIZE: Record<LogoVariant, number> = {
  full: 56,
  compact: 40,
  icon: 36,
};

const BRAND_NAME = "מקפיאות";
const TAGLINE = "הדרך שלך להקפאת ביציות";
const HOME_ARIA_LABEL = "מקפיאות: מעבר לעמוד הראשי";

/**
 * רכיב לוגו יחיד לכל האתר, עם שלוש וריאציות שכולן נבנות מאותו LogoMark
 * ומאותה לוגיקה — בלי שכפול:
 *  - "full": סמל + השם "מקפיאות" + שורת תיאור קטנה. לסיידבר בדסקטופ ולראש
 *    עמוד הבית.
 *  - "compact": סמל + השם "מקפיאות" בלבד. לכותרת המובייל ולמגירת הניווט.
 *  - "icon": הסמל בלבד, בלי טקסט. לשימושים צפופים (כרגע לא בשימוש ישיר
 *    ב-UI, אך זמין; ה-favicon עצמו הוא קובץ SVG נפרד עם אותה גיאומטריה).
 *
 * כשמועבר onClick, הלוגו הופך לכפתור עם aria-label ברור ("מקפיאות – מעבר
 * לעמוד הראשי"), כדי שקוראי מסך יבינו את הפעולה גם בלי להסתמך על הסמל
 * הדקורטיבי (שמסומן aria-hidden). כשלא מועבר onClick, הלוגו מוצג כרכיב
 * לא-אינטראקטיבי (למשל בראש עמוד הבית).
 */
export default function Logo({ variant, onClick, markSize, className, tabIndex }: LogoProps) {
  const size = markSize ?? DEFAULT_MARK_SIZE[variant];
  const Wrapper: ElementType = onClick ? "button" : "div";
  const wrapperProps = onClick
    ? {
        type: "button" as const,
        onClick,
        "aria-label": HOME_ARIA_LABEL,
        ...(tabIndex !== undefined ? { tabIndex } : {}),
      }
    : {};

  // רק הגובה נקבע כאן — הרוחב תמיד "auto" בתוך LogoMark עצמו, כדי
  // שהתרנגולת תוצג בשלמותה, בלי מתיחה ובלי חיתוך ליחס-רוחב מרובע.
  const markStyle = { height: size };

  if (variant === "icon") {
    return (
      <Wrapper
        {...wrapperProps}
        className={`inline-flex shrink-0 items-center justify-center transition-opacity ${
          onClick ? "hover:opacity-80" : ""
        } ${className ?? ""}`}
      >
        <LogoMark className="shrink-0" style={markStyle} />
      </Wrapper>
    );
  }

  if (variant === "compact") {
    return (
      <Wrapper
        {...wrapperProps}
        className={`inline-flex min-w-0 items-center gap-2 text-right transition-opacity ${
          onClick ? "hover:opacity-80" : ""
        } ${className ?? ""}`}
      >
        <LogoMark className="shrink-0" style={markStyle} />
        <span className="truncate font-sans text-base font-extrabold leading-none tracking-tight text-ink">
          {BRAND_NAME}
        </span>
      </Wrapper>
    );
  }

  // variant === "full"
  return (
    <Wrapper
      {...wrapperProps}
      className={`flex min-w-0 items-center gap-3 text-right transition-opacity ${
        onClick ? "hover:opacity-80" : ""
      } ${className ?? ""}`}
    >
      <LogoMark className="shrink-0" style={markStyle} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-sans text-xl font-extrabold leading-tight tracking-tight text-ink">
          {BRAND_NAME}
        </span>
        <span className="truncate font-sans text-xs font-medium leading-snug text-ink/55">
          {TAGLINE}
        </span>
      </span>
    </Wrapper>
  );
}
