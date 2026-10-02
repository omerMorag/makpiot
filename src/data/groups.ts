/**
 * "קבוצות חשובות". כאן מוסיפים קבוצות: כל קבוצה היא שורה אחת בתוך groups
 * של הקטגוריה המתאימה. קטגוריה בלי קבוצות לא מוצגת באתר.
 *
 * דוגמה לשורה:
 *   { name: "שם הקבוצה", url: "https://www.facebook.com/groups/...", platform: "facebook", description: "משפט קצר על הקבוצה" },
 *
 * platform: "facebook" | "whatsapp" | "telegram" | "other"
 */

export type GroupPlatform = "facebook" | "whatsapp" | "telegram" | "other";

export interface CommunityGroup {
  name: string;
  url: string;
  platform: GroupPlatform;
  description?: string;
}

export interface GroupCategory {
  id: string;
  title: string;
  intro?: string;
  /** הערה קטנה שמוצגת מתחת לקבוצות של הקטגוריה */
  note?: string;
  groups: CommunityGroup[];
}

export const groupCategories: GroupCategory[] = [
  {
    id: "community",
    title: "קהילה ותמיכה",
    intro: "מקום לשאול, לשתף ולקבל חיזוק מנשים שעוברות את אותו תהליך.",
    groups: [
      // { name: "", url: "", platform: "facebook", description: "" },
    ],
  },
  {
    id: "medications",
    title: "מסירת תרופות",
    intro: "קבוצות שבהן נשים מוסרות תרופות שנשארו להן אחרי הטיפול.",
    note: "לפני שימוש בתרופה שקיבלת ממישהי אחרת, כדאי לבדוק עם הצוות המטפל שהיא מתאימה לך, שהיא בתוקף ושנשמרה כמו שצריך.",
    groups: [
      // { name: "", url: "", platform: "whatsapp", description: "" },
    ],
  },
];
