import { NextResponse } from "next/server";
import { z } from "zod";
import { contactLimiter } from "@/lib/rateLimit";
import { CONTACT_TOPICS } from "@/data/contact";

/**
 * טופס "צרי קשר" → מייל לבעלת האתר, דרך Resend (בלי ספרייה נוספת — קריאת
 * REST אחת). נדרשים משתני סביבה: RESEND_API_KEY, CONTACT_TO_EMAIL (לאן
 * לשלוח), ואופציונלי CONTACT_FROM_EMAIL (ברירת מחדל: הכתובת של Resend
 * לבדיקות, שמותר לשלוח ממנה רק למייל של בעלת החשבון). ההודעה לא נשמרת
 * בשום מקום באתר — רק נשלחת במייל.
 */

const schema = z.object({
  name: z.string().trim().max(80).optional().default(""),
  email: z.union([z.literal(""), z.string().trim().email().max(120)]).optional().default(""),
  topic: z.enum(CONTACT_TOPICS),
  message: z.string().trim().min(5).max(3000),
  /** שדה מלכודת לבוטים — אמור להישאר ריק */
  website: z.string().max(200).optional(),
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  try {
    const { success } = await contactLimiter.limit(ip);
    if (!success) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  } catch {
    // אם Redis לא זמין — לא חוסמים את הטופס בגלל זה
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { name, email, topic, message, website } = parsed.data;
  // בוט מילא את שדה המלכודת — עונים "הצליח" בלי לשלוח
  if (website) return NextResponse.json({ ok: true });

  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">
<p><b>נושא:</b> ${escapeHtml(topic)}</p>
<p><b>שם:</b> ${escapeHtml(name || "לא צוין")}<br/><b>מייל לחזרה:</b> ${escapeHtml(email || "לא צוין")}</p>
<hr/><p style="white-space:pre-wrap">${escapeHtml(message)}</p></div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "מקפיאות <onboarding@resend.dev>",
      to: [to],
      subject: `מקפיאות — ${topic}${name ? ` (${name})` : ""}`,
      html,
      ...(email ? { reply_to: email } : {}),
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "send_failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
