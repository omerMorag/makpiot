import type { MetadataRoute } from "next";

/** robots.txt — הכתובת הרשמית היא www.makpiot.co.il. ה-API לא נסרק. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://www.makpiot.co.il/sitemap.xml",
    host: "https://www.makpiot.co.il",
  };
}
