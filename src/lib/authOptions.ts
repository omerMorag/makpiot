import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * קונפיגורציית NextAuth משותפת — משמשת גם את ה-route handler של
 * /api/auth/[...nextauth] וגם את getServerSession() ב-API routes אחרים
 * (כמו /api/progress) כדי לוודא שמדובר באותה session בדיוק.
 *
 * session.strategy: "jwt" — אין DB adapter נפרד; ה-JWT עצמו מכיל את מזהה
 * המשתמש/ת (sub) של Google, וההתקדמות נשמרת בנפרד ב-Upstash Redis לפי אותו מזהה.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  events: {
    // רישום ברשימת המשתמשות (באקלוג → משתמשות). לעולם לא חוסם התחברות.
    async signIn({ user, profile }) {
      const id = profile && "sub" in profile && typeof profile.sub === "string" ? profile.sub : null;
      if (!id) return;
      try {
        const { recordSignIn } = await import("./userStore");
        await recordSignIn({ id, email: user.email, name: user.name });
      } catch (err) {
        console.error("recordSignIn failed", err);
      }
    },
  },
  callbacks: {
    async jwt({ token, profile }) {
      // profile.sub הוא המזהה היציב של חשבון ה-Google — נשמר בטוקן פעם אחת בכניסה
      if (profile && "sub" in profile && typeof profile.sub === "string") {
        token.userId = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        (session.user as { id?: string }).id = token.userId;
      }
      return session;
    },
  },
};
