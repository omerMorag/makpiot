/** נושאי הפנייה בטופס "צרי קשר" — משותף לטופס ול-API */
export const CONTACT_TOPICS = ["הצעה או רעיון", "תיקון מידע באתר", "שאלה על האתר", "אחר"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];
