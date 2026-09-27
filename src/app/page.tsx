import AppShell from "@/components/shell/AppShell";

/**
 * נקודת הכניסה היחידה לאתר — כל המסע (המסלול שלי / הבדיקות שלי / איפה
 * כדאי לעשות / כמה ביציות להקפיא / מידע ומדריכים) חי כעת בתוך App Shell אחד,
 * עם ניווט לפי #hash ובלי טעינות עמוד. ראו src/components/shell/AppShell.tsx.
 */
export default function HomePage() {
  return <AppShell />;
}
