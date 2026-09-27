import type { LucideIcon } from "lucide-react";
import { CalendarHeart, Egg, Scale3d } from "lucide-react";

export interface KeyFactCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const keyFacts: KeyFactCard[] = [
  {
    icon: CalendarHeart,
    title: "הגיל בזמן ההקפאה",
    description:
      "הגיל הרלוונטי לחישוב הוא הגיל שבו הביציות הוקפאו, ולא הגיל שבו תרצי להשתמש בהן.",
  },
  {
    icon: Egg,
    title: "מספר הביציות הבשלות",
    description: "החישוב מתייחס לביציות בשלות מסוג MII, ולא בהכרח לכל הביציות שנשאבו.",
  },
  {
    icon: Scale3d,
    title: "נתונים של קבוצה, לא תחזית אישית",
    description:
      "המספר מתאר מה נמצא בממוצע אצל קבוצות נשים במחקר. אחוז גבוה אינו מבטיח לידה, ואחוז נמוך אינו אומר שזה לא יקרה.",
  },
];

export interface FamilyGoalOption {
  value: 1 | 2 | 3;
  /** תווית הכפתור */
  label: string;
  /** מה בדיוק האחוז מודד — "לידת חי אחת לפחות" וכו'. בלי "הסיכוי שלך":
   *  זו הערכת מודל קבוצתית (ר' ChanceResult.tsx). */
  outcome: string;
  /** כותרת קצרה מתחת לאחוז */
  resultLabel: string;
}

export const familyGoalOptions: FamilyGoalOption[] = [
  { value: 1, label: "ילד אחד", outcome: "לידת חי אחת לפחות", resultLabel: "הערכת המודל ללידת חי אחת לפחות" },
  { value: 2, label: "שני ילדים", outcome: "שתי לידות חי לפחות", resultLabel: "הערכת המודל לשתי לידות חי לפחות" },
  { value: 3, label: "שלושה ילדים", outcome: "שלוש לידות חי לפחות", resultLabel: "הערכת המודל לשלוש לידות חי לפחות" },
];

export const ageInfoText =
  "הביציות שומרות על המאפיינים הקשורים לגיל שבו הוקפאו. אם הקפאת ביציות בגיל 34 והשתמשת בהן בגיל 40, החישוב מתייחס בעיקר לגיל 34. עם זאת, הגיל בזמן ההיריון עדיין עשוי להשפיע על ההיריון ועל הבריאות הכללית. חשוב גם לדעת: המודל המחקרי שעליו מבוסס החישוב מתייחס לכל הגילאים 35 ומטה כאל קבוצה אחת — כך שההערכה עצמה זהה לכל גיל הקפאה עד 35 כולל, ומשתנה רק מגיל 36 ומעלה.";

export const miiTooltipText =
  "MII הוא השלב שבו הביצית נחשבת בשלה ומתאימה בדרך כלל להקפאה ולהפריה עתידית.";

/** כרטיס מידע קצר, קבוע (לא חלונית/פופ-אפ, לא דורש "אישור") שמוצג מעל
 *  שדות המחשבון — ר' ChanceCalculator.tsx. הטקסט ניתן מילה במילה ואסור
 *  לשנותו. linkHref מצביע על העוגן של מקטע המקורות בתחתית העמוד. */
export const preCalculatorInfo = {
  heading: "רגע לפני שמחשבים",
  body: "המחשבון מציג הערכה סטטיסטית לסיכוי ללידת חי באמצעות ביציות שהוקפאו ושייעשה בהן שימוש בעתיד. החישוב מבוסס על הגיל בזמן ההקפאה ועל מספר הביציות הבשלות (MII), לפי מודל מחקרי. מחקרים שבדקו תוצאות בפועל מצאו שונות בין נשים וקבוצות מחקר, ולכן התוצאה אינה תחזית אישית או הבטחה.",
  linkLabel: "איך חושבה ההערכה?",
  linkHref: "#chance-sources",
};

/** התווית שמוצגת ליד האחוז בתוצאה — מזהה במפורש את המודל שממנו חושב האחוז. */
export const goldmanModelLabel = "הערכה לפי מודל Goldman, 2017";

/** המשפט הקבוע שמוצג מתחת לאחוז בתוצאה — ר' ChanceResult.tsx. */
export const resultDisclaimerText =
  "זהו חישוב סטטיסטי. התוצאה בפועל עשויה להיות שונה, ותלויה גם בגורמים שאינם נכללים במחשבון.";

/** שאלה נפתחת אחרי התוצאה, על שיעור השימוש בביציות מוקפאות — נפרדת
 *  לגמרי משלוש השאלות הנפוצות (chanceFaq למטה) ומכרטיס התוצאה עצמו,
 *  כדי שלא יהיה שום ערבוב בין "כמה נשים חזרו להשתמש" לבין "מה הסיכוי
 *  ללידת חי לאחר שימוש" (שני נתונים שונים לגמרי, ממחקרים שונים). ר'
 *  ReturnRateAccordion.tsx. */
export const returnRateQa = {
  question: "כמה נשים חוזרות להשתמש בביציות שהקפיאו?",
  answer:
    "בסקירה של 27 מחקרים, כ-11% מהנשים חזרו להפשיר את הביציות שהקפיאו במהלך תקופות המעקב, שאורכן השתנה בין המחקרים. אי-שימוש בביציות אינו מספר לנו לבדו מה קרה בהמשך: חלק מהנשים הרו בלי להשתמש בהן, ואחרות דחו את הניסיון להרות. שיעור החזרה מתאר שימוש בביציות לאורך זמן; הוא אינו חלק מההערכה שמוצגת למעלה.",
  sources: [
    {
      label: "Kirubarajan et al., Fertility and Sterility, 2024",
      url: "https://pubmed.ncbi.nlm.nih.gov/38964588/",
    },
    {
      label: "Tsafrir et al., Reproductive BioMedicine Online, 2021",
      url: "https://pubmed.ncbi.nlm.nih.gov/34686418/",
    },
  ],
};

export interface ResultTier {
  max: number; // exclusive upper bound, 1 = 100%
  text: string;
}

export const resultTiers: ResultTier[] = [
  {
    max: 0.4,
    text: "במספר הביציות ובגיל שהוזנו, ההערכה של המודל נמוכה יחסית. זה לא אומר שאין אפשרות ללידת חי — זה אומר שלפי הנתונים שעליהם המודל מבוסס, במצב דומה לידה פחות שכיחה. רופא/ת הפוריות יכולים לעזור להבין מה זה אומר במצב שלך.",
  },
  {
    max: 0.7,
    text: "במספר הביציות ובגיל שהוזנו, ההערכה של המודל בטווח הביניים. מה שיקרה בפועל תלוי גם בהפשרה, בהפריה, בהתפתחות העוברים ובגורמים רפואיים שהמודל לא כולל.",
  },
  {
    max: 1.01,
    text: "במספר הביציות ובגיל שהוזנו, ההערכה של המודל גבוהה יחסית. גם הערכה גבוהה אינה מבטיחה היריון או לידת חי.",
  },
];

/** מה האחוז מודד — מוצג ליד התוצאה, במילים פשוטות (לא משנה את החישוב) */
export function measureExplanation(age: number, eggs: number, outcome: string): string {
  return `לפי מודל Goldman (2017): ההסתברות ש־${eggs} ביציות בשלות שהוקפאו בגיל ${age} יובילו ל${outcome}, אם כולן יופשרו וישמשו לניסיון להרות. המודל מבוסס על שיעורים ממוצעים של הישרדות בהפשרה, התפתחות לעובר, תקינות כרומוזומלית ולידה.`;
}

/** המשפט על נתונים קבוצתיים — ליד ההערכה */
export const groupDataNote = "זו הערכה שמבוססת על ממוצעים מנתוני מחקר של קבוצות נשים, והיא לא יכולה לקבוע מה יקרה במקרה האישי שלך.";

/** מגבלות הנתונים — גלויות מתחת לתוצאה. כל פריט מבוסס על מידע שכבר מופיע בעמוד (ר' chanceSourceGroups, ageInfoText). */
export const dataLimits: string[] = [
  "המודל פורסם ב־2017. שיעורי ההצלחה בפועל עשויים להשתנות בין נשים, מרפאות ומעבדות.",
  "המודל מתייחס לכל הגילאים 35 ומטה כקבוצה אחת, ולכן ההערכה זהה עד גיל 35 כולל.",
  "מחקר מעקב מ־2024 מצא בחלק מההשוואות הערכות נמוכות יותר מאלה של מודלים קודמים.",
  "ההערכה לא כוללת נתונים רפואיים אישיים, איכות הזרע בעתיד ותגובת הביציות להפשרה.",
];

/** שאלות לשיחה עם הרופא/ה — מבוססות על הגורמים שהעמוד כבר מציין שהמודל לא כולל */
export const doctorQuestions: string[] = [
  "איך הנתונים האלה מתאימים למצב הרפואי שלי?",
  "מה ידוע על תוצאות ההפשרה במעבדה שבה הביציות שלי מוקפאות?",
  "אם יש לי ביציות מכמה סבבים או מגילים שונים — איך כדאי להסתכל עליהן יחד?",
  "האם יש גורמים אצלי שהמחשבון לא מביא בחשבון?",
  "מה השיקולים בעד ונגד סבב הקפאה נוסף במקרה שלי?",
];

export interface FaqItem {
  question: string;
  answer: string;
}

// לפי בקשת המשתמשת: בדיוק שלוש שאלות, כל אחת קצרה וללא חזרה על תוכן שכבר
// מוצג במחשבון, בטבלה או בכרטיסים שמעליה בעמוד.
export const chanceFaq: FaqItem[] = [
  {
    question: "האם אפשר לחבר ביציות מכמה סבבים?",
    answer:
      "מספר הביציות המצטבר עשוי להיות רלוונטי, אבל צריך להביא בחשבון את הגיל שבו כל קבוצת ביציות הוקפאה — ולא רק את הסכום הכולל.",
  },
  {
    question: "מה קורה אם הקפאתי ביציות בגילים שונים?",
    answer:
      "הגיל בזמן כל סבב חשוב, ולכן אין להתייחס לכל הביציות כאילו הוקפאו באותו גיל. המודל הנוכחי אינו כולל חישוב משולב אוטומטי לביציות שהוקפאו בגילים שונים.",
  },
  {
    question: "אילו גורמים המחשבון לא כולל?",
    answer:
      "ההערכה אינה כוללת את כל המשתנים האישיים — למשל איכות המעבדה, נתונים רפואיים אישיים, איכות הזרע בעתיד, תגובת הביציות להפשרה והשונות בין מטופלות.",
  },
];

export const processStages: string[] = [
  "ביציות בשלות שהוקפאו",
  "הפשרה",
  "הפריה",
  "התפתחות לעובר",
  "עובר המתאים להחזרה",
  "השרשה והיריון",
  "לידת חי",
];

export interface ChanceSource {
  /** שם/ות המחברים, כותרת קצרה, כתב-עת */
  label: string;
  year: number;
  /** משפט אחד שמסביר בדיוק מה תפקיד המקור הזה — לא "עוד מחקר תומך" גורף */
  description: string;
  url: string;
}

export interface ChanceSourceGroup {
  title: string;
  sources: ChanceSource[];
}

/** רשימת המקורות, מקובצת לפי תפקיד — כך שברור לכל משתמשת מה בדיוק כל
 *  מחקר תורם: המקור שממנו חושב האחוז עצמו, לעומת מחקרים על תוצאות בפועל,
 *  לעומת סקירות/מידע כללי. ר' MyChancesSection.tsx (מקטע "על מה מבוססת
 *  ההערכה?"). בכוונה **לא** ChanceSource[] שטוח כמו קודם — כדי שלא יהיה
 *  רושם מוטעה שכל המקורות "מאמתים" את הנוסחה המדויקת של גולדמן באותה
 *  מידה. */
export const chanceSourceGroups: ChanceSourceGroup[] = [
  {
    title: "מקור החישוב במחשבון",
    sources: [
      {
        label: "Goldman RH et al., Human Reproduction",
        year: 2017,
        description:
          "המודל שממנו מחושב האחוז לפי הגיל בזמן ההקפאה ומספר הביציות הבשלות, עבור לידת חי אחת לפחות, שתיים לפחות או שלוש לפחות.",
        url: "https://academic.oup.com/humrep/article/32/4/853/2968357",
      },
    ],
  },
  {
    title: "מחקרים על תוצאות לאחר שימוש בביציות מוקפאות",
    sources: [
      {
        label: "Cascante SD et al., Journal of Assisted Reproduction and Genetics",
        year: 2024,
        description:
          "מחקר מעקב בנשים שחזרו להשתמש בביציות; מציג את הקשר בין גיל, מספר ביציות ותוצאות. בחלק מההשוואות החוקרים מצאו הערכות נמוכות יותר מאלה של מודלים קודמים. המדד במחקר כולל לידת חי או היריון מתמשך, ולכן אין להציג אותו כאימות ישיר של האחוז המדויק במחשבון.",
        url: "https://link.springer.com/article/10.1007/s10815-024-03175-w",
      },
      {
        label: "Cobo A et al., Human Reproduction",
        year: 2018,
        description:
          "נתונים מכמה מרפאות על תוצאות לאחר הקפאה; כאשר מסבירים אותו, יש להבחין בין הקפאה מבחירה לבין הקפאה מסיבה רפואית.",
        url: "https://pubmed.ncbi.nlm.nih.gov/30383235/",
      },
    ],
  },
  {
    title: "סקירות ומידע על השימוש בביציות",
    sources: [
      {
        label: "Hirsch A et al., Human Reproduction Update",
        year: 2024,
        description:
          "סקירה שיטתית שנותנת תמונה רחבה על תוצאות הקפאת ביציות מתוכננת ועל השונות בין מחקרים. היא אינה מחשבת את האחוז האישי במחשבון.",
        url: "https://pubmed.ncbi.nlm.nih.gov/38654466/",
      },
      {
        label: "Kirubarajan A et al., Fertility and Sterility",
        year: 2024,
        description: "סקירה שיטתית המשמשת מקור לנתון על שיעור הנשים שחזרו להפשיר ביציות.",
        url: "https://pubmed.ncbi.nlm.nih.gov/38964588/",
      },
      {
        label: "Tsafrir A et al., Reproductive BioMedicine Online",
        year: 2021,
        description:
          "מחקר מעקב על סיבות אפשריות לכך שנשים אינן חוזרות להשתמש בביציות. מדובר במחקר קטן יחסית, ולכן אין להציג את הסיבות שנמצאו בו כאילו הן מייצגות את כולן.",
        url: "https://pubmed.ncbi.nlm.nih.gov/34686418/",
      },
    ],
  },
  {
    title: "הנחיות ומידע נוסף",
    sources: [
      {
        label: "ASRM, Evidence-based outcomes after oocyte cryopreservation",
        year: 2021,
        description:
          "הנחיה מקצועית שנותנת הקשר מחקרי רחב על תוצאות הקפאת ביציות — אינה מאמתת את הנוסחה המדויקת של גולדמן ואינה מחליפה אותה.",
        url: "https://www.asrm.org/practice-guidance/practice-committee-documents/evidence-based-outcomes-after-oocyte-cryopreservation-for-donor-oocyte-in-vitro-fertilization-and-planned-oocyte-cryopreservation-a-guideline-2021/",
      },
      {
        label:
          "Maslow BL et al., Likelihood of achieving a 50%, 60%, or 70% estimated live birth rate threshold with 1 or 2 cycles of planned oocyte cryopreservation, Journal of Assisted Reproduction and Genetics",
        year: 2020,
        description:
          "מחקר הקשר נוסף על סבבי הקפאה מרובים — נותן פרספקטיבה משלימה, לא אימות של האחוז המדויק שמציג המחשבון.",
        url: "https://link.springer.com/article/10.1007/s10815-020-01791-w",
      },
      {
        label:
          "ASRM Ethics Committee, Planned oocyte cryopreservation to preserve future reproductive potential, Fertility and Sterility",
        year: 2024,
        description: "מסמך עמדה אתי על הקפאת ביציות מתוכננת — הקשר כללי, לא חלק מהחישוב עצמו.",
        url: "https://www.asrm.org/practice-guidance/ethics-opinions/planned-oocyte-cryopreservation/",
      },
    ],
  },
];
