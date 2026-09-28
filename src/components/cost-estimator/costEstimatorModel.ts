import type { WizardAnswers } from "@/lib/validation/costEstimateSchemas";

/** שורה אחת ב-cost_items כפי שמוחזרת מ-GET /api/cost-items (JSON — תאריכים כמחרוזות) */
export interface CostItemRow {
  id: number;
  category: string;
  label: string;
  treatmentRoute: string;
  hmo: string | null;
  clinic: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  billingType: "per_cycle" | "one_time" | "annual" | "per_visit";
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  isActive: boolean;
}

export type LineItemSource = "manual" | "estimated" | "unpriced";
export type LineItemBilling = "per_cycle" | "one_time" | "annual";

export interface EstimateLineItem {
  key: string;
  label: string;
  min: number | null;
  max: number | null;
  source: LineItemSource;
  billing: LineItemBilling;
  /** הערה קצרה, למשל "המחיר משתנה בין יחידות — טרם עודכן" */
  note?: string;
}

export interface EstimateResult {
  cyclesCount: number;
  lineItems: EstimateLineItem[];
  /** לסבב בודד */
  perCycleMin: number;
  perCycleMax: number;
  /** חד-פעמי (לא כפול מספר סבבים) */
  oneTimeMin: number;
  oneTimeMax: number;
  /** שנתי מתמשך (אחסון) — מוצג בנפרד, לא נכלל בסה"כ */
  annualMin: number;
  annualMax: number;
  /** סה"כ לכל הסבבים = (perCycle * cyclesCount) + oneTime */
  totalMin: number;
  totalMax: number;
  hasUnpricedItems: boolean;
}

function findCostItem(
  items: CostItemRow[],
  match: { category: string; treatmentRoute?: string; hmo?: string | null; clinic?: string | null }
): CostItemRow | undefined {
  return items.find((item) => {
    if (item.category !== match.category) return false;
    if (match.treatmentRoute && item.treatmentRoute !== "not_specified" && item.treatmentRoute !== match.treatmentRoute)
      return false;
    if (match.hmo !== undefined && item.hmo && item.hmo !== match.hmo) return false;
    if (match.clinic !== undefined && match.clinic !== null && item.clinic && item.clinic !== match.clinic)
      return false;
    return true;
  });
}

function fromCostItem(key: string, label: string, item: CostItemRow | undefined, billing: LineItemBilling): EstimateLineItem {
  if (!item || item.minPrice == null || item.maxPrice == null) {
    return {
      key,
      label,
      min: null,
      max: null,
      source: "unpriced",
      billing,
      note: "המחיר טרם עודכן, לא נכלל בסכום",
    };
  }
  return { key, label, min: item.minPrice, max: item.maxPrice, source: "estimated", billing };
}

function manualLineItem(key: string, label: string, amount: number, billing: LineItemBilling): EstimateLineItem {
  return { key, label, min: amount, max: amount, source: "manual", billing };
}

function resolveCyclesCount(answers: WizardAnswers): number {
  if (answers.cyclesMode === "custom") return answers.cyclesCustomCount ?? 1;
  return Number(answers.cyclesMode);
}

/**
 * מחשבת הערכת עלות מתשובות האשף + פריטי מחיר מה-DB. כלל קריטי: פריט שאין
 * לו מחיר (source==="unpriced") לעולם לא נכנס לסכומים כ-0 — הוא מוצג
 * בנפרד עם הערה, ומודר מהחישוב לגמרי.
 */
export function computeEstimate(answers: WizardAnswers, costItems: CostItemRow[]): EstimateResult {
  const cyclesCount = resolveCyclesCount(answers);
  const treatmentRoute = answers.treatmentRoute === "undecided" ? undefined : answers.treatmentRoute;
  const lineItems: EstimateLineItem[] = [];

  // --- שלב 5: עלות מרפאה/בית חולים (per_cycle) ---
  if (answers.clinicMode === "manual" && answers.clinicManualAmount != null) {
    lineItems.push(manualLineItem("clinic", "עלות מרפאה/בית חולים", answers.clinicManualAmount, "per_cycle"));
  } else if (answers.clinicMode === "site_choice" && answers.clinicChoiceName) {
    const item = findCostItem(costItems, { category: "clinic_cycle", treatmentRoute, clinic: answers.clinicChoiceName });
    lineItems.push(fromCostItem("clinic", `עלות מרפאה/בית חולים: ${answers.clinicChoiceName}`, item, "per_cycle"));
  }
  // clinicMode === "not_chosen" → אין שורה בכלל (עדיין לא רלוונטי לחישוב)

  // --- שלב 4: ליווי רופא/ה פרטי/ת (per_cycle) ---
  if (answers.doctorAccompaniment === "known_cost" && answers.doctorKnownCost != null) {
    lineItems.push(manualLineItem("doctor", "ליווי רופא/ה פרטי/ת", answers.doctorKnownCost, "per_cycle"));
  } else if (answers.doctorAccompaniment === "default_estimate") {
    const item = findCostItem(costItems, { category: "private_doctor", treatmentRoute });
    lineItems.push(fromCostItem("doctor", "ליווי רופא/ה פרטי/ת (הערכת ברירת מחדל)", item, "per_cycle"));
  }
  // "no" → אין שורה

  // --- שלב 6: תרופות (per_cycle) ---
  if (answers.medicationMode === "known_cost" && answers.medicationKnownCost != null) {
    lineItems.push(manualLineItem("medication", "תרופות", answers.medicationKnownCost, "per_cycle"));
  } else if (answers.medicationMode === "hmo_subsidized") {
    const item = findCostItem(costItems, { category: "medication", hmo: answers.hmo });
    lineItems.push(fromCostItem("medication", "תרופות (עם השתתפות קופת חולים)", item, "per_cycle"));
  } else if (answers.medicationMode === "no_subsidy") {
    const item = findCostItem(costItems, { category: "medication", hmo: "none" });
    lineItems.push(fromCostItem("medication", "תרופות (ללא השתתפות)", item, "per_cycle"));
  }
  // "unknown" → אין שורה (לא מציגים ניחוש)

  // --- שלב 7: עלויות נוספות ---
  if (answers.additionalCosts.consultations) {
    const item = findCostItem(costItems, { category: "consultation", treatmentRoute });
    lineItems.push(fromCostItem("consultations", "פגישות ייעוץ", item, "one_time"));
  }
  if (answers.additionalCosts.tests) {
    const item = findCostItem(costItems, { category: "test", treatmentRoute });
    lineItems.push(fromCostItem("tests", "בדיקות", item, "one_time"));
  }
  if (answers.additionalCosts.travel) {
    const item = findCostItem(costItems, { category: "travel" });
    lineItems.push(fromCostItem("travel", "נסיעות וחניה", item, "per_cycle"));
  }
  if (answers.additionalCosts.storageAnnual) {
    const item = findCostItem(costItems, { category: "storage_annual" });
    lineItems.push(fromCostItem("storage", "אחסון שנתי", item, "annual"));
  }
  if (answers.additionalCosts.customEnabled && answers.additionalCosts.customAmount != null) {
    lineItems.push(
      manualLineItem(
        "custom",
        answers.additionalCosts.customLabel?.trim() || "עלות נוספת בהתאמה אישית",
        answers.additionalCosts.customAmount,
        "one_time"
      )
    );
  }

  const sum = (billing: LineItemBilling, pick: "min" | "max") =>
    lineItems
      .filter((li) => li.billing === billing && li.source !== "unpriced")
      .reduce((acc, li) => acc + (li[pick] ?? 0), 0);

  const perCycleMin = sum("per_cycle", "min");
  const perCycleMax = sum("per_cycle", "max");
  const oneTimeMin = sum("one_time", "min");
  const oneTimeMax = sum("one_time", "max");
  const annualMin = sum("annual", "min");
  const annualMax = sum("annual", "max");

  return {
    cyclesCount,
    lineItems,
    perCycleMin,
    perCycleMax,
    oneTimeMin,
    oneTimeMax,
    annualMin,
    annualMax,
    totalMin: perCycleMin * cyclesCount + oneTimeMin,
    totalMax: perCycleMax * cyclesCount + oneTimeMax,
    hasUnpricedItems: lineItems.some((li) => li.source === "unpriced"),
  };
}
