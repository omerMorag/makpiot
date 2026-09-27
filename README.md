# המסע להקפאת ביציות

מלווה אישי דיגיטלי לתהליך הקפאת ביציות — מפת דרך אישית, מעקב בדיקות, מחשבון עלות, וסיפורים קהילתיים. אתר Next.js בעברית (RTL), מותאם למובייל.

## סטאק טכנולוגי

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **NextAuth v4** — כניסה אופציונלית עם Google (מצב אורחת עובד תמיד, גם בלי התחברות)
- **Upstash Redis** — סנכרון התקדמות אישית בין מכשירים + rate limiting
- **Neon Postgres** + **Drizzle ORM** — סיפורים קהילתיים, מחשבון עלות, מודרציה

## דרישות מוקדמות

- Node.js 20+ ו-npm

## התקנה והרצה מקומית

1. **התקנת חבילות**
   ```bash
   npm install
   ```

2. **קובץ סביבה** — העתיקי את `.env.example` ל-`.env.local` ומלאי את הערכים:
   ```bash
   cp .env.example .env.local
   ```

3. **Google OAuth** (Google Cloud Console → APIs & Services → Credentials):
   - יצירת OAuth Client מסוג "Web application".
   - יש להגדיר OAuth consent screen (External) לפני יצירת ה-Client.
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (ופרודקשן, כשיש).
   - העתיקי `GOOGLE_CLIENT_ID` ו-`GOOGLE_CLIENT_SECRET` ל-`.env.local`.
   - `NEXTAUTH_SECRET` — מחרוזת אקראית ארוכה (למשל `openssl rand -base64 32`).
   - `NEXTAUTH_URL=http://localhost:3000`.

4. **Upstash Redis** (upstash.com):
   - יצירת Redis database חינמי.
   - העתיקי את ה-**REST URL** וה-**REST Token** (לא כתובת Redis הרגילה) ל-`.env.local`.

5. **Neon Postgres** (neon.tech):
   - יצירת פרויקט חדש.
   - מלוח הבקרה של Neon, העתיקי **שני** connection strings:
     - ה-pooled (עם `-pooler` בכתובת) → `DATABASE_URL`.
     - ה-direct (בלי `-pooler`) → `DATABASE_URL_UNPOOLED` (משמש רק את המיגרציות).
   - אם משתמשים ב-Neon דרך Vercel Marketplace integration, ודאו שהמשתנים שהאינטגרציה מזריקה תואמים לשמות האלה (או הוסיפו alias בהתאם).

6. **הרשאת מנהלת**:
   - `ADMIN_EMAILS=your-email@gmail.com` (אימייל/י Google שיקבלו הרשאת מודרציה על סיפורים; אפשר כמה מופרדים בפסיקים).

7. **הרצת מיגרציות**:
   ```bash
   npm run db:generate   # יוצר SQL מהסכמה (רק אם שיניתם את הסכמה)
   npm run db:migrate    # מריץ את כל המיגרציות מול DATABASE_URL_UNPOOLED
   ```

8. **הרצה**:
   ```bash
   npm run dev   # http://localhost:3000
   ```

## סקריפטים

| פקודה | מה היא עושה |
|---|---|
| `npm run dev` | שרת פיתוח מקומי |
| `npm run build` | בנייה לפרודקשן |
| `npm run start` | הרצת בנייה שהופקה |
| `npm run lint` | בדיקת lint |
| `npm run db:generate` | יצירת קובצי מיגרציה מהסכמה (`src/db/schema`) |
| `npm run db:migrate` | הרצת כל המיגרציות הממתינות מול מסד הנתונים |
| `npm run db:studio` | דפדפן סכמה/נתונים מקומי של Drizzle — שימושי גם לזריעת מחירים ידנית ל-`cost_items` |

## פריסה (Vercel)

- כל משתני הסביבה שלמעלה (`.env.example`) צריכים להיות מוגדרים גם ב-Vercel → Project Settings → Environment Variables. `NEXTAUTH_URL` בפרודקשן צריך להיות כתובת האתר החי (`https://www.makpiot.co.il`), ו-redirect URI תואם צריך להתווסף ב-Google Cloud Console.
- לאחר הוספה/שינוי של משתני סביבה ב-Vercel, נדרש **redeploy** (לא מספיק push בלבד) כדי שהם ייקלטו.
- מיגרציות **לא** רצות אוטומטית ב-build של Vercel — יש להריץ `npm run db:migrate` (מול `DATABASE_URL_UNPOOLED` של הפרודקשן) לפני/בזמן כל דיפלוי שמוסיף מיגרציה חדשה.

## ארכיטקטורה בקצרה

- אתר עמוד-יחיד (SPA) מבוסס hash routing — כל "עמוד" הוא section שמוצג לפי `#hash`, לא ניתוב אמיתי של Next.js.
- **התקדמות אישית** (שלבים/בדיקות/תאריכים): `localStorage` תמיד, וכש-Google מחובר — מסונכרן גם ל-Upstash Redis (מיזוג union, לעולם לא מבטל סימון קיים).
- **מחשבון עלות**: תשובות נשמרות מקומית (localStorage); שמירת הערכה בענן דורשת התחברות (נשמר ב-Postgres).
- **סיפורים קהילתיים**: קריאה פתוחה לכולן; שליחה דורשת התחברות; כל סיפור חדש ממתין לאישור מנהלת (מודרציה) לפני שהוא נראה לציבור.
- הרשאת מנהלת נקבעת אך ורק בצד השרת לפי `ADMIN_EMAILS`, לעולם לא לפי מידע שמגיע מהדפדפן.
