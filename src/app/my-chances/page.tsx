import HashRedirect from "@/components/shell/HashRedirect";

/** נתיב ישן — מפנה אל האזור "כמה ביציות להקפיא?" בתוך ה-App Shell החדש (/#my-chances). */
export default function MyChancesRedirectPage() {
  return <HashRedirect hash="#my-chances" />;
}
