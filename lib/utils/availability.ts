/**
 * Parses time string (e.g. "10:00 AM", "05:00 PM", "21:30") into total minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr || !timeStr.trim()) return null;
  try {
    const cleaned = timeStr.trim().toUpperCase();
    const isPM = cleaned.includes("PM");
    const isAM = cleaned.includes("AM");
    const digitsOnly = cleaned.replace(/[^0-9:]/g, "");
    const parts = digitsOnly.split(":");
    if (!parts[0]) return null;

    let hour = parseInt(parts[0], 10);
    const minute = parts[1] ? parseInt(parts[1], 10) : 0;

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    return hour * 60 + minute;
  } catch {
    return null;
  }
}

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function isTodayAvailable(days?: string[]): boolean {
  if (!days || !Array.isArray(days) || days.length === 0) return true;
  const now = new Date();
  const dayIdx = now.getDay(); // 0 = Sun, 1 = Mon ...
  const shortToday = SHORT_DAYS[dayIdx].toLowerCase();
  const fullToday = FULL_DAYS[dayIdx].toLowerCase();

  return days.some((d) => {
    const s = String(d).trim().toLowerCase();
    return s === shortToday || s === fullToday;
  });
}

/**
 * Calculates effective product availability based on:
 * manualActive === true AND isTodayAvailable === true AND currentTime >= startTime AND currentTime < endTime
 */
export function isEffectiveAvailable(
  item: {
    isAvailable?: boolean;
    available?: boolean;
    status?: string;
    availableFrom?: string;
    availableUntil?: string;
    availableDays?: string[];
    branchAvailability?: Record<string, any>;
  },
  targetBranchId?: string
): boolean {
  let manualActive = (item.status === undefined || item.status === "ACTIVE") && (item.isAvailable ?? item.available ?? true);
  let sFrom = item.availableFrom || "";
  let sUntil = item.availableUntil || "";
  let days: string[] | undefined = item.availableDays;

  if (targetBranchId && item.branchAvailability?.[targetBranchId]) {
    const override = item.branchAvailability[targetBranchId];
    if (override) {
      if (override.isActive !== undefined) manualActive = Boolean(override.isActive);
      else if (override.isAvailable !== undefined) manualActive = Boolean(override.isAvailable);

      if (override.availableFrom) sFrom = override.availableFrom;
      if (override.availableUntil) sUntil = override.availableUntil;
      if (Array.isArray(override.availableDays)) days = override.availableDays;
    }
  }

  if (!manualActive) return false;
  if (!isTodayAvailable(days)) return false;

  const startMinutesParsed = parseTimeToMinutes(sFrom);
  const endMinutesParsed = parseTimeToMinutes(sUntil);

  if (startMinutesParsed === null && endMinutesParsed === null) return true;

  const startMinutes = startMinutesParsed ?? 0;
  const endMinutes = endMinutesParsed ?? 1439;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (endMinutes > startMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else if (startMinutes > endMinutes) {
    // Overnight schedule (e.g., 8:00 PM to 2:00 AM)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    return true;
  }
}
