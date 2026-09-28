import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/requireAdmin";
import { db } from "@/db";
import { stories, storyEditAudit } from "@/db/schema";
import { adminRedactSchema } from "@/lib/validation/storySchemas";

/**
 * עריכת redact ע"י אדמין — לצורך הסרת פרטים מזהים בלבד. כותבת שורת
 * story_edit_audit (diff לפני/אחרי) לפני ביצוע העדכון עצמו.
 */
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = adminRedactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_shape", issues: parsed.error.issues }, { status: 400 });
  }
  const changes = parsed.data;
  const fields = Object.keys(changes) as (keyof typeof changes)[];
  if (fields.length === 0) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }

  try {
    const [existing] = await db.select().from(stories).where(eq(stories.id, params.id)).limit(1);
    if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const fieldChanges: Record<string, { old: unknown; new: unknown }> = {};
    for (const field of fields) {
      fieldChanges[field] = { old: existing[field as keyof typeof existing], new: changes[field] };
    }

    await db.insert(storyEditAudit).values({
      storyId: params.id,
      adminUserId: admin.userId,
      fieldChanges,
    });

    await db.update(stories).set({ ...changes, updatedAt: new Date() }).where(eq(stories.id, params.id));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
