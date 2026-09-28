"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Download, Mail, RotateCcw } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";

interface Msg {
  id: string;
  createdAt: string;
  topic: string;
  name: string | null;
  email: string | null;
  message: string;
  status: "new" | "handled";
}

const FILTERS = [
  { value: "new", label: "חדשות" },
  { value: "handled", label: "טופלו" },
  { value: "all", label: "הכול" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

/** פניות "צרי קשר" בבאקלוג — חדשות/טופלו, סימון כטופל, והורדה לאקסל */
export default function ContactInbox({ onChanged }: { onChanged?: () => void }) {
  const [filter, setFilter] = useState<Filter>("new");
  const [rows, setRows] = useState<Msg[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setRows(null);
    setError(false);
    try {
      const q = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/contact${q}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setRows(((await res.json()) as { messages: Msg[] }).messages);
    } catch {
      setError(true);
      setRows([]);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: Msg["status"]) => {
    const res = await fetch("/api/admin/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setRows((rs) => (rs ?? []).map((r) => (r.id === id ? { ...r, status } : r)).filter((r) => filter === "all" || r.status === filter));
      onChanged?.();
    }
  };

  return (
    <div data-testid="contact-inbox">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="סינון פניות">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`min-h-[36px] rounded-full px-3.5 text-sm font-semibold transition-colors ${
                filter === f.value ? "bg-teal-600 text-ink shadow-sm" : "bg-mist-100 text-ink/65 hover:bg-mist-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <a
          href="/api/admin/contact?format=csv"
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 hover:bg-teal-50"
          data-testid="contact-csv"
        >
          <Download className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
          הורדה לאקסל
        </a>
      </div>

      <div className="mt-4">
        {rows === null ? (
          <LoadingState />
        ) : error ? (
          <p className="rounded-2xl bg-mist-50 p-4 text-sm text-ink/60">לא הצלחנו לטעון את הפניות. נסי לרענן.</p>
        ) : rows.length === 0 ? (
          <EmptyState message={filter === "new" ? "אין פניות חדשות" : "אין פניות להצגה"} />
        ) : (
          <ul className="space-y-3">
            {rows.map((m) => (
              <li
                key={m.id}
                className={`rounded-2xl border-2 bg-white p-4 shadow-card ${m.status === "new" ? "border-teal-200" : "border-mist-200 opacity-80"}`}
                data-testid="contact-row"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-mist-100 px-2.5 py-0.5 text-xs font-bold text-ink/70">{m.topic}</span>
                  <span className="text-xs text-ink/50">
                    {new Date(m.createdAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{m.message}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-mist-100 pt-2.5 text-xs text-ink/60">
                  <span>
                    {m.name || "ללא שם"}
                    {m.email && (
                      <>
                        {" · "}
                        <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline" dir="ltr">
                          <Mail className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                          {m.email}
                        </a>
                      </>
                    )}
                  </span>
                  {m.status === "new" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(m.id, "handled")}
                      className="inline-flex min-h-[32px] items-center gap-1 rounded-full bg-teal-600 px-3 text-xs font-bold text-ink hover:bg-teal-500"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.75} aria-hidden="true" />
                      סימון כטופל
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStatus(m.id, "new")}
                      className="inline-flex min-h-[32px] items-center gap-1 rounded-full px-3 text-xs font-semibold text-ink/55 hover:bg-mist-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
                      החזרה לחדשות
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
