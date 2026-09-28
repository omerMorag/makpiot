"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, X } from "lucide-react";
import FloatingPortal from "@/components/shared/FloatingPortal";
import type { TestSubItemPriceInfo } from "@/data/types";

interface TestPriceInfoModalProps {
  info: TestSubItemPriceInfo | null;
  onClose: () => void;
}

function formatCheckedDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("he-IL");
}

/**
 * חלונית מידע קטנה על מחיר/זכאות לרכיב ספציפי בתוך הצ'קליסט (כרגע רק AMH,
 * ר' tests.ts/TestChecklist.tsx). mount מותנה (info !== null) בלבד — בלי
 * מנגנון open/close עם CSS, באותו דפוס בדיוק כמו CompletionCelebration/
 * ScrollToCompletionHint (ר' התיעוד שם: "נשקל כרצוי, לא כתקלה"). סגירה
 * (X, קליק על הרקע הכהה, או Escape) לא מנווטת/גוללת לשום מקום — היא רק
 * מסירה את החלונית מעל הדף; הדף שמתחת לא זז כלל בזמן שהיא פתוחה (רק
 * overflow:hidden זמני על body, בדיוק כמו ב-MobileDrawer.tsx), כך
 * שהמשתמשת חוזרת בדיוק לאותו מקום בצ'קליסט שבו הייתה.
 *
 * במובייל היא bottom sheet צמוד לתחתית המסך (items-end + rounded-t-3xl);
 * בדסקטופ ממורכזת (sm:items-center + sm:rounded-3xl).
 */
export default function TestPriceInfoModal({ info, onClose }: TestPriceInfoModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!info) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [info, onClose]);

  if (!info) return null;

  return (
    <FloatingPortal>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <div onClick={onClose} aria-hidden="true" className="absolute inset-0 bg-ink/40" />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={info.linkLabel}
          className="animate-fadeUp relative flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-white p-4 shadow-cardHover sm:max-w-lg sm:rounded-3xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-sans text-base font-bold tracking-tight text-ink sm:text-lg">
              {info.linkLabel}
            </h3>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="סגירה"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-mist-100"
            >
              <X className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-ink/65 sm:text-sm">{info.intro}</p>

          <ul className="mt-4 flex flex-col gap-3">
            {info.rows.map((row) => (
              <li key={row.name} className="rounded-2xl bg-mist-50/70 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="text-sm font-semibold text-ink">{row.name}</span>
                  {row.verification === "verified" && row.price ? (
                    <span className="text-sm font-bold text-teal-700">{row.price}</span>
                  ) : (
                    <span className="text-xs font-semibold text-ink/45">מחיר לא אומת</span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink/55 sm:text-xs">
                  <a
                    href={row.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-teal-700/90 underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
                  >
                    {row.sourceLabel}
                    <ExternalLink className="h-3 w-3" strokeWidth={2.25} />
                  </a>
                  <span>· נבדק לאחרונה {formatCheckedDate(row.checkedDate)}</span>
                </div>
                {row.note && (
                  <p className="mt-1 text-[11px] leading-snug text-ink/50 sm:text-xs">{row.note}</p>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[11px] leading-snug text-ink/45 sm:text-xs">
            מחירים ותנאי ביצוע עשויים להשתנות, כדאי לוודא מול המקום לפני קביעת הבדיקה.
          </p>

          {info.fundLinks.length > 0 && (
            <div className="mt-4 border-t border-mist-100 pt-3">
              <p className="mb-1.5 text-[11px] font-bold text-ink/55 sm:text-xs">
                בדיקת זכאות דרך הקופה שלך
              </p>
              <ul className="flex flex-col gap-1">
                {info.fundLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700/90 underline decoration-teal-300 underline-offset-2 hover:text-teal-800 sm:text-sm"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3" strokeWidth={2.25} />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[11px] leading-snug text-ink/45 sm:text-xs">
                תנאי הזכאות שונים בין הקופות, כל קישור מציג את התנאים הספציפיים של הקופה שלו בלבד.
              </p>
            </div>
          )}
        </div>
      </div>
    </FloatingPortal>
  );
}
