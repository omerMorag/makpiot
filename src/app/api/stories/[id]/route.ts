import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";

/**
 * GET ציבורי לסיפור בודד — ללא auth, רק status='published' (404 גם אם
 * הסיפור קיים אבל pending/rejected/וכו', כולל אם זה סיפור pending של
 * המשתמשת המחוברת עצמה — היא רואה את הטיוטה שלה רק דרך /api/stories/mine).
 */
export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const [row] = await db
      .select()
      .from(stories)
      .where(and(eq(stories.id, params.id), eq(stories.status, "published")))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      id: row.id,
      title: row.title,
      displayName: row.isAnonymous ? null : row.displayName,
      isAnonymous: row.isAnonymous,
      storyText: row.storyText,
      personalTip: row.personalTip,
      ageRange: row.ageRange,
      hmo: row.hmo,
      clinic: row.clinic,
      region: row.region,
      treatmentRoute: row.treatmentRoute,
      cyclesCount: row.cyclesCount,
      retrievedCount: row.retrievedCount,
      frozenCount: row.frozenCount,
      publishedAt: row.publishedAt,
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
