"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";

interface User {
  id: string;
  email: string | null;
  name: string | null;
  firstSeen: string;
  lastSeen: string;
  signIns: number;
}
interface Stats {
  total: number;
  new7: number;
  active30: number;
}

const date = (iso: string) => new Date(iso).toLocaleDateString("he-IL");

/** באקלוג → משתמשות: כמה התחברו עם Google, מי, ומתי */
export default function UsersPanel() {
  const [data, setData] = useState<{ users: User[]; stats: Stats } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="rounded-2xl bg-mist-50 p-4 text-sm text-ink/60">לא הצלחנו לטעון את הרשימה. נסי לרענן.</p>;
  if (!data) return <LoadingState />;

  const tiles = [
    { label: "משתמשות", value: data.stats.total },
    { label: "חדשות השבוע", value: data.stats.new7 },
    { label: "פעילות החודש", value: data.stats.active30 },
  ];

  return (
    <div data-testid="users-panel">
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border-2 border-mist-200 bg-white p-3 shadow-card sm:p-4">
            <p className="font-sans text-2xl font-extrabold text-ink sm:text-3xl" data-testid="users-stat">
              {t.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-snug text-ink/55 sm:text-xs">{t.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink/45">
        נספרות משתמשות שהתחברו עם Google מאז שהרשימה נוספה לאתר. מי שמשתמשת בלי להתחבר לא מופיעה כאן. אותן רואים ב-Umami.
      </p>

      <div className="mt-5 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">הרשימה</h2>
        <a
          href="/api/admin/users?format=csv"
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 hover:bg-teal-50"
        >
          <Download className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
          הורדה לאקסל
        </a>
      </div>

      {data.users.length === 0 ? (
        <div className="mt-3">
          <EmptyState message="עוד אין משתמשות ברשימה" variant="genuine" />
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-mist-100 rounded-2xl border-2 border-mist-200 bg-white" data-testid="users-list">
          {data.users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{u.name || "ללא שם"}</p>
                <p className="truncate text-xs text-ink/55" dir="ltr">
                  {u.email}
                </p>
              </div>
              <p className="text-xs text-ink/55">
                הצטרפה {date(u.firstSeen)} · אחרונה {date(u.lastSeen)} · {u.signIns} התחברויות
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
