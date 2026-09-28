import { HeartHandshake } from "lucide-react";

export default function DisclaimerFooter() {
  return (
    <footer className="mt-16 border-t border-mist-200 bg-mist-100/60 px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center">
        <HeartHandshake className="h-5 w-5 text-teal-600" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-ink/60">
          מידע כללי להתארגנות בלבד ואינו מחליף ייעוץ רפואי.
        </p>
        <p className="text-xs leading-relaxed text-ink/45">
          האתר משתמש בסטטיסטיקת שימוש אנונימית (Umami), בלי עוגיות. מה שאת מזינה באתר לא נשלח אליה. בהתחברות עם Google נשמרים השם והמייל שלך, כדי לשמור את ההתקדמות בחשבון.
        </p>
      </div>
    </footer>
  );
}
