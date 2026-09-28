import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { listUsers, userStats } from "@/lib/userStore";

export const dynamic = "force-dynamic";

function csvCell(v: string | number | null) {
  let s = String(v ?? "").replace(/\r?\n/g, " ");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const fmt = (iso: string) => new Date(iso).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

/** משתמשות שהתחברו — למנהלת בלבד. ?format=csv להורדה לאקסל. */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const url = new URL(request.url);
  const users = await listUsers();

  if (url.searchParams.get("format") === "csv") {
    const header = ["שם", "מייל", "התחברות ראשונה", "התחברות אחרונה", "מספר התחברויות"].map(csvCell).join(",");
    const lines = users.map((u) => [u.name, u.email, fmt(u.firstSeen), fmt(u.lastSeen), u.signIns].map(csvCell).join(","));
    return new NextResponse("﻿" + [header, ...lines].join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="makpiot-users-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({ users, stats: await userStats() }, { headers: { "Cache-Control": "no-store" } });
}
