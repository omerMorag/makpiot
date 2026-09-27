import type { LucideIcon } from "lucide-react";
import { Egg, MapPin } from "lucide-react";

export interface ReadingPage {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

// רשימת דפי מידע נוספים, נגישים מתפריט "עיון" בכל עמוד.
// כדי להוסיף עמוד חדש בעתיד — רק להוסיף פריט לרשימה הזו.
export const readingPages: ReadingPage[] = [
  {
    href: "/where-to-go",
    label: "איפה כדאי לעשות את זה?",
    description: "מחירים, קופות חולים ומקורות מימון להקפאת ביציות",
    icon: MapPin,
  },
  {
    href: "/my-chances",
    label: "כמה ביציות להקפיא?",
    description: "איך גיל ומספר ביציות קשורים לנתונים המחקריים, ומה המגבלות",
    icon: Egg,
  },
];
