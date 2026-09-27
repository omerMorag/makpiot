/**
 * מקפיאות — קבלת פניות מטופס "צרי קשר" לתוך Google Sheets.
 *
 * התקנה:
 * 1. יוצרים Google Sheet חדש (למשל "מקפיאות — פניות").
 * 2. בתפריט: Extensions → Apps Script. מוחקים את מה שיש ומדביקים את כל הקובץ הזה.
 * 3. משנים את SECRET למטה למילת סוד משלך (אותה מילה תיכנס ל-Vercel כ-CONTACT_SHEET_SECRET).
 * 4. Deploy → New deployment → סוג: Web app.
 *    Execute as: Me.  Who has access: Anyone.  → Deploy, ומאשרים הרשאות.
 * 5. מעתיקים את ה-Web app URL (מסתיים ב-/exec) ל-Vercel כ-CONTACT_SHEET_URL.
 */
const SECRET = "change-me";

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput("bad request");
  }
  if (data.secret !== SECRET) return ContentService.createTextOutput("forbidden");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("פניות") || ss.insertSheet("פניות");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["תאריך", "נושא", "שם", "מייל", "הודעה"]);
    sheet.setRightToLeft(true);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date(), data.topic || "", data.name || "", data.email || "", data.message || ""]);
  return ContentService.createTextOutput("ok");
}
