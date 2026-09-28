import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * רשימת המשתמשות שהתחברו עם Google — טבלה פשוטה ב-Postgres (Neon), שנוצרת
 * אוטומטית (CREATE TABLE IF NOT EXISTS), כמו contact_messages. נרשמת בכל
 * התחברות (authOptions → events.signIn). נשמרים רק שם, מייל ותאריכים — לא
 * שום נתון מהמסלול, מהיומן או מהמחשבונים. נצפית רק ע"י מנהלת (requireAdmin).
 */

export interface SiteUser {
  id: string;
  email: string | null;
  name: string | null;
  firstSeen: string;
  lastSeen: string;
  signIns: number;
}

let ready: Promise<unknown> | null = null;
function ensureTable() {
  if (!ready) {
    ready = db
      .execute(
        sql`CREATE TABLE IF NOT EXISTS site_users (
          id text PRIMARY KEY,
          email text,
          name text,
          first_seen timestamptz NOT NULL DEFAULT now(),
          last_seen timestamptz NOT NULL DEFAULT now(),
          sign_ins integer NOT NULL DEFAULT 1
        )`
      )
      .catch((err) => {
        ready = null;
        throw err;
      });
  }
  return ready;
}

export async function recordSignIn(u: { id: string; email?: string | null; name?: string | null }) {
  await ensureTable();
  await db.execute(sql`
    INSERT INTO site_users (id, email, name) VALUES (${u.id}, ${u.email ?? null}, ${u.name ?? null})
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, site_users.email),
      name = COALESCE(EXCLUDED.name, site_users.name),
      last_seen = now(),
      sign_ins = site_users.sign_ins + 1
  `);
}

type Row = { id: string; email: string | null; name: string | null; first_seen: string | Date; last_seen: string | Date; sign_ins: number };

export async function listUsers(): Promise<SiteUser[]> {
  await ensureTable();
  const res = await db.execute(sql`SELECT * FROM site_users ORDER BY first_seen DESC LIMIT 5000`);
  return (res.rows as Row[]).map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    firstSeen: new Date(r.first_seen).toISOString(),
    lastSeen: new Date(r.last_seen).toISOString(),
    signIns: Number(r.sign_ins),
  }));
}

export async function userStats(): Promise<{ total: number; new7: number; active30: number }> {
  await ensureTable();
  const res = await db.execute(sql`
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE first_seen > now() - interval '7 days')::int AS new7,
      count(*) FILTER (WHERE last_seen > now() - interval '30 days')::int AS active30
    FROM site_users`);
  const r = res.rows[0] as { total: number; new7: number; active30: number } | undefined;
  return { total: r?.total ?? 0, new7: r?.new7 ?? 0, active30: r?.active30 ?? 0 };
}
