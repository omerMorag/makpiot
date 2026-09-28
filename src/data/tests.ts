import {
  Activity,
  Beaker,
  Biohazard,
  Droplets,
  Microscope,
  ShieldCheck,
  Stethoscope,
  TestTubes,
  Waves,
} from "lucide-react";
import type { TestItem } from "./types";

/**
 * עודכן 2026-09-23 — שכתוב מלא של תוכן ההכנה בכל תשע הקבוצות, לפי בקשת
 * המשתמשת: הצגת הנחיה מיוחדת רק כשיש תוכן ממשי (לא שורה ריקה/מומצאת),
 * הפרדה בין "הנחיית הכנה" (prepNote) לבין "מה לבדוק מול היחידה"
 * (unitCheckNote — לא הנחיית הכנה, אלא מידע על מה היחידה דורשת/מקבלת),
 * והסרת כל קביעת "בתוקף X" גורפת שאינה מבוססת על דרישה שאומתה בפועל מול
 * יחידה ספציפית (ר' TestChecklist.tsx: getRecordedStatus). תאריך הביצוע
 * (testDates, ב-useJourneyProgress.ts) ממשיך להופיע לצורך מעקב אישי בלבד.
 *
 * מקורות שהתבססנו עליהם:
 * - ASRM, Fertility Evaluation of Infertile Women (2021): FSH/אסטרדיול
 *   נמדדים יחד בימים 2–4 למחזור; AMH ניתן למדוד בכל יום במחזור; פרולקטין/LH
 *   אינם חלק משגרת ההערכה אלא אם יש אינדיקציה קלינית ספציפית (למשל גלקטוריאה
 *   או מחזור לא סדיר לפרולקטין).
 *   https://www.asrm.org/practice-guidance/practice-committee-documents/fertility-evaluation-of-infertile-women-a-committee-opinion-2021/
 * - מכבי שירותי בריאות, הכנה לבדיקת פרולקטין: יש לבצע לפחות 3 שעות אחרי
 *   יקיצה (רמות הפרולקטין גבוהות משמעותית בזמן השינה).
 *   https://www.maccabi4u.co.il/healthguide/labs/prolactin/
 * - NHS, הכנה לבדיקת סקר צוואר הרחם: לקבוע תור ללא דימום וסתי, ולהימנע
 *   מתרופות/קרמים/חומרי סיכה נרתיקיים ביומיים שלפני הבדיקה.
 *   https://www.nhs.uk/tests-and-treatments/cervical-screening/how-to-book/
 */
export const testItems: TestItem[] = [
  {
    id: 1,
    icon: Activity,
    title: "פרופיל הורמונלי",
    detail: "FSH, LH, אסטרדיול, AMH, פרולקטין, פרוגסטרון ו־TSH. לכל הורמון תזמון משלו; הפרטים ליד כל אחד למטה.",
    subItems: [
      // FSH/אסטרדיול: "ערכי בסיס" (basal) נמדדים יחד בתחילת המחזור לפי ASRM —
      // לא כלל אחיד לכל הפרופיל (ר' AMH/TSH/פרוגסטרון למטה, שלכל אחד תזמון שונה).
      { label: "FSH", note: "לרוב בימים 2-4 למחזור, כשהמטרה היא בדיקת ערכי בסיס" },
      { label: "LH", note: "נבדקת יחד עם FSH ואסטרדיול אם נכללה בהפניה שקיבלת" },
      { label: "אסטרדיול", note: "לרוב בימים 2-4 למחזור, כשהמטרה היא בדיקת ערכי בסיס" },
      // AMH לא תלוי במחזור — ASRM: "can be measured at any point in the menstrual cycle".
      // optional: true — לא כל יחידה דורשת AMH (ר' secondaryNote), ולכן היא
      // לא נדרשת כדי ש"פרופיל הורמונלי" ייחשב הושלם (ר' useJourneyProgress.ts).
      // מחירי priceInfo אומתו מול המקורות הרשמיים ב-2026-09-29 (ר' checkedDate).
      // נבדקו גם שיבא, בילינסון, מאיר, שמיר, קפלן, לניאדו, מעייני הישועה, הרצליה מדיקל,
      // שערי צדק, רמב"ם, בני ציון, כרמל, סורוקה ועוד: לא פורסם מחיר, ולכן לא נוספו.
      // שורות בלי מחיר מפורסם מסומנות needs-verification ולא מציגות מספר.
      {
        label: "AMH",
        note: "אפשר לבצע בכל יום במחזור",
        secondaryNote:
          "בדיקת AMH אינה נדרשת בכל יחידה. אם תתבקשי לבצע אותה, בדקי אם יש לך זכאות דרך הקופה או היחידה; בביצוע במימון עצמי יש תשלום.",
        optional: true,
        priceInfo: {
          linkLabel: "איפה אפשר לבצע וכמה זה עולה?",
          intro:
            "יש מקומות שבהם אפשר לבצע את הבדיקה בזכאות דרך היחידה או הקופה, כדאי לבדוק זאת קודם. מחיר במימון עצמי משתנה בין מקומות ועשוי להשתנות עם הזמן.",
          rows: [
            {
              name: "מרכז רפואי וולפסון, חולון",
              price: "300 ₪",
              sourceLabel: "עמוד היחידה",
              sourceUrl: "https://www.nashim.net/?CategoryID=1202",
              checkedDate: "2026-09-29",
              verification: "verified",
              note: "לפי העמוד, הבדיקה ללא עלות למטופלות יחידת הפוריות של וולפסון.",
            },
            {
              name: "איכילוב, תל אביב",
              price: "400 ₪",
              sourceLabel: "מחירון המעבדה האנדוקרינית",
              sourceUrl: "https://www.tasmc.org.il/unit-index-page/lab/endocrinology-lab/prices-endocrine-lab/",
              checkedDate: "2026-09-29",
              verification: "verified",
              note: "מחירון לנבדקות שמשלמות באופן פרטי, מעודכן ל-1.7.2026.",
            },
            {
              name: "הדסה הר הצופים, ירושלים",
              price: "448 ₪",
              sourceLabel: "עמוד הבדיקה",
              sourceUrl: "https://he.hadassah.org.il/women/amh-test/",
              checkedDate: "2026-09-29",
              verification: "verified",
              note: "לפי העמוד אפשר להגיע גם בלי הפניה. כדאי לבדוק בעמוד את ימי ושעות הקבלה.",
            },
            {
              name: "מרכז רפואי העמק, עפולה",
              sourceLabel: "עמוד הבדיקה",
              sourceUrl: "https://hospitals.clalit.co.il/emek/he/yoldot_vetinokot/lifney_haherayon/Pages/AMH.aspx",
              checkedDate: "2026-09-29",
              verification: "needs-verification",
              note: "לפי העמוד, הבדיקה אפשרית באופן פרטי בלבד, גם למי שאינה חברת כללית, בתיאום מראש. המחיר לא מפורסם ונמסר בטלפון.",
            },
            {
              name: "הלל יפה, חדרה",
              sourceLabel: "עמוד היחידה",
              sourceUrl: "https://hymc.org.il/?ArticleID=3231&CategoryID=1218",
              checkedDate: "2026-09-29",
              verification: "needs-verification",
              note: "לפי העמוד, הבדיקה מבוצעת ביחידת ה-IVF במחיר עלות. הסכום לא מפורסם, כדאי לברר ביחידה.",
            },
            {
              name: "אסותא רמת החייל, תל אביב",
              sourceLabel: "עמוד המעבדה",
              sourceUrl:
                "https://www.assuta.co.il/hospitals/about_assuta_ramathahayal/clinics_ramathahayal/laboratory/",
              checkedDate: "2026-09-29",
              verification: "needs-verification",
              note: "לא אותר מחיר מפורש בעמוד, כדאי לברר טלפונית מול המעבדה לפני קביעת תור.",
            },
          ],
          fundLinks: [
            { label: "בדיקת זכאות דרך מכבי", url: "https://www.maccabi4u.co.il/healthguide/labs/amh/" },
            { label: "בדיקת זכאות דרך כללית", url: "https://www.clalit.co.il/he/myrights/fertility/Pages/amh-test.aspx" },
          ],
        },
      },
      { label: "פרולקטין", note: "יש לתכנן את הבדיקה לפחות 3 שעות אחרי היקיצה; בדקי אם המעבדה מבקשת גם מנוחה לפני לקיחת הדם" },
      { label: "פרוגסטרון", note: "המועד תלוי בסיבת הבדיקה: יש לפעול לפי הנחיית הרופא/ה שהפנתה אותך" },
      // TSH בכוונה בלי הנחיית יום-במחזור — אינו תלוי במחזור.
      { label: "TSH" },
    ],
  },
  {
    id: 2,
    icon: Beaker,
    title: "פרופיל הורמונלי משלים",
    detail:
      "17-OH פרוגסטרון, אנדרוסטנדיון, טסטוסטרון ו־DHEAS. לרוב נלקחים באותה בדיקת דם כמו הפרופיל ההורמונלי, בהתאם להפניה שקיבלת.",
    subItems: [
      { label: "17-OH פרוגסטרון (17-Hydroxyprogesterone)" },
      { label: "אנדרוסטנדיון" },
      { label: "טסטוסטרון" },
      { label: "DHEAS" },
    ],
    // בכוונה בלי prepNote אחיד לארבעת הרכיבים — לא נמצא מקור מאומת שקובע
    // הנחיית תזמון/הכנה גורפת לטסטוסטרון/אנדרוסטנדיון/DHEAS.
    unitCheckNote:
      "ודאי בהפניה שקיבלת שה־\"17-OH\" אכן מתייחס ל-17-hydroxyprogesterone, ובדקי מול היחידה אם יש דרישת תזמון ספציפית לבדיקות האלה.",
  },
  {
    id: 3,
    icon: Droplets,
    title: "בדיקות דם כלליות",
    detail: "ספירת דם, כימיה בדם ותפקודי קרישה (PT, PTT, INR).",
    subItems: [
      { label: "ספירת דם" },
      { label: "כימיה בדם", note: "צום נדרש רק אם ההפניה/היחידה ביקשו זאת (למשל גלוקוז בצום), לא כלל אחיד לכל בדיקת כימיה" },
      { label: "תפקודי קרישה: PT, PTT, INR" },
    ],
    unitCheckNote: "אם היחידה שבחרת מבקשת כימיה מלאה בצום, זו דרישה שכדאי לוודא מולה מראש.",
  },
  {
    id: 4,
    icon: ShieldCheck,
    title: "סרולוגיה ובדיקות זיהומיות",
    detail: "TPHA/VDRL, HCV Ab, HBs Ag, HIV. הרכיבים המדויקים עשויים להשתנות בהתאם להפניה וליחידה.",
    subItems: [
      { label: "TPHA/VDRL" },
      { label: "HCV Ab" },
      { label: "HBs Ag" },
      { label: "HIV" },
    ],
    // אין הכנה פיזית מיוחדת לבדיקות הדם האלה — מה שכן משתנה זה אילו רכיבים
    // נדרשים ואיזה תוקף מקובל, ולכן זה unitCheckNote ולא prepNote.
    unitCheckNote: "בדקי מול היחידה שבחרת אילו מהבדיקות האלה היא דורשת בדיוק, ואם היא מקבלת תוצאה קיימת.",
  },
  {
    id: 5,
    icon: Biohazard,
    title: "CMV וטוקסופלזמה",
    detail: "בדיקות סרולוגיה נוספות שנדרשות לרוב לפני תחילת הטיפול.",
    subItems: [
      { label: "CMV" },
      { label: "טוקסופלזמה" },
    ],
    unitCheckNote: "בדקי מול היחידה אילו מהבדיקות האלה היא מבקשת, ואם היא מקבלת תוצאה קיימת.",
  },
  {
    id: 6,
    icon: TestTubes,
    title: "סוג דם וסקר נוגדנים",
    detail: "בהתאם לדרישות היחידה שבחרת.",
    subItems: [
      { label: "סוג דם" },
      { label: "סקר נוגדנים" },
    ],
    unitCheckNote: "סוג הדם עצמו קבוע ואינו משתנה; סקר הנוגדנים עשוי לדרוש חידוש בהתאם ליחידה, בדקי איתה.",
  },
  {
    id: 7,
    icon: Waves,
    title: "אולטרסאונד גינקולוגי",
    detail: "ספירת זקיקים אנטרליים (AFC), מבוצעת ע״י טכנאית US, ניתן לקבל הפניה מרופא/ת משפחה.",
    subItems: [{ label: "ספירת זקיקים אנטרליים (AFC)" }],
    prepNote:
      "בדרך כלל קובעים תור בתחילת המחזור, לפי הנחיית היחידה. אם זו בדיקה וגינלית, ייתכן שיבקשו להגיע עם שלפוחית שתן ריקה, יש לפעול לפי הנחיות המכון שבו נקבע התור.",
  },
  {
    id: 8,
    // שם הקבוצה עודכן מ"בדיקת פאפ" — כולל גם HPV, ובוטלה הקביעה הגורפת
    // "בתוקף 3 שנים" (לא כל יחידה בהכרח מקבלת תוצאה בת 3 שנים).
    icon: Microscope,
    title: "בדיקת סקר צוואר הרחם (HPV / פאפ)",
    detail: "משטח צוואר הרחם, מבוצע ע״י רופא/ת נשים.",
    subItems: [{ label: "משטח צוואר הרחם (Pap / HPV)" }],
    prepNote:
      "כדאי לקבוע תור כשאין דימום וסתי, ולהימנע מתרופות, קרמים וחומרי סיכה נרתיקיים במשך יומיים לפני הבדיקה, בהתאם להנחיות המרפאה.",
    unitCheckNote: "בדקי מול היחידה שבחרת איזו תוצאה עדכנית היא מקבלת.",
  },
  {
    id: 9,
    icon: Stethoscope,
    title: "בדיקת/ייעוץ כירורג/ית שד",
    detail: "בדיקה גופנית ע״י כירורג/ית שד.",
    subItems: [{ label: "בדיקה גופנית ע״י כירורג/ית שד" }],
    // אין הכנה מיוחדת לבדיקה הגופנית עצמה — לכן בלי prepNote; המידע הרלוונטי
    // הוא מה כדאי להביא איתך, לא איך להתכונן לבדיקה.
    whatToBring:
      "אם יש לך סיכום מביקור קודם אצל כירורג/ית שד ו/או תוצאות דימות קודמות (US/ממוגרפיה), כדאי להביא אותם איתך ליחידה.",
  },
];
