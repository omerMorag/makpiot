"use client";

import { useCallback, useEffect, useState } from "react";
import { BookHeart, MessageSquare, Users } from "lucide-react";
import { useIsAdmin } from "@/lib/useIsAdmin";
import AdminModerationPanel from "@/components/stories/AdminModerationPanel";
import ContactInbox from "@/components/admin/ContactInbox";
import UsersPanel from "@/components/admin/UsersPanel";

type Part = "contact" | "stories" | "users";

/**
 * "באקלוג" — אזור אחד למנהלת: פניות מ"צרי קשר", מודרציית סיפורים ומשתמשות, כחלקים
 * באותו עמוד (בלי עוד פריט בתפריט). לא מופיע ב-navSections; נטען דרך dynamic
 * import. useIsAdmin כאן הוא UX בלבד — האכיפה היא requireAdmin() בכל route.
 */
export default function AdminStoriesSection() {
  const isAdmin = useIsAdmin();
  const [part, setPart] = useState<Part>("contact");
  const [newCount, setNewCount] = useState<number | null>(null);

  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/contact?count=1", { cache: "no-store" });
      if (res.ok) setNewCount(((await res.json()) as { newCount: number }).newCount);
    } catch {
      /* לא קריטי */
    }
  }, []);

  useEffect(() => {
    if (isAdmin) refreshCount();
  }, [isAdmin, refreshCount]);

  if (!isAdmin) {
    return (
      <div className="animate-fadeUp rounded-2xl border-2 border-mist-200 bg-mist-50/60 p-6 text-center">
        <p className="text-sm text-ink/60">האזור הזה מיועד למנהלות המערכת בלבד.</p>
      </div>
    );
  }

  const tabs: { value: Part; label: string; Icon: typeof MessageSquare; badge?: number | null }[] = [
    { value: "contact", label: "פניות", Icon: MessageSquare, badge: newCount },
    { value: "stories", label: "סיפורים", Icon: BookHeart },
    { value: "users", label: "משתמשות", Icon: Users },
  ];

  return (
    <div className="animate-fadeUp">
      <h1 className="font-sans text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">באקלוג</h1>
      <p className="mt-1.5 text-sm text-ink/60">כל מה שמחכה לך במקום אחד.</p>

      <div className="mt-5 flex gap-1 rounded-2xl bg-mist-100 p-1" role="tablist" aria-label="חלקי הבאקלוג">
        {tabs.map(({ value, label, Icon, badge }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={part === value}
            onClick={() => setPart(value)}
            className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-bold sm:px-3 sm:text-sm transition-colors ${
              part === value ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink"
            }`}
            data-testid={`backlog-tab-${value}`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
            {label}
            {!!badge && (
              <span className="rounded-full bg-teal-600 px-1.5 py-0.5 text-[11px] font-extrabold leading-none text-ink">{badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6" role="tabpanel">
        {part === "contact" ? (
          <ContactInbox onChanged={refreshCount} />
        ) : part === "stories" ? (
          <AdminModerationPanel />
        ) : (
          <UsersPanel />
        )}
      </div>
    </div>
  );
}
