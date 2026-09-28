/** @type {import('next').NextConfig} */

/**
 * כותרות אבטחה לכל העמודים:
 * - frame-ancestors / X-Frame-Options: אתר אחר לא יכול להטמיע את מקפיאות ב-iframe (clickjacking).
 * - nosniff: הדפדפן לא "מנחש" סוג קובץ.
 * - Referrer-Policy: לאתרים חיצוניים נשלח רק שם הדומיין, לא הכתובת המלאה.
 * - Permissions-Policy: האתר לא מבקש מצלמה/מיקרופון/מיקום.
 * - HSTS: רק HTTPS.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
