import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { redis } from "@/lib/redis";
import { progressKey } from "@/lib/progressKey";
import type { StoredProgress } from "@/lib/useJourneyProgress";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/** ולידציה בסיסית של הצורה — לא בודקת עומק, רק שהשדות הקריטיים מהסוג הנכון */
function isValidStoredProgress(value: unknown): value is StoredProgress {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const selectedCareUnitValid =
    v.selectedCareUnit === undefined ||
    v.selectedCareUnit === null ||
    (typeof v.selectedCareUnit === "object" &&
      v.selectedCareUnit !== null &&
      typeof (v.selectedCareUnit as Record<string, unknown>).id === "string" &&
      typeof (v.selectedCareUnit as Record<string, unknown>).name === "string");
  // hasSeenIntro: שדה חדש, אופציונלי-לצורך-תאימות-לאחור בלבד — payload ישן
  // (מלפני שהתווסף) פשוט לא כולל אותו כלל, ולא אמור להיפסל בגלל זה.
  const hasSeenIntroValid = v.hasSeenIntro === undefined || typeof v.hasSeenIntro === "boolean";
  return (
    Array.isArray(v.steps) &&
    Array.isArray(v.stepTasks) &&
    Array.isArray(v.tests) &&
    Array.isArray(v.testSubItems) &&
    typeof v.testDates === "object" &&
    v.testDates !== null &&
    selectedCareUnitValid &&
    hasSeenIntroValid
  );
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const data = await redis.get<StoredProgress>(progressKey(userId));
    return NextResponse.json(data ?? null);
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  // הגבלת גודל — ההתקדמות אמורה להיות כמה KB; מונע מילוי Redis בנתוני זבל
  if (JSON.stringify(body).length > 50_000) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  if (!isValidStoredProgress(body)) {
    return NextResponse.json({ error: "invalid_shape" }, { status: 400 });
  }
  try {
    await redis.set(progressKey(userId), body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
