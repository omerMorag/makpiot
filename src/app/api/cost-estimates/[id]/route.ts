import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db";
import { savedCostEstimates } from "@/db/schema";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const deleted = await db
      .delete(savedCostEstimates)
      .where(and(eq(savedCostEstimates.id, params.id), eq(savedCostEstimates.userId, userId)))
      .returning({ id: savedCostEstimates.id });

    // 404 גם אם השורה קיימת אבל שייכת למישהי אחרת — לא מבדילים כדי לא
    // לחשוף קיום/בעלות של משאב.
    if (deleted.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
