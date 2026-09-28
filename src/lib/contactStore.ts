import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * פניות מטופס "צרי קשר" — טבלה אחת פשוטה ב-Postgres (Neon), שנוצרת אוטומטית
 * בפעם הראשונה (CREATE TABLE IF NOT EXISTS). בכוונה לא חלק מסכימת drizzle
 * ולא דורשת הרצת migration ידנית.
 */

export type ContactStatus = "new" | "handled";

export interface ContactMessage {
  id: string;
  createdAt: string;
  topic: string;
  name: string | null;
  email: string | null;
  message: string;
  status: ContactStatus;
}

let ready: Promise<unknown> | null = null;
function ensureTable() {
  if (!ready) {
    ready = db
      .execute(
        sql`CREATE TABLE IF NOT EXISTS contact_messages (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at timestamptz NOT NULL DEFAULT now(),
          topic text NOT NULL,
          name text,
          email text,
          message text NOT NULL,
          status text NOT NULL DEFAULT 'new'
        )`
      )
      .catch((err) => {
        ready = null;
        throw err;
      });
  }
  return ready;
}

export async function insertContactMessage(m: { topic: string; name: string; email: string; message: string }) {
  await ensureTable();
  await db.execute(
    sql`INSERT INTO contact_messages (topic, name, email, message) VALUES (${m.topic}, ${m.name || null}, ${m.email || null}, ${m.message})`
  );
}

type Row = { id: string; created_at: string | Date; topic: string; name: string | null; email: string | null; message: string; status: string };

function toMessage(r: Row): ContactMessage {
  return {
    id: r.id,
    createdAt: new Date(r.created_at).toISOString(),
    topic: r.topic,
    name: r.name,
    email: r.email,
    message: r.message,
    status: r.status === "handled" ? "handled" : "new",
  };
}

export async function listContactMessages(status?: ContactStatus): Promise<ContactMessage[]> {
  await ensureTable();
  const res = status
    ? await db.execute(sql`SELECT * FROM contact_messages WHERE status = ${status} ORDER BY created_at DESC LIMIT 500`)
    : await db.execute(sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 2000`);
  return (res.rows as Row[]).map(toMessage);
}

export async function countNewContactMessages(): Promise<number> {
  await ensureTable();
  const res = await db.execute(sql`SELECT count(*)::int AS n FROM contact_messages WHERE status = 'new'`);
  return (res.rows[0] as { n: number } | undefined)?.n ?? 0;
}

export async function setContactStatus(id: string, status: ContactStatus): Promise<boolean> {
  await ensureTable();
  const res = await db.execute(sql`UPDATE contact_messages SET status = ${status} WHERE id = ${id}::uuid`);
  return (res.rowCount ?? 0) > 0;
}
