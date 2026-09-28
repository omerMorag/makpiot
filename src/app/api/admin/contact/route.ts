import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/requireAdmin";
import { countNewContactMessages, listContactMessages, setContactStatus, type ContactStatus } from "@/lib/contactStore";

export const dynamic = "force-dynamic";

/** תא CSV בטוח: מרכאות, ומניעת פרשנות כנוסחה באקסל */
function csvCell(v: string | null) {
  let s = (v ?? "").replace(/\r?\n/g, " ");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * פניות "צרי קשר" — למנהלת בלבד (requireAdmin).
 * GET ?status=new|handled — רשימה; GET ?format=csv — הורדה לאקסל; GET ?count=1 — מספר פניות חדשות.
 */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const url = new URL(request.url);

  if (url.searchParams.get("count")) {
    return NextResponse.json({ newCount: await countNewContactMessages() });
  }

  const s = url.searchParams.get("status");
  const status: ContactStatus | undefined = s === "new" || s === "handled" ? s : undefined;
  const rows = await listContactMessages(status);

  if (url.searchParams.get("format") === "csv") {
    const header = ["תאריך", "נושא", "שם", "מייל", "הודעה", "סטטוס"].map(csvCell).join(",");
    const lines = rows.map((r) =>
      [
        new Date(r.createdAt).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }),
        r.topic,
        r.name,
        r.email,
        r.message,
        r.status === "handled" ? "טופל" : "חדש",
      ]
        .map(csvCell)
        .join(",")
    );
    // BOM כדי שאקסל יזהה עברית (UTF-8)
    const body = "﻿" + [header, ...lines].join("\r\n");
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="makpiot-contact-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({ messages: rows }, { headers: { "Cache-Control": "no-store" } });
}

const patchSchema = z.object({ id: z.string().uuid(), status: z.enum(["new", "handled"]) });

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const ok = await setContactStatus(parsed.data.id, parsed.data.status);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
