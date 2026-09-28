"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Heart, MessageCircleHeart, User } from "lucide-react";
import DisclaimerNote from "@/components/shared/DisclaimerNote";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import StoriesSearchBar, { type StoriesFilters } from "@/components/stories/StoriesSearchBar";
import StoryCard from "@/components/stories/StoryCard";
import StoryDetailView from "@/components/stories/StoryDetailView";
import Pagination from "@/components/stories/Pagination";
import ShareStoryForm from "@/components/stories/ShareStoryForm";
import MyStoriesPanel from "@/components/stories/MyStoriesPanel";
import type { PublicStoryDetail, PublicStoryListItem } from "@/components/stories/storyTypes";

const PAGE_SIZE = 10;

function buildQuery(filters: StoriesFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.ageRange) params.set("ageRange", filters.ageRange);
  if (filters.cyclesCount !== undefined) params.set("cyclesCount", String(filters.cyclesCount));
  if (filters.treatmentRoute) params.set("treatmentRoute", filters.treatmentRoute);
  if (filters.hmo) params.set("hmo", filters.hmo);
  if (filters.region) params.set("region", filters.region);
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));
  return params.toString();
}

/**
 * "סיפורים מהמקפיא" — קריאה ציבורית (בלי התחברות), שיתוף דורש Google.
 * כל הסינון/חיפוש/pagination קורים בצד שרת (GET /api/stories) — הרכיב
 * לעולם לא טוען את כל הסיפורים בבת אחת.
 */
export default function StoriesSection() {
  const { status } = useSession();
  const [filters, setFilters] = useState<StoriesFilters>({ q: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [storiesList, setStoriesList] = useState<PublicStoryListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PublicStoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showMine, setShowMine] = useState(false);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stories?${buildQuery(filters, page)}`, { cache: "no-store" });
      if (!res.ok) {
        setStoriesList([]);
        setTotalPages(1);
        setTotalCount(0);
        return;
      }
      const data = await res.json();
      setStoriesList(Array.isArray(data.stories) ? data.stories : []);
      setTotalPages(data.totalPages ?? 1);
      setTotalCount(typeof data.total === "number" ? data.total : null);
    } catch {
      setStoriesList([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const handleFiltersChange = (next: StoriesFilters) => {
    setFilters(next);
    setPage(1);
  };

  const openStory = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    setSelectedDetail(null);
    try {
      const res = await fetch(`/api/stories/${id}`, { cache: "no-store" });
      if (res.ok) {
        setSelectedDetail(await res.json());
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSelectedDetail(null);
  };

  const handleShareClick = () => {
    if (status === "authenticated") {
      setShowForm((v) => !v);
    } else {
      signIn("google");
    }
  };

  const isFiltered = Boolean(filters.q || filters.ageRange || filters.cyclesCount !== undefined || filters.treatmentRoute || filters.hmo || filters.region);

  return (
    <div className="animate-fadeUp">
      <section>
        <h1 className="font-sans text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
          סיפורים מהמקפיא
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">
          אין דרך אחת לעבור את התהליך. כאן אפשר לקרוא חוויות אמיתיות, לקבל פרספקטיבה ולהרגיש קצת פחות לבד.
        </p>

        {/* באנר קהילתי — ארבע תרנגולות מתכרבלות יחד, שונה במהותו מאיורי התרנגולת
            הבודדת שבשאר העמודים (סצנה רחבה עם רקע מלא, לא מסקוט בודד על רקע
            שקוף), ולכן מוצג כבאנר רוחב-מלא עם פינות מעוגלות במקום כאיור צדדי
            קטן ליד הכותרת, מתאים יותר לתוכן (חום/קהילתיות) ולצורת התמונה (יחס
            רוחב-גובה 1400:933, כמעט בדיוק 3:2).
            תוקן: גבהים קבועים (h-48/h-64/h-72) יצרו יחס-תצוגה הרבה יותר רחב
            מיחס-הממדים האמיתי של התמונה, ב-object-cover זה גרם לחיתוך אנכי
            משמעותי (מלמעלה ומלמטה, כובעים/רגליים) כדי למלא את המסגרת הרחבה.
            במקום זה, aspect-ratio שמזהה בדיוק את יחס התמונה, כך שהיא תמיד
            מוצגת במלואה בלי חיתוך, בכל רוחב מסך. הוקטן: רוחב-מלא של עמודת
            התוכן (עד כ-900px בדסקטופ) היה דומיננטי/גדול מדי כבאנר; עכשיו
            מוגבל ברוחב מקסימלי וממורכז, כמו שאר האיורים באתר שלא תופסים
            את כל רוחב העמוד. */}
        <div className="mx-auto mt-5 aspect-[1400/933] w-full max-w-sm overflow-hidden rounded-2xl shadow-card sm:max-w-md lg:max-w-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hens/hen-stories-group.png"
            alt="ארבע תרנגולות מתכרבלות יחד בבגדי חורף חמים, אחת מהן משתפת בסיפור עם בועת דיבור שמסמלת אהבה וחום בתוך הקור"
            className="h-full w-full object-cover"
          />
        </div>

        <button
          type="button"
          onClick={handleShareClick}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-ink shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-cardHover"
        >
          <MessageCircleHeart className="h-4 w-4" strokeWidth={2.25} />
          רוצה לשתף את הסיפור שלך?
        </button>
      </section>

      {showForm && status === "authenticated" && (
        <section className="mt-5 rounded-2xl border-2 border-teal-200 bg-teal-50/30 p-5 shadow-card sm:p-7">
          <h2 className="mb-4 text-lg font-bold text-ink">שיתוף הסיפור שלך</h2>
          <ShareStoryForm
            mode="create"
            onSuccess={() => {
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </section>
      )}

      {status === "authenticated" && (
        <section className="mt-5">
          <button
            type="button"
            onClick={() => setShowMine((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-mist-300 bg-white px-4 py-2 text-sm font-semibold text-ink/70 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-700"
          >
            <User className="h-4 w-4" strokeWidth={2.25} />
            הסיפורים שלי
          </button>
          {showMine && (
            <div className="mt-3">
              <MyStoriesPanel />
            </div>
          )}
        </section>
      )}

      <section className="mt-6">
        <DisclaimerNote icon={Heart}>
          הסיפורים כאן הם חוויות אישיות של נשים אחרות בתהליך, לא ייעוץ רפואי ולא תחליף לשיחה עם רופא/ה.
        </DisclaimerNote>
      </section>

      <section className="mt-6">
        <StoriesSearchBar onChange={handleFiltersChange} />
      </section>

      <section className="mt-5">
        {loading && <LoadingState label="טוענת סיפורים..." />}

        {!loading && storiesList.length === 0 && isFiltered && (
          <EmptyState variant="filtered" message="אין סיפורים שמתאימים לסינון הזה. נסי להרחיב את החיפוש." />
        )}

        {!loading && storiesList.length === 0 && !isFiltered && (
          <EmptyState
            variant="genuine"
            message="עדיין אין כאן סיפורים שפורסמו. את יכולה להיות הראשונה לשתף."
          />
        )}

        {!loading && storiesList.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {storiesList.map((story) => (
                <StoryCard key={story.id} story={story} onOpen={() => openStory(story.id)} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            {totalCount !== null && (
              <p className="mt-2 text-center text-xs text-ink/40">{totalCount} סיפורים בסך הכול</p>
            )}
          </>
        )}
      </section>

      <StoryDetailView story={selectedId ? selectedDetail : null} loading={detailLoading} onClose={closeDetail} />
    </div>
  );
}
