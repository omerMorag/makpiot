"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BUTTER_YELLOW,
  CONFETTI,
  CORAL,
  SNOWFLAKES,
  SPARKLES,
} from "./celebrationParticles";
import { useCelebrationTrigger } from "./useCelebrationTrigger";

/** התרנגולת ה"חורפית" הקיימת (מעיל סקי) — אותו קובץ המשמש בלוגו/מסך הפתיחה */
const WINTER_HEN_SRC = "/brand/hen-full.png";
/** התרנגולת ה"קיצית" החדשה (בגד ים, משקפי שמש, גביע) — עוד לא הועלתה בפועל;
 *  יש לה גיבוי (onError למטה) לקובץ החורפי הקיים כדי שהאתר לעולם לא ישבר. */
const SUMMER_HEN_SRC = "/images/hens/hen-completion-summer.png";

/*
 * הערה חשובה לגבי הטקסטים למטה: בעקבות סיכום/דחיסה של השיחה, הנוסח המדויק
 * והמלא שהתבקש עבור חלק מהטקסטים (הכותרת, פסקת הגוף, טקסט רמז הגלילה
 * הנראה, הודעת ה-aria-live) לא נשמר מילה במילה. שלושה מחרוזות בלבד ידועות
 * כמדויקות מהתבקש ומסומנות ככה למטה: הכותרת-משנה, ה-aria-label של רמז
 * הגלילה, וטקסט ה-alt של תמונת התרנגולת הקיצית. שאר הטקסטים נוסחו כאן
 * בהתאמה לטון הקיים באתר (ראו למשל הניסוח הדומה ב-RoadmapSection.tsx) —
 * כולם מרוכזים כקבועים כאן כדי שיהיה קל לשנות ניסוח בלי לגעת בשאר הרכיב.
 */
const TITLE = "סיימת את המסלול! 🎉";
/** טקסט מדויק כפי שהתבקש */
const SUBTITLE = "הסבב מאחורייך, ואת בחזרה לשמש.";
const BODY = "כל שלב שסימנת כאן הוא שלב אמיתי שעברת. קחי רגע להרגיש את זה.";
const BACK_TO_TOP_LABEL = "חזרה לראש המסלול ↑";
/** טקסט מדויק כפי שהתבקש */
const SUMMER_HEN_ALT = "תרנגולת חוגגת את סיום מסלול הקפאת הביציות עם בגד ים וגביע";

const HEN_BOX_SIZES = "(min-width: 1024px) 320px, (min-width: 640px) 260px, 220px";

/**
 * מסך סיום חגיגי — מוצג רק אחרי השלמת כל 7 שלבי המסלול (ראו isJourneyComplete
 * ב-RoadmapSection.tsx). כל רצף האנימציה נשלט ע"י שני booleans בלבד
 * (started/reducedMotion, מ-useCelebrationTrigger) — בלי שום setTimeout: כל
 * אלמנט מקודד את העיכוב שלו בעצמו (transitionDelay inline, או בתוך מחרוזת
 * ה-animation), כך שברגע ש-started הופך true כל הרצף (כ-2.3 שניות) מתנגן
 * לבד דרך CSS. ב-prefers-reduced-motion מוצג מיד מצב הסיום הסופי הסטטי,
 * בלי אף אלמנט דקורטיבי (ענן/שלג/נצנצים/קונפטי) ובלי מעברים.
 */
export default function CompletionCelebration() {
  const { containerRef, started, reducedMotion } = useCelebrationTrigger();
  const [summerSrc, setSummerSrc] = useState(SUMMER_HEN_SRC);

  // active: מצב הסיום "פעיל" ויזואלית (או כי האנימציה הסתיימה, או כי
  // reducedMotion מציג את מצב הסוף מיד). play: מותר להריץ בפועל את
  // האלמנטים הדקורטיביים החד-פעמיים (רק כשיש תנועה בכלל).
  const active = started || reducedMotion;
  const play = started && !reducedMotion;

  return (
    <section
      id="completion-celebration"
      ref={containerRef}
      aria-label="מסך סיום מסלול הקפאת הביציות"
      className="no-print relative mt-6 flex min-h-screen-safe flex-col items-center justify-center gap-10 overflow-hidden rounded-[2.5rem] px-4 py-16 sm:mt-8 sm:px-8"
    >
      {/* רקע: שכבה קרירה (קרם->מנטה) קבועה, ומעליה שכבה חמה (אפרסק->חמאה)
          שדוהה פנימה כשהשמש "זורחת", crossfade אמין בין שתי שכבות מוכנות
          מראש, ולא אנימציה של gradient עצמו (שלא תמיד עובדת חלק בין דפדפנים) */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-mist-50 to-warm-100" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b"
        style={{
          backgroundImage: `linear-gradient(to bottom, #FFF6E3, ${BUTTER_YELLOW}55)`,
          opacity: active ? 1 : 0,
          transitionProperty: "opacity",
          transitionDuration: reducedMotion ? "0ms" : "1800ms",
          transitionDelay: reducedMotion || !started ? "0ms" : "1400ms",
          transitionTimingFunction: "ease-out",
        }}
      />

      <div className="relative flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-14">
        {/* עמודת הטקסט — ראשונה ב-JSX = מוצגת בצד ימין תחת RTL; במובייל
            מוצגת מתחת לאיור (order-2), בדסקטופ חוזרת לסדר הרגיל */}
        <div className="order-2 flex max-w-md flex-col items-center gap-3 text-center lg:order-none lg:items-end lg:text-right">
          <h2
            className="font-sans text-2xl font-extrabold tracking-tight text-ink sm:text-3xl"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(16px)",
              transitionProperty: "opacity, transform",
              transitionDuration: reducedMotion ? "0ms" : "600ms",
              transitionDelay: reducedMotion || !started ? "0ms" : "2300ms",
              transitionTimingFunction: "ease-out",
            }}
          >
            {TITLE}
          </h2>
          <p
            className="text-base font-bold text-teal-700 sm:text-lg"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(16px)",
              transitionProperty: "opacity, transform",
              transitionDuration: reducedMotion ? "0ms" : "600ms",
              transitionDelay: reducedMotion || !started ? "0ms" : "2420ms",
              transitionTimingFunction: "ease-out",
            }}
          >
            {SUBTITLE}
          </p>
          <p
            className="text-sm leading-relaxed text-ink/65 sm:text-base"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(16px)",
              transitionProperty: "opacity, transform",
              transitionDuration: reducedMotion ? "0ms" : "600ms",
              transitionDelay: reducedMotion || !started ? "0ms" : "2540ms",
              transitionTimingFunction: "ease-out",
            }}
          >
            {BODY}
          </p>

          {/* הכפתור תמיד גלוי/בר-מיקוד מהרגע הראשון (לא ממתין לאנימציה) —
              כדי להבטיח נגישות מקלדת/פוקוס אמינה ולמנוע מצב "נראה שקוף
              אבל עדיין ניתן ל-tab אליו" */}
          <button
            type="button"
            onClick={() => {
              document.getElementById("roadmap-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-teal-700 shadow-card ring-1 ring-inset ring-mist-200 transition-colors hover:bg-teal-50"
          >
            {BACK_TO_TOP_LABEL}
          </button>
        </div>

        {/* עמודת האיור — שנייה ב-JSX = מוצגת בצד שמאל תחת RTL; במובייל
            מוצגת ראשונה מעל הטקסט (order-1) */}
        <div className="order-1 flex shrink-0 justify-center lg:order-none">
          <div className="relative aspect-[519/700] w-[220px] sm:w-[260px] lg:w-[320px]">
            {/* השמש — מוצבת מאחורי תיבת התרנגולת, "זורחת" ע"י opacity+translateY */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[140%] rounded-full blur-md"
              style={{
                background: `radial-gradient(circle, ${BUTTER_YELLOW} 0%, ${CORAL}55 55%, transparent 75%)`,
                opacity: active ? 0.9 : 0,
                transform: active ? "translate(-50%, -50%)" : "translate(-50%, -30%)",
                transitionProperty: "opacity, transform",
                transitionDuration: reducedMotion ? "0ms" : "1400ms",
                transitionDelay: reducedMotion || !started ? "0ms" : "1300ms",
                transitionTimingFunction: "ease-out",
              }}
            />

            {/* תרנגולת חורפית (hen-full.png) — מגיעה (henArrive/henWobble) ואז
                דוהה החוצה ברגע ההחלפה. wrapper אחד עם absolute inset-0 כדי
                ש-next/image עם fill יקבל קונטיינר עם מידות מוגדרות, וגם
                יישא את אנימציית ה-transform/opacity הכוללת של ה"הגעה". */}
            <div
              className="absolute inset-0"
              style={
                reducedMotion
                  ? { opacity: 0 }
                  : play
                    ? { animation: "henArrive 580ms ease-out both, henWobble 400ms ease-in-out 1700ms both" }
                    : { opacity: 0, transform: "translateY(28px)" }
              }
            >
              <Image
                src={WINTER_HEN_SRC}
                alt=""
                fill
                sizes={HEN_BOX_SIZES}
                className="object-contain"
                style={{
                  opacity: started ? 0 : 1,
                  transitionProperty: "opacity",
                  transitionDuration: reducedMotion ? "0ms" : "500ms",
                  transitionDelay: reducedMotion || !started ? "0ms" : "700ms",
                }}
              />
            </div>

            {/* תרנגולת קיצית (החדשה) — דוהה פנימה + מתמקדת (scale) ברגע ההחלפה.
                תמונת ה-fallback זהה חזותית לחורפית עד להעלאת הקובץ האמיתי —
                ברגע שהקובץ יעלה, שום שינוי קוד לא יידרש. */}
            <div
              className="absolute inset-0"
              style={{
                opacity: reducedMotion ? 1 : started ? 1 : 0,
                transform: reducedMotion ? "scale(1)" : started ? "scale(1)" : "scale(0.92)",
                transitionProperty: "opacity, transform",
                transitionDuration: reducedMotion ? "0ms" : "600ms",
                transitionDelay: reducedMotion || !started ? "0ms" : "750ms",
                transitionTimingFunction: "ease-out",
              }}
            >
              <Image
                src={summerSrc}
                alt={SUMMER_HEN_ALT}
                fill
                sizes={HEN_BOX_SIZES}
                className="object-contain"
                style={{ filter: "saturate(1.15) brightness(1.05)" }}
                onError={() => setSummerSrc(WINTER_HEN_SRC)}
              />
            </div>

            {/* הבזק חם ("revealGlow") בדיוק ברגע ההחלפה — עוזר לרגע להרגיש
                כמו "קרה משהו" גם כשתמונת הקיץ עוד לא הועלתה (fallback זהה
                לחורפית). ⚠️ transform באנימציה עצמה מכיל translate(-50%,-50%)
                יחד עם ה-scale (לא רק scale), ראו הערה ב-globals.css למה זה
                קריטי: אנימציית CSS דורסת את כל ה-transform, כולל מיקום
                שהוגדר ע"י מחלקת Tailwind, ולא רק את החלק שה-keyframe "מתכוון"
                לשנות. */}
            {play && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[70%] rounded-full"
                style={{
                  background: `radial-gradient(circle, ${BUTTER_YELLOW}cc 0%, transparent 70%)`,
                  animation: "revealGlow 750ms ease-out 550ms both",
                }}
              />
            )}

            {/* הענן — מבליח פעם אחת בדיוק סביב רגע ההחלפה, "מכסה" אותה.
                כנ"ל: ה-translate נמצא בתוך ה-keyframe עצמו (cloudPulse
                ב-globals.css), לא כמחלקת Tailwind נפרדת, זה בדיוק התיקון
                לבאג שבו הענן "קפץ" הצידה במקום להישאר ממורכז על התרנגולת
                לאורך כל האנימציה. */}
            {play && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[38%] aspect-[3/2] w-[92%] rounded-full bg-white"
                style={{ animation: "cloudPulse 900ms ease-out 500ms both" }}
              />
            )}

            {/* פתיתי שלג — שלב חורפי, לפני ההחלפה */}
            {play &&
              SNOWFLAKES.map((flake) => (
                <span
                  key={flake.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute rounded-full bg-white"
                  style={{
                    left: `${flake.leftPercent}%`,
                    top: `${flake.topPercent}%`,
                    width: flake.sizePx,
                    height: flake.sizePx,
                    animation: `flakeDrift ${flake.durationMs}ms ease-in-out ${flake.delayMs}ms both`,
                  }}
                />
              ))}

            {/* נצנצים — רגע החשיפה הקיצית */}
            {play &&
              SPARKLES.map((sparkle) => (
                <span
                  key={sparkle.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute rounded-full bg-white"
                  style={{
                    left: `${sparkle.leftPercent}%`,
                    top: `${sparkle.topPercent}%`,
                    width: sparkle.sizePx,
                    height: sparkle.sizePx,
                    boxShadow: `0 0 6px 1px ${BUTTER_YELLOW}`,
                    animation: `sparklePulse 700ms ease-out ${sparkle.delayMs}ms both`,
                  }}
                />
              ))}

            {/* קונפטי — נופל אחרי זריחת השמש. כל חלקיק שני מסתובב בכיוון הפוך
                (confettiFall/confettiFallReverse לסירוגין, לפי אינדקס) כדי
                שהנפילה לא תיראה כמו עותק מוכפל של אותה תנועה, ⚠️ ה-rotateDeg
                שבקונפיגורציה (celebrationParticles.ts) לא משמש כאן כ-transform
                נפרד, כי היה נדרס לגמרי ע"י ה-transform של ה-keyframe עצמו
                (אותו באג שתואר ב-cloudPulse למעלה). */}
            {play &&
              CONFETTI.map((piece, index) => (
                <span
                  key={piece.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute rounded-sm"
                  style={{
                    left: `${piece.leftPercent}%`,
                    top: "-4%",
                    width: piece.sizePx,
                    height: piece.sizePx * 2.4,
                    backgroundColor: piece.color,
                    animation: `${index % 2 === 0 ? "confettiFall" : "confettiFallReverse"} ${piece.durationMs}ms ease-in ${piece.delayMs}ms both`,
                  }}
                />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
