import type { MetadataRoute } from "next";

/** האתר הוא עמוד אחד (האזורים מתחלפים לפי #), ולכן יש בו כתובת אחת לסריקה */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://www.makpiot.co.il/", changeFrequency: "weekly", priority: 1 }];
}
