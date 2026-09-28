"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, ShieldAlert, Trash2, X } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { REPORT_REASON_LABELS } from "@/lib/validation/reportSchemas";

type StoryStatus = "pending" | "published" | "rejected" | "unpublished" | "removed";

interface AdminStoryRow {
  id: string;
  title: string;
  storyText: string;
  personalTip: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  clinic: string | null;
  status: StoryStatus;
  createdAt: string;
}

interface AdminReportRow {
  id: string;
  storyId: string;
  storyTitle: string;
  storyStatus: string;
  reason: keyof typeof REPORT_REASON_LABELS;
  details: string | null;
  status: "open" | "reviewed" | "dismissed";
  createdAt: string;
}

const STATUS_TABS: { value: StoryStatus; label: string }[] = [
  { value: "pending", label: "ממתינות לאישור" },
  { value: "published", label: "פורסמו" },
  { value: "rejected", label: "נדחו" },
  { value: "unpublished", label: "הוסרו ע\"י המשתמשת" },
  { value: "removed", label: "הוסרו ע\"י מנהלת" },
];

const STORY_STATUS_LABELS: Record<StoryStatus, string> = {
  pending: "ממתין לאישור",
  published: "פורסם",
  rejected: "נדחה",
  unpublished: "הוסר ע\"י המשתמשת",
  removed: "הוסר ע\"י מנהלת",
};

function pillClass(active: boolean) {
  return `rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
    active ? "bg-teal-600 text-ink shadow-sm" : "bg-mist-100 text-ink/60 hover:bg-mist-200"
  }`;
}

function RedactForm({ story, onDone }: { story: AdminStoryRow; onDone: () => void }) {
  const [title, setTitle] = useState(story.title);
  const [displayName, setDisplayName] = useState(story.displayName ?? "");
  const [isAnonymous, setIsAnonymous] = useState(story.isAnonymous);
  const [clinic, setClinic] = useState(story.clinic ?? "");
  const [storyText, setStoryText] = useState(story.storyText);
  const [personalTip, setPersonalTip] = useState(story.personalTip ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/stories/${story.id}/redact`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          displayName: displayName || null,
          isAnonymous,
          clinic: clinic || null,
          storyText,
          personalTip: personalTip || null,
        }),
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-2.5 rounded-xl border-2 border-warm-300 bg-warm-100/30 p-3">
      <p className="text-xs font-bold text-ink/60">עריכת פרטים מזהים, לצורך הסרת פרטים מזהים בלבד</p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5 text-sm" placeholder="כותרת" />
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4 accent-teal-600" />
        <span className="text-xs text-ink/60">בעילום שם</span>
      </div>
      {!isAnonymous && (
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5 text-sm" placeholder="שם תצוגה" />
      )}
      <input value={clinic} onChange={(e) => setClinic(e.target.value)} className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5 text-sm" placeholder="מרפאה" />
      <textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} rows={4} className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5 text-sm" />
      <textarea value={personalTip} onChange={(e) => setPersonalTip(e.target.value)} rows={2} className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5 text-sm" placeholder="טיפ אישי" />
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-60">
          {saving ? "שומרת..." : "שמירה"}
        </button>
        <button type="button" onClick={onDone} className="rounded-full px-3 py-1.5 text-xs font-medium text-ink/50">
          ביטול
        </button>
      </div>
    </div>
  );
}

function StoriesTab() {
  const [status, setStatus] = useState<StoryStatus>("pending");
  const [rows, setRows] = useState<AdminStoryRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [redactingId, setRedactingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    try {
      const res = await fetch(`/api/admin/stories?status=${status}`, { cache: "no-store" });
      const data = await res.json();
      setRows(Array.isArray(data.stories) ? data.stories : []);
    } catch {
      setRows([]);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: "approve" | "reject" | "remove") => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/stories/${id}/${action}`, { method: "POST" });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} type="button" onClick={() => setStatus(tab.value)} className={pillClass(status === tab.value)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {rows === null && <LoadingState label="טוענת סיפורים..." />}
        {rows !== null && rows.length === 0 && <EmptyState message="אין סיפורים בקטגוריה הזו." />}
        {rows !== null && rows.length > 0 && (
          <div className="flex flex-col gap-3">
            {rows.map((story) => (
              <div key={story.id} className="rounded-2xl border-2 border-mist-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-ink">{story.title}</h3>
                    <p className="mt-0.5 text-xs text-ink/50">
                      {story.isAnonymous ? "בעילום שם" : story.displayName || "-"} ·{" "}
                      {new Date(story.createdAt).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                </div>
                <p className="mt-2 max-h-24 overflow-hidden text-sm leading-relaxed text-ink/70">{story.storyText}</p>

                {redactingId === story.id ? (
                  <RedactForm story={story} onDone={() => { setRedactingId(null); load(); }} />
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => act(story.id, "approve")}
                          disabled={busyId === story.id}
                          className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          אישור
                        </button>
                        <button
                          type="button"
                          onClick={() => act(story.id, "reject")}
                          disabled={busyId === story.id}
                          className="inline-flex items-center gap-1 rounded-full border-2 border-mist-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink/70 disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                          דחייה
                        </button>
                      </>
                    )}
                    {status === "published" && (
                      <button
                        type="button"
                        onClick={() => act(story.id, "remove")}
                        disabled={busyId === story.id}
                        className="inline-flex items-center gap-1 rounded-full border-2 border-mist-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink/70 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                        הסרה
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setRedactingId(story.id)}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink/50 hover:text-teal-700"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
                      עריכת פרטים מזהים
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsTab() {
  const [status, setStatus] = useState<"open" | "reviewed" | "dismissed">("open");
  const [rows, setRows] = useState<AdminReportRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    try {
      const res = await fetch(`/api/admin/story-reports?status=${status}`, { cache: "no-store" });
      const data = await res.json();
      setRows(Array.isArray(data.reports) ? data.reports : []);
    } catch {
      setRows([]);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id: string, next: "reviewed" | "dismissed") => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/story-reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["open", "reviewed", "dismissed"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setStatus(s)} className={pillClass(status === s)}>
            {s === "open" ? "פתוחים" : s === "reviewed" ? "טופלו" : "נדחו"}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {rows === null && <LoadingState label="טוענת דיווחים..." />}
        {rows !== null && rows.length === 0 && <EmptyState message="אין דיווחים בקטגוריה הזו." />}
        {rows !== null && rows.length > 0 && (
          <div className="flex flex-col gap-3">
            {rows.map((report) => (
              <div key={report.id} className="rounded-2xl border-2 border-mist-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-ink">{report.storyTitle}</p>
                  <span className="rounded-full bg-mist-100 px-2 py-0.5 text-[11px] font-semibold text-ink/50">
                    {REPORT_REASON_LABELS[report.reason]}
                  </span>
                </div>
                {report.details && <p className="mt-1.5 text-xs text-ink/60">{report.details}</p>}
                <p className="mt-1 text-[11px] text-ink/40">
                  {new Date(report.createdAt).toLocaleDateString("he-IL")} · סטטוס סיפור:{" "}
                  {STORY_STATUS_LABELS[report.storyStatus as StoryStatus] ?? report.storyStatus}
                </p>
                {status === "open" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => review(report.id, "reviewed")}
                      disabled={busyId === report.id}
                      className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-50"
                    >
                      סימון כטופל
                    </button>
                    <button
                      type="button"
                      onClick={() => review(report.id, "dismissed")}
                      disabled={busyId === report.id}
                      className="rounded-full border-2 border-mist-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink/70 disabled:opacity-50"
                    >
                      דחיית דיווח
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** פאנל המודרציה המלא — תור סיפורים + תור דיווחים. כל בקשה כאן פונה ל-/api/admin/** שאוכף requireAdmin() בעצמו. */
export default function AdminModerationPanel() {
  const [tab, setTab] = useState<"stories" | "reports">("stories");

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border-2 border-warm-300 bg-warm-100/40 p-3">
        <ShieldAlert className="h-4 w-4 text-deep" strokeWidth={2.25} />
        <p className="text-xs font-semibold text-ink/70">אזור מנהלת, כל הפעולות כאן משפיעות על תוכן ציבורי.</p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => setTab("stories")} className={pillClass(tab === "stories")}>
          תור סיפורים
        </button>
        <button type="button" onClick={() => setTab("reports")} className={pillClass(tab === "reports")}>
          דיווחים
        </button>
      </div>

      <div className="mt-4">{tab === "stories" ? <StoriesTab /> : <ReportsTab />}</div>
    </div>
  );
}
