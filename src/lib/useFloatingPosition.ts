"use client";

import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

const VIEWPORT_MARGIN = 12;

/**
 * ממקם פאנל צף (תפריט/טולטיפ) בקואורדינטות מסך קבועות (position: fixed),
 * כדי שלעולם לא "יגלוש" מעבר לרוחב המסך — גם כשהכפתור המפעיל יושב קרוב לקצה
 * (כמו במובייל). ראו תיעוד הבאג בפרויקט (ReadingMenu, 2026-09-09): החישוב
 * חייב להתבסס על אלמנט שכבר מוגדר "fixed" בקלאס עצמו (לא רק דרך ה-style
 * המחושב), אחרת ברינדור הראשון (לפני שה-effect רץ) האלמנט עדיין בזרימה
 * הרגילה ומעוות את מדידת ה-container העוטף אותו.
 *
 * הפאנל שמקבל את ה-style המוחזר חייב לכלול תמיד את מחלקת ה-Tailwind "fixed"
 * (position: fixed) בעצמו — ה-hook רק קובע top/left/visibility.
 *
 * חשוב (באג שני, 2026-09-09): הפאנל עצמו — כולל ה-FloatingPortal שעוטף
 * אותו — חייב להיות מורכב (mounted) תמיד, ולא רק כש-open===true. אם הפורטל
 * נוצר/נהרס באופן מותנה ({open && <FloatingPortal>...}), יש פער של סייקל
 * רינדור אחד שבו ה-DOM node של הפאנל עדיין לא קיים כש-useLayoutEffect הזה
 * רץ בפעם הראשונה (כי ref הוא אובייקט יציב שלא משתנה גם כש-.current מתמלא
 * מאוחר יותר — אז ה-effect לא "מתעורר" לנסות שוב). הפתרון: הפאנל נשאר
 * ב-DOM כל הזמן, וה-hook הזה קובע רק visibility/pointerEvents לפי open.
 */
export function useFloatingPosition(
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  open: boolean,
  align: "start" | "end" = "end",
) {
  const [style, setStyle] = useState<CSSProperties>({
    visibility: "hidden",
    pointerEvents: "none",
    top: 0,
    left: 0,
  });

  useLayoutEffect(() => {
    if (!open) {
      setStyle((prev) => ({ ...prev, visibility: "hidden", pointerEvents: "none" }));
      return;
    }

    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const triggerRect = trigger.getBoundingClientRect();
    const panelWidth = panel.offsetWidth;
    const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - panelWidth - VIEWPORT_MARGIN);
    let left = align === "end" ? triggerRect.right - panelWidth : triggerRect.left;
    left = Math.min(Math.max(left, VIEWPORT_MARGIN), maxLeft);

    setStyle({
      top: triggerRect.bottom + 8,
      left,
      visibility: "visible",
      pointerEvents: "auto",
    });
  }, [open, align, triggerRef, panelRef]);

  return style;
}
