"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown } from "lucide-react";
import { readingPages } from "@/data/readingPages";
import { useFloatingPosition } from "@/lib/useFloatingPosition";
import FloatingPortal from "@/components/shared/FloatingPortal";

interface ReadingMenuProps {
  className?: string;
}

export default function ReadingMenu({ className = "" }: ReadingMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuStyle = useFloatingPosition(containerRef, panelRef, open, "end");

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-ink/70 transition-colors duration-200 hover:bg-teal-50 hover:text-teal-800"
      >
        <BookOpen className="h-4 w-4" strokeWidth={2} />
        עיון
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      {/*
        הפאנל וה-FloatingPortal מורכבים תמיד (לא מותנים ב-open), ראו
        התיעוד ב-useFloatingPosition.ts. הנראות/אינטראקטיביות נשלטות רק
        דרך style (visibility/pointerEvents) ו-aria-hidden.
      */}
      <FloatingPortal>
        <div
          ref={panelRef}
          role="menu"
          aria-hidden={!open}
          style={menuStyle}
          className="fixed z-30 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border-2 border-mist-200 bg-white shadow-cardHover"
        >
          {readingPages.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.href}
                href={page.href}
                role="menuitem"
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-teal-50"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{page.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink/55">
                    {page.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </FloatingPortal>
    </div>
  );
}
