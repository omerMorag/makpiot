"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Trash2 } from "lucide-react";

interface SavedEstimateRow {
  id: string;
  label: string | null;
  minTotal: number;
  maxTotal: number;
  createdAt: string;
}

function formatILS(amount: number): string {
  return `${amount.toLocaleString("he-IL")} ₪`;
}

/**
 * רשימת הערכות עלות שנשמרו בענן — מוצגת רק למשתמשת מחוברת (GET
 * /api/cost-estimates מחזיר 401 בלי session, ולכן הרכיב לא מנסה לשלוף
 * במצב אורחת בכלל).
 */
export default function SavedEstimatesList() {
  const { status } = useSession();
  const [rows, setRows] = useState<SavedEstimateRow[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/cost-estimates", { cache: "no-store" });
      if (!res.ok) {
        setRows([]);
        return;
      }
      const data = await res.json();
      setRows(Array.isArray(data.items) ? data.items : []);
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      load();
    } else {
      setRows(null);
    }
  }, [status, load]);

  if (status !== "authenticated") return null;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cost-estimates/${id}`, { method: "DELETE" });
      if (res.ok || res.status === 404) {
        setRows((prev) => (prev ? prev.filter((row) => row.id !== id) : prev));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-bold text-ink/50">הערכות ששמרת בעבר</p>

      {rows === null && (
        <p className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-mist-200 p-5 text-sm text-ink/50">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
          טוענת...
        </p>
      )}

      {rows !== null && rows.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-mist-200 p-5 text-center text-sm text-ink/50">
          עדיין לא שמרת הערכות עלות. לחצי על &quot;שמרי את ההערכה&quot; כדי לשמור את ההערכה הנוכחית.
        </p>
      )}

      {rows !== null && rows.length > 0 && (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-mist-200 bg-white p-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {row.label || "הערכת עלות"}
                </p>
                <p className="text-xs text-ink/50">
                  {new Date(row.createdAt).toLocaleDateString("he-IL")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-ink" dir="ltr">
                  {formatILS(row.minTotal)} עד {formatILS(row.maxTotal)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={deletingId === row.id}
                  aria-label="מחיקת הערכה"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-mist-100 hover:text-deep disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
