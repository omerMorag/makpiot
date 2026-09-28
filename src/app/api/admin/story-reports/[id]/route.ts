import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/requireAdmin";
import { db } from "@/db";
import { storyReports } from "@/db/schema";
import { reviewReportSchema } from "@/lib/validation/reportSchemas";

/** סימון דיווח כ-reviewed/dismissed */
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
  const parsed = reviewReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_shape" }, { status: 400 });
  }

  try {
    const [row] = await db
      .update(storyReports)
      .set({ status: parsed.data.status })
      .where(eq(storyReports.id, params.id))
      .returning({ id: storyReports.id });

    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
