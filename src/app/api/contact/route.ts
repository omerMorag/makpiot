import { NextResponse } from "next/server";
import { z } from "zod";
import { contactLimiter } from "@/lib/rateLimit";
import { CONTACT_TOPICS } from "@/data/contact";
import { insertContactMessage } from "@/lib/contactStore";

/**
 * טופס "צרי קשר". כל פנייה נשמרת במסד הנתונים של האתר (טבלת
 * contact_messages, ר' lib/contactStore.ts) ומוצגת למנהלת ב"באקלוג", עם
 * הורדה לאקסל. בנוסף, אם הוגדרו — נשלחת גם לגיליון Google (CONTACT_SHEET_URL
 * + CONTACT_SHEET_SECRET) ו/או במייל דרך Resend (RESEND_API_KEY +
 * CONTACT_TO_EMAIL). אלה תוספות לא חובה.
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

/** מונע ממחרוזת שמתחילה ב-= / + / - / @ להתפרש כנוסחה בגיליון */
function sheetSafe(s: string) {
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const sheetUrl = process.env.CONTACT_SHEET_URL;
  const sheetSecret = process.env.CONTACT_SHEET_SECRET;
  const useMail = !!(apiKey && to);
  const useSheet = !!(sheetUrl && sheetSecret);

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

  // היעד העיקרי: מסד הנתונים של האתר
  const sends: Promise<boolean>[] = [
    insertContactMessage({ topic, name, email, message })
      .then(() => true)
      .catch((err) => {
        console.error("contact: db insert failed", err);
        return false;
      }),
  ];

  if (useSheet) {
    sends.push(
      fetch(sheetUrl!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: sheetSecret,
          topic,
          name: sheetSafe(name),
          email: sheetSafe(email),
          message: sheetSafe(message),
        }),
      })
        .then(async (r) => r.ok && (await r.text()).trim() === "ok")
        .catch(() => false)
    );
  }

  if (useMail) {
    const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">
<p><b>נושא:</b> ${escapeHtml(topic)}</p>
<p><b>שם:</b> ${escapeHtml(name || "לא צוין")}<br/><b>מייל לחזרה:</b> ${escapeHtml(email || "לא צוין")}</p>
<hr/><p style="white-space:pre-wrap">${escapeHtml(message)}</p></div>`;
    sends.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || "מקפיאות <onboarding@resend.dev>",
          to: [to],
          subject: `מקפיאות — ${topic}${name ? ` (${name})` : ""}`,
          html,
          ...(email ? { reply_to: email } : {}),
        }),
      })
        .then((r) => r.ok)
        .catch(() => false)
    );
  }

  const results = await Promise.all(sends);
  if (!results.some(Boolean)) return NextResponse.json({ error: "send_failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
