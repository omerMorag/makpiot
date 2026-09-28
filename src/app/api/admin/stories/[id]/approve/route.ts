import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/requireAdmin";
import { db } from "@/db";
import { stories } from "@/db/schema";

export async function POST(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const [row] = await db
      .update(stories)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(stories.id, params.id))
      .returning({ id: stories.id });

    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
