import type { Metadata } from "next";
import "@fontsource/assistant/300.css";
import "@fontsource/assistant/400.css";
import "@fontsource/assistant/500.css";
import "@fontsource/assistant/600.css";
import "@fontsource/assistant/700.css";
import "@fontsource/assistant/800.css";
import "./globals.css";
import { AuthSessionProvider } from "@/components/shell/AuthSessionProvider";
import Script from "next/script";

/**
 * Umami — סטטיסטיקת שימוש אנונימית, בלי עוגיות. נטען רק בפרודקשן ב-Vercel
 * (לא בפיתוח מקומי ולא בגרסאות Preview), כדי שבדיקות לא ייספרו. נספרות רק
 * כתובות האזורים (#roadmap, #tests...) — שום נתון מהיומן או מהמחשבון לא
 * נכנס לכתובת. פרמטרי חיפוש (?...) לא נאספים.
 */
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "6a55e3e5-b929-4295-a664-ff3a6c6a42f4";
const LOAD_ANALYTICS = process.env.VERCEL_ENV === "production";

const SITE_TITLE = "מקפיאות | הדרך שלך להקפאת ביציות";
const SITE_DESCRIPTION =
  "מידע, סדר וכלים שיעזרו לך להבין את תהליך הקפאת הביציות ולעבור אותו שלב אחר שלב.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  appleWebApp: {
    title: "מקפיאות",
    statusBarStyle: "default",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "מקפיאות",
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen font-sans antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        {LOAD_ANALYTICS && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={UMAMI_WEBSITE_ID}
            data-exclude-search="true"
            data-auto-track="false"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
