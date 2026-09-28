"use client";

import { Inbox } from "lucide-react";
import { useIsAdmin } from "@/lib/useIsAdmin";
import type { SectionId } from "@/data/navSections";

interface AdminNavLinkProps {
  activeSection: SectionId;
  onNavigate: (id: SectionId) => void;
  focusable?: boolean;
}

/**
 * קישור הניווט ל"באקלוג" (פניות + מודרציית סיפורים) — מחוץ ל-navSections/NavList בכוונה (ר'
 * navSections.ts), מוצג רק כש-useIsAdmin() מחזיר true. זהו UX בלבד; האכיפה
 * האמיתית היא requireAdmin() בכל route תחת /api/admin/**.
 */
export default function AdminNavLink({ activeSection, onNavigate, focusable = true }: AdminNavLinkProps) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;

  const isActive = activeSection === "admin-stories";

  return (
    <a
      href="#admin-stories"
      aria-current={isActive ? "page" : undefined}
      tabIndex={focusable ? undefined : -1}
      onClick={() => onNavigate("admin-stories")}
      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
        isActive
          ? "bg-warm-100 text-deep ring-1 ring-inset ring-warm-300"
          : "text-ink/65 hover:bg-mist-100 hover:text-ink"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
          isActive ? "bg-warm-500 text-ink" : "bg-mist-100 text-deep"
        }`}
        aria-hidden="true"
      >
        <Inbox className="h-4 w-4" strokeWidth={2} />
      </span>
      באקלוג
    </a>
  );
}
