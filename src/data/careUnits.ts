import type { SourceLink } from "./types";

/**
 * מודל הנתונים של "איפה כדאי לעשות?" — מקור האמת היחיד למקומות, מסלולי
 * התשלום והמחירים באזור הזה (וגם לרשימת המקומות במחשבון "כמה יעלה לי?").
 *
 * העיקרון (תיקון-שורש 22.9.2026): יחידה (CareUnit) היא ישות אחת עם תכונה
 * פיזית קבועה (setting: ציבורי/פרטי), ובתוכה כמה "מסלולי תשלום" (routes)
 * בו-זמנית — תשלום עצמי ו/או הסדר ביטוח משלים של קופה. ציבורי/פרטי ו"דרך
 * הקופה"/"תשלום עצמי" הם שני ממדים נפרדים: יחידה שבהסדר יכולה להיות ציבורית
 * או פרטית, ו"ציבורי" אינו מילה נרדפת ל"מסובסד".
 *
 * עדכון 23.9.2026 — לפי קובץ המיפוי של המשתמשת ("מיפוי מקומות ומסלולים
 * להקפאת ביציות", 23.9.2026) ובדיקה חוזרת של מקורות רשמיים:
 *  - לאומית זהב: נוספו 4 מסלולים (שיבא, מדיקה אלישע, ברזילי, הדסה עין כרם)
 *    לפי רשימת הספקים הרשמית של לאומית.
 *  - שערי צדק: 8,000 ₪ למחזור + 345 ₪ פתיחת תיק (היה 6,500 ₪).
 *  - קפלן: המחיר היחיד שאותר הוא מ-2022 — מוצג כמידע היסטורי, "מחיר בבירור".
 *  - שמיר: הוסרו "12,000 ₪ לשניים" ו"300 ₪ פתיחת תיק" שלא אותרו במקור.
 *  - מאוחדת שיא על שיבא: המחיר (3,500 ₪) לפי תקנון ספטמבר 2026, אבל ההסדר
 *    עם שיבא עצמו לא אומת — סומן "דורש בירור".
 *  - נצרת: הרשומה המאוחדת לשלושה בתי חולים צומצמה לבית החולים האנגלי בלבד —
 *    זה המוסד היחיד שאותר לו פירוט IVF במקור שנבדק.
 *
 * עדכון 25.9.2026 — בדיקה חוזרת מול העמודים הרשמיים (לפני עיצוב מחדש של העמוד):
 *  - אושרו ללא שינוי: שמיר, וולפסון, שערי צדק, רמב״ם, הלל יפה, העמק, מכבי שלי,
 *    כללית מושלם פלטינום, סכום לאומית זהב.
 *  - מאיר: בעמוד היחידה אין מחיר — הוסר ה-7,000 ₪.
 *  - שיבא: העמוד הראשי חסם בדיקה אוטומטית (403) — נשאר האימות מ-23.9.2026.
 *    דף הקמפיין הרשמי של שיבא מציין 3,500 ₪ לטיפול ראשון לחברות כללית, מכבי
 *    ומאוחדת "בכפוף לתנאי הזכות" — לכן ההסדר של כללית בשיבא סומן כמאומת.
 *  - לאומית: בעמוד הזכאות לא מופיעה תקופת המתנה — נוסח מחדש.
 *  - שערי צדק: נוסף מסלול מאוחדת שיא לפי עמוד היחידה (כ־4,500 ₪) — דורש בירור.
 *  - מאוחדת שיא: התקנון לא נקרא במלואו בבדיקה — נשאר "דורש בירור".
 *
 * כללים:
 *  - `priceAmount` (מספר) מוזן רק כשיש מחיר שפורסם במקור רשמי. המחשבון מחבר
 *    רק מחירים כאלה; כל השאר מוצג כ"מחיר בבירור" ולעולם לא נכנס לסכום.
 *  - `pricePerCycle` (טקסט) יכול להכיל מחיר שפורסם בעבר / ממקור לא רשמי —
 *    ה-UI מציג אותו רק כרמז מסומן "לא אומת", לא כמחיר.
 *  - `verifiedAt` — רק תאריך בדיקה אמיתי.
 *  - הסדר קופה ≠ "היחידה מבצעת הקפאת ביציות". route של קופה נוסף רק כשיש
 *    מקור שמקשר בין הקופה ליחידה, ומסומן verified רק כשהקישור הזה אומת.
 */

export type Region = "מרכז" | "ירושלים" | "צפון" | "דרום";
export type Setting = "public" | "private";
export type HealthFund = "כללית" | "מכבי" | "מאוחדת" | "לאומית";
export type FundingType = "selfPay" | "healthFundArrangement";
export type VerificationStatus = "verified" | "needsVerification" | "outdatedDoNotUse";

/** מסלול מימון יחיד בתוך יחידה — ראו הסבר המודל למעלה */
export interface CareRoute {
  id: string;
  fundingType: FundingType;
  /** רק כש-fundingType === "healthFundArrangement" */
  healthFund?: HealthFund;
  /** שם הרובד/התוכנית הנדרשים, למשל "מכבי שלי" */
  requiredPlan?: string;
  ageMin?: number;
  ageMax?: number;
  /** true כש"עד לפני גיל X" (לא כולל את הגיל עצמו) */
  ageMaxExclusive?: boolean;
  waitingPeriodMonths?: number;
  /** מחיר מספרי לסבב אחד — רק כשפורסם במקור רשמי (ר' כללים למעלה) */
  priceAmount?: number;
  /** true כשהמקור עצמו מציין "כ-" */
  priceApprox?: boolean;
  /** על מה המחיר: "למחזור טיפול", "לשאיבה" וכו' */
  priceBasis?: string;
  /** טקסט מחיר חופשי. כש-priceAmount חסר — רמז לא-מאומת בלבד */
  pricePerCycle?: string;
  /** מידע נוסף על המחיר (חבילות, דמי פתיחת תיק) — רק מה שאותר במקור */
  priceExtra?: string;
  numberOfCycles?: string;
  eggLimit?: string;
  storageYears?: number;
  medicationsIncluded?: boolean;
  medicationNotes?: string;
  doctorChoice?: "yes" | "no" | "depends";
  included?: string;
  notIncluded?: string;
  /** תמיד ניסוח "בכפוף ל..." — לעולם לא טענת זכאות ודאית */
  eligibilityNote?: string;
  /** מה נדרש כדי לקבל אישור (הפניה, אישור מראש וכו') */
  approvalNote?: string;
  source?: SourceLink;
  /** רק תאריך בדיקה אמיתי */
  verifiedAt?: string;
  verificationStatus: VerificationStatus;
  /** הערת אי-התאמה בין מקורות, או הבהרה חשובה למסלול הזה בלבד */
  caveat?: string;
}

export interface CareUnit {
  id: string;
  name: string;
  city?: string;
  region?: Region;
  /** תכונה פיזית קבועה של המוסד — לא של המסלול */
  setting: Setting;
  routes: CareRoute[];
  isActive: boolean;
  /** אתר/עמוד היחידה */
  website?: SourceLink;
  /** טלפון שמופיע במקור רשמי בלבד, עם ציון המקור */
  phone?: { number: string; sourceLabel: string };
  /**
   * לוגו רשמי של המוסד — רק קובץ שהתקבל מהמוסד/באישורו (למשל מערכת
   * העיתונות שלו), שמור תחת public/logos/. כשאין — מוצג סמל ראשי תיבות.
   */
  logo?: { src: string };
}

function slug(name: string): string {
  return name.replace(/[^֐-׿\w]+/g, "-");
}

const CHECKED = "23.9.2026";
/** נבדק שוב מול העמוד הרשמי ב-25.9.2026 */
const RECHECKED = "25.9.2026";
const SHEBA_CHECKED = CHECKED;

/* ---------------------------------------------------------------------- */
/* מקורות משותפים                                                          */
/* ---------------------------------------------------------------------- */

const MACCABI_SHELI_SOURCE: SourceLink = {
  label: "מכבי — שימור ביציות מסיבות שאינן רפואיות",
  url: "https://www.maccabi4u.co.il/eligibilites/117173/",
};

const CLALIT_MUSHLAM_SOURCE: SourceLink = {
  label: "כללית מושלם — שימור פוריות",
  url: "https://mushlam.clalit.co.il/he/content_worlds/pregnancy-and-childbirth/Pages/Fertility-preservation.aspx",
};

const MEUHEDET_SIA_SOURCE: SourceLink = {
  label: "תקנון מאוחדת שיא, ספטמבר 2026",
  url: "https://www.meuhedet.co.il/media/8952/%D7%A9%D7%99%D7%90-%D7%A1%D7%A4%D7%98%D7%9E%D7%91%D7%A8-2026.pdf",
};

const LEUMIT_GOLD_SOURCE: SourceLink = {
  label: "לאומית — הקפאת ביציות מסיבות לא רפואיות",
  url: "https://www.leumit.co.il/lobby-rights/rightspage/zakautpage/?sid=849&zid=116675",
};

export const LEUMIT_PROVIDERS_SOURCE: SourceLink = {
  label: "לאומית — רשימת נותני השירות",
  url: "https://www.leumit.co.il/outerservices/externalservicessearchresults/?serviceCode=14053",
};

const SHEBA_SOURCE: SourceLink = {
  label: "שיבא — הקפאת ביציות",
  url: "https://www.sheba.co.il/pregnancy/fertility/eggs-freezing",
};

const SHEBA_FUNDS_SOURCE: SourceLink = {
  label: "שיבא — שימור פוריות (דף הטבות הקופות)",
  url: "https://lp.sheba.co.il/fertility-preservation",
};

const SZMC_SOURCE: SourceLink = {
  label: "שערי צדק — שימור ביציות מבחירה",
  url: "https://www.szmc.org.il/departments/obstetrics-and-gynecology/ivf/madrich-ivf/shimur-mbhira/",
};

/** קישורי "בדקי זכאות" לכל קופה — מוצגים רק ליד route קיים של אותה קופה */
export const FUND_ELIGIBILITY_LINKS: Record<HealthFund, SourceLink> = {
  מכבי: MACCABI_SHELI_SOURCE,
  כללית: CLALIT_MUSHLAM_SOURCE,
  מאוחדת: MEUHEDET_SIA_SOURCE,
  לאומית: LEUMIT_GOLD_SOURCE,
};

/** הרובד שבו, לפי המקורות שנבדקו, קיימת ההטבה להקפאה מבחירה בכל קופה */
export const FUND_PLANS: Record<HealthFund, string> = {
  כללית: "מושלם פלטינום",
  מכבי: "מכבי שלי",
  מאוחדת: "מאוחדת שיא",
  לאומית: "לאומית זהב",
};

const CLALIT_CAVEAT =
  "כללית מפרסמת 3,500 ₪ למחזור במושלם פלטינום \"בבתי החולים שבהסדר\", אבל רשימת היחידות שבהסדר לא אותרה במקור רשמי — יש לאשר מול כללית שהמקום הזה בהסדר לפני קביעת תור.";

/* ---------------------------------------------------------------------- */
/* factory-ים למסלולי קופה חוזרים                                          */
/* ---------------------------------------------------------------------- */

function maccabiSheliRoute(unitSlug: string): CareRoute {
  return {
    id: `${unitSlug}-maccabi`,
    fundingType: "healthFundArrangement",
    healthFund: "מכבי",
    requiredPlan: "מכבי שלי",
    ageMin: 31,
    ageMax: 38,
    waitingPeriodMonths: 12,
    priceAmount: 3500,
    priceBasis: "לטיפול",
    pricePerCycle: "3,500 ₪",
    numberOfCycles: "עד 3 טיפולים או 25 ביציות, לפי המוקדם (מכסת כיסוי של מכבי שלי)",
    storageYears: 5,
    medicationsIncluded: false,
    medicationNotes: "תרופות הפריון אינן כלולות ב-3,500 ₪ ונרכשות בנפרד; ייתכנו הנחות במסגרת סל התרופות של מכבי זהב.",
    eligibilityNote: "בכפוף לגיל 31–38, ותק של 12 חודשים במכבי שלי, וזכאות בפועל. ההטבה לא קיימת במכבי זהב/כסף.",
    source: MACCABI_SHELI_SOURCE,
    verifiedAt: RECHECKED,
    verificationStatus: "verified",
  };
}

function clalitMushlamRoute(unitSlug: string, caveat = CLALIT_CAVEAT): CareRoute {
  return {
    id: `${unitSlug}-clalit`,
    fundingType: "healthFundArrangement",
    healthFund: "כללית",
    requiredPlan: "מושלם פלטינום",
    ageMin: 30,
    ageMax: 37,
    waitingPeriodMonths: 12,
    priceAmount: 3500,
    priceBasis: "למחזור טיפול",
    pricePerCycle: "3,500 ₪",
    numberOfCycles:
      "לפי המידע שהיה באתר: גיל 30–35 עד 2 מחזורים/25 ביציות; גיל 36–37 עד 3 מחזורים/35 ביציות — לא מופיע בעמוד כללית שנבדק, יש לאמת בתקנון",
    storageYears: 5,
    medicationsIncluded: false,
    medicationNotes: "התרופות אינן כלולות ב-3,500 ₪.",
    eligibilityNote: "בכפוף לגיל 30–37 (עד גיל 38), ותק במושלם פלטינום, וזכאות בפועל.",
    source: CLALIT_MUSHLAM_SOURCE,
    verifiedAt: RECHECKED,
    verificationStatus: "needsVerification",
    caveat,
  };
}

function leumitGoldRoute(unitSlug: string): CareRoute {
  return {
    id: `${unitSlug}-leumit`,
    fundingType: "healthFundArrangement",
    healthFund: "לאומית",
    requiredPlan: "לאומית זהב",
    ageMin: 30,
    ageMax: 37,
    priceAmount: 3491,
    priceBasis: "לטיפול",
    pricePerCycle: "3,491 ₪",
    numberOfCycles: "עד 4 טיפולים או עד תקרת הביציות של משרד הבריאות, לפי המוקדם (מכסת כיסוי של לאומית זהב)",
    storageYears: 5,
    medicationsIncluded: false,
    medicationNotes: "התרופות משולמות בנפרד, לפי תעריף סל הבריאות.",
    eligibilityNote:
      "בכפוף לגיל 30–37 (עד יום ההולדת ה-38) וזכאות בפועל. תקופת ההמתנה לא מופיעה בעמוד הזכאות (בעדכון הרבדים מיולי 2026 הופיעו 12 חודשים) — יש לוודא מול לאומית.",
    approvalNote: "נדרשת הפניה מרופא/ת נשים בלאומית והבקשה עוברת לאישור מראש של הקופה.",
    source: LEUMIT_GOLD_SOURCE,
    verifiedAt: RECHECKED,
    verificationStatus: "verified",
    caveat:
      "עמוד הזכאות של לאומית מציין 3,491 ₪ לטיפול, ועמוד עדכון הרבדים מיולי 2026 מציין 3,500 ₪ — כדאי לוודא את הסכום המדויק מול הקופה. היחידה מופיעה ברשימת נותני השירות של לאומית.",
  };
}

/** מאוחדת שיא — המחיר לפי התקנון, אבל אין רשימה רשמית שמאמתת הסדר עם שיבא */
function meuhedetOnSheba(): CareRoute {
  return {
    id: "sheba-tel-hashomer-meuhedet",
    fundingType: "healthFundArrangement",
    healthFund: "מאוחדת",
    requiredPlan: "מאוחדת שיא",
    ageMin: 30,
    ageMax: 41,
    ageMaxExclusive: true,
    waitingPeriodMonths: 12,
    priceAmount: 3500,
    priceBasis: "למחזור טיפול",
    pricePerCycle: "3,500 ₪",
    numberOfCycles: "עד 6 שאיבות או 30 ביציות, לפי המוקדם (לפי תקנון מאוחדת שיא)",
    storageYears: 5,
    medicationsIncluded: false,
    medicationNotes: "השתתפות עצמית בתרופות של עד 50% מהמחיר המרבי לצרכן, לפי תקנון מאוחדת שיא.",
    eligibilityNote: "בכפוף לגיל 30 עד לפני 41, ותק של 12 חודשים במאוחדת שיא, וזכאות בפועל.",
    source: MEUHEDET_SIA_SOURCE,
    verifiedAt: CHECKED,
    verificationStatus: "needsVerification",
    caveat:
      "שיבא מציינת בדף הרשמי שלה 3,500 ₪ לטיפול ראשון גם לחברות מאוחדת, בכפוף לתנאי הזכות. את התקנון של מאוחדת שיא לא הצלחנו לקרוא במלואו, ובעמוד שערי צדק מופיע סכום אחר למאוחדת (כ־4,500 ₪) — יש לאשר את הסכום מול מאוחדת.",
  };
}

function selfPay(unitSlug: string, opts: Omit<CareRoute, "id" | "fundingType">): CareRoute {
  return { id: `${unitSlug}-selfpay`, fundingType: "selfPay", ...opts };
}

/** מקום שבו לא אותר מחיר עצמי עדכני במקור רשמי (ר' קובץ המיפוי, 23.9.2026) */
function selfPayUnverified(unitSlug: string, previouslyShown?: string, extra?: Partial<CareRoute>): CareRoute {
  return selfPay(unitSlug, {
    pricePerCycle: previouslyShown,
    verifiedAt: CHECKED,
    verificationStatus: "needsVerification",
    caveat:
      "לא אותר מחיר עצמי עדכני במקור רשמי. יש לבקש מהיחידה מחיר למחזור, מה כלול, תרופות, אחסון ותוקף ההצעה.",
    ...extra,
  });
}

/* ---------------------------------------------------------------------- */
/* בתי חולים ציבוריים                                                      */
/* ---------------------------------------------------------------------- */

const shamirId = slug("שמיר – אסף הרופא");
const shebaId = slug("שיבא תל השומר");
const wolfsonId = slug("וולפסון");
const hadassahEinKeremId = slug("הדסה עין כרם");
const shaareiZedekId = slug("שערי צדק");
const naharyaId = slug("המרכז הרפואי לגליל – נהריה");
const poriyaId = slug("פוריה");
const rambamId = slug("רמב״ם");
const beneiZionId = slug("בני ציון");
const carmelId = slug("כרמל");
const meirId = slug("מאיר");
const belinsonId = slug("בילינסון");
const kaplanId = slug("קפלן");
const ichilovId = slug("איכילוב");
const barzilaiId = slug("ברזילי");
const sorokaId = slug("סורוקה");
const hillelYaffeId = slug("הלל יפה");
const hadassahHarHatzofimId = slug("הדסה הר הצופים");
const haemekId = slug("העמק");
const nazarethId = slug("בית החולים האנגלי (נצרת)");
const assutaAshdodId = slug("אסותא אשדוד");

const publicUnits: CareUnit[] = [
  {
    id: shamirId,
    name: "שמיר – אסף הרופא",
    city: "באר יעקב",
    region: "מרכז",
    setting: "public",
    isActive: true,
    website: { label: "שמיר — הקפאת ביציות", url: "https://vitrofertilization.shamir.org/oocyte-freezing/" },
    routes: [
      selfPay(shamirId, {
        priceAmount: 6500,
        priceBasis: "למחזור ראשון",
        pricePerCycle: "6,500 ₪",
        verifiedAt: RECHECKED,
        verificationStatus: "verified",
        caveat:
          "מחיר לשני סבבים ודמי פתיחת תיק לא אותרו באתר היחידה — יש לברר. באתר מופיע גם נתון ישן של 4,000 ₪ למאוחדת, שאינו עדכני.",
        source: { label: "שמיר — הקפאת ביציות", url: "https://vitrofertilization.shamir.org/oocyte-freezing/" },
      }),
    ],
  },
  {
    id: shebaId,
    name: "שיבא תל השומר",
    city: "רמת גן",
    region: "מרכז",
    setting: "public",
    isActive: true,
    website: SHEBA_SOURCE,
    phone: { number: "03-5305000", sourceLabel: "רשימת נותני השירות של לאומית" },
    routes: [
      selfPay(shebaId, {
        priceAmount: 7500,
        priceBasis: "למחזור שאיבה אחד",
        pricePerCycle: "7,500 ₪",
        priceExtra: "14,000 ₪ לשני מחזורים",
        storageYears: 5,
        included: "שאיבה, הקפאה ושמירה לחמש שנים",
        verifiedAt: SHEBA_CHECKED,
        verificationStatus: "verified",
        source: SHEBA_SOURCE,
      }),
      maccabiSheliRoute(shebaId),
      {
        ...clalitMushlamRoute(shebaId, undefined),
        verificationStatus: "verified",
        caveat:
          "שיבא מציינת בדף הרשמי שלה השתתפות עצמית של 3,500 ₪ לטיפול ראשון לחברות כללית, \"בכפוף לתנאי הזכות של קופות החולים\". מכסת המחזורים — לפי תקנון כללית.",
      },
      meuhedetOnSheba(),
      leumitGoldRoute(shebaId),
    ],
  },
  {
    id: wolfsonId,
    name: "וולפסון",
    city: "חולון",
    region: "מרכז",
    setting: "public",
    isActive: true,
    website: { label: "וולפסון — היחידה להפריה חוץ גופית", url: "https://www.nashim.net/?CategoryID=1142" },
    routes: [
      selfPay(wolfsonId, {
        priceAmount: 7000,
        priceBasis: "לשאיבה לשימור",
        pricePerCycle: "7,000 ₪",
        verifiedAt: RECHECKED,
        verificationStatus: "verified",
        caveat: "בעמוד היחידה יש גם מידע ישן על מגבלות הטיפול — אין להסיק ממנו תנאי זכאות עדכניים.",
        source: { label: "וולפסון — שימור ביציות", url: "https://www.nashim.net/?CategoryID=1142" },
      }),
    ],
  },
  {
    id: hadassahEinKeremId,
    name: "הדסה עין כרם",
    city: "ירושלים",
    region: "ירושלים",
    setting: "public",
    isActive: true,
    phone: { number: "02-6777111", sourceLabel: "רשימת נותני השירות של לאומית" },
    routes: [
      selfPayUnverified(hadassahEinKeremId, "7,500 ₪"),
      clalitMushlamRoute(hadassahEinKeremId),
      leumitGoldRoute(hadassahEinKeremId),
    ],
  },
  {
    id: shaareiZedekId,
    name: "שערי צדק",
    city: "ירושלים",
    region: "ירושלים",
    setting: "public",
    isActive: true,
    website: {
      label: "שערי צדק — שימור ביציות מבחירה",
      url: "https://www.szmc.org.il/departments/obstetrics-and-gynecology/ivf/madrich-ivf/shimur-mbhira/",
    },
    phone: { number: "02-6666055", sourceLabel: "עמוד היחידה בשערי צדק" },
    routes: [
      selfPay(shaareiZedekId, {
        priceAmount: 8000,
        priceBasis: "למחזור טיפול",
        pricePerCycle: "8,000 ₪",
        priceExtra: "פתיחת תיק: 345 ₪, או טופס התחייבות (טופס 17) מהקופה. מחירי חבילות למספר מחזורים לא אותרו.",
        storageYears: 5,
        included: "גירוי שחלתי, מעקב זקיקים (אולטרסאונד ובדיקות דם), שאיבה בהרדמה כללית והקפאה; 5 שנות אחסון ראשונות ללא עלות נוספת",
        medicationNotes: "העמוד לא מציין אם התרופות כלולות — כדאי לברר.",
        verifiedAt: RECHECKED,
        verificationStatus: "verified",
        caveat: "אחרי 5 שנים עלות האחסון נקבעת לפי משרד הבריאות.",
        source: SZMC_SOURCE,
      }),
      {
        id: `${shaareiZedekId}-meuhedet`,
        fundingType: "healthFundArrangement",
        healthFund: "מאוחדת",
        requiredPlan: "מאוחדת שיא",
        priceAmount: 4500,
        priceApprox: true,
        priceBasis: "למחזור טיפול",
        pricePerCycle: "כ־4,500 ₪",
        medicationsIncluded: false,
        medicationNotes: "הנחה של 50% על התרופות, לפי עמוד היחידה.",
        eligibilityNote: "בכפוף לתנאי מאוחדת שיא (גיל, ותק וזכאות בפועל).",
        source: SZMC_SOURCE,
        verifiedAt: RECHECKED,
        verificationStatus: "needsVerification",
        caveat:
          "הסכום מופיע בעמוד של שערי צדק ולא בעמוד של מאוחדת. תקנון מאוחדת שיא לא נקרא במלואו בבדיקה — יש לאשר את הסכום ואת ההסדר מול מאוחדת.",
      },
      clalitMushlamRoute(shaareiZedekId),
    ],
  },
  {
    id: naharyaId,
    name: "המרכז הרפואי לגליל – נהריה",
    city: "נהריה",
    region: "צפון",
    setting: "public",
    isActive: true,
    routes: [selfPayUnverified(naharyaId, "6,700 ₪; 5,300 ₪ לסבב שני")],
  },
  {
    id: poriyaId,
    name: "פוריה",
    city: "טבריה",
    region: "צפון",
    setting: "public",
    isActive: true,
    routes: [selfPayUnverified(poriyaId, "6,500 ₪; כ־5,500 ₪ מסבב שני")],
  },
  {
    id: rambamId,
    name: "רמב״ם",
    city: "חיפה",
    region: "צפון",
    setting: "public",
    isActive: true,
    website: {
      label: "רמב״ם — שימור פוריות",
      url: "https://www.rambam.org.il/?catid=%7BA03BFCDB-688F-4FF0-A8A4-D41705AB9359%7D",
    },
    routes: [
      selfPay(rambamId, {
        priceAmount: 6500,
        priceBasis: "למחזור גירוי אחד",
        pricePerCycle: "6,500 ₪",
        included: "גירוי שחלתי, מעקב באולטרסאונד ובדיקות דם, שאיבה בהרדמה והקפאה",
        verifiedAt: RECHECKED,
        verificationStatus: "verified",
        caveat: "בעמוד יש גם מידע ישן על מספר סבבים — אין להסיק ממנו תנאי זכאות עדכניים.",
        source: {
          label: "רמב״ם — שימור פוריות",
          url: "https://www.rambam.org.il/?catid=%7BA03BFCDB-688F-4FF0-A8A4-D41705AB9359%7D",
        },
      }),
    ],
  },
  {
    id: beneiZionId,
    name: "בני ציון",
    city: "חיפה",
    region: "צפון",
    setting: "public",
    isActive: true,
    routes: [selfPayUnverified(beneiZionId, "כ־6,500 ₪")],
  },
  {
    id: carmelId,
    name: "כרמל",
    city: "חיפה",
    region: "צפון",
    setting: "public",
    isActive: true,
    routes: [selfPayUnverified(carmelId, "כ־8,500 ₪"), clalitMushlamRoute(carmelId)],
  },
  {
    id: meirId,
    name: "מאיר",
    city: "כפר סבא",
    region: "מרכז",
    setting: "public",
    isActive: true,
    website: { label: "מאיר — היחידה להפריה חוץ גופית", url: "https://hospitals.clalit.co.il/meir/he/med/gyne/ivf/Pages/cons.aspx" },
    routes: [
      selfPay(meirId, {
        verifiedAt: RECHECKED,
        verificationStatus: "needsVerification",
        caveat: "בעמוד היחידה לא מופיע מחיר. יש לבקש מהיחידה מחיר למחזור, מה כלול, תרופות ואחסון.",
        source: { label: "מאיר — ייעוץ ושימור", url: "https://hospitals.clalit.co.il/meir/he/med/gyne/ivf/Pages/cons.aspx" },
      }),
      clalitMushlamRoute(meirId),
    ],
  },
  {
    id: belinsonId,
    name: "בילינסון",
    city: "פתח תקווה",
    region: "מרכז",
    setting: "public",
    isActive: true,
    routes: [selfPayUnverified(belinsonId, "כ־7,000 ₪"), clalitMushlamRoute(belinsonId)],
  },
  {
    id: kaplanId,
    name: "קפלן",
    city: "רחובות",
    region: "מרכז",
    setting: "public",
    isActive: true,
    website: { label: "קפלן — הקפאת ביציות", url: "https://hospitals.clalit.co.il/kaplan/he/med_units/ivf/Pages/eggfreez.aspx" },
    routes: [
      selfPay(kaplanId, {
        pricePerCycle: "ב-2022: 6,214 ₪ למבוטחות כללית, 6,338 ₪ לאחרות (מחיר היסטורי)",
        verifiedAt: CHECKED,
        verificationStatus: "outdatedDoNotUse",
        caveat: "המחיר היחיד שאותר הוא מעמוד מ-30.1.2022 — יש לבקש מחירון נוכחי מהיחידה.",
        source: { label: "קפלן — הקפאת ביציות (2022)", url: "https://hospitals.clalit.co.il/kaplan/he/med_units/ivf/Pages/eggfreez.aspx" },
      }),
      clalitMushlamRoute(kaplanId),
    ],
  },
  {
    id: ichilovId,
    name: "איכילוב",
    city: "תל אביב",
    region: "מרכז",
    setting: "public",
    isActive: true,
    routes: [selfPayUnverified(ichilovId, "כ־9,245 ₪")],
  },
  {
    id: barzilaiId,
    name: "ברזילי",
    city: "אשקלון",
    region: "דרום",
    setting: "public",
    isActive: true,
    phone: { number: "08-6745555", sourceLabel: "רשימת נותני השירות של לאומית" },
    routes: [selfPayUnverified(barzilaiId, "כ־6,500 ₪"), leumitGoldRoute(barzilaiId)],
  },
  {
    id: sorokaId,
    name: "סורוקה",
    city: "באר שבע",
    region: "דרום",
    setting: "public",
    isActive: true,
    routes: [selfPayUnverified(sorokaId, "כ־14,000 ₪ לשני סבבים"), clalitMushlamRoute(sorokaId)],
  },
  {
    id: hillelYaffeId,
    name: "הלל יפה",
    city: "חדרה",
    region: "צפון",
    setting: "public",
    isActive: true,
    website: { label: "הלל יפה — שימור הפוריות", url: "https://hymc.org.il/?ArticleID=8603&CategoryID=2253" },
    routes: [
      selfPay(hillelYaffeId, {
        priceAmount: 8000,
        priceBasis: "למחזור טיפול",
        pricePerCycle: "8,000 ₪",
        included: "תהליך השימור (שאיבה והקפאה)",
        notIncluded: "תרופות לגירוי שחלתי",
        medicationsIncluded: false,
        medicationNotes: "תרופות לגירוי שחלתי אינן כלולות.",
        verifiedAt: RECHECKED,
        verificationStatus: "verified",
        caveat: "בתיאור המקוצר של העמוד מופיע גם 6,500 ₪ — כדאי לוודא טלפונית (04-7744750) את המחיר העדכני.",
        source: { label: "הלל יפה — שימור הפוריות", url: "https://hymc.org.il/?ArticleID=8603&CategoryID=2253" },
      }),
    ],
  },
  {
    id: hadassahHarHatzofimId,
    name: "הדסה הר הצופים",
    city: "ירושלים",
    region: "ירושלים",
    setting: "public",
    isActive: true,
    website: { label: "הדסה הר הצופים — שימור פוריות", url: "https://he.hadassah.org.il/women/fertility-conservation/" },
    routes: [selfPayUnverified(hadassahHarHatzofimId)],
  },
  {
    id: haemekId,
    name: "העמק",
    city: "עפולה",
    region: "צפון",
    setting: "public",
    isActive: true,
    website: {
      label: "העמק — מרפאת פוריות",
      url: "https://hospitals.clalit.co.il/emek/he/departmentsandclinics/women_birth_department/moadon_yoldot_hila/Pages/fertility_clinic.aspx",
    },
    routes: [
      selfPay(haemekId, {
        priceAmount: 6300,
        priceApprox: true,
        priceBasis: "למחזור טיפול",
        pricePerCycle: "כ־6,300 ₪",
        medicationsIncluded: false,
        medicationNotes: "התרופות אינן כלולות.",
        verifiedAt: RECHECKED,
        verificationStatus: "verified",
        caveat: "היחידה מפרסמת מחיר מקורב — לא מחיר סופי או כולל.",
        source: {
          label: "העמק — מרפאת פוריות",
          url: "https://hospitals.clalit.co.il/emek/he/departmentsandclinics/women_birth_department/moadon_yoldot_hila/Pages/fertility_clinic.aspx",
        },
      }),
      clalitMushlamRoute(haemekId),
    ],
  },
  {
    id: nazarethId,
    name: "בית החולים האנגלי (נצרת)",
    city: "נצרת",
    region: "צפון",
    setting: "public",
    isActive: true,
    website: { label: "עמותת איילה — רשימת יחידות", url: "https://www.ayala.org.il/ViewContent.aspx?CategoryId=15286" },
    routes: [
      selfPayUnverified(nazarethId, undefined, {
        caveat:
          "לא אותר מחיר עצמי. בעבר הרשומה כללה גם את בית החולים הצרפתי והמשפחה הקדושה — לא אומת שהם מבצעים הקפאת ביציות, ולכן הם לא מוצגים.",
      }),
    ],
  },
  {
    id: assutaAshdodId,
    name: "אסותא אשדוד",
    city: "אשדוד",
    region: "דרום",
    setting: "public",
    isActive: true,
    website: {
      label: "אסותא אשדוד — פריון והפריה חוץ גופית",
      url: "https://www.assutaashdod.co.il/?catid=%7B6b314f6f-f644-4645-9172-848e7b5115dc%7D",
    },
    routes: [selfPayUnverified(assutaAshdodId)],
  },
];

/* ---------------------------------------------------------------------- */
/* מרכזים פרטיים                                                           */
/* ---------------------------------------------------------------------- */

const elishaId = slug("מדיקה אלישע");
const assutaRamatHachayalId = slug("אסותא רמת החייל");
const assutaRishonId = slug("אסותא ראשון לציון");
const herzliyaId = slug("הרצליה מדיקל סנטר");

const PRIVATE_NOTE =
  "ביחידה פרטית כדאי להפריד בין תשלום לרופא/ה, תשלום ליחידה, תרופות ואחסון, ולוודא מי מבצע/ת בפועל את השאיבה.";

const privateUnits: CareUnit[] = [
  {
    id: elishaId,
    name: "מדיקה אלישע",
    city: "חיפה",
    region: "צפון",
    setting: "private",
    isActive: true,
    phone: { number: "04-8300000", sourceLabel: "רשימת נותני השירות של לאומית" },
    routes: [
      selfPayUnverified(elishaId, undefined, { caveat: `לא אותר מחיר עצמי במקור רשמי. ${PRIVATE_NOTE}` }),
      maccabiSheliRoute(elishaId),
      clalitMushlamRoute(
        elishaId,
        'במידע הקודם הופיע מוסד בשם "אלישע" בהקשר של כללית מושלם, אך לא אותרה רשימה רשמית של כללית — יש לאשר מול כללית אם מדיקה אלישע בהסדר.'
      ),
      leumitGoldRoute(elishaId),
    ],
  },
  {
    id: assutaRamatHachayalId,
    name: "אסותא רמת החייל",
    city: "תל אביב",
    region: "מרכז",
    setting: "private",
    isActive: true,
    routes: [
      selfPayUnverified(assutaRamatHachayalId, undefined, { caveat: `לא אותר מחיר עצמי במקור רשמי. ${PRIVATE_NOTE}` }),
      maccabiSheliRoute(assutaRamatHachayalId),
    ],
  },
  {
    id: assutaRishonId,
    name: "אסותא ראשון לציון",
    city: "ראשון לציון",
    region: "מרכז",
    setting: "private",
    isActive: true,
    routes: [selfPayUnverified(assutaRishonId, undefined, { caveat: `לא אותר מחיר עצמי במקור רשמי. ${PRIVATE_NOTE}` })],
  },
  {
    id: herzliyaId,
    name: "הרצליה מדיקל סנטר",
    city: "הרצליה",
    region: "מרכז",
    setting: "private",
    isActive: true,
    routes: [
      selfPayUnverified(herzliyaId, "סדר גודל שפורסם (לא מחירון רשמי): כ־10,000–15,000 ₪ לסבב", {
        caveat: `לא אותר מחירון רשמי. ${PRIVATE_NOTE}`,
      }),
    ],
  },
];

export const careUnits: CareUnit[] = [...publicUnits, ...privateUnits];

/** ה-route של תשלום עצמי ליחידה, אם קיים */
export function selfPayRoute(unit: CareUnit): CareRoute | undefined {
  return unit.routes.find((r) => r.fundingType === "selfPay");
}

/** כל ה-routes של יחידה עבור קופה נתונה */
export function routesForFund(unit: CareUnit, fund: HealthFund): CareRoute[] {
  return unit.routes.filter((r) => r.fundingType === "healthFundArrangement" && r.healthFund === fund);
}

/** רשימת הקופות שיש להן הסדר כלשהו ביחידה */
export function fundsWithArrangement(unit: CareUnit): HealthFund[] {
  const set = new Set<HealthFund>();
  for (const r of unit.routes) {
    if (r.fundingType === "healthFundArrangement" && r.healthFund) set.add(r.healthFund);
  }
  return [...set];
}

export function findRoute(unit: CareUnit, routeId: string): CareRoute | undefined {
  return unit.routes.find((r) => r.id === routeId);
}

/** שם קצר למסלול: "תשלום עצמי" / "מכבי שלי" */
export function routeName(route: CareRoute): string {
  return route.fundingType === "selfPay" ? "תשלום עצמי" : (route.requiredPlan ?? `הסדר ${route.healthFund}`);
}

export type PriceLabelKind = "copay" | "selfPay" | "pending";

/**
 * תווית המחיר לתצוגה: "השתתפות עצמית לסבב" (מחיר קופה שפורסם),
 * "מחיר בתשלום עצמי" (מחיר יחידה שפורסם), או "מחיר בבירור".
 */
export function priceLabel(route: CareRoute): { kind: PriceLabelKind; label: string } {
  if (route.priceAmount == null) return { kind: "pending", label: "מחיר בבירור" };
  if (route.fundingType === "healthFundArrangement") return { kind: "copay", label: "השתתפות עצמית לסבב" };
  return { kind: "selfPay", label: "מחיר בתשלום עצמי" };
}

export function formatShekel(n: number, approx?: boolean): string {
  return `${approx ? "כ־" : ""}${n.toLocaleString("he-IL")} ₪`;
}

/** מה ידוע על תרופות — ניסוח קצר לכרטיס/השוואה */
export function medicationSummary(route: CareRoute): string {
  if (route.medicationsIncluded === true) return "כלולות במחיר";
  if (route.medicationNotes) return route.medicationNotes;
  if (route.medicationsIncluded === false) return "אינן כלולות";
  return "לא אומת";
}

export function storageSummary(route: CareRoute): string {
  if (route.storageYears) return `${route.storageYears} שנות אחסון כלולות`;
  return "לא אומת";
}
