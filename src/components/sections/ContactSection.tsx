"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import HenIllustration from "@/components/hens/HenIllustration";
import { CONTACT_TOPICS, type ContactTopic } from "@/data/contact";

const inputCls =
  "mt-1 block w-full rounded-xl border border-mist-200 bg-white px-3 py-2.5 text-base text-ink placeholder:text-ink/35 focus:border-teal-400 focus:outline-none sm:text-sm";

type Status = "idle" | "sending" | "sent" | "error" | "rate" | "offline";

/**
 * "צרי קשר" — טופס קצר שמגיע לבעלת האתר (גיליון ו/או מייל, ר' api/contact). ההודעה לא
 * נשמרת באתר. מבקשים במפורש לא לכתוב פרטים רפואיים אישיים.
 */
export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<ContactTopic>(CONTACT_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // מלכודת לבוטים
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message, website }),
      });
      if (res.ok) {
        setStatus("sent");
        setMessage("");
      } else setStatus(res.status === 429 ? "rate" : res.status === 503 ? "offline" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="print-stack animate-fadeUp">
      <section className="lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1">
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">צרי קשר</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">
            משהו חסר באתר, מידע שצריך לעדכן, או רעיון שיכול לעזור לעוד נשים? אשמח לשמוע.
          </p>
        </div>
        <div className="mt-4 flex justify-center lg:mt-0 lg:shrink-0 lg:justify-end">
          <HenIllustration name="contact" blob="mint" />
        </div>
      </section>

      {status === "sent" ? (
        <div className="mt-6 rounded-3xl border-2 border-teal-100 bg-teal-50/60 p-6 text-center" role="status" data-testid="contact-sent">
          <CheckCircle2 className="mx-auto h-8 w-8 text-teal-700" strokeWidth={2} aria-hidden="true" />
          <p className="mt-2 text-lg font-bold text-ink">תודה, ההודעה נשלחה</p>
          <p className="mt-1 text-sm text-ink/65">{email ? "אם צריך, אחזור אלייך למייל שהשארת." : "תודה שלקחת רגע לכתוב."}</p>
          <button type="button" onClick={() => setStatus("idle")} className="mt-4 text-sm font-semibold text-teal-700 hover:underline">
            לשליחת הודעה נוספת
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 rounded-3xl border-2 border-mist-200 bg-white p-5 shadow-card sm:p-6" data-testid="contact-form">
          <p className="flex items-start gap-2 rounded-xl bg-warm-100/70 px-3.5 py-2.5 text-sm leading-relaxed text-ink/75">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" strokeWidth={2.25} aria-hidden="true" />
            בבקשה לא לכתוב כאן פרטים רפואיים אישיים. לשאלות על הטיפול שלך, פני לצוות המטפל.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-ink/70">
              שם (לא חובה)
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputCls} autoComplete="name" />
            </label>
            <label className="block text-xs font-semibold text-ink/70">
              מייל לחזרה (לא חובה)
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                className={inputCls}
                dir="ltr"
                autoComplete="email"
              />
            </label>
          </div>

          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-ink/70">על מה?</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {CONTACT_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={topic === t}
                  onClick={() => setTopic(t)}
                  className={`min-h-[38px] rounded-full px-3.5 text-sm font-semibold transition-colors ${
                    topic === t ? "bg-teal-600 text-ink shadow-sm" : "bg-mist-100 text-ink/65 hover:bg-mist-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 block text-xs font-semibold text-ink/70">
            ההודעה
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={5}
              maxLength={3000}
              rows={6}
              className={`${inputCls} min-h-[140px]`}
              data-testid="contact-message"
            />
          </label>

          {/* מלכודת לבוטים — מוסתרת ממשתמשות */}
          <div className="hidden" aria-hidden="true">
            <label>
              אתר
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>

          {status === "error" && <p className="mt-3 text-sm font-semibold text-teal-700">משהו השתבש בשליחה. אפשר לנסות שוב בעוד רגע.</p>}
          {status === "rate" && <p className="mt-3 text-sm font-semibold text-teal-700">נשלחו כמה הודעות ברצף. אפשר לנסות שוב בעוד שעה.</p>}
          {status === "offline" && <p className="mt-3 text-sm font-semibold text-teal-700">הטופס עוד לא פעיל. נסי שוב מאוחר יותר.</p>}

          <button
            type="submit"
            disabled={status === "sending" || message.trim().length < 5}
            className="mt-4 min-h-[44px] rounded-full bg-teal-600 px-6 text-sm font-bold text-ink shadow-sm transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="contact-submit"
          >
            {status === "sending" ? "שולחת…" : "שליחה"}
          </button>
          <p className="mt-2 text-xs text-ink/45">ההודעה מגיעה רק אליי, אף אחד אחר לא רואה אותה.</p>
        </form>
      )}
    </div>
  );
}
