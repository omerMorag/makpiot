import type { EligibilityQuotaRow, SourceLink } from "./types";

/**
 * מכסות הביציות/המחזורים המרביים בהקפאה מבחירה (לא מטעמים רפואיים),
 * לפי חוזר משרד הבריאות 13/2024.
 */
export const eligibilityQuota: EligibilityQuotaRow[] = [
  { ageRange: "מגיל 30 ועד לפני גיל 36", maxEggs: "עד 25 ביציות", maxCycles: "עד 6 שאיבות" },
  { ageRange: "מגיל 36 ועד לפני גיל 41", maxEggs: "עד 35 ביציות", maxCycles: "עד 6 שאיבות" },
];

export const mohCircularSource: SourceLink = {
  label: "חוזר משרד הבריאות 13/2024",
  url: "https://www.gov.il/BlobFolder/policy/mr13-2024/he/files_circulars_mr_mr13-2024.pdf",
};

export const mohStorageSource: SourceLink = {
  label: "משרד הבריאות: שירות הקפאת ביציות",
  url: "https://www.gov.il/he/service/oocyte-cryopreservation",
};
