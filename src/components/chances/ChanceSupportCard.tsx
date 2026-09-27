import { HeartHandshake } from "lucide-react";

/**
 * כרטיס תמיכה עדין — שונה מ-LowReserveCard (שעוסק ברזרבה שחלתית/AMH ומוצג
 * בתוך המחשבון עצמו): זהו כרטיס ברמת העמוד שמתייחס לכל מי שקיבלה אחוז נמוך
 * מהמחשבון, לא רק למי עם רזרבה נמוכה. טקסט קבוע בדיוק כפי שהתבקש — לא
 * מבוסס על נתון מחושב, ולכן אין לו props.
 */
export default function ChanceSupportCard() {
  return (
    <div className="rounded-2xl border-2 border-warm-300/70 bg-warm-100/60 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-warm-500 shadow-sm ring-1 ring-warm-300/50">
          <HeartHandshake className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <div>
          <h3 className="font-sans text-base font-bold tracking-tight text-ink sm:text-lg">
            האחוז נמוך ממה שקיווית?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70 sm:text-[15px]">
            זו הערכה שמבוססת על נתונים של קבוצות נשים, לא ציון ולא תחזית אישית. אחוז נמוך אינו
            אומר שזה לא יקרה, ואחוז גבוה אינו מבטיח לידה. אפשר לדבר עם רופא/ת הפוריות על המשמעות
            עבורך ועל האפשרויות להמשך.
          </p>
        </div>
      </div>
    </div>
  );
}
