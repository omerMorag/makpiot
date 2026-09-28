import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { storyEditSchema } from "@/lib/validation/storySchemas";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/**
 * עריכת תוכן בלבד ע"י הבעלים. status לא קיים בכלל בסכימת storyEditSchema —
 * אין נתיב קוד שמאפשר למשתמשת רגילה לקבוע סטטוס לסיפור שלה. עריכה מחזירה
 * את הסיפור למצב "pending" מחדש (עריכה מהותית דורשת אישור מחדש).
 */
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = storyEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_shape", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const [row] = await db
      .update(stories)
      .set({ ...parsed.data, status: "pending", publishedAt: null, updatedAt: new Date() })
      .where(and(eq(stories.id, params.id), eq(stories.authorUserId, userId)))
      .returning({ id: stories.id });

    // 404 גם אם קיים אבל שייך למשתמשת אחרת — לא לחשוף קיום/בעלות
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

/** מחיקה מלאה ע"י הבעלים — cascade לדיווחים/audit דרך ה-FK-ים */
export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const deleted = await db
      .delete(stories)
      .where(and(eq(stories.id, params.id), eq(stories.authorUserId, userId)))
      .returning({ id: stories.id });

    if (deleted.length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
