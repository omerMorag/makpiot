import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/requireAdmin";
import { db } from "@/db";
import { stories } from "@/db/schema";

/** פרטי סיפור מלאים בכל סטטוס — לצורך מודרציה */
export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const [row] = await db.select().from(stories).where(eq(stories.id, params.id)).limit(1);
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
