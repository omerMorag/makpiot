import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { stories } from "@/db/schema";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/**
 * המשתמשת מבטלת פרסום לסיפור שלה — רק אם published כרגע (לא הופך לזמין
 * לפרסום אוטומטי מחדש; אם תרצה לפרסם שוב תצטרך לבקש מחדש/לערוך — כרגע
 * הפעולה חד-סטרית לפי הספק). status הופך ל-"unpublished", לא חוזר ל-"pending".
 */
export async function POST(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const [row] = await db
      .update(stories)
      .set({ status: "unpublished", updatedAt: new Date() })
      .where(and(eq(stories.id, params.id), eq(stories.authorUserId, userId), eq(stories.status, "published")))
      .returning({ id: stories.id });

    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
