import type { HospitalPriceRow, SourceLink } from "./types";

/**
 * מחירון בתשלום עצמי (הקפאה מבחירה) בבתי חולים ציבוריים, לפי מה שפורסם.
 * המחירים עשויים להשתנות — יש לאמת מול היחידה לפני קביעת תור או תשלום.
 *
 * verification: "verified" = אומת בפרסום הרשמי של בית החולים עצמו.
 *               "needs-verification" = מבוסס על מדריכי השוואה ברשת, לא על מחירון רשמי עדכני.
 *
 * fundArrangements: "כללית" מסומן על 6 בתי החולים שמופעלים ישירות ע"י כללית
 * (סורוקה, בילינסון, מאיר, כרמל, קפלן, העמק) — לפי דיווחי תקשורת עצמאיים
 * ומתואמים (ישראל היום, 30.6.2025; Mynet-עמק, 8.7.2025; חי-פה) על השקת שירות
 * שימור הפוריות בכללית מושלם פלטינום, ולא לפי רשימה רשמית שאותרה ישירות
 * באתר כללית מושלם (ר' הערת המקור/הניסוח המלא ב-healthFunds.ts). "מכבי"
 * מסומן לפי אתר מכבי שלי הרשמי (healthFunds.ts).
 */

export const comparisonGuideSource: SourceLink = {
  label: "מחירון השוואה: הקונטיינר",
  url: "https://www.container.org.il/כמה-עולה-הקפאת-ביציות/",
};

export const hospitalPrices: HospitalPriceRow[] = [
  {
    name: "שמיר (אסף הרופא)",
    region: "מרכז",
    cycle1Price: "6,500 ₪",
    cycle2Price: "12,000 ₪ לפי המחירון שפורסם",
    whatsIncluded: "שאיבה והקפאה; יש לבדוק אחסון ופגישת ייעוץ",
    verification: "verified",
    caveat:
      "עמוד אחר של היחידה מציין שהמחזור הראשון עולה 6,500 ₪ וללא התחייבות לתשלום עבור מחזור שני, כלומר ייתכן שהמחזור השני כלול ולא בתוספת תשלום. מומלץ לאשר את הפרט הזה ישירות מול היחידה.",
    source: { label: "שמיר: הקפאת ביציות", url: "https://vitrofertilization.shamir.org/oocyte-freezing/" },
  },
  {
    name: "שיבא תל השומר",
    region: "מרכז",
    cycle1Price: "7,500 ₪",
    cycle2Price: "14,000 ₪",
    whatsIncluded: "טיפול ומעקב, שאיבה, הקפאה ואחסון לחמש שנים",
    verification: "verified",
    fundArrangements: ["מכבי"],
    source: { label: "שיבא: הקפאת ביציות מבחירה", url: "https://maternity.sheba.co.il/הקפאת-ביציות" },
  },
  {
    name: "וולפסון",
    region: "מרכז",
    cycle1Price: "7,000 ₪",
    cycle2Price: "14,000 ₪ אם אין חבילת הנחה",
    whatsIncluded: "שאיבה לשימור; יש לבדוק אחסון וייעוץ",
    verification: "verified",
    source: { label: "וולפסון: שימור פוריות", url: "https://wolfsonhealth.com/הקפאת-ביציות/" },
  },
  {
    name: "הדסה",
    region: "ירושלים",
    cycle1Price: "7,500 ₪",
    cycle2Price: "12,000 ₪ לשני סבבים",
    needsVerify: "אחסון, תרופות ומדיניות החזר",
    verification: "needs-verification",
  },
  {
    name: "שערי צדק",
    region: "ירושלים",
    cycle1Price: "8,000 ₪ למחזור טיפול",
    cycle2Price: "345 ₪ דמי פתיחת תיק (מתקזזים); מחירי חבילות לא אותרו",
    whatsIncluded: "גירוי, מעקב, שאיבה והקפאה; 5 שנות אחסון ראשונות",
    verification: "verified",
    source: {
      label: "שערי צדק: שימור ביציות מבחירה",
      url: "https://www.szmc.org.il/departments/obstetrics-and-gynecology/ivf/madrich-ivf/shimur-mbhira/",
    },
  },
  {
    name: "המרכז הרפואי לגליל, נהריה",
    region: "צפון",
    cycle1Price: "6,700 ₪",
    cycle2Price: "5,300 ₪ לסבב שני; 12,000 ₪ יחד",
    needsVerify: "מה כלול ומספר שנות אחסון",
    verification: "needs-verification",
  },
  {
    name: "פוריה",
    region: "צפון",
    cycle1Price: "6,500 ₪",
    cycle2Price: "כ־5,500 ₪ מסבב שני",
    needsVerify: "מחיר עדכני ואחסון",
    verification: "needs-verification",
  },
  {
    name: "רמב״ם",
    region: "צפון",
    cycle1Price: "כ־6,000 ₪",
    needsVerify: "פורסמה בעבר גם אגרת ייעוץ",
    verification: "needs-verification",
  },
  {
    name: "בני ציון",
    region: "צפון",
    cycle1Price: "כ־6,500 ₪",
    needsVerify: "מחיר מלא ואחסון",
    verification: "needs-verification",
  },
  {
    name: "כרמל",
    region: "צפון",
    cycle1Price: "כ־8,500 ₪",
    needsVerify: "מחיר עדכני והסדרי קופה",
    verification: "needs-verification",
    fundArrangements: ["כללית"],
  },
  {
    name: "מאיר",
    region: "מרכז",
    cycle1Price: "כ־7,000 ₪",
    needsVerify: "זמינות, אחסון ותרופות",
    verification: "needs-verification",
    fundArrangements: ["כללית"],
  },
  {
    name: "בילינסון",
    region: "מרכז",
    cycle1Price: "כ־7,000 ₪",
    needsVerify: "מחיר וזמן המתנה",
    verification: "needs-verification",
    fundArrangements: ["כללית"],
  },
  {
    name: "קפלן",
    region: "מרכז",
    cycle1Price: "מחיר בבירור (ב-2022: 6,214-6,338 ₪)",
    needsVerify: "מחירון נוכחי ומה כלול",
    verification: "needs-verification",
    fundArrangements: ["כללית"],
  },
  {
    name: "איכילוב",
    region: "מרכז",
    cycle1Price: "כ־9,245 ₪",
    needsVerify: "מחיר עדכני ומספר שנות אחסון",
    verification: "needs-verification",
  },
  {
    name: "ברזילי",
    region: "דרום",
    cycle1Price: "כ־6,500 ₪",
    cycle2Price: "כ־12,000 ₪ לשני סבבים",
    needsVerify: "תנאי החבילה והחזר",
    verification: "needs-verification",
  },
  {
    name: "סורוקה",
    region: "דרום",
    cycle1Price: "פורסם מחיר של כ־14,000 ₪ לשני סבבים",
    cycle2Price: "14,000 ₪",
    needsVerify: "מחיר לסבב יחיד ומה כלול",
    verification: "needs-verification",
    fundArrangements: ["כללית"],
  },
  // 5 השורות הבאות נוספו לפי רשימת היחידות המוסמכות הרשמית של משרד הבריאות
  // (gov.il — ivf-inst-cryopreservation) שהמשתמשת סיפקה, ולא היו בטבלה קודם.
  // שיוך האזור לכל שורה חדשה (וגם לשורות הקיימות שנבדקו מחדש) נעשה לפי
  // המחוז הרשמי של העיר: מחוז חיפה + מחוז הצפון -> "צפון", מחוז הדרום ->
  // "דרום" (לכן חדרה, שבמחוז חיפה, מסווגת "צפון" בשונה מכפר סבא/"מאיר"
  // שבמחוז המרכז; ואשדוד, שבמחוז הדרום הרשמי, מסווגת "דרום" ולא "מרכז").
  {
    name: "הלל יפה",
    region: "צפון",
    cycle1Price: "8,000 ₪",
    whatsIncluded: "כל תהליך השימור (שאיבה והקפאה); לא כולל תרופות לגירוי שחלתי",
    verification: "verified",
    caveat:
      "באתר היחידה מופיע גם הנתון 6,500 ₪ בתיאור מקוצר של העמוד, לצד 8,000 ₪ בפירוט המלא בהמשכו, מומלץ לאמת טלפונית (04-7744750) איזה מהם המחיר המעודכן.",
    source: {
      label: "הלל יפה: שימור הפוריות",
      url: "https://hymc.org.il/?CategoryID=2253&ArticleID=8603",
    },
  },
  {
    name: "הדסה הר הצופים",
    region: "ירושלים",
    cycle1Price: "לא פורסם מחיר תשלום עצמי באתר היחידה",
    needsVerify: "מחיר, מה כלול ואחסון",
    verification: "needs-verification",
    source: {
      label: "הדסה הר הצופים: שימור פוריות",
      url: "https://he.hadassah.org.il/women/fertility-conservation/",
    },
  },
  {
    name: "העמק",
    region: "צפון",
    cycle1Price: "לא פורסם מחיר תשלום עצמי באתר היחידה",
    needsVerify: "מחיר, מה כלול ואחסון",
    verification: "needs-verification",
    fundArrangements: ["כללית"],
    source: {
      label: "מרכז רפואי העמק: מעבדת IVF",
      url: "https://hospitals.clalit.co.il/emek/he/departmentsandclinics/women_birth_department/moadon_yoldot_hila/Pages/ivf_laborotory.aspx",
    },
  },
  {
    name: "בית החולים האנגלי (נצרת)",
    region: "צפון",
    cycle1Price: "לא אותר מחיר תשלום עצמי מפורסם",
    needsVerify: "מחיר, מה כלול ופרטי ההליך בפועל",
    verification: "needs-verification",
    source: {
      label: "משרד הבריאות: רשימת יחידות IVF מוסמכות",
      url: "https://www.gov.il/he/pages/ivf-inst-cryopreservation",
    },
  },
  {
    name: "אסותא אשדוד",
    region: "דרום",
    cycle1Price: "לא אותר מחיר תשלום עצמי מפורסם",
    needsVerify: "מחיר ומה כלול",
    verification: "needs-verification",
    source: {
      label: "אסותא אשדוד: היחידה לפריון ולהפריה חוץ גופית",
      url: "https://www.assutaashdod.co.il/?catid=%7B6b314f6f-f644-4645-9172-848e7b5115dc%7D",
    },
  },
];
