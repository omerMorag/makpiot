import { Info } from "lucide-react";

/**
 * הסבר קצר למסלול הפרטי + סדר גודל לתכנון תקציב. זו הערכה כללית בלבד —
 * לא מחיר של מקום מסוים, לא מחשבון, ולעולם לא מחליפה "מחיר בבירור" בכרטיס.
 */
export default function PrivateRouteExplainer() {
  return (
    <section className="rounded-2xl border-2 border-mist-200 bg-white p-4 shadow-card sm:p-5" data-testid="private-explainer">
      <h2 className="text-base font-bold text-ink">איך זה עובד במסלול פרטי?</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/75">
        במסלול פרטי לרוב מתחילים בבחירת רופא/ת פוריות ובפגישת ייעוץ. יחד בודקים באיזו יחידת IVF אפשר לבצע את
        התהליך. העלות עשויה לכלול תשלום לרופא/ה, תרופות ותשלום נפרד ליחידה על סבב השאיבה והקפאת הביציות. כדאי
        לבקש מראש פירוט כתוב של מה כלול בכל תשלום.
      </p>

      <div className="mt-4 rounded-xl bg-mist-50 p-3.5 ring-1 ring-inset ring-mist-200" data-testid="budget-estimate">
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink">סדר גודל לתכנון תקציב</p>
        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-warm-100 px-2.5 py-0.5 text-[11px] font-bold text-ink/75">
          <Info className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
          הערכה כללית, לא מחיר של מקום מסוים
        </p>
        <ul className="mt-2.5 space-y-1.5 text-[13px] leading-relaxed text-ink/75 sm:text-sm">
          <li>
            <span className="font-semibold text-ink">פגישת רופא/ה פרטית:</span> בערך 1,200-2,000 ₪.
          </li>
          <li>
            <span className="font-semibold text-ink">סבב ביחידה פרטית:</span> בערך 9,000-10,000 ₪ לפי דיווחי מחירים שפורסמו
           (לא מחיר מאומת או עדכני של יחידה מסוימת).
          </li>
          <li>
            <span className="font-semibold text-ink">תרופות:</span> לעיתים סביב 3,000-5,000 ₪, אך העלות יכולה להשתנות מאוד ואף
            להיות גבוהה יותר.
          </li>
          <li>
            <span className="font-semibold text-ink">סך הכול לתכנון:</span> בערך 13,000-20,000 ₪ לסבב פרטי מלא, ולעיתים יותר.
          </li>
        </ul>
        <p className="mt-2.5 text-xs leading-relaxed text-ink/55">
          זו הערכה בלבד; אין להשתמש בה כמחשבון או כמחיר אישי. ״תשלום ליחידה״ יכול לכלול דברים שונים בכל מקום (מעקבים, הרדמה,
          הקפאה, תקופת אחסון), ופגישת הייעוץ לא בהכרח מכסה את הליווי של הרופא/ה לאורך כל הסבב, כדאי לשאול על כל רכיב.
        </p>
      </div>
    </section>
  );
}
